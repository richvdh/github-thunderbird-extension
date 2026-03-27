# GitHub Review Context – Thunderbird Extension

Adds inline parent-comment context to GitHub pull-request review emails inside
Thunderbird. When you open a review email, any reply comment will have the
original comment it is replying to inserted directly below the diff, so you
never have to switch to the browser to understand the conversation.

---

## TODO

- Stop `vitest` writing to `src/node_modules`
- Error handling: show an error in the message
- Show a spinner while fetching
- Caching: keep a record of results for recent pull requests

## Installation

1. Clone or download this repository.
2. Run `npm install` to install dependencies.
3. Run `npm run build` to build the extension.
4. In Thunderbird, open **Tools → Add-on Manager**.
5. Click the gear icon → **Install Add-on From File…**
6. Select the `dist` directory (or a `.zip` of it).


## Running Tests

```bash
npm install
npm test
```
