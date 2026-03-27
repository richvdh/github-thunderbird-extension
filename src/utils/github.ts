/**
 * GitHub REST API utilities.
 *
 * All functions are async and return parsed JSON on success.
 * They throw an Error (with a descriptive message) on HTTP or network failure.
 */

const GITHUB_API_BASE = "https://api.github.com";

/** Information on a GitHub PR comment. The type returned by {@link fetchReviewComments} and {@link fetchPullComment}. */
export type ReviewComment = {
    user: {
        login: string;
    };
    id: number;
    in_reply_to_id?: number;
    body_html?: string;
};

/**
 * Fetch all review comments for a pull request review.
 * @param reviewDetails - details of the review to fetch
 * @param token - Optional GitHub personal access token
 * @returns Array of review comment objects.
 */
export async function fetchReviewComments(
    reviewDetails: {
        owner: string;
        repo: string;
        pullNumber: string;
        reviewId: string;
    },
    token: string,
): Promise<Array<ReviewComment>> {
    const result = await githubGet(
        `/repos/${reviewDetails.owner}/${reviewDetails.repo}/pulls/${reviewDetails.pullNumber}/reviews/${reviewDetails.reviewId}/comments`,
        token,
    );
    if (!(result instanceof Array)) {
        throw new Error("GitHub API did not return an array of comments");
    }
    return result;
}

/**
 * Fetch all comments for a pull request
 * @param reviewDetails - details of the review to fetch
 * @param token - Optional GitHub personal access token
 * @returns Array of review comment objects.
 */
export async function fetchPullComments(
    reviewDetails: {
        owner: string;
        repo: string;
        pullNumber: string;
    },
    token: string,
    callback: (comment: ReviewComment) => void,
): Promise<void> {
    let url = `${GITHUB_API_BASE}/repos/${reviewDetails.owner}/${reviewDetails.repo}/pulls/${reviewDetails.pullNumber}/comments?per_page=100`;

    while (url) {
        const response = await fetch(url, {
            method: "GET",
            headers: buildHeaders(
                token,
                "application/vnd.github-commitcomment.html+json",
            ),
        });
        if (!response.ok) {
            const body = await response.text().catch(() => "");
            throw new Error(
                `GitHub API error ${response.status} for ${url}: ${body}`,
            );
        }

        const comments = await response.json();

        if (!(comments instanceof Array)) {
            throw new Error("GitHub API did not return an array of comments");
        }
        comments.forEach(callback);

        url = response.headers.get("link")?.match(/<([^>]+)>; rel="next"/)?.[1];
    }
}

/**
 * Fetch a single pull request comment by its ID.
 * @param commentDetails - details of the comment to fetch
 * @param token - Optional GitHub personal access token
 */
export async function fetchPullComment(
    commentDetails: { owner: string; repo: string; commentId: number },
    token: string,
): Promise<ReviewComment> {
    const result = await githubGet(
        `/repos/${commentDetails.owner}/${commentDetails.repo}/pulls/comments/${commentDetails.commentId}`,
        token,
        {
            // opt into receiving body_html in the response
            acceptHeader: "application/vnd.github-commitcomment.html+json",
        },
    );
    return result as ReviewComment;
}

/**
 * Perform a GET request against the GitHub API.
 *
 * @param path - API path, e.g. "/repos/owner/repo/pulls/1/reviews/2/comments".
 * @param token - Optional GitHub personal access token.
 * @param options - Optional request options.
 * @param options.acceptHeader - Overrides the "Accept" header in the request.
 *
 * @returns Parsed JSON response body
 *
 * @throws {Error} If the request fails or returns a non-2xx status code.
 */
async function githubGet(
    path: string,
    token: string,
    options?: { acceptHeader: string },
): Promise<object> {
    const url = `${GITHUB_API_BASE}${path}`;
    const response = await fetch(url, {
        method: "GET",
        headers: buildHeaders(token, options?.acceptHeader),
    });

    if (!response.ok) {
        const body = await response.text().catch(() => "");
        throw new Error(
            `GitHub API error ${response.status} for ${url}: ${body}`,
        );
    }

    return response.json();
}
/**
 * Build request headers, optionally including an Authorization token.
 *
 * @param token - GitHub personal access token, or empty.
 * @param acceptHeader - Overrides the default "Accept" header.
 */
export function buildHeaders(
    token: string,
    acceptHeader?: string,
): HeadersInit {
    const headers = {
        Accept: acceptHeader ?? "application/vnd.github+json",
        "X-GitHub-Api-Version": "2026-03-10",
    };
    if (token) {
        headers["Authorization"] = `Bearer ${token}`;
    }
    return headers;
}
