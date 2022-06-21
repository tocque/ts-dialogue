import { Completion } from "@codemirror/autocomplete";
import { UnknownStatement } from "../ast/define";
import { takeText } from "../ast/utils";
import { getKeywordList } from "../nls/nls";

/**
 * 创建关键词补全
 * @todo 对于必须参数，补全其初始值
 * @param orderName 
 * @returns 
 */
function createKeyOrderCompletion(orderName: string): Completion {
    return {
        label: orderName, type: "keyword", apply: orderName + " ",
    }
}

export function keyOrderStatementCompletion(statement: UnknownStatement, pos: number) {
    const name = statement.header.name;
    if (name.end === pos) {
        const list = getKeywordList();
        return {
            from: name.pos,
            options: list
                .map(([ name ]) => name)
                .map(createKeyOrderCompletion),
        }
    }

    return null;
}
 