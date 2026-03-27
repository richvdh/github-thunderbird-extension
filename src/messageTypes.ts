/** The types of request that can be sent to the background script. */
export type BackgroundRequest =
    | GetReviewDataForMessageIdRequest
    | GetPullCommentRequest;

/**
 * Parse the message-id of the current message, then fetch the review data.
 *
 * Response is {@link GetReviewDataForMessageIdResponse}.
 */
export type GetReviewDataForMessageIdRequest = {
    action: "getReviewDataForMessageId";
};

/** Response to {@link GetReviewDataForMessageIdRequest}. */
export type GetReviewDataForMessageIdResponse = null | {
    owner: string;
    repo: string;
    pullNumber: string;
    reviewId: string;
    replyMap: Map<number, number>;
};

/** Fetch a single pull request comment by its ID. */
export type GetPullCommentRequest = {
    action: "getPullComment";
    owner: string;
    repo: string;
    commentId: number;
};

/** Response to {@link GetPullCommentRequest}. */
export type GetPullCommentResponse = {
    user: string;
    body_html: string;
};
