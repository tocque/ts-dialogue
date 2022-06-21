import { AssignStatement, Attachment, AttachmentHead, AttachmentSpan, AttachmentSubstitution, AwaitExpression, AwaitStatement, BreakStatement, CommentStatement, ContinueStatement, DefaultParamGroup, DialogueHeader, DialogueMain, DialogueStatement, IfStatement, IterateStatement, KeyOrderHeader, LoopStatement, LoopValue, NamedParamGroup, Node, OrderHeader, OrderMain, OrderStatement, Output, Param, ParamGroupName, ParamList, RangeForStatement, RangeForStep, RangeForTo, ReturnStatement, Statement, SubOrderHeader, SubOrderMain, SubOrderStatement, SyntaxKind, Token, UnknownStatement } from "./define";

export type Visitor = (node: Node) => boolean;

namespace Visit {

    let visitor: Visitor = () => false;

    export function setVisitor(_visitor: Visitor) {
        visitor = _visitor;
    }

    export function visitStatement(statement: Statement) {
        if (!visitor(statement)) return;
        switch (statement.kind) {
            case SyntaxKind.DialogueStatement: {
                visitDialogueStatement(statement);
            } break;
            case SyntaxKind.OrderStatement: {
                visitOrderStatement(statement);
            } break;
            case SyntaxKind.SubOrderStatement: {
                visitSubOrderStatement(statement);
            } break;
            case SyntaxKind.AssignStatement: {
                visitAssignStatement(statement);
            } break;
            case SyntaxKind.IfStatement: {
                visitIfStatement(statement);
            } break;
            case SyntaxKind.LoopStatement: {
                visitLoopStatement(statement);
            } break;
            case SyntaxKind.IterateStatement: {
                visitIterateStatement(statement);
            } break;
            case SyntaxKind.RangeForStatement: {
                visitRangeForStatement(statement);
            } break;
            case SyntaxKind.BreakStatement: {
                visitBreakStatement(statement);
            } break;
            case SyntaxKind.ContinueStatement: {
                visitContinueStatement(statement);
            } break;
            case SyntaxKind.ReturnStatement: {
                visitReturnStatement(statement);
            } break;
            case SyntaxKind.AwaitStatement: {
                visitAwaitStatement(statement);
            } break;
            case SyntaxKind.UnknownStatement: {
                visitUnknownStatement(statement);
            } break;
            case SyntaxKind.CommentStatement: {
                visitCommentStatement(statement);
            } break;
            default: 
                throw new Error();
        }
    }

    function visitToken(token: Token<any>) {
        visitor(token);
    }

    function visitParam(param: Param) {
        switch (param.kind) {
            case SyntaxKind.LiteralParam: {
                visitToken(param.content);
            } break;
            case SyntaxKind.QuotedLiteralParam: {
                visitToken(param.open);
                visitToken(param.content);
                visitToken(param.close);
            } break;
            case SyntaxKind.SubstitutionParam: {
                visitToken(param.open);
                visitToken(param.content);
                visitToken(param.close);
            } break;
        }
    }

    function visitParams(params: Param[]) {
        params.forEach((param) => {
            visitParam(param);
        })
    }

    function visitDefaultParamGroup(defaultParamGroup: DefaultParamGroup) {
        if (!visitor(defaultParamGroup)) return;
        visitParams(defaultParamGroup.params);
    }

    function visitParamGroupName(paramGroupName: ParamGroupName) {
        if (!visitor(paramGroupName)) return;
        visitToken(paramGroupName.prefix);
        visitToken(paramGroupName.identifier);
    }

    function visitNamedParamGroup(namedParamGroup: NamedParamGroup) {
        if (!visitor(namedParamGroup)) return;
        visitParamGroupName(namedParamGroup.name);
        visitParams(namedParamGroup.params);
    }

    function visitParamList(paramList: ParamList) {
        if (!visitor(paramList)) return;
        visitDefaultParamGroup(paramList.defaultParamGroup);
        paramList.namedParamGroups.forEach((group) => {
            visitNamedParamGroup(group);
        });
    }

    function visitOutput(output: Output) {
        if (!visitor(output)) return;
        visitToken(output.operator);
        visitToken(output.target);
    }

    function visitAttachmentHead(attachmentHead: AttachmentHead) {
        if (!visitor(attachmentHead)) return;
        visitToken(attachmentHead.content);
    }

    function visitAttachmentSubstitution(attachmentSubstitution: AttachmentSubstitution) {
        if (!visitor(attachmentSubstitution)) return;
        visitToken(attachmentSubstitution.open);
        visitToken(attachmentSubstitution.content);
        visitToken(attachmentSubstitution.close);
    }

    function visitAttachmentSpan(attachmentSpan: AttachmentSpan) {
        if (!visitor(attachmentSpan)) return;
        visitAttachmentSubstitution(attachmentSpan.substitution);
        visitToken(attachmentSpan.literal);
    }

