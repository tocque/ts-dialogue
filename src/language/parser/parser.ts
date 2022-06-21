import { Diagnostic } from "@codemirror/lint";
import ts, { CharacterCodes, isIdentifierPart, isIdentifierStart, isIdentifierText, isLineBreak, isWhiteSpaceLike, ScriptTarget } from "byots";
import { createDialogueMain, createDialogueHeader, SyntaxKind, OrderBody, Token, createToken, ParamList, createOrderBody, Param, NamedParamGroup, DefaultParamGroup, createLiteralParam, createQuotedLiteralParam, createSubstitutionParam, ParamGroupName, createDefaultParamGroup, createNamedParamGroup, createParamList, Output, Attachment, createParamGroupName, TextRange, createOutput, createCommentStatement, DialogueHeader, createDialogueStatement, OrderHeader, createOrderHeader, createOrderMain, createOrderStatement, AttachmentSpan, createAttachmentHead, createAttachment, AttachmentSubstitution, createAttachmentSubstitution, createAttachmentSpan, Statement, UnknownStatement, createKeyOrderHeader, KeyOrderHeader, createUnknownStatement, ReturnStatement, createReturnStatement, BreakStatement, createBreakStatement, createContinueStatement, ContinueStatement, LoopStatement, createLoopStatement, IfStatement, createIfStatement, AwaitStatement, AwaitExpression, createAwaitExpression, createAwaitStatement, IterateStatement, RangeForStatement, AssignStatement, createAssignStatement, LoopValue, RangeForTo, RangeForStep, createIterateStatement, createLoopValue, createRangeForStatement, createRangeForTo, createRangeForStep, createSubOrderStatement, createSubOrderHeader, createSubOrderMain, SubOrderHeader } from "@/language/ast/define";
import { getKeyword, Keyword } from "@/language/nls/nls";
import { find, findCloseBrace, findCloseDoubleQuote, findForSpan, findIdentifierEnd, findSubstitutionHead, isAlpha, Scanner } from "./scanner";

function nextRange(range: TextRange): TextRange {
    return { pos: range.end, end: range.end + 1 };
}

namespace Parser {

    let scanner = new Scanner(""); 
    let diagnostics: Diagnostic[] = [];

    export function load(text: string) {
        scanner = new Scanner(text);
        diagnostics = [];
    }

    export function getDiagnostics() {
        return diagnostics;
    }

    export function parseStatement() {
        if (scanner.match(CharacterCodes.hash)) {
            return parseDialogueStatement();
        } else if (scanner.match(CharacterCodes.at)) {
            return parseOrderStatement();
        } else if (scanner.match(CharacterCodes.ampersand)) {
            return parseSubOrderStatement();
        } else if (scanner.match(CharacterCodes.percent)) {
            return parseKeyOrderStatement();
        } else if (scanner.match(CharacterCodes.slash, CharacterCodes.slash)) {
            return parseCommentStatement(); 
        } else {
            return parseUntitledDialogueStatement();
        }
    }

    function parseError(message: string, range: number | TextRange) {
        if (typeof range === "number") range = scanner.createRange(range);
        diagnostics.push({
            message,
            from: range.pos,
            to: range.end,
            severity: "error",
            source: "dialogue-parser",
        });
    }

    function expectTokenByMatchCharCode<T extends SyntaxKind>(kind: T, ...charCodes: number[]): Token<T> {
        const token = scanner.takeTokenByMatchCharCode(kind, ...charCodes);
        if (token) return token;
        parseError(`缺少 token "${ String.fromCharCode(...charCodes) }"`, charCodes.length);
        return createToken(kind, scanner.createRange(0));
    }

    function optionalTakeTokenByLength<T extends SyntaxKind>(kind: T, length: number, condition: boolean, message: string): Token<T> {
        if (condition) {
            return scanner.takeTokenByLength(kind, length);
        } else {
            parseError(message, 1);
            return scanner.takeTokenByLength(kind, 0);
        }
    }

    function parseParam(): Param | undefined {
        scanner.skipWhiteSpace();
        if (scanner.ended()) return void 0;
        // output
        if (scanner.match(CharacterCodes.greaterThan)) return void 0;
        // next group name
        if (scanner.match(CharacterCodes.minus)) return void 0;
        // attachment
        if (isLineBreak(scanner.charCodeNow())) return void 0;
        // qouted param
        if (scanner.match(CharacterCodes.doubleQuote)) {
            const open = scanner.takeTokenByLength(SyntaxKind.DoubleQuote, 1);
            const content = scanner.takeTokenByOperator(SyntaxKind.QuotedLiteral, findCloseDoubleQuote);
            const close = optionalTakeTokenByLength(SyntaxKind.DoubleQuote, 1, scanner.match(CharacterCodes.doubleQuote), "参数未终止");
            return createQuotedLiteralParam(open, content, close);
        }
        // substitution param
        if (scanner.match(CharacterCodes.$, CharacterCodes.openBrace)) {
            const open = scanner.takeTokenByLength(SyntaxKind.SubstitutionHead, 2);
            const content = scanner.takeTokenByOperator(SyntaxKind.Expression, findCloseBrace);
            const close = optionalTakeTokenByLength(SyntaxKind.SubstitutionTail, 1, !scanner.ended(), "嵌入表达式未终止");
            return createSubstitutionParam(open, content, close);
        }
        // param
        const content = scanner.takeTokenByOperator(
            SyntaxKind.Literal, find((code) => isWhiteSpaceLike(code))
        );
        return createLiteralParam(content);
    }

