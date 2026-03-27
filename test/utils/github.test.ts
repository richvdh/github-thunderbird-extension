/**
 * Tests for src/utils/github.js
 */

import { describe, beforeEach, afterEach, test, expect } from "vitest";
import fetchMock from "fetch-mock";

import { buildHeaders, fetchReviewComments } from "@/utils/github";

describe("buildHeaders", () => {
    test("includes standard GitHub API headers without a token", () => {
        const headers = buildHeaders(null);
        expect(headers["Accept"]).toBe("application/vnd.github+json");
        expect(headers["X-GitHub-Api-Version"]).toBe("2026-03-10");
        expect(headers["Authorization"]).toBeUndefined();
    });

    test("includes standard GitHub API headers with an empty string token", () => {
        const headers = buildHeaders("");
        expect(headers["Authorization"]).toBeUndefined();
    });

    test("includes Authorization header when a token is provided", () => {
        const headers = buildHeaders("ghp_test123");
        expect(headers["Authorization"]).toBe("Bearer ghp_test123");
    });
});

describe("fetchReviewComments", () => {
    beforeEach(() => {
        fetchMock.mockGlobal();
    });
    afterEach(() => {
        fetchMock.hardReset();
        fetchMock.unmockGlobal();
    });

    test("calls the correct GitHub API URL without a token", async () => {
        fetchMock.get(
            "https://api.github.com/repos/owner/repo/pulls/42/reviews/99/comments",
            [{ id: 1, in_reply_to_id: null }],
        );

        const result = await fetchReviewComments(
            { owner: "owner", repo: "repo", pullNumber: "42", reviewId: "99" },
            "",
        );
        expect(result).toEqual([{ id: 1, in_reply_to_id: null }]);

        const calls = fetchMock.callHistory.calls();
        expect(calls.length).toEqual(1);
        expect(calls[0].options.headers["authorization"]).toBeUndefined();
    });

    test("includes Authorization header when a token is provided", async () => {
        fetchMock.get(
            "https://api.github.com/repos/owner/repo/pulls/1/reviews/2/comments",
            [],
        );

        await fetchReviewComments(
            { owner: "owner", repo: "repo", pullNumber: "1", reviewId: "2" },
            "ghp_abc",
        );

        const calls = fetchMock.callHistory.calls();
        expect(calls[0].options.headers["authorization"]).toBe(
            "Bearer ghp_abc",
        );
    });

    test("throws on non-OK response", async () => {
        fetchMock.get(
            "https://api.github.com/repos/owner/repo/pulls/1/reviews/2/comments",
            { status: 404, body: "Not Found" },
        );

        await expect(
            fetchReviewComments(
                {
                    owner: "owner",
                    repo: "repo",
                    pullNumber: "1",
                    reviewId: "2",
                },
                null,
            ),
        ).rejects.toThrow("404");
    });
});
