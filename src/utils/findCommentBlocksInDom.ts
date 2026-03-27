export type CommentBlock = { commentId: number; preElement: Element };

/**
 * Find all GitHub review comment blocks in the message body document and
 * return insertion descriptors.
 *
 * Each GitHub review comment in the email looks like:
 *
 *   <hr>
 *   <p>In <a href="…#discussion_r{comment_id}">…</a>:</p>
 *   <pre style="color:#555">…diff…</pre>
 *   …comment body…
 *
 * We locate these by walking the DOM so we can insert nodes cleanly.
 */
export function findCommentBlocksInDom(doc: Document): Array<CommentBlock> {
    const results = [];

    // Find all anchors whose href contains #discussion_r<digits>
    const anchors = doc.querySelectorAll('a[href*="#discussion_r"]');

    for (const anchor of anchors) {
        const match = (anchor as HTMLAnchorElement).href.match(
            /#discussion_r(\d+)/,
        );
        if (!match) continue;

        const commentId = parseInt(match[1], 10);

        // The <pre> is expected to be the next sibling element of the <p> that
        // contains this anchor.
        const paragraph = anchor.closest("p");
        if (!paragraph) continue;

        const pre = paragraph.nextElementSibling;
        if (!pre || pre.tagName.toLowerCase() !== "pre") continue;

        results.push({ commentId, preElement: pre });
    }

    return results;
}
