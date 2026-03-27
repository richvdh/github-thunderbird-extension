import { describe, test, expect } from "vitest";

import { parseMessageId } from "@/utils/parseMessageId";

describe("parseMessageId", () => {
    test("returns null for empty string", () => {
        expect(parseMessageId("")).toBeNull();
    });

    test("returns null for a plain email Message-ID", () => {
        expect(parseMessageId("abc123@mail.example.com")).toBeNull();
    });

    test("returns null when the host is not github.com", () => {
        expect(
            parseMessageId("owner/repo/pull/1/review/2@gitlab.com"),
        ).toBeNull();
    });

    test("returns null when the path structure is wrong", () => {
        expect(
            parseMessageId("owner/repo/issues/1/review/2@github.com"),
        ).toBeNull();
    });

    test("returns null when pull number is missing", () => {
        expect(
            parseMessageId("owner/repo/pull/review/2@github.com"),
        ).toBeNull();
    });

    test("parses a valid GitHub review Message-ID", () => {
        const result = parseMessageId(
            "octocat/Hello-World/pull/42/review/100@github.com",
        );
        expect(result).toEqual({
            owner: "octocat",
            repo: "Hello-World",
            pullNumber: "42",
            reviewId: "100",
        });
    });

    test("handles leading/trailing whitespace", () => {
        const result = parseMessageId(
            "  octocat/Hello-World/pull/42/review/100@github.com  ",
        );
        expect(result).toEqual({
            owner: "octocat",
            repo: "Hello-World",
            pullNumber: "42",
            reviewId: "100",
        });
    });

    test("handles repos with dots and hyphens", () => {
        const result = parseMessageId(
            "my-org/my.repo-name/pull/1/review/2@github.com",
        );
        expect(result).toEqual({
            owner: "my-org",
            repo: "my.repo-name",
            pullNumber: "1",
            reviewId: "2",
        });
    });

    test("handles a geniune Message-ID", () => {
        const result = parseMessageId(
            "matrix-org/matrix-js-sdk/pull/5231/review/4007942139@github.com",
        );
        expect(result).toEqual({
            owner: "matrix-org",
            repo: "matrix-js-sdk",
            pullNumber: "5231",
            reviewId: "4007942139",
        });
    });
});