    function visitAttachment(attachment: Attachment) {
        if (!visitor(attachment)) return;
        visitAttachmentHead(attachment.head);
        attachment.spans.forEach((span) => {
            visitAttachmentSpan(span);
        })
    }

    function visitDialogueHeader(header: DialogueHeader) {
        if (!visitor(header)) return;
        visitToken(header.prefix);
    }

    function visitDialogueMain(main: DialogueMain) {
        if (!visitor(main)) return;
        visitDialogueHeader(main.header);
        visitParamList(main.paramList);
        if (main.output) {
            visitOutput(main.output);
        }
    }
    
    function visitDialogueStatement(statement: DialogueStatement) {
        if (statement.main) {
            visitDialogueMain(statement.main);
        }
        visitAttachment(statement.attachment);
    }

    function visitOrderHeader(header: OrderHeader) {
        if (!visitor(header)) return;
        visitToken(header.prefix);
        visitToken(header.name);
    }

    function visitOrderMain(main: OrderMain) {
        if (!visitor(main)) return;
        visitOrderHeader(main.header);
        visitParamList(main.paramList);
        if (main.output) {
            visitOutput(main.output);
        }
    }
    
    function visitOrderStatement(statement: OrderStatement) {
        visitOrderMain(statement.main);
        if (statement.attachment) {
            visitAttachment(statement.attachment);
        }
    }

    function visitSubOrderHeader(header: SubOrderHeader) {
        if (!visitor(header)) return;
        visitToken(header.prefix);
        visitToken(header.name);
    }

    function visitSubOrderMain(main: SubOrderMain) {
        if (!visitor(main)) return;
        visitSubOrderHeader(main.header);
        visitParamList(main.paramList);
        if (main.output) {
            visitOutput(main.output);
        }
    }
    
    function visitSubOrderStatement(statement: SubOrderStatement) {
        visitSubOrderMain(statement.main);
        if (statement.attachment) {
            visitAttachment(statement.attachment);
        }
    }

    function visitKeyOrderHeader(header: KeyOrderHeader) {
        if (!visitor(header)) return;
        visitToken(header.prefix);
        visitToken(header.name);
    }

    function visitAssignStatement(statement: AssignStatement) {
        visitKeyOrderHeader(statement.header);
        visitToken(statement.left);
        visitToken(statement.operator);
        visitToken(statement.right);
    }

    function visitIfStatement(statement: IfStatement) {
        visitKeyOrderHeader(statement.header);
        visitToken(statement.condition);
    }

    function visitLoopStatement(statement: LoopStatement) {
        visitKeyOrderHeader(statement.header);
        visitToken(statement.condition);
    }

    function visitLoopValue(loopValue: LoopValue) {
        if (!visitor(loopValue)) return;
        visitToken(loopValue.operator);
        visitToken(loopValue.target);
    }

    function visitIterateStatement(statement: IterateStatement) {
        visitKeyOrderHeader(statement.header);
        visitToken(statement.source);
        if (statement.loopValue) {
            visitLoopValue(statement.loopValue);
        }
    }

    function visitRangeForTo(rangeForTo: RangeForTo) {
        if (!visitor(rangeForTo)) return;
        visitToken(rangeForTo.separator);
        visitToken(rangeForTo.expression);
    }

    function visitRangeForStep(rangeForStep: RangeForStep) {
        if (!visitor(rangeForStep)) return;
        visitToken(rangeForStep.separator);
        visitToken(rangeForStep.expression);
    }

    function visitRangeForStatement(statement: RangeForStatement) {
        visitKeyOrderHeader(statement.header);
        visitToken(statement.from);
        visitRangeForTo(statement.to);
        if (statement.step) {
            visitRangeForStep(statement.step);
        }
        if (statement.loopValue) {
            visitLoopValue(statement.loopValue);
        }
    }

    function visitBreakStatement(statement: BreakStatement) {
        visitKeyOrderHeader(statement.header);
    }

    function visitContinueStatement(statement: ContinueStatement) {
        visitKeyOrderHeader(statement.header);
    }

    function visitReturnStatement(statement: ReturnStatement) {
        visitKeyOrderHeader(statement.header);
        if (statement.expression) {
            visitToken(statement.expression);
        }
    }

    function visitAwaitExpression(expression: AwaitExpression) {
        if (!visitor(expression)) return;
        visitToken(expression.source);
        if (expression.output) {
            visitOutput(expression.output);
        }
    }

    function visitAwaitStatement(statement: AwaitStatement) {
        visitKeyOrderHeader(statement.header);
        statement.list.forEach(visitAwaitExpression);
    }

    function visitUnknownStatement(statement: UnknownStatement) {
        visitKeyOrderHeader(statement.header);
        visitToken(statement.body);
    }

    function visitCommentStatement(statement: CommentStatement) {
        visitToken(statement.comment);
    }
}

export function visitStatement(statement: Statement, visitor: Visitor) {
    Visit.setVisitor(visitor);
    Visit.visitStatement(statement);
}
