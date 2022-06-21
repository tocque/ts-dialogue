import ts from "byots";

export function calTextChangeRange(newText: string, oldText: string) {
    const [ lesslen, greaterlen ] = [ newText.length, oldText.length ].sort((a, b) => a - b);
    const answer = (start: number, end: number) => {
        return ts.createTextChangeRange(
            ts.createTextSpan(start, oldText.length - end - start), newText.length - end - start
        );
    }
    const st = (() => {
        for (let i = 0; i < lesslen; i++) {
            if (newText[i] !== oldText[i]) {
                return i;
            }
        }
        return lesslen;
    })();
    if (st === lesslen) {
        if (lesslen === greaterlen) {
            return void 0;
        }
        return answer(lesslen, 0);
    }
    const en = (() => {
        for (let i = 0; i < lesslen - st; i++) {
            if (newText.at(-i-1) !== oldText.at(-i-1)) {
                return i;
            }
        }
        return lesslen - st;
    })();
    return answer(st, en);
}