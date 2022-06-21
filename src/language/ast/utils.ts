import { TextRange } from "./define";

export function takeText(content: string, range: TextRange) {
    return content.slice(range.pos, range.end);
}
