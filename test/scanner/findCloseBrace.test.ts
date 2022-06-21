import { findCloseBrace } from "@/language/parser/scanner";
import findCloseBraceTestCase from "./findCloseBrace.json";

const label = "language/parser";

test(`${ label } unserialize`, () => {
    (findCloseBraceTestCase as [ string, number ][]).forEach((testCase) => {
        expect(findCloseBrace(testCase[0], 0)).toBe(JSON.stringify(testCase[1]));
    });
});
