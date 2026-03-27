import { describe, expect, test } from "vitest";
import { JSDOM } from "jsdom";

import { findCommentBlocksInDom } from "@/utils/findCommentBlocksInDom";

function parseHTMLToDOM(singleBlock: string) {
    const dom = new JSDOM(singleBlock);
    const doc = dom.window.document;
    return doc;
}

describe("findCommentBlocksInDom", () => {
    test("finds a single comment block", () => {
        const singleBlock = `
<hr>
<p>In <a href="https://github.com/owner/repo/pull/1?email_source=notifications#discussion_r123456">src/foo.ts</a>:</p>
<pre style='color:#555'>@@ -1,4 +1,5 @@
 line1
 line2
</pre>
<p>Great change!</p>
`;

        const blocks = findCommentBlocksInDom(parseHTMLToDOM(singleBlock));
        expect(blocks).toHaveLength(1);
        expect(blocks[0].commentId).toBe(123456);
        expect(blocks[0].preElement.outerHTML).toMatch(/<pre[\s\S]*?<\/pre>/);
    });

    test("returns empty array for HTML with no comment blocks", () => {
        expect(
            findCommentBlocksInDom(parseHTMLToDOM("<p>Hello world</p>")),
        ).toEqual([]);
    });

    test("finds multiple comment blocks", () => {
        const html = `
<hr>
<p>In <a href="https://github.com/o/r/pull/1#discussion_r111">a.ts</a>:</p>
<pre style='color:#555'>diff1</pre>
<p>comment 1</p>

<hr>
<p>In <a href="https://github.com/o/r/pull/1#discussion_r222">b.ts</a>:</p>
<pre style='color:#555'>diff2</pre>
<p>comment 2</p>
`;
        const blocks = findCommentBlocksInDom(parseHTMLToDOM(html));
        expect(blocks).toHaveLength(2);
        expect(blocks[0].commentId).toBe(111);
        expect(blocks[1].commentId).toBe(222);
    });
});
