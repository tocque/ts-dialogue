export const enum Keyword {
    Set,
    Let,
    Const,

    If,

    Loop,
    For,

    Break,
    Continue,

    Match,
    Case,

    Do,
    Fork,
    IIFE,

    Return,
    Await,
}

const keywordDict: Record<string, Keyword> = {};

function reigster(dictName: string, dict: Record<Keyword, string>) {
    Object.entries(dict).forEach(([ word, locale ]) => {
        if (locale in keywordDict) {
            if (keywordDict[locale] !== +word) {
                console.warn("");
            }
        } else {
            keywordDict[locale] = +word;
        }
    });
}

reigster("en", {
    [Keyword.Set]: "set",
    [Keyword.Let]: "let",
    [Keyword.Const]: "const",

    [Keyword.If]: "if",

    [Keyword.Loop]: "while",
    [Keyword.For]: "for",

    [Keyword.Break]: "break",
    [Keyword.Continue]: "continue",

    [Keyword.Match]: "match",
    [Keyword.Case]: "case",

    [Keyword.Do]: "do",
    [Keyword.Fork]: "fork",
    [Keyword.IIFE]: "iife",

    [Keyword.Return]: "return",
    [Keyword.Await]: "await",
});

export function getKeyword(name: string) {
    return keywordDict[name];
}

export function getKeywordList() {
    return Object.entries(keywordDict);
}
