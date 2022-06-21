import { CompletionContext } from "@codemirror/autocomplete";
import { Diagnostic } from "@codemirror/lint";
import { Decoration, DecorationSet } from "@codemirror/view";
import ts from "byots";
import { extractTSSource } from "../ast/extract";
import { autocomplete } from "../autocompletion";
import { highlightDialogue, highlightTS, mergeDecorations } from "../highlight";
import { ParseResult, parseStatement } from "../parser/parser";
import { checkLine, CheckResult } from "../type/checker";
import { calTextChangeRange } from "./utils";

export class SASTNode {
    protected content: string;

    protected parseResult: ParseResult;
    protected checkResult: CheckResult;
    protected tsProxy: ts.SourceFile;

    constructor(content = "") {
        this.content = content;
        this.parseResult = parseStatement(content);
        this.tsProxy = ts.createSourceFile("x.ts", "", ts.ScriptTarget.ESNext);
        this.checkResult = checkLine(this);
        this.update(content);
        this.updateCache();
    }

    update(newContent: string) {
        this.content = newContent;
        this.parseResult = parseStatement(newContent);
        const tsSource = extractTSSource(newContent, this.parseResult.statement);
        const change = calTextChangeRange(tsSource, this.tsProxy.text);
        if (change) {
            this.tsProxy = this.tsProxy.update(tsSource, change);
        }
        this.checkResult = checkLine(this);
        this.updateCache();
    }

    updateCache() {
        this.highlightCache = Decoration.set([
            ...mergeDecorations(
                highlightDialogue(this.parseResult.statement),
                highlightTS(this.tsProxy),
            ),
            ...this.checkResult.decorations,
        ], true);
        this.diagnosticCache = [
            ...this.parseResult.diagnostics,
            ...this.tsProxy.parseDiagnostics.map((d) => {
                return {
                    from: d.start,
                    to: d.start + d.length,
                    message: d.messageText,
                    severity: "error",
                    source: `ts(${ d.code })`
                } as Diagnostic;
            }),
            ...this.checkResult.diagnostics,
        ];
    }

    protected highlightCache?: DecorationSet;


    getHighlight() {
        return this.highlightCache ?? Decoration.set([]);
    }

    protected diagnosticCache?: Diagnostic[];

    getDiagnostic() {
        return this.diagnosticCache ?? [];
    }

    getStatement() {
        return this.parseResult.statement;
    }

    getContent() {
        return this.content;
    }

    /**
     * 获取补全
     * 目前只有指令名称和具名参数有补全功能
     */
    getCompletion(context: CompletionContext) {
        return autocomplete(this, context.pos);
    }
}
