import { Statement } from "@/language/ast/define";
import { Line } from "@/model/line";

export type FormInit<T extends Statement> = (line: Line, statement: T) => () => string;

export type FormHandler<T extends Statement> = (init: FormInit<T>) => void;