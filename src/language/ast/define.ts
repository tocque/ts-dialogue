import { inRange } from "lodash-es";

export const enum SyntaxKind {
    Unknown,

    // Literal
    Literal,
    QuotedLiteral,
    AttachmentLiteral,

    // Substitution
    SubstitutionHead,
    SubstitutionTail,

    // Expression
    Expression,

    // Punctuation
    DoubleQuote,
    OpenBrace,
    CloseBrace,

    // Identifier
    Identifier,
    OrderIdentifier,
    KeyOrderIdentifier,
    ParamGroupIdentifier,

    // Keyword
    DialoguePrefix,   // #
    OrderPrefix,      // @
    SubOrderPrefix,   // &
    KeyOrderPrefix,   // %
    ParamGroupNamePrefix, // -
    OutputOperator,     // >

    // KeyOrder
    LoopValuePrefix,     // |>
    RangeForSeparator,     // ;

    // Comment
    Comment,

    TokenEnd,

    // ParseTree node
    // Statement
    DialogueStatement,
    OrderStatement,
    SubOrderStatement,

    // KeyOrderStatement
    UnknownStatement,

    AssignStatement,

    IfStatement,

    LoopStatement,
    IterateStatement,
    RangeForStatement,

    BreakStatement,
    ContinueStatement,

    MatchStatement,

    DoStatement,
    ForkStatement,

    ReturnStatement,

    AwaitStatement,

    KeyOrderStatementEnd,

    CommentStatement,

    // Header
    DialogueHeader,
    OrderHeader,
    SubOrderHeader,
    KeyOrderHeader,

    // Main
    DialogueMain,
    OrderMain,
    SubOrderMain,

    // Body
    OrderBody,

    // Param
    ParamList,
    DefaultParamGroup,
    NamedParamGroup,
    ParamGroupName,
    
    LiteralParam,
    QuotedLiteralParam,
    SubstitutionParam,

    // Output
    Output,

    // Attachment
    Attachment,
    AttachmentHead,
    AttachmentSpan,
    AttachmentSubstitution,

    // KeyOrder
    AssignOperator,
    LoopValue,
    RangeForTo,
    RangeForStep,
    AwaitExpression,
}

export interface TextRange {
    pos: number;
    end: number;
}

export interface Node extends TextRange {
    kind: SyntaxKind;
}

export interface Token<T extends SyntaxKind> extends Node {
    kind: T;
}

export function isToken(token: Node): token is Token<any> {
    return inRange(token.kind, SyntaxKind.Unknown, SyntaxKind.TokenEnd);
}

export type Param = 
    | LiteralParam
    | QuotedLiteralParam
    | SubstitutionParam
    ;

export interface LiteralParam extends Node {
    kind: SyntaxKind.LiteralParam;
    content: Token<SyntaxKind.Literal>;
}

export interface QuotedLiteralParam extends Node {
    kind: SyntaxKind.QuotedLiteralParam;
    open: Token<SyntaxKind.DoubleQuote>;
    content: Token<SyntaxKind.QuotedLiteral>;
    close: Token<SyntaxKind.DoubleQuote>;
}

export interface SubstitutionParam extends Node {
    kind: SyntaxKind.SubstitutionParam;
    open: Token<SyntaxKind.SubstitutionHead>;
    content: Token<SyntaxKind.Expression>;
    close: Token<SyntaxKind.SubstitutionTail>;
}

interface ParamGroup extends Node {
    params: Param[];
}

export interface DefaultParamGroup extends ParamGroup {
    kind: SyntaxKind.DefaultParamGroup;
}

export interface ParamGroupName extends Node {
    kind: SyntaxKind.ParamGroupName;
    prefix: Token<SyntaxKind.ParamGroupNamePrefix>;
    identifier: Token<SyntaxKind.ParamGroupIdentifier>;
}

