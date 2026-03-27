/**
 * The Message-ID format used by GitHub review emails:
 *   <{owner}/{repo}/pull/{pull_number}/review/{review_id}@github.com>
 */
const MESSAGE_ID_REGEX =
    /^([^/]+)\/([^/]+)\/pull\/(\d+)\/review\/(\d+)@github\.com$/;

/** The result of {@link parseMessageId()}. */
export type MessageIdComponents = {
    owner: string;
    repo: string;
    pullNumber: string;
    reviewId: string;
};

/**
 * Parse a Message-ID header value into its constituent parts.
 *
 * @param messageId - Raw Message-ID header value, e.g.
 *   `<owner/repo/pull/42/review/99@github.com>`
 * @returns Parsed components, or `null` if the header does not match.
 */
export function parseMessageId(messageId: string): MessageIdComponents | null {
    const match = messageId.trim().match(MESSAGE_ID_REGEX);
    if (!match) return null;
    return {
        owner: match[1],
        repo: match[2],
        pullNumber: match[3],
        reviewId: match[4],
    };
}
