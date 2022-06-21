import { syntaxTree } from "@codemirror/language";
import { Decoration, DecorationSet, EditorView, Range } from "@codemirror/view";
import { dialog } from "./lib";
import { OrderDefinition, OrderManager, Param } from "./order";
import { zip } from "lodash-es";
import { checkConstraint, ConstraintType } from "./constraint";
import { useLabel } from "./decoration";
import { Diagnostic } from "@codemirror/lint";
import { SASTNode } from "../sast";
import { OrderStatement, Param as ParamNode, ParamList, SyntaxKind, TextRange } from "../ast/define";
import { takeText } from "../ast/utils";

export type CheckResult = {
    decorations: Range<Decoration>[];
    diagnostics: Diagnostic[];
};

function nextRange(range: TextRange): TextRange {
    return { pos: range.end, end: range.end + 1 };
}

/**
 * 负责 dialog order subOrder 的检查
 * @todo 需要性能优化时，可以改写为闭包形式
 * @returns 
 */
export function checkLine(node: SASTNode): CheckResult {

    const decorations = [] as Range<Decoration>[];
    const diagnostics = [] as Diagnostic[];

    const attachLabel = decorationAttacher(useLabel);
    const attachInfo = diagnosticAttacher("info");
    const attachWarning = diagnosticAttacher("warning");
    const attachError = diagnosticAttacher("error");

    const retval = () => {
        return {
            decorations,
            diagnostics,
        }
    };
    
    const input = node.getContent();
    const statement = node.getStatement();

    // line.name: Order | Dialog | Comment
    switch (statement.kind) {
        case SyntaxKind.OrderStatement: {
            const main = statement.main;
            const orderName = getText(main.header.name);
            const definition = OrderManager.get(orderName);

            if (!definition) {
                attachError(`指令 [${ orderName }] 未被定义`, main.header.name);
                break;
            }

            checkParamList(main.paramList, definition);
        } break;
        case SyntaxKind.DialogueStatement: {
            if (statement.main) {
                checkParamList(statement.main.paramList, dialog);
            }

            break;
        }
        case SyntaxKind.CommentStatement: {
            
        } break;
    }
    return retval();

    function getText(node: TextRange) {
        return takeText(input, node);
    }

    function decorationAttacher<T extends any[]>(useDecoration: (...args: T) => Decoration) {
        return (pos: number, ...rest: T) => {
            decorations.push(useDecoration(...rest).range(pos));
        }
    }

    function diagnosticAttacher(severity: "info" | "warning" | "error") {
        return (message: string, node: TextRange) => {
            const { pos: from, end: to } = node;
            diagnostics.push({
                from, to, severity, source: "dialogue 语言服务", message,
            });
        }
    }

    type ExtractedParam = [ string, TextRange, boolean ];

    /**
     * 
     * @returns 
     */
    function extractParams(nodes: ParamNode[]): ExtractedParam[] {

        const getParamValue = (node: ParamNode): string => {
            switch (node.kind) {
                case SyntaxKind.LiteralParam:
                    return getText(node);
                case SyntaxKind.QuotedLiteralParam: {
                    return getText(node.content);
                }
                case SyntaxKind.SubstitutionParam:
                    return getText(node.content);
                default: {
                    console.log(node);
                    throw new Error("");
                }
            }
        }
        return nodes.map((node) => {
            const value = getParamValue(node);
            return [ value, node, node.kind === SyntaxKind.SubstitutionParam ];
        });
    }

    function checkParams(params: ExtractedParam[], definitions: Param[]) {
        zip(params, definitions).forEach(([ param, definition ]) => {
            if (!param) {
                if (!definition!.optional[0]) {
                    attachError("缺少参数", nextRange((statement as OrderStatement).main.header));
                }
                return;
            }
            const [ value, node, isExpression ] = param;
            if (!definition) {
                attachError("多余的参数", node);
            } else {
                // 对于表达式类型的值不做检查
                if (isExpression) return;
                const { constraint } = definition;
                const [ accept, reason ] = checkConstraint(value, constraint);
                if (!accept) {
                    if (constraint.type === ConstraintType.Free) throw new Error();
                    attachError([
                        `参数类型错误, ${ value }`,
                        reason ? reason :
                            constraint.label ? `不是${ constraint.label }` : "",
                    ].join(""), node);
                }
            }
        });
    }

    function checkParamList(list: ParamList, definition: OrderDefinition) {
        
        const defaultParam = list.defaultParamGroup;
        const params = extractParams(defaultParam.params);
        checkParams(params, definition.params);
        console.log(params, definition.params);

        list.namedParamGroups.forEach((group) => {
            const name = getText(group.name.identifier);
            const paramDefintion = definition.namedParams[name];
            if (!paramDefintion) {
                attachError(`未定义的具名参数 -${ name }`, group.name);
                return;
            }
            if (paramDefintion.label) {
                attachLabel(group.name.end, `:${ paramDefintion.label }`);
            }
            const params = extractParams(group.params);
            checkParams(params, paramDefintion.params);
            return;
        })
    }
}