export interface NamedParamGroup extends ParamGroup {
    kind: SyntaxKind.NamedParamGroup;
    name: ParamGroupName;
}

export interface Output extends Node {
    kind: SyntaxKind.Output
    operator: Token<SyntaxKind.OutputOperator>;
    target: Token<SyntaxKind.Identifier>;
}

export interface ParamList extends Node {
    kind: SyntaxKind.ParamList;
    defaultParamGroup: DefaultParamGroup;
    namedParamGroups: NamedParamGroup[];
}

export interface OrderBody extends Node {
    paramList: ParamList;
    output?: Output;
}

export interface AttachmentSubstitution extends Node {
    kind: SyntaxKind.AttachmentSubstitution;
    open: Token<SyntaxKind.SubstitutionHead>;
    content: Token<SyntaxKind.Expression>;
    close: Token<SyntaxKind.SubstitutionTail>;
}

export interface AttachmentHead extends Node {
    kind: SyntaxKind.AttachmentHead;
    content: Token<SyntaxKind.AttachmentLiteral>;
}

export interface AttachmentSpan extends Node {
    kind: SyntaxKind.AttachmentSpan;
    substitution: AttachmentSubstitution;
    literal: Token<SyntaxKind.AttachmentLiteral>;
}

export interface Attachment extends Node {
    kind: SyntaxKind.Attachment;
    head: AttachmentHead;
    spans: AttachmentSpan[];
}

export type Statement =
    | DialogueStatement
    | OrderStatement
    | SubOrderStatement
    | CommentStatement
    | AssignStatement 
    | IfStatement
    | LoopStatement
    | IterateStatement
    | RangeForStatement
    | BreakStatement
    | ContinueStatement
    | ReturnStatement
    | AwaitStatement
    | UnknownStatement
    ;

export interface DialogueHeader extends Node {
    kind: SyntaxKind.DialogueHeader;
    prefix: Token<SyntaxKind.DialoguePrefix>;
}

export interface DialogueMain extends OrderBody {
    kind: SyntaxKind.DialogueMain;
    header: DialogueHeader;
}

export interface DialogueStatement extends Node {
    kind: SyntaxKind.DialogueStatement;
    main?: DialogueMain;
    attachment: Attachment;
}

export interface OrderHeader extends Node {
    kind: SyntaxKind.OrderHeader;
    prefix: Token<SyntaxKind.OrderPrefix>;
    name: Token<SyntaxKind.OrderIdentifier>;
}

export interface OrderMain extends OrderBody {
    kind: SyntaxKind.OrderMain;
    header: OrderHeader;
}

export interface OrderStatement extends Node {
    kind: SyntaxKind.OrderStatement;
    main: OrderMain;
    attachment?: Attachment;
}

export interface SubOrderHeader extends Node {
    kind: SyntaxKind.SubOrderHeader;
    prefix: Token<SyntaxKind.SubOrderPrefix>;
    name: Token<SyntaxKind.OrderIdentifier>;
}

export interface SubOrderMain extends OrderBody {
    kind: SyntaxKind.SubOrderMain;
    header: SubOrderHeader;
}

export interface SubOrderStatement extends Node {
    kind: SyntaxKind.SubOrderStatement;
    main: SubOrderMain;
    attachment?: Attachment;
}

export interface CommentStatement extends Node {
    kind: SyntaxKind.CommentStatement;
    comment: Token<SyntaxKind.Comment>;
}

export interface KeyOrderHeader extends Node {
    prefix: Token<SyntaxKind.KeyOrderPrefix>;
    name: Token<SyntaxKind.KeyOrderIdentifier>;
}

type KeyOrderSyntaxKind = 
    | SyntaxKind.AssignStatement

    | SyntaxKind.IfStatement
    
    | SyntaxKind.LoopStatement
    | SyntaxKind.RangeForStatement
    | SyntaxKind.IterateStatement

    | SyntaxKind.BreakStatement
    | SyntaxKind.ContinueStatement

    | SyntaxKind.MatchStatement

    | SyntaxKind.DoStatement
    | SyntaxKind.ForkStatement

    | SyntaxKind.ReturnStatement
    | SyntaxKind.AwaitStatement
    | SyntaxKind.UnknownStatement
    ;

