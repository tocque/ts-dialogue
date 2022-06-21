import ts, { CharacterCodes, isIdentifierPart, isLineBreak, isWhiteSpaceSingleLine } from "byots";
import { inRange } from "lodash-es";
import { createTextRange, createToken, SyntaxKind, TextRange, Token } from "../ast/define";

export function isAlpha(charCode: number) {
    return inRange(charCode, CharacterCodes.a, CharacterCodes.z+1)
        || inRange(charCode, CharacterCodes.A, CharacterCodes.Z+1);
}

export function find(predictor: (charCode: number) => boolean): ScanOperator {
    return (source: string, start: number) => {
        const len = source.length;
        for (let i = start; i < len; i++) {
            if (predictor(source.charCodeAt(i))) return i;
        }
        return len;
    }
}

export function findCloseDoubleQuote(source: string, start: number) {
    const len = source.length;
    for (let i = start; i < len; i++) {
        const ch = source.charCodeAt(i);
        if (ch === CharacterCodes.backslash) {
            i++;
        } else if (ch === CharacterCodes.doubleQuote || isLineBreak(ch)) {
            return i;
        }
    }
    return len;
}

export function findSubstitutionHead(source: string, start: number) {
    const len = source.length;
    for (let i = start; i < len; i++) {
        const ch = source.charCodeAt(i);
        if (ch === CharacterCodes.backslash) {
            i++;
        } else if (ch === CharacterCodes.$ && source.charCodeAt(i+1) === CharacterCodes.openBrace) {
            return i;
        }
    }
    return len;
}

export function findIdentifierEnd(source: string, start: number) {
    const len = source.length;
    for (let i = start; i < len; i++) {
        const ch = source.charCodeAt(i);
        if (!isIdentifierPart(ch, ts.ScriptTarget.ESNext)) {
            return i;
        }
    }
    return len;
}

export function findLeftValueEnd(source: string, start: number) {
    const len = source.length;
    for (let i = start; i < len; i++) {
        const ch = source.charCodeAt(i);
        if (isIdentifierPart(ch, ts.ScriptTarget.ESNext)) {
            i++;
        } else {
            return i;
        }
    }
    return len;
}

export function findForSpan(source: string, start: number) {
    const len = source.length;
    for (let i = start; i < len; i++) {
        const ch = source.charCodeAt(i);
        if (ch === CharacterCodes.backslash) {
            i++;
        } else if (ch === CharacterCodes.semicolon) {
            return i;
        } else if (ch === CharacterCodes.bar && source.charCodeAt(i+1) === CharacterCodes.greaterThan) {
            return i;
        }
    }
    return len;
}

/**
 * 括号匹配
 * @param {string} source 
 * @param {number} start 
 */
