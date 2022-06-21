import { Statement, SyntaxKind } from "./define";
import { visitStatement } from "./visitor";

export function extractTSSource(text: string, statement: Statement) {
    let last = 0, source: string[] = [];
    const createSpace = (length: number) => {
        return Array(length).fill(" ").join("");
    }
    visitStatement(statement, (node) => {
        if (node.kind === SyntaxKind.Expression) {
            source.push(createSpace(node.pos - last));
            source.push(`${ text.slice(node.pos, node.end) };`);
            last = node.end + 1;
        }
        return true;
    });
    return source.join("");
}
