import { buildReplyMap } from "@/utils/buildReplyMap";

describe("buildReplyMap", () => {
    test("returns an empty map for an empty comments array", () => {
        expect(buildReplyMap([])).toEqual(new Map());
    });

    test("excludes top-level comments (null/missing in_reply_to_id)", () => {
        const comments = [{ id: 1, in_reply_to_id: null }, { id: 2 }];
        expect(buildReplyMap(comments).size).toBe(0);
    });

    test("maps reply comments correctly", () => {
        const comments = [
            { id: 10, in_reply_to_id: null }, // top-level
            { id: 20, in_reply_to_id: 10 }, // reply to 10
            { id: 30, in_reply_to_id: 20 }, // reply to 20
        ];
        const map = buildReplyMap(comments);
        expect(map.size).toBe(2);
        expect(map.get(20)).toBe(10);
        expect(map.get(30)).toBe(20);
        expect(map.has(10)).toBe(false);
    });
});
