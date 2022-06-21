/**
 * 将文档转译为 js 代码
 */

import { LineData } from "@/model/line";
import { unserialize } from "@/model/serializer";
import { SyntaxKind, TextRange } from "../ast/define";
import { takeText } from "../ast/utils";
import { parseStatement } from "../parser/parser";

const INDENT = "    ";

function transpileLine(line: LineData, indent = ""): string {
    const result = parseStatement(line.content);
    const statement = result.statement;
    const getText = (range: TextRange) => {
        return takeText(line.content, range);
    }
    const nxdent = indent + INDENT;
    switch (statement.kind) {
        case SyntaxKind.AssignStatement: {
            return indent + [
                getText(statement.left), 
                getText(statement.operator),
                getText(statement.right) + ";",
            ].join(" ");
        }
        case SyntaxKind.IfStatement: {
            const [ thenBrench, elseBrench ] = line.children!;
            const thenCode = transpileList(thenBrench.children ?? [], nxdent);
            const elseCode = transpileList(elseBrench.children ?? [], nxdent);
            const condition = getText(statement.condition);
            return [
                indent + `if (${ condition }) {`,
                thenCode,
                indent + `} else {`,
                elseCode,
                indent + `}`
            ].join("\n");
        }
        case SyntaxKind.LoopStatement: {
            const loopbody = line.children ?? [];
            const loopCode = transpileList(loopbody, nxdent);
            const condition = getText(statement.condition);
            return [
                indent + `while (${ condition }) {`,
                loopCode,
                indent + `}`
            ].join("\n");
        }
        case SyntaxKind.OrderStatement: {
            const main = statement.main;
            const orderName = getText(main.header.name);
            const output = main.output ? `${ getText(main.output.target) } = ` : "";
            const funcName = {
                "输出": "alert",
                "读入": "prompt",
                "等待": "sleep",
            }[orderName];
            const params = main.paramList.defaultParamGroup.params.map((param) => {
                const content = param.content;
                console.log(content);
                if (content.kind === SyntaxKind.Literal || content.kind === SyntaxKind.QuotedLiteral) {
                    return `"${ getText(content) }"`;
                }
                return getText(content);
            }).join(", ");
            return [
                indent + output + funcName + `(${ params });`,
            ].join("\n");
        }
        case SyntaxKind.CommentStatement: {
            const comment = getText(statement.comment);
            const cooked = comment
                .split(/\r?\n/)
                .join(`\n${ indent }//`);
            return indent + cooked;
        }
        default:
            throw new Error();
    }
}

function transpileList(lines: LineData[], indent = ""): string {
    return lines.map((line) => {
        return transpileLine(line, indent);
    }).join("\n");
}

export function transpile(sourceFile: string): string {
    const data = unserialize(sourceFile);
    return `
async function sleep(time) {
    return new Promise((res) => {
        setTimeout(time, res);
    });
}
(async () => {
${ transpileList(data) }
})();
    `;
}
