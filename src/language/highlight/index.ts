import { Decoration, Range } from "@codemirror/view";
import ts, { CharacterCodes } from "byots";
import { isToken, Statement } from "../ast/define";
import { visitStatement } from "../ast/visitor";
import { getDialogueTokenMark } from "./dialogue-mark";
import { getTSTokenMark } from "./ts-mark";

export function highlightDialogue(statement: Statement): Range<Decoration>[] {
    const decorations: Range<Decoration>[] = [];

    function attachMark(mark: Decoration, start: number, end: number) {
        if (start >= end) return;
        console.log(mark.spec.class, start, end);
        decorations.push(mark.range(start, end));
    }

    visitStatement(statement, (node) => {
        if (isToken(node)) {
            const deco = getDialogueTokenMark(node.kind);
            if (!deco) return true;
            const { pos, end } = node;
            attachMark(deco, pos, end);
        }
        return true;
    });
    return decorations;
}

export function highlightTS(sf: ts.SourceFile): Range<Decoration>[] {
    const decorations: Range<Decoration>[] = [];

    highlightNode(sf);
    return decorations;

    function useMark(mark: Decoration, start: number, end: number) {
        console.log(mark.spec.class, start, end);
        return mark.range(start, end);
    }

    function attach(mark?: Range<Decoration>) {
        if (!mark) return;
        decorations.push(mark);
    }

    function highlightNode(node: ts.Node) {
        if (ts.isToken(node)) {
            const leadingComments = ts.getLeadingCommentRanges(sf.text, node.pos) || ts.emptyArray;
            leadingComments.forEach((comment) => {
                highlightComment(comment);
            })
            const trailingComments = ts.getTrailingCommentRanges(sf.text, node.pos) || ts.emptyArray;
            trailingComments.forEach((comment) => {
                highlightComment(comment);
            })
            attach(useTokenMark(node));
        } else {
            node.getChildren().forEach((child) => {
                highlightNode(child);
            })
        }
    }

    function useTokenMark(node: ts.Token<any>) {
        const start = node.getStart(sf), end = node.getEnd();
        if (start === end) return;
        const mark = getTSTokenMark(node.kind);
        return useMark(mark, start, end);
    }

    function isJsDoc(comment: ts.CommentRange) {
        if (comment.kind === ts.SyntaxKind.SingleLineCommentTrivia) return false;
        return sf.text.charCodeAt(comment.pos+2) === CharacterCodes.asterisk
            && sf.text.charCodeAt(comment.pos+3) !== CharacterCodes.slash;
    }

    function highlightComment(comment: ts.CommentRange) {
        if (!isJsDoc(comment)) {
            attach(useCommentMark(comment));
            return;
        }
        const needMerge = [];
        while (decorations.length > 0) {
            const last = decorations.at(-1)!;
            if (last.from > comment.pos) {
                needMerge.push(last);
            } else {
                break;
            }
            decorations.pop();
        }
        let commentLast = comment.pos;
        while (needMerge.length > 0) {
            const token = needMerge.pop()!;
            attach(useCommentMark(comment, commentLast, token.from-1));
            attach(token);
            commentLast = token.to + 1;
        }
        attach(useCommentMark(comment, commentLast, comment.end));
    }

    function useCommentMark(range: ts.CommentRange): Range<Decoration>
    function useCommentMark(range: ts.CommentRange, start: number, end: number): Range<Decoration>
    function useCommentMark(range: ts.CommentRange, start = range.pos, end = range.end) {
        if (start >= end) return;
        const mark = getTSTokenMark(range.kind);
        return useMark(mark, start, end);
    }
}

export function mergeDecorations(ori: Range<Decoration>[], add: Range<Decoration>[]) {
    const merged: Range<Decoration>[] = [];
    const left = [ ...add ];
    const guard = Decoration.mark({}).range(1e18, 1e19);
    [ ...ori, guard ].forEach((deco) => {
        while (true) {
            const next = left.at(0);
            if (!next) break;
            if (next.to > deco.from) break;
            if (next.from >= (merged.at(-1)?.to ?? 0)) {
                merged.push(next);
            }
            left.shift();
        }
        merged.push(deco);
    })
    merged.pop();
    return merged;
}