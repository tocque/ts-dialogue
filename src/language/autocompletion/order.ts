/**
 * @todo 命名空间折叠
 */
import { Completion } from "@codemirror/autocomplete";
import { OrderStatement } from "../ast/define";
import { takeText } from "../ast/utils";
import { OrderManager } from "../type/order";

/**
 * 创建指令补全
 * @todo 对于必须参数，补全其初始值
 * @param orderName 
 * @returns 
 */
function createOrderNameCompletion(orderName: string): Completion {
    return {
        label: orderName, type: "function", apply: orderName + " "
    }
}

export function orderStatementCompletion(statement: OrderStatement,  pos: number) {
    const main = statement.main;
    const name = main.header.name;
    if (name.end === pos) {
        const list = OrderManager.list();
        return {
            from: name.pos,
            options: list
                .map(createOrderNameCompletion),
        }
    }

    return null;
}
