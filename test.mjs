// // import { parse, parseExpression } from '@babel/parser';
// import pkg from 'byots';
// const { createSourceFile, parseNodeFactory } = pkg;
// /**
//  * 
//  * @param {string} code 
//  * @param {number} start 
//  */
// function findCloseBracket(code, start) {
//     const len = code.length;
//     const Dollar = "$";
//     const SingleQuote = `"`;
//     const DoubleQuote = `'`;
//     const BackQuote = `\``;
//     const StartBracket = "{";
//     const CloseBracket = "}";
//     const BackSlash = "\\";
//     const Slash = "/";
//     const LineBreak = "\n";
//     const Star = "*";
//     const state = [ StartBracket ];
//     const debug = (pos) => {
//         console.log(code.slice(start, pos), "=>", state);
//     }
//     // debug(start+1);
//     for (let i = start+1; i < len; i++) {
//         const ch = code[i];
//         switch (state.at(-1)) {
//             case StartBracket: {
//                 switch (ch) {
//                     case SingleQuote:
//                     case DoubleQuote:
//                     case BackQuote:
//                     case StartBracket: {
//                         state.push(ch);
//                     } break;
//                     case CloseBracket: {
//                         state.pop();
//                     } break;
//                     case Slash: {
//                         const nc = code[i+1];
//                         if (nc === Star || nc === Slash) {
//                             state.push(nc);
//                         }
//                     } break;
//                 }
//             } break;
//             case SingleQuote:
//             case DoubleQuote: {
//                 if (ch === state.at(-1)) {
//                     state.pop();
//                 } else if (ch === BackSlash) {
//                     i++;
//                 }
//             } break;
//             case BackQuote: {
//                 if (ch === BackQuote) {
//                     state.pop();
//                 } else if (ch === BackSlash) {
//                     i++;
//                 } else if (ch === Dollar && code[i+1] === StartBracket) {
//                     state.push(StartBracket);
//                     i++;
//                 }
//             } break;
//             case Slash: {
//                 if (ch === LineBreak) {
//                     state.pop();
//                 }
//             } break;
//             case Star: {
//                 if (ch === Star && code[i+1] === Slash) {
//                     state.pop();
//                     i++;
//                 }
//             } break;
//             default: {
//                 console.log(state.at(-1));
//                 throw new Error(state.at(-1));
//             }
//         }
//         // debug(i);
//         if (state.length === 0) {
//             return i;
//         }
//     }
//     return -1;
// }

// // console.log(findCloseBracket(/* JS */`{}`, 0));
// // console.log(findCloseBracket(/* JS */`{{}}`, 0));
// // console.log(findCloseBracket(/* JS */`{"{"}`, 0));
// // console.log(findCloseBracket(/* JS */`{ \`\${ "{" }\`}`, 0));
// // console.log(findCloseBracket(/* JS */`{"{\\\""}`, 0));
// // console.log(findCloseBracket(/* JS */`{() => {
// //     console.log("{}");
// //     // }}}
// //     /** } */
// // }}`, 0));

// // console.time();
// // const res = parse(`
// // switch (code) {
// //     case 200: case 201: case: get() {
// //         return true;
// //     }
// //     default: {
// //         return false; 
// //     }
// // }
// // `, {
// //     errorRecovery: true,
// //     strictMode: true,
// //     allowAwaitOutsideFunction: true,
// //     allowReturnOutsideFunction: true,
// //     tokens: true,
// //     plugins: [
// //         'typescript',
// //     ],
// // });
// // console.timeEnd();

// // console.log(res);


// console.time();
// const sf = createSourceFile("xx", `
// switch (code) {
//     case 200: case 201: case: get() {
//         return true;
//     }
//     default: {
//         return false; 
//     }
// }
// `)
// console.timeEnd();

// // console.log(sf.parseDiagnostics);

// function unserialize(data) {
//     const lines = data.split("\n");

//     const dedent = (str) => {
//         let it = 0;
//         while (str[it * 4] === " ") it++;
//         return [ it, str.slice(it * 4, it * 4 + 1), str.slice(it * 4 + 1) ];
//     }

//     const create = (content) => ({ content });
//     const stack = [ create("") ];
//     const push = (indent, content) => {
//         while (stack.length > indent + 1) {
//             stack.pop();
//         }
//         if (!stack[indent].children) {
//             stack[indent].children = [];
//         }
//         const line = create(content);
//         stack.push(line);
//         stack[indent].children.push(line);
//     };
//     const append = (content) => {
//         const last = stack.at(-1);
//         if (!last) throw new Error();
//         last.content += "\n" + content;
//     }

//     lines.forEach((line) => {
//         const [ indent, symbol, content ] = dedent(line);
//         console.log(indent, symbol, content);
//         if (symbol === "+") {
//             push(indent, content);
//         } else {
//             append(content);
//         }
//     });

//     console.log(stack);

//     return stack[0].children;
// }

// console.log(unserialize("+1"));

async function sleep(time) {
    return new Promise((res) => {
        setTimeout(time, res);
    });
}
(async () => {
//
//欢迎使用 Dialogue，这是一个贴近纯文本的可视化编程工具
//熟练使用之后，你可以获得类似于传统文本编程的编写体验
// 在Dialogue中，代码文件由一系列块组成，每一个块都代表一个语句
alert("hello, world");
n = prompt("输入一个数字");
i = 5;
while (i > 0) {
    n *= 2;
    i = i - 1;
}
if ( n > 435) {
    alert("a");
} else {
    alert("b");
}
})();