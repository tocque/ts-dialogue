import { getLineById, Line, LineData, RootLine } from "./line";

export class Model {

    readonly root: Line;

    constructor(data: LineData[] = []) {
        if (data.length === 0) data = [{ content: "" }];
        this.root = new RootLine(this, data);
    }

    getValue(): LineData[] {
        return this.root.getValue().children!;
    }

    appendLine(lineId: number, data: LineData = { content: "" }) {
        const line = getLineById(lineId);
        const parent = line.parent;
        if (!parent) throw Error(`line ${ lineId} haven't been append`);
        const newLine = Line.newLine(data);
        parent.insertAfter(newLine, line);
        return newLine;
    }

    appendChildLine(lineId: number, data: LineData = { content: "" }) {
        const line = getLineById(lineId);
        const newLine = Line.newLine(data);
        line.appendChild(newLine);
        return newLine;
    }

    deleteLine(lineId: number) {
        const line = getLineById(lineId);
        if (!line.canDeleteByReduce()) {
            throw new Error("尝试删除不可删除的节点");
        }
        const parent = line.parent;
        if (!parent) throw Error(`line ${ lineId} haven't been append`);
        const nextFocus = line.previousSibling() || parent;
        parent.removeChild(line);
        nextFocus.focus();
    }
}
