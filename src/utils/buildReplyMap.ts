/**
 * Build a map from comment id → in_reply_to_id for a list of review comments.
 * Comments that are not replies (in_reply_to_id is absent/null) are omitted.
 */
export function buildReplyMap(
    comments: Array<{ id: number; in_reply_to_id?: number }>,
): Map<number, number> {
    const map = new Map();
    for (const comment of comments) {
        if (comment.in_reply_to_id) {
            map.set(comment.id, comment.in_reply_to_id);
        }
    }
    return map;
}
