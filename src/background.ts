/**
 * Background script for the GitHub Review Context extension.
 *
 * Responsibilities:
 *   - Expose a helper to retrieve the stored GitHub token.
 *   - Listen for messages from the message-display content script and
 *     proxy GitHub API calls (content scripts cannot set arbitrary headers
 *     directly in all Thunderbird versions, so we centralise fetching here).
 */

import MessageSender = messenger.runtime.MessageSender;

import { fetchPullComment, fetchReviewComments } from "./utils/github";
import { parseMessageId } from "./utils/parseMessageId";
import { buildReplyMap } from "@/utils/buildReplyMap";
import {
    BackgroundRequest,
    GetPullCommentResponse,
    GetReviewDataForMessageIdResponse,
} from "@/messageTypes";

/*
 * Tell Thunderbird that it should load our message display script whenever a message is displayed
 */
messenger.messageDisplayScripts
    .register({
        js: [{ file: "/messageDisplay.js" }],
        css: [{ file: "/messageDisplay.css" }],
    })
    .then(
        () => console.log("Registered message display script"),
        (err) =>
            console.error("Failed to register message display script:", err),
    );

/*
 * Handle messages from the message-display script.
 */
messenger.runtime.onMessage.addListener(
    async (message: BackgroundRequest, sender: MessageSender) => {
        if (message.action === "getReviewDataForMessageId") {
            return await handleGetReviewDataForMessageId(sender);
        }

        if (message.action === "getPullComment") {
            return { data: await handleGetPullComment(message) };
        }
    },
);

/**
 * Handle a `getReviewCommentMap` message from the message-display script.
 *
 * @param sender - the details of the sender
 *
 */
async function handleGetReviewDataForMessageId(
    sender: MessageSender,
): Promise<GetReviewDataForMessageIdResponse> {
    // First of all, try and get the 'Message-ID' header of the email displayed in the sending tab.
    const message = await messenger.messageDisplay.getDisplayedMessage(
        sender.tab.id,
    );
    const parsedMessageId = parseMessageId(message.headerMessageId);
    if (!parsedMessageId) {
        return null;
    }
    console.log("[GitHub Review Context] Parsed Message-ID:", parsedMessageId);

    // Fetch review comments and build the reply map.
    const reviewComments = await fetchReviewComments(
        parsedMessageId,
        await getToken(),
    );
    console.log("[GitHub Review Context] Got review comments:", reviewComments);
    const replyMap = buildReplyMap(reviewComments);

    return { ...parsedMessageId, replyMap };
}

async function handleGetPullComment(message: {
    owner: string;
    repo: string;
    commentId: number;
}): Promise<GetPullCommentResponse> {
    const commentData = await fetchPullComment(message, await getToken());
    console.log("[GitHub Review Context] Got pull comment data:", commentData);

    return {
        user: commentData.user.login,
        body_html: commentData.body_html,
    };
}

/**
 * Retrieve the stored GitHub personal access token.
 * Returns an empty string if none has been set.
 */
async function getToken(): Promise<string> {
    const result = await messenger.storage.local.get("githubToken");
    return result.githubToken || "";
}
