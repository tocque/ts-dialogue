/**
 * @module model/serializer
 */

import { LineData } from "./line";

export function serialize(data: LineData[], indent = ""): string {
    const lines = data.map((line) => {
        const str = indent + "+" + line.content.replaceAll("\n", "\n" + indent + "|");
        if (!line.children) return str;
        return str + "\n" + serialize(line.children, indent + "    ");
    });
    return lines.join("\n");
}

export function unserialize(data: string): LineData[] {
    const lines = data.split(/\r?\n/);

    const dedent = (str: string): [ number, string, string ] => {
        let it = 0;
        while (str[it * 4] === " ") it++;
        return [ it, str.slice(it * 4, it * 4 + 1), str.slice(it * 4 + 1) ];
    }

    const create = (content: string) => ({ content });
    const stack: LineData[] = [ create("") ];
    const push = (indent: number, content: string) => {
        while (stack.length > indent + 1) {
            stack.pop();
        }
        if (!stack[indent].children) {
            stack[indent].children = [];
        }
        const line = create(content);
        stack.push(line);
        stack[indent].children!.push(line);
    };
    const append = (content: string) => {
        const last = stack.at(-1);
        if (!last) throw new Error();
        last.content += "\n" + content;
    }

    lines.forEach((line) => {
        const [ indent, symbol, content ] = dedent(line);
        if (symbol === "+") {
            push(indent, content);
        } else {
            append(content);
        }
    });

    return stack[0].children!;
}