interface KeyOrderStatement extends Node {
    kind: KeyOrderSyntaxKind;
    header: KeyOrderHeader;
}

export interface AssignStatement extends KeyOrderStatement {
    kind: SyntaxKind.AssignStatement;
    left: Token<SyntaxKind.Identifier>;
    operator: Token<SyntaxKind.AssignOperator>;
    right: Token<SyntaxKind.Expression>;
}

export interface IfStatement extends KeyOrderStatement {
    kind: SyntaxKind.IfStatement;
    condition: Token<SyntaxKind.Expression>;
}

export interface LoopStatement extends KeyOrderStatement {
    kind: SyntaxKind.LoopStatement;
    condition: Token<SyntaxKind.Expression>;
}

export interface LoopValue extends Node {
    kind: SyntaxKind.LoopValue;
    operator: Token<SyntaxKind.LoopValuePrefix>;
    target: Token<SyntaxKind.Identifier>;
}

export interface IterateStatement extends KeyOrderStatement {
    kind: SyntaxKind.IterateStatement;
    source: Token<SyntaxKind.Expression>;
    loopValue?: LoopValue;
}

export interface RangeForTo extends Node {
    kind: SyntaxKind.RangeForTo;
    separator: Token<SyntaxKind.RangeForSeparator>;
    expression: Token<SyntaxKind.Expression>;
}

export interface RangeForStep extends Node {
    kind: SyntaxKind.RangeForStep;
    separator: Token<SyntaxKind.RangeForSeparator>;
    expression: Token<SyntaxKind.Expression>;
}

export interface RangeForStatement extends KeyOrderStatement {
    kind: SyntaxKind.RangeForStatement;
    from: Token<SyntaxKind.Expression>;
    to: RangeForTo;
    step?: RangeForStep;
    loopValue?: LoopValue;
}

export interface BreakStatement extends KeyOrderStatement {
    kind: SyntaxKind.BreakStatement;
}

export interface ContinueStatement extends KeyOrderStatement {
    kind: SyntaxKind.ContinueStatement;
}

export interface DoStatement extends KeyOrderStatement {
    kind: SyntaxKind.DoStatement;
}

export interface ForkStatement extends KeyOrderStatement {
    kind: SyntaxKind.ForkStatement;
    output?: Output;
}

export interface ReturnStatement extends KeyOrderStatement {
    kind: SyntaxKind.ReturnStatement;
    expression?: Token<SyntaxKind.Expression>;
}

export interface AwaitExpression extends Node {
    source: Token<SyntaxKind.Identifier>;
    output?: Output;
}

export interface AwaitStatement extends KeyOrderStatement {
    kind: SyntaxKind.AwaitStatement;
    list: AwaitExpression[];
}

export interface UnknownStatement extends KeyOrderStatement {
    kind: SyntaxKind.UnknownStatement;
    body: Token<SyntaxKind.Unknown>;
}

export function createTextRange(pos: number, end: number): TextRange {
    return {
        pos,
        end,
    }
}

export function copyTextRange(range: TextRange): TextRange {
    return {
        pos: range.pos,
        end: range.end,
    }
}

export function mergeTextRange(leftRange: TextRange, rightRange: TextRange): TextRange {
    return {
        pos: leftRange.pos,
        end: rightRange.end,
    }
}

export function createToken<T extends SyntaxKind>(kind: T, range: TextRange): Token<T> {
    return {
        ...range,
        kind,
    }
}

export function createLiteralParam(literal: Token<SyntaxKind.Literal>): LiteralParam {
    const range = copyTextRange(literal);
    return {
        ...range,
        kind: SyntaxKind.LiteralParam,
        content: literal,
    }
}

