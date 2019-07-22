import { math } from "../../src/utils";

describe("diff-match-patch-ts - utils/math", () =>
{
    it("max - 1", () =>
    {
        const a = 1.0;
        const b = 2.0;
        expect(math.max(a, b)).toEqual(b);
        expect(math.max(b, a)).toEqual(b);
    });

    it("max - 2", () =>
    {
        const a = 2.0;
        const b = 2;
        expect(math.max(a, b)).toEqual(a);
        expect(math.max(a, b)).toEqual(b);
        expect(math.max(b, a)).toEqual(a);
        expect(math.max(b, a)).toEqual(b);
    });

    it("min - 1", () =>
    {
        const a = 1.0;
        const b = 2.0;
        expect(math.min(a, b)).toEqual(a);
        expect(math.min(b, a)).toEqual(a);
    });

    it("min - 2", () =>
    {
        const a = 2.0;
        const b = 2;
        expect(math.min(a, b)).toEqual(a);
        expect(math.min(a, b)).toEqual(b);
        expect(math.min(b, a)).toEqual(a);
        expect(math.min(b, a)).toEqual(b);
    });
});
