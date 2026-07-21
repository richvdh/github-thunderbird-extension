# GitHub Review Context – Thunderbird Extension

Adds inline parent-comment context to GitHub pull-request review emails inside
Thunderbird. When you open a review email, any reply comment will have the
original comment it is replying to inserted directly below the diff, so you
never have to switch to the browser to understand the conversation.

Before:

![Before screenshot](/doc/screenshot1.png)

After:

![After screenshot](/doc/screenshot2.png)

---

## TODO

- Stop `vitest` writing to `src/node_modules`
- Error handling: show an error in the message
- Show a spinner while fetching
- Caching: keep a record of results for recent pull requests

## Installation

Note that this extension requires Thunderbird 148 or newer.

### Build from source

1. Clone or download this repository.
2. Run `pnpm install` to install dependencies.
3. Run `pnpm build` to build the extension.
4. In Thunderbird, open **Tools → Add-on Manager**.
5. Click the gear icon → **Install Add-on From File…**.
6. Select `github-review-context.xpi`

## Running Tests

```bash
pnpm install
pnpm test
```