    function parseParams(): Param[] {
        const params = [];
        while (!scanner.ended()) {
            const param = parseParam();
            if (!param) break;
            params.push(param);
        }
        return params;
    }

    function parseDefaultParamGroup(): DefaultParamGroup {
        const range = scanner.createRange(0);
        const params = parseParams();
        return createDefaultParamGroup(params, range);
    }

    function parseParamGroupName(): ParamGroupName | undefined {
        scanner.skipWhiteSpace();
        if (scanner.ended()) return void 0;
        if (!scanner.match(CharacterCodes.minus)) return void 0;
        const prefix = scanner.takeTokenByLength(SyntaxKind.ParamGroupNamePrefix, 1);
        const name = optionalTakeTokenByLength(SyntaxKind.ParamGroupIdentifier, 1, isAlpha(scanner.charCodeNow()), "参数组名称必须是英文字母");
        return createParamGroupName(prefix, name);
    }

    function parseNamedParamGroup(): NamedParamGroup | undefined {
        const name = parseParamGroupName();
        if (!name) return void 0;
        const params = parseParams();
        return createNamedParamGroup(name, params);
    }

    /**
     * 
     */
    function parseParamList(): ParamList {
        const defaultParamGroup = parseDefaultParamGroup();
        const namedParamGroups = [];
        while (!scanner.ended()) {
            const group = parseNamedParamGroup();
            if (!group) break;
            namedParamGroups.push(group);
        }
        return createParamList(defaultParamGroup, namedParamGroups);
    }

    function parseIdentifier(): Token<SyntaxKind.Identifier> {
        const identifier = scanner.takeTokenByOperator(
            SyntaxKind.Identifier, find((code) => !isIdentifierPart(code, ts.ScriptTarget.ESNext))
        );
        if (!isIdentifierStart(scanner.source.charCodeAt(identifier.pos), ScriptTarget.ESNext)) {
            parseError("不合法的标识符名称", identifier);
        }
        return identifier;
    }

    /**
     * Output ::= ">" Identifier
     */
    function parseOutput(): Output | undefined {
        scanner.skipWhiteSpace();
        if (scanner.ended()) return void 0;
        if (!scanner.match(CharacterCodes.greaterThan)) return void 0;
        const operator = scanner.takeTokenByLength(SyntaxKind.OutputOperator, 1);
        scanner.skipWhiteSpace();
        if (scanner.ended() || isLineBreak(scanner.charCodeNow())) {
            parseError("未指定输出目标", 1);
            const identifier = scanner.takeTokenByLength(SyntaxKind.Identifier, 0);
            return createOutput(operator, identifier);
        }
        const identifier = parseIdentifier();
        return createOutput(operator, identifier);
    }

    function parseOrderBody(): OrderBody {
        const paramList = parseParamList();
        const output = parseOutput();
        return createOrderBody(paramList, output);
    }

    function checkLineBreak(): boolean {
        scanner.skipWhiteSpace();
        if (scanner.ended()) return false;
        if (isLineBreak(scanner.charCodeNow())) {
            return true;
        } else {
            const unknown = scanner.takeTokenByOperator(SyntaxKind.Unknown, find((code) => isLineBreak(code)));
            parseError("预期外的字符", unknown);
            return isLineBreak(scanner.charCodeNow());
        }
    }

    function parseAttachmentLiteral(): Token<SyntaxKind.AttachmentLiteral> {
        return scanner.takeTokenByOperator(SyntaxKind.AttachmentLiteral, findSubstitutionHead);
    }

    function parseAttachmentSubstitution(): AttachmentSubstitution {
        const head = scanner.takeTokenByLength(SyntaxKind.SubstitutionHead, 2);
        const content = scanner.takeTokenByOperator(SyntaxKind.Expression, findCloseBrace);
        const close = optionalTakeTokenByLength(SyntaxKind.SubstitutionTail, 1, !scanner.ended(), "嵌入表达式未终止");
        return createAttachmentSubstitution(head, content, close);
    }