export function createQuotedLiteralParam(
    open: Token<SyntaxKind.DoubleQuote>,
    content: Token<SyntaxKind.QuotedLiteral>,
    close: Token<SyntaxKind.DoubleQuote>,
): QuotedLiteralParam {
    const range = mergeTextRange(open, close);
    return {
        ...range,
        kind: SyntaxKind.QuotedLiteralParam,
        open,
        content,
        close,
    }
}

export function createSubstitutionParam(
    open: Token<SyntaxKind.SubstitutionHead>,
    content: Token<SyntaxKind.Expression>,
    close: Token<SyntaxKind.SubstitutionTail>,
): SubstitutionParam {
    const range = mergeTextRange(open, close);
    return {
        ...range,
        kind: SyntaxKind.SubstitutionParam,
        open,
        content,
        close,
    }
}

export function createDefaultParamGroup(
    params: Param[],
    guard: TextRange = createTextRange(-1, -1)
): DefaultParamGroup {
    const range = mergeTextRange(params.at(0) ?? guard, params.at(-1) ?? guard);
    return {
        ...range,
        kind: SyntaxKind.DefaultParamGroup,
        params,
    }
}

export function createParamGroupName(
    prefix: Token<SyntaxKind.ParamGroupNamePrefix>,
    identifier: Token<SyntaxKind.ParamGroupIdentifier>
): ParamGroupName {
    const range = mergeTextRange(prefix, identifier);
    return {
        ...range,
        kind: SyntaxKind.ParamGroupName,
        prefix,
        identifier,
    }
}

export function createNamedParamGroup(name: ParamGroupName, params: Param[]): NamedParamGroup {
    const range = mergeTextRange(params.at(0) ?? name, params.at(-1) ?? name);
    return {
        ...range,
        kind: SyntaxKind.NamedParamGroup,
        name,
        params,
    }
}

export function createParamList(
    defaultParamGroup: DefaultParamGroup,
    namedParamGroups: NamedParamGroup[] = []
): ParamList {
    const range = mergeTextRange(defaultParamGroup, namedParamGroups.at(-1) ?? defaultParamGroup);
    return {
        ...range,
        kind: SyntaxKind.ParamList,
        defaultParamGroup,
        namedParamGroups,
    }
}

export function createOutput(operator: Token<SyntaxKind.OutputOperator>, target: Token<SyntaxKind.Identifier>): Output {
    const range = mergeTextRange(operator, target);
    return {
        ...range,
        kind: SyntaxKind.Output,
        operator,
        target,
    }
}

export function createOrderBody(paramList: ParamList, output?: Output): OrderBody {
    const range = mergeTextRange(paramList, output ?? paramList);
    return {
        ...range,
        kind: SyntaxKind.OrderBody,
        paramList,
        output,
    }
}

export function createDialogueHeader(prefix: Token<SyntaxKind.DialoguePrefix>): DialogueHeader {
    const range = copyTextRange(prefix);
    return {
        ...range,
        kind: SyntaxKind.DialogueHeader,
        prefix,
    }
}

export function createDialogueMain(header: DialogueHeader, body: OrderBody): DialogueMain {
    const range = mergeTextRange(header, body);
    return {
        ...range,
        kind: SyntaxKind.DialogueMain,
        header,
        paramList: body.paramList,
        output: body.output,
    }
}

export function createAttachmentHead(content: Token<SyntaxKind.AttachmentLiteral>): AttachmentHead {
    const range = copyTextRange(content);
    return {
        ...range,
        kind: SyntaxKind.AttachmentHead,
        content,
    }
}

