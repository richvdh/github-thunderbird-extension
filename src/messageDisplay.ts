import { findCommentBlocksInDom } from "./utils/findCommentBlocksInDom";
import {
    BackgroundRequest,
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
    // Locate comment blocks in the email body.
    const blocks = findCommentBlocksInDom(document);
    if (!blocks.length) return;

    // Show a spinner under each diff while we wait for the GitHub API.
    const spinners = blocks.map(({ preElement }) =>
        addSpinnerToDom(preElement),
    );

    let reviewData: GetReviewDataForMessageIdResponse;
    try {
        reviewData = (await sendToBackground({
            action: "getReviewDataForMessageId",
        })) as GetReviewDataForMessageIdResponse;
    } finally {
        for (const spinner of spinners) spinner.remove();
    }

    if (!reviewData) return; // Not a GitHub review email.

    const { commentData } = reviewData;
    if (commentData.size === 0) return; // No reply comments – nothing to insert.

    // For each comment block that is a reply, fetch the parent and insert it.
    for (const { commentId, preElement } of blocks) {
        let parentId = commentData.get(commentId)?.inReplyToId;
        while (parentId) {
            const thisCommentData = commentData.get(parentId);
            if (!thisCommentData) break;
            addCommentHtmlToDom(
                thisCommentData.user,
                thisCommentData.body_html,
                preElement,
            );
            parentId = thisCommentData.inReplyToId;
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
 */
async function sendToBackground(message: BackgroundRequest): Promise<object> {
    //console.debug("[GitHub Review Context] Sending message:", message);
    const response = await messenger.runtime.sendMessage(message);
    //console.debug("[GitHub Review Context] Received response:", response);
    if (response && response.error) {
        throw new Error(response.error);
    }
    return response;
}

function addCommentHtmlToDom(
    parentCommentUser: string,
    parentCommentHtml: string,
    insertAfter: Element,
): void {
    // Create a container for the parent comment and insert it after the <pre>.
    const wrapper = document.createElement("div");
    wrapper.className = "github-review-context-parent";

    const label = document.createElement("p");
    label.className = "github-review-context-label";
    label.textContent = `↩ In reply to comment from @${parentCommentUser}:`;
    wrapper.appendChild(label);

    const replyBodyDiv = document.createElement("div");
    replyBodyDiv.setHTML(parentCommentHtml);
    wrapper.appendChild(replyBodyDiv);

    insertAfter.insertAdjacentElement("afterend", wrapper);
}

/**
 * Insert a "loading" placeholder after the given element, to show that we are
 * waiting for data from GitHub.
 *
 * @returns the inserted element
 */
function addSpinnerToDom(insertAfter: Element): Element {
    const wrapper = document.createElement("div");
    wrapper.className =
        "github-review-context-parent github-review-context-loading";
    wrapper.setAttribute("role", "status");

    const spinner = document.createElement("div");
    spinner.className = "github-review-context-spinner";
    wrapper.appendChild(spinner);

    const label = document.createElement("p");
    label.className = "github-review-context-label";
    label.textContent = "Loading comment context…";
    wrapper.appendChild(label);

    insertAfter.insertAdjacentElement("afterend", wrapper);
    return wrapper;
}