    function parseAttachmentSpan(): AttachmentSpan {
        const substitution = parseAttachmentSubstitution();
        const literal = parseAttachmentLiteral();
        return createAttachmentSpan(substitution, literal);
    }

    function parseAttachment(): Attachment {
        const literal = parseAttachmentLiteral();
        const head = createAttachmentHead(literal);
        const spans = [];
        while (!scanner.ended()) {
            const span = parseAttachmentSpan();
            if (!span) break;
            spans.push(span);
        }
        return createAttachment(head, spans);
    }
    
    function parseUntitledDialogueStatement() {
        const attachment = parseAttachment();
        return createDialogueStatement(attachment);
    }

    function parseDialogueHeader(): DialogueHeader {
        const prefix = scanner.takeTokenByLength(SyntaxKind.DialoguePrefix, 1);
        return createDialogueHeader(prefix);
    }
    
    function parseDialogueStatement() {
        const header = parseDialogueHeader();
        const body = parseOrderBody();
        const main = createDialogueMain(header, body);
        if (!checkLineBreak()) {
            parseError("对话必须有对话体", 1);
        }
        scanner.skip(1);
        const attachment = parseAttachment();
        return createDialogueStatement(attachment, main);
    }

    function parseOrderHeader(): OrderHeader {
        const prefix = scanner.takeTokenByLength(SyntaxKind.OrderPrefix, 1);
        const name = scanner.takeTokenByOperator(
            SyntaxKind.OrderIdentifier, find((code) => isWhiteSpaceLike(code))
        );
        if (name.pos === name.end) {
            parseError("未提供指令名", 1);
        }
        return createOrderHeader(prefix, name);
    }
    
    function parseOrderStatement() {
        const header = parseOrderHeader();
        const body = parseOrderBody();
        const main = createOrderMain(header, body);
        if (!checkLineBreak()) {
            return createOrderStatement(main);
        }
        scanner.skip(1);
        const attachment = parseAttachment();
        return createOrderStatement(main, attachment);
    }

    function parseSubOrderHeader(): SubOrderHeader {
        const prefix = scanner.takeTokenByLength(SyntaxKind.SubOrderPrefix, 1);
        const name = scanner.takeTokenByOperator(
            SyntaxKind.OrderIdentifier, find((code) => isWhiteSpaceLike(code))
        );
        if (name.pos === name.end) {
            parseError("未提供指令名", 1);
        }
        return createSubOrderHeader(prefix, name);
    }
    
    function parseSubOrderStatement() {
        const header = parseSubOrderHeader();
        const body = parseOrderBody();
        const main = createSubOrderMain(header, body);
        if (!checkLineBreak()) {
            return createSubOrderStatement(main);
        }
        scanner.skip(1);
        const attachment = parseAttachment();
        return createSubOrderStatement(main, attachment);
    }

    function parseKeyOrderHeader() {
        const prefix = scanner.takeTokenByLength(SyntaxKind.KeyOrderPrefix, 1);
        const name = scanner.takeTokenByOperator(
            SyntaxKind.KeyOrderIdentifier,
            find((code) => isWhiteSpaceLike(code))
        );
        if (name.pos === name.end) {
            parseError("未提供指令名", 1);
        }
        return createKeyOrderHeader(prefix, name);
    }

    function parseAssignStatement(header: KeyOrderHeader): AssignStatement {
        scanner.skipWhiteSpace();
        const left = parseIdentifier();
        scanner.skipWhiteSpace();
        if (scanner.ended()) {
            parseError("缺少赋值运算符", nextRange(left));
        }
        const operator = scanner.takeTokenByOperator(SyntaxKind.AssignOperator, find((code) => isWhiteSpaceLike(code)));
        scanner.skipWhiteSpace();
        const right = scanner.takeTokenToEnd(SyntaxKind.Expression);
        return createAssignStatement(header, left, operator, right);
    }
    
    function parseIfStatement(header: KeyOrderHeader): IfStatement {
        const expression = scanner.takeTokenToEnd(SyntaxKind.Expression);
        return createIfStatement(header, expression);
    }

    function parseLoopStatement(header: KeyOrderHeader): LoopStatement {
        scanner.skipWhiteSpace();
        const expression = scanner.takeTokenToEnd(SyntaxKind.Expression);
        return createLoopStatement(header, expression);
    }

    function parseRangeForTo(): RangeForTo {
        const operator = scanner.takeTokenByLength(SyntaxKind.RangeForSeparator, 1);
        const expression = scanner.takeTokenByOperator(SyntaxKind.Expression, findForSpan);

        return createRangeForTo(operator, expression);
    }

    function parseRangeForStep(): RangeForStep {
        const operator = scanner.takeTokenByLength(SyntaxKind.RangeForSeparator, 1);
        const expression = scanner.takeTokenByOperator(SyntaxKind.Expression, findForSpan);

        return createRangeForStep(operator, expression);
    }

