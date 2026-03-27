import { findCommentBlocksInDom } from "./utils/findCommentBlocksInDom";
import {
    BackgroundRequest,
    GetPullCommentResponse,
    GetReviewDataForMessageIdResponse,
} from "@/messageTypes";

// ---------------------------------------------------------------------------
// Main entry point
// ---------------------------------------------------------------------------

/**
 * Enrich the currently-displayed message with parent-comment context from
 * the GitHub API.
 */
async function enrichMessage(): Promise<void> {
    const reviewData: GetReviewDataForMessageIdResponse =
        await sendToBackground({
            action: "getReviewDataForMessageId",
        });
    if (!reviewData) return; // Not a GitHub review email.

    const { owner, repo, replyMap } = reviewData;
    if (replyMap.size === 0) return; // No reply comments – nothing to insert.

    // Locate comment blocks in the email body.
    const blocks = findCommentBlocksInDom(document);
    if (!blocks.length) return;

    // For each comment block that is a reply, fetch the parent and insert it.
    for (const { commentId, preElement } of blocks) {
        if (!replyMap.has(commentId)) continue;

        const parentId = replyMap.get(commentId);

        let data: GetPullCommentResponse;
        try {
            const r = await sendToBackground({
                action: "getPullComment",
                owner,
                repo,
                commentId: parentId,
            });
            data = r.data;
        } catch (err) {
            console.error(
                `[GitHub Review Context] Failed to fetch parent comment ${parentId}:`,
                err,
            );
            continue;
        }

        if (data.body_html) {
            addCommentHtmlToDom(data.user, data.body_html, preElement);
        }
    }
}

// Run when the message display script loads.
enrichMessage().catch((err) =>
    console.error("[GitHub Review Context] Unexpected error:", err),
);

// ---------------------------------------------------------------------------
// Helpers
// ---------------------------------------------------------------------------

/**
 * Send a message to the background script and return the response.
 * Throws if the response contains an `error` field.
 * @param {object} message
 * @returns {Promise<any>}
 */
async function sendToBackground(message: BackgroundRequest) {
    console.debug("[GitHub Review Context] Sending message:", message);
    const response = await messenger.runtime.sendMessage(message);
    console.debug("[GitHub Review Context] Received response:", response);
    if (response && response.error) {
        throw new Error(response.error);
    }
    return response;
}

function addCommentHtmlToDom(
    parentCommentUser: string,
    parentCommentHtml: string,
    insertAfter: Element,
) {
    // Create a container for the parent comment and insert it after the <pre>.
    const wrapper = document.createElement("div");
    wrapper.className = "github-review-context-parent";

    const label = document.createElement("p");
    label.className = "github-review-context-label";
    label.textContent = `↩ In reply to comment from @${parentCommentUser}:`;
    wrapper.appendChild(label);

    const body = document.createElement("div");
    body.innerHTML = parentCommentHtml;
    wrapper.appendChild(body);

    insertAfter.insertAdjacentElement("afterend", wrapper);
}
