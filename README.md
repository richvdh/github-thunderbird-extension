# GitHub Review Context – Thunderbird Extension

Adds inline parent-comment context to GitHub pull-request review emails inside
Thunderbird. When you open a review email, any reply comment will have the
original comment it is replying to inserted directly below the diff, so you
never have to switch to the browser to understand the conversation.

---

## TODO

- register the message display scripts properly
- convert to manifest V3

## Features

- **Zero-config for public repos** – the GitHub REST API is used without
  authentication for public repositories.
- **Optional token** for private repos or to avoid rate limiting.
- **Non-destructive** – only the message display is enriched; no emails are
  modified on the server.

---

## Installation

1. Clone or download this repository.
2. In Thunderbird, open **Tools → Add-on Manager**.
3. Click the gear icon → **Install Add-on From File…**
4. Select the directory (or a `.zip` of it).

> Thunderbird 102+ is required for the `messageDisplay` API.

---

## Configuration

1. Open **Tools → Add-ons → GitHub Review Context → Options** (or via the
   extension's gear icon).
2. Paste a GitHub personal access token. The token needs only
   `Pull Requests → Read` permission (fine-grained) or `repo` scope (classic).
3. Click **Save**.

---

## Project Structure

```
github-review-context/
├── manifest.json                  # Extension manifest (MV2 for Thunderbird)
├── package.json                   # Node dev-dependencies for tests
├── icons/
│   ├── icon-48.png
│   └── icon-96.png
├── src/
│   ├── background/
│   │   └── background.js          # Token storage; GitHub API proxy
│   ├── content/
│   │   └── messageDisplay.js      # Runs in the message pane; does enrichment
│   ├── options/
│   │   ├── options.html
│   │   ├── options.css
│   │   └── options.js
│   └── utils/
│       ├── github.js              # GitHub REST API helpers
│       └── parser.js              # Message-ID & HTML body parsing
└── tests/
    ├── parser.test.js             # Unit tests for parser.js
    ├── github.test.js             # Unit tests for github.js
    └── integration.test.js        # End-to-end pipeline tests
```

---

## Running Tests

```bash
npm install
npm test
```

Coverage is reported automatically.

---

## How It Works

1. **Message-ID detection** – when an email is opened, the extension reads its
   `Message-ID` header. If it matches
   `<{owner}/{repo}/pull/{pull_number}/review/{review_id}@github.com>` the
   extension proceeds; otherwise it does nothing.

2. **Fetch review comments** – calls
   `GET /repos/{owner}/{repo}/pulls/{pull_number}/reviews/{review_id}/comments`
   and builds a map of `comment_id → in_reply_to_id` for all reply comments.

3. **Locate comment blocks** – scans the email HTML body for GitHub's standard
   per-comment rendering (an `<hr>`, a `<p>In …</p>`, and a `<pre>` diff block)
   and extracts each comment's ID from the `#discussion_r{id}` anchor.

4. **Insert parent context** – for each reply comment found in the email, the
   extension fetches the parent comment via
   `GET /repos/{owner}/{repo}/pulls/comments/{parent_id}` and inserts its
   `body_html` directly after the `<pre>` diff block.

---

## Development Notes

- Thunderbird extensions use **Manifest V2** (not V3).
- `message_display_scripts` cannot use ES modules, so the utility logic is
  duplicated inline in `messageDisplay.js`. The canonical implementations live
  in `src/utils/` and are covered by the test suite.
- All GitHub API calls are proxied through the background script so that the
  stored token (from `browser.storage.local`) can be attached to requests.