export function createAttachmentSubstitution(
    open: Token<SyntaxKind.SubstitutionHead>,
    content: Token<SyntaxKind.Expression>,
    close: Token<SyntaxKind.SubstitutionTail>,
): AttachmentSubstitution {
    const range = mergeTextRange(open, close);
    return {
        ...range,
        kind: SyntaxKind.AttachmentSubstitution,
        open,
        content,
        close,
    }
}

export function createAttachmentSpan(
    substitution: AttachmentSubstitution,
    literal: Token<SyntaxKind.AttachmentLiteral>
): AttachmentSpan {
    const range = mergeTextRange(substitution, literal);
    return {
        ...range,
        kind: SyntaxKind.AttachmentSpan,
        substitution,
        literal,
    }
}

export function createAttachment(head: AttachmentHead, spans: AttachmentSpan[]): Attachment {
    const range = mergeTextRange(head, spans.at(-1) ?? head);
    return {
        ...range,
        kind: SyntaxKind.Attachment,
        head,
        spans,
    }
}

export function createDialogueStatement(attachment: Attachment, main?: DialogueMain): DialogueStatement {
    const range = mergeTextRange(main ?? attachment, attachment);
    return {
        ...range,
        kind: SyntaxKind.DialogueStatement,
        main,
        attachment,
    }
}

export function createOrderHeader(
    prefix: Token<SyntaxKind.OrderPrefix>,
    name: Token<SyntaxKind.OrderIdentifier>,
): OrderHeader {
    const range = mergeTextRange(prefix, name);
    return {
        ...range,
        kind: SyntaxKind.OrderHeader,
        prefix,
        name,
    }
}

export function createOrderMain(header: OrderHeader, body: OrderBody): OrderMain {
    const range = mergeTextRange(header, body);
    return {
        ...range,
        kind: SyntaxKind.OrderMain,
        header,
        paramList: body.paramList,
        output: body.output,
    }
}

export function createOrderStatement(main: OrderMain, attachment?: Attachment): OrderStatement {
    const range = mergeTextRange(main, attachment ?? main);
    return {
        ...range,
        kind: SyntaxKind.OrderStatement,
        main,
        attachment,
    }
}

export function createSubOrderHeader(
    prefix: Token<SyntaxKind.SubOrderPrefix>,
    name: Token<SyntaxKind.OrderIdentifier>,
): SubOrderHeader {
    const range = mergeTextRange(prefix, name);
    return {
        ...range,
        kind: SyntaxKind.SubOrderHeader,
        prefix,
        name,
    }
}

export function createSubOrderMain(header: SubOrderHeader, body: OrderBody): SubOrderMain {
    const range = mergeTextRange(header, body);
    return {
        ...range,
        kind: SyntaxKind.SubOrderMain,
        header,
        paramList: body.paramList,
        output: body.output,
    }
}

export function createSubOrderStatement(main: SubOrderMain, attachment?: Attachment): SubOrderStatement {
    const range = mergeTextRange(main, attachment ?? main);
    return {
        ...range,
        kind: SyntaxKind.SubOrderStatement,
        main,
        attachment,
    }
}

export function createKeyOrderHeader(
    prefix: Token<SyntaxKind.KeyOrderPrefix>,
    name: Token<SyntaxKind.KeyOrderIdentifier>,
): KeyOrderHeader {
    const range = mergeTextRange(prefix, name);
    return {
        ...range,
        kind: SyntaxKind.OrderHeader,
        prefix,
        name,
    }
}

export function createAssignStatement(header: KeyOrderHeader, left: Token<SyntaxKind.Identifier>, operator: Token<SyntaxKind.AssignOperator>, right: Token<SyntaxKind.Expression>): AssignStatement {
    const range = mergeTextRange(header, right);
    return {
        ...range,
        kind: SyntaxKind.AssignStatement,
        header,
        left,
        operator,
        right,
    }
}

export function createIfStatement(header: KeyOrderHeader, expression: Token<SyntaxKind.Expression>): IfStatement {
    const range = copyTextRange(header);
    return {
        ...range,
        kind: SyntaxKind.IfStatement,
        header,
        condition: expression,
    }
}

