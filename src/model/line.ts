import { closeBrackets } from "@codemirror/closebrackets";
import { Compartment, EditorState, Transaction } from "@codemirror/state";
import { Decoration, DecorationSet, EditorView, keymap, ViewPlugin, ViewUpdate } from "@codemirror/view";
import { computed, nextTick, Ref, ref, shallowReactive } from "vue";
import { lightplus } from "@/theme";
import { Model } from ".";
import { bracketMatching } from "@codemirror/matchbrackets";
import { autocompletion } from "@codemirror/autocomplete";
import { Diagnostic, linter } from "@codemirror/lint";
import { myKeymap } from "./command";
import { SASTNode } from "@/language/sast";

const idMap = new Map<number, Line>();
let id = 0;

export function tryGetLineById(id: number) {
    return idMap.get(id);
}

export function getLineById(id: number) {
    const line = tryGetLineById(id);
    if (!line) throw Error(`line ${ id } doesn't exist`);
    return line;
}

export interface LineData {
    content: string;
    children?: LineData[];
}

export class Line {

    readonly id: number;

    model?: Model;
    parent?: Line;
    readonly children: Line[];

    protected readonly view: EditorView;

    readonly node: SASTNode;
    
    protected constructor(data: LineData, parent?: Line) {

        this.id = id++;
        idMap.set(this.id, this);

        const { content, children = [] } = data;

        this.node = new SASTNode(content);

        /** @todo 拆分定义 */
        this.view = new EditorView({
            state: EditorState.create({
                doc: content,
                extensions: [
                    bracketMatching(),
                    closeBrackets(),
                    autocompletion({
                        override: [ (ctx) => this.node.getCompletion(ctx) ]
                    }),
                    linter(() => this.node.getDiagnostic()),
                    myKeymap(this),
                    ViewPlugin.define(() => ({}), {
                        decorations: () => this.node.getHighlight(),
                    }),
                ],
            }),
            dispatch: (tr: Transaction) => {
                this.handleTransaction(tr);
            },
        });

        this.children = shallowReactive(children.map((e) => new Line(e, this)));
        if (parent) {
            this.linkParent(parent);
        }
    }

    /**
     * 创建一个新行
     * @param data 
     * @returns 
     */
    static newLine(data: LineData = { content: ""}) {
        return new Line(data);
    }

    focus() {
        // 如果当前dom不在视口内，则滚动画面以对准dom
        /** @todo 对于封装好的编辑器，允许定义容器dom */
        const dom = this.view.dom;
        const rect = dom.getBoundingClientRect();
        if (rect.top <= 0) {
            dom.scrollTo({
                top: 0,
                behavior: "auto",
            });
        } else if (rect.bottom >= window.innerHeight) {
            dom.scrollTo({
                top: dom.scrollHeight,
            });
        }
        nextTick(() => {
            this.view.focus();
        });
    }

    mount(elm: HTMLElement) {
        elm.appendChild(this.view.dom);
    }

    private getFirstLine() {
        return this.view.state.doc.lineAt(0).text;
    }

    isEmpty() {
        if (this.getFirstLine().length > 0) return false;
        return this.view.state.doc.lines === 1;
    }

    canDelete() {
        if (!this.parent) throw new Error();
        if (this.parent instanceof RootLine && this.parent.children.length === 1) return false;
        return true; 
    }

    /**
     * 是否可以通过空状态下减少内容的方式删除
     * @returns 
     */
    canDeleteByReduce() {
        // 没有父亲则不存在删除的概念
        if (!this.parent) throw new Error();
        if (!this.canDelete()) return false;
        // 有子节点则不可删除
        if (this.children.length > 0) return false;
        return true;
    }

    /**
     * 拦截操作事务
     * @todo 如果当前有子节点，则不允许删除前导标识符
     * @param tr 
     * @returns 
     */
    handleTransaction(tr: Transaction) {
        const view = this.view;
        view.update([ tr ]);
        if (!tr.docChanged) return;
        this.node.update(view.state.doc.toString());
        view.dispatch({});
    }

    setModel(model: Model | undefined) {
        this.model = model;
        this.children.forEach((e) => {
            e.setModel(model);
        });
    }

    // ============ 树操作接口 ============

    previousSibling() {
        if (!this.parent) return null;
        const index = this.parent.findIndexOfLine(this);
        return this.parent.getLineByIndex(index-1) ?? null;
    }

    nextSibling() {
        if (!this.parent) return null;
        const index = this.parent.findIndexOfLine(this);
        return this.parent.getLineByIndex(index+1) ?? null;
    }

    linkParent(line: Line) {
        this.parent = line;
        this.setModel(this.parent.model);
    }

    unlinkParent() {
        this.parent = void 0;
        this.setModel(void 0);
    }

    remove() {
        if (!this.parent) throw Error();
        this.parent.removeChild(this);
    }

    appendChild(childNode: Line) {
        if (childNode.parent) {
            childNode.remove();
        }
        this.children.push(childNode);
        childNode.linkParent(this);
    }

    insertAfter(newNode: Line, referenceNode: Line) {
        const index = this.findIndexOfLine(referenceNode);
        if (index === this.children.length-1) {
            this.appendChild(newNode);
        } else {
            if (newNode.parent) {
                newNode.remove();
            }
            this.children.splice(index+1, 0, newNode);
            newNode.linkParent(this);
        }
    }

    findIndexOfLine(line: Line) {
        return this.children.indexOf(line);
    }

    getLineByIndex(index: number) {
        return this.children[index];
    }

    /**
     * 移除子节点
     * @param childNode 
     * @returns 
     */
    removeChild(childNode: Line) {
        const index = this.findIndexOfLine(childNode);
        this.children.splice(index, 1);
        childNode.unlinkParent();
    }

    getChildrenIds() {
        return computed(() => this.children.map((e) => e.id));
    }

    getContent(): string {
        return this.view.state.doc.toString();
    }

    setContent(content: string) {
        const state = this.view.state;
        const transaction = state.update({
            changes: {from: 0, to: state.doc.length, insert: content 
        }}) 
        this.view.dispatch(transaction);
    }

    getValue(): LineData {
        const content = this.getContent();
        if (this.children.length === 0) return { content };
        const children = this.children.map((line) => line.getValue());
        return { content, children };
    }
}

export class RootLine extends Line {

    constructor(model: Model, data: LineData[] = []) {
        super({ content: "", children: data });
        this.parent = this;
        this.setModel(model);
    }
}