    function parseLoopValue(): LoopValue {
        const operator = scanner.takeTokenByLength(SyntaxKind.LoopValuePrefix, 2);
        scanner.skipWhiteSpace();
        const target = parseIdentifier();

        return createLoopValue(operator, target);
    }

    function parseForStatement(header: KeyOrderHeader): IterateStatement | RangeForStatement {
        scanner.skipWhiteSpace();
        const expression = scanner.takeTokenByOperator(SyntaxKind.Expression, findForSpan);

        // IterateStatement
        if (!scanner.match(CharacterCodes.semicolon)) {
            let loopValue: LoopValue | undefined = void 0;
            if (!scanner.ended()) {
                loopValue = parseLoopValue();
            }
            return createIterateStatement(header, expression, loopValue);
        } else {
            const to = parseRangeForTo();
            let step: RangeForStep | undefined = void 0;
            if (scanner.match(CharacterCodes.semicolon)) {
                step = parseRangeForStep();
            }
            let loopValue: LoopValue | undefined = void 0;
            if (!scanner.ended()) {
                loopValue = parseLoopValue();
            }
            return createRangeForStatement(header, expression, to, step, loopValue);
        }
    }

    function parseBreakStatement(header: KeyOrderHeader): BreakStatement {
        if (!scanner.ended()) {
            parseError("预料之外的代码", scanner.takeTokenToEnd(SyntaxKind.Unknown));
        }
        return createBreakStatement(header);
    }

    function parseContinueStatement(header: KeyOrderHeader): ContinueStatement {
        scanner.skipWhiteSpace();
        if (!scanner.ended()) {
            parseError("预料之外的代码", scanner.takeTokenToEnd(SyntaxKind.Unknown));
        }
        return createContinueStatement(header);
    }

    function parseReturnStatement(header: KeyOrderHeader): ReturnStatement {
        scanner.skipWhiteSpace();
        if (scanner.ended()) {
            return createReturnStatement(header);
        }
        console.log("x");
        const expression = scanner.takeTokenToEnd(SyntaxKind.Expression);
        return createReturnStatement(header, expression);
    }

    function parseAwaitExpression(): AwaitExpression {
        scanner.skipWhiteSpace();
        const source = scanner.takeTokenByOperator(SyntaxKind.Identifier, findIdentifierEnd);
        scanner.skipWhiteSpace();
        const output = parseOutput();
        return createAwaitExpression(source, output);
    }

    function parseAwaitStatement(header: KeyOrderHeader): AwaitStatement {
        scanner.skipWhiteSpace();
        if (scanner.ended()) {
            parseError("缺少要等待的目标", nextRange(header));
            return createAwaitStatement(header, []);
        }
        const head = parseAwaitExpression();
        const list = [ head ];
        while (true) {
            scanner.skipWhiteSpace();
            if (!scanner.match(CharacterCodes.comma)) {
                break;
            }
            scanner.skip(1);
            const expression = parseAwaitExpression();
            list.push(expression);
        }
        return createAwaitStatement(header, list);
    }

    function parseUnknownStatement(header: KeyOrderHeader): UnknownStatement {
        const unknown = scanner.takeTokenToEnd(SyntaxKind.Unknown);
        parseError("未知的指令名", header.name);
        return createUnknownStatement(header, unknown);
    };
    
    function parseKeyOrderStatement() {
        const header = parseKeyOrderHeader();
        const name = scanner.slice(header.name);
        const keyword = getKeyword(name);
        switch (keyword) {
            case Keyword.Set: return parseAssignStatement(header);
        //     case Keyword.Let: return letStatement(source);
        //     case Keyword.Const: return constStatement(source);

            case Keyword.If: return parseIfStatement(header);

            case Keyword.Loop: return parseLoopStatement(header);
            case Keyword.For: return parseForStatement(header);

            case Keyword.Break: return parseBreakStatement(header);
            case Keyword.Continue: return parseContinueStatement(header);

        //     case Keyword.Do: return doStatement(source);
        //     case Keyword.Fork: return forkStatement(source);
        //     case Keyword.IIFE: return iifeStatement(source);

            case Keyword.Return: return parseReturnStatement(header);
            case Keyword.Await: return parseAwaitStatement(header);
            default:
                return parseUnknownStatement(header);
        }
    }

    function parseCommentStatement() {
        const comment = scanner.takeTokenToEnd(SyntaxKind.Comment);
        return createCommentStatement(comment);
    }
}

export interface ParseResult {
    statement: Statement;
    diagnostics: Diagnostic[];
}

export function parseStatement(sourceText: string): ParseResult {
    console.time();
    Parser.load(sourceText);
    const statement = Parser.parseStatement();
    const diagnostics = Parser.getDiagnostics();
    console.timeEnd();
    return {
        statement,
        diagnostics,
    }
}
