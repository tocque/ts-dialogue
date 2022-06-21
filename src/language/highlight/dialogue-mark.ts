import { SyntaxKind } from "../ast/define";
import { callable, comment, controlKeyword, identifier, keyword, number, operatorKeyword, other, punctuation, regexp, string, type } from "./mark";

export function getDialogueTokenMark(token: SyntaxKind) {
    switch (token) {
    case SyntaxKind.Unknown:
        return other;

    // Literal
    case SyntaxKind.Literal:
        return identifier;
    case SyntaxKind.QuotedLiteral:
        return string;
    case SyntaxKind.AttachmentLiteral:
        return void 0;

    // Substitution
    case SyntaxKind.SubstitutionHead:
    case SyntaxKind.SubstitutionTail:
        return keyword;
    case SyntaxKind.Expression:
        return void 0;

    // Punctuation
    case SyntaxKind.DoubleQuote:
        return string;
    case SyntaxKind.OpenBrace:
    case SyntaxKind.CloseBrace:
        return punctuation;

    // Identifier
    case SyntaxKind.Identifier:
        return identifier;
    case SyntaxKind.OrderIdentifier:
        return callable;
    case SyntaxKind.KeyOrderIdentifier:
        return controlKeyword;
    case SyntaxKind.ParamGroupIdentifier:
        return identifier;

    // Keyword
    case SyntaxKind.DialoguePrefix:       // #
    case SyntaxKind.OrderPrefix:          // @
    case SyntaxKind.SubOrderPrefix:       // &
    case SyntaxKind.KeyOrderPrefix:       // %
    case SyntaxKind.ParamGroupNamePrefix: // -
        return punctuation;
    case SyntaxKind.OutputOperator:       // >
    case SyntaxKind.LoopValuePrefix:
        return keyword;

    // Comment
    case SyntaxKind.Comment:
        return comment;
    default:
        return other;
    }
}
