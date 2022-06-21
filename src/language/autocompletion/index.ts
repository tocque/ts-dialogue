import { Statement, SyntaxKind } from "../ast/define";
import { SASTNode } from "../sast";
import { keyOrderStatementCompletion } from "./keyOrder";
import { orderStatementCompletion } from "./order";

export function autocomplete(node: SASTNode, pos: number) {
    const statement = node.getStatement();
    switch (statement.kind) {
        case SyntaxKind.OrderStatement:
            return orderStatementCompletion(statement, pos);
        case SyntaxKind.CommentStatement:
            return null;
        case SyntaxKind.UnknownStatement:
            return keyOrderStatementCompletion(statement, pos);
    }
    return null;
}
