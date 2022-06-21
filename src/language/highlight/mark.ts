import { Decoration } from "@codemirror/view";

export const comment = Decoration.mark({ class: "comment" });
export const string = Decoration.mark({ class: "string" });
export const regexp = Decoration.mark({ class: "string-regexp" });
export const number = Decoration.mark({ class: "constant-numeric" });
export const punctuation = Decoration.mark({ class: "punctuation" });
export const identifier = Decoration.mark({ class: "variable" });
export const callable = Decoration.mark({ class: "entity-name-function" });
export const type = Decoration.mark({ class: "support-type" });

export const keyword = Decoration.mark({ class: "keyword" });
export const controlKeyword = Decoration.mark({ class: "keyword-control" });
export const operatorKeyword = Decoration.mark({ class: "keyword-operator"});
export const other = Decoration.mark({});