export function findCloseBrace(source: string, start: number) {
    const len = source.length;
    let state = 1;
    for (let i = start; i < len; i++) {
        const ch = source.charCodeAt(i);
        if (ch === CharacterCodes.backslash) {
            i++;
        } else if (ch === CharacterCodes.openBrace) {
            state++;
        } else if (ch === CharacterCodes.closeBrace) {
            state--;
            if (state === 0) {
                return i;
            }
        }
    }
    // const state = [ CharacterCodes.openBrace ];
    // const debug = (pos: number) => {
    //     console.log(source.slice(start, pos+1), "=>", state);
    // }
    // debug(start);
    // for (let i = start; i < len; i++) {
    //     const ch = source.charCodeAt(i);
    //     switch (state.at(-1)) {
    //         case CharacterCodes.openBrace: {
    //             switch (ch) {
    //                 case CharacterCodes.singleQuote:
    //                 case CharacterCodes.doubleQuote:
    //                 case CharacterCodes.backtick:
    //                 case CharacterCodes.openBrace: {
    //                     state.push(ch);
    //                 } break;
    //                 case CharacterCodes.closeBrace: {
    //                     state.pop();
    //                 } break;
    //                 case CharacterCodes.slash: {
    //                     const nc = source.charCodeAt(i+1);
    //                     if (nc === CharacterCodes.asterisk || nc === CharacterCodes.slash) {
    //                         state.push(nc);
    //                     }
    //                 } break;
    //             }
    //         } break;
    //         case CharacterCodes.singleQuote:
    //         case CharacterCodes.doubleQuote: {
    //             if (ch === state.at(-1)) {
    //                 state.pop();
    //             } else if (ch === CharacterCodes.backslash) {
    //                 i++;
    //             }
    //         } break;
    //         case CharacterCodes.backtick: {
    //             if (ch === CharacterCodes.backtick) {
    //                 state.pop();
    //             } else if (ch === CharacterCodes.backslash) {
    //                 i++;
    //             } else if (ch === CharacterCodes.$ && source.charCodeAt(i+1) === CharacterCodes.openBracket) {
    //                 state.push(CharacterCodes.openBracket);
    //                 i++;
    //             }
    //         } break;
    //         case CharacterCodes.slash: {
    //             if (isLineBreak(ch)) {
    //                 state.pop();
    //             }
    //         } break;
    //         case CharacterCodes.asterisk: {
    //             if (ch === CharacterCodes.asterisk && source.charCodeAt(i+1) === CharacterCodes.slash) {
    //                 state.pop();
    //                 i++;
    //             }
    //         } break;
    //         default: {
    //             console.error(source, i, state);
    //             throw new Error();
    //         }
    //     }
    //     // debug(i);
    //     if (state.length === 0) {
    //         return i;
    //     }
    // }
    return len;
}

export type ScanOperator = (source: string, start: number) => number;

export class Scanner {

    readonly source: string;
    pointer: number;

    constructor(source: string, pointer = 0) {
        this.source = source;
        this.pointer = pointer;
    }

    charCodeNow() {
        return this.source.charCodeAt(this.pointer);
    }

    match(...rest: number[]) {
        for (let i = 0; i < rest.length; i++) {
            if (this.source.charCodeAt(this.pointer + i) !== rest[i]) {
                return false;
            }
        }
        return true;
    }

    skip(length: number) {
        this.pointer += length;
    }

    skipWhiteSpace() {
        while (!this.ended()) {
            const pos = this.pointer;
            const ch = this.source.charCodeAt(pos)!;
            if (!isWhiteSpaceSingleLine(ch)) {
                break;
            }
            this.pointer++;
        }
    }

    private takeRange(length: number) {
        const nowpos = this.pointer;
        this.pointer += length;
        return createTextRange(nowpos, this.pointer);
    }

    takeTokenByMatchCharCode<T extends SyntaxKind>(kind: T, ...charCodes: number[]): Token<T> | undefined {
        if (this.match(...charCodes)) {
            return createToken(kind, this.takeRange(charCodes.length));
        }
        return void 0;
    }

    takeTokenByLength<T extends SyntaxKind>(kind: T, length: number): Token<T> {
        return createToken(kind, this.takeRange(length));
    }

    takeTokenByOperator<T extends SyntaxKind>(kind: T, operator: ScanOperator) {
        const nowpos = this.pointer;
        const nextpos = operator(this.source, nowpos);
        this.pointer = nextpos;
        return createToken(kind, createTextRange(nowpos, nextpos));
    }

    takeTokenToEnd<T extends SyntaxKind>(kind: T): Token<T> {
        const nowpos = this.pointer;
        const endpos = this.source.length;
        this.pointer = endpos;
        return createToken(kind, createTextRange(nowpos, endpos));
    }

    createRange(length: number) {
        return createTextRange(this.pointer, this.pointer + length);
    }

    slice(range: TextRange) {
        return this.source.slice(range.pos, range.end);
    }

    ended() {
        return this.pointer >= this.source.length;
    }
}