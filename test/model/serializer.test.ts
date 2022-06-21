import {LineData } from "@/model/line";
import { serialize, unserialize } from "@/model/serializer";
import serializeTestCases from "./serializer.json";

const label = "model/serializer";

test(`${ label } serialize`, () => {
    (serializeTestCases as [ LineData[], string ][]).forEach((testCase) => {
        expect(serialize(testCase[0])).toBe(testCase[1]);
    });
});

test(`${ label } unserialize`, () => {
    (serializeTestCases as [ LineData[], string ][]).forEach((testCase) => {
        expect(JSON.stringify(unserialize(testCase[1]))).toBe(JSON.stringify(testCase[0]));
    });
});