export function createLoopStatement(header: KeyOrderHeader, expression: Token<SyntaxKind.Expression>): LoopStatement {
    const range = copyTextRange(header);
    return {
        ...range,
        kind: SyntaxKind.LoopStatement,
        header,
        condition: expression,
    }
}

export function createRangeForTo(separator: Token<SyntaxKind.RangeForSeparator>, expression: Token<SyntaxKind.Expression>): RangeForTo {
    const range = mergeTextRange(separator, expression);
    return {
        ...range,
        kind: SyntaxKind.RangeForTo,
        separator,
        expression,
    }
}

export function createRangeForStep(separator: Token<SyntaxKind.RangeForSeparator>, expression: Token<SyntaxKind.Expression>): RangeForStep {
    const range = mergeTextRange(separator, expression);
    return {
        ...range,
        kind: SyntaxKind.RangeForStep,
        separator,
        expression,
    }
}

export function createLoopValue(operator: Token<SyntaxKind.LoopValuePrefix>, target: Token<SyntaxKind.Identifier>): LoopValue {
    const range = mergeTextRange(operator, target ?? operator);
    return {
        ...range,
        kind: SyntaxKind.LoopValue,
        operator,
        target,
    }
}

export function createIterateStatement(header: KeyOrderHeader, source: Token<SyntaxKind.Expression>, loopValue?: LoopValue): IterateStatement {
    const range = mergeTextRange(header, loopValue ?? source);
    return {
        ...range,
        kind: SyntaxKind.IterateStatement,
        header,
        source,
        loopValue,
    }
}

export function createRangeForStatement(header: KeyOrderHeader, from: Token<SyntaxKind.Expression>, to: RangeForTo, step?: RangeForStep, loopValue?: LoopValue): RangeForStatement {
    const range = mergeTextRange(header, loopValue ?? step ?? to);
    return {
        ...range,
        kind: SyntaxKind.RangeForStatement,
        header,
        from,
        to,
        step,
        loopValue,
    }
}

export function createBreakStatement(header: KeyOrderHeader): BreakStatement {
    const range = copyTextRange(header);
    return {
        ...range,
        kind: SyntaxKind.BreakStatement,
        header,
    }
}

export function createContinueStatement(header: KeyOrderHeader): ContinueStatement {
    const range = copyTextRange(header);
    return {
        ...range,
        kind: SyntaxKind.ContinueStatement,
        header,
    }
}

export function createReturnStatement(header: KeyOrderHeader, expression?: Token<SyntaxKind.Expression>): ReturnStatement {
    const range = mergeTextRange(header, expression ?? header);
    return {
        ...range,
        kind: SyntaxKind.ReturnStatement,
        header,
        expression,
    }
}

export function createAwaitExpression(source: Token<SyntaxKind.Identifier>, output?: Output): AwaitExpression {
    const range = mergeTextRange(source, output ?? source);
    return {
        ...range,
        kind: SyntaxKind.AwaitExpression,
        source,
        output,
    }
}

export function createAwaitStatement(header: KeyOrderHeader, list: AwaitExpression[]): AwaitStatement {
    const range = mergeTextRange(header, list.at(-1) ?? header);
    
    return {
        ...range,
        kind: SyntaxKind.AwaitStatement,
        header,
        list,
    }
}

export function createUnknownStatement(header: KeyOrderHeader, body: Token<SyntaxKind.Unknown>): UnknownStatement {
    const range = mergeTextRange(header, body);
    
    return {
        ...range,
        kind: SyntaxKind.UnknownStatement,
        header,
        body,
    }
}

export function createCommentStatement(comment: Token<SyntaxKind.Comment>): CommentStatement {
    const range = copyTextRange(comment);
    return {
        ...range,
        kind: SyntaxKind.CommentStatement,
        comment,
    }
}
