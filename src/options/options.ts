/**
 * Options page script for GitHub Review Context.
 * Handles saving/loading the GitHub personal access token via browser.storage.
 */

document.addEventListener("DOMContentLoaded", onLoaded);

async function onLoaded() {
    const tokenInput = document.getElementById("token") as HTMLInputElement;
    const toggleBtn = document.getElementById("toggleVisibility");
    const saveBtn = document.getElementById("save");
    const clearBtn = document.getElementById("clear");
    const statusEl = document.getElementById("status");

    /**
     * Display a temporary status message.
     * @param {string} message
     * @param {"success"|"error"} type
     */
    function showStatus(message, type) {
        statusEl.textContent = message;
        statusEl.className = `status ${type}`;
        setTimeout(() => {
            statusEl.textContent = "";
            statusEl.className = "status";
        }, 3000);
    }

    // Toggle token visibility.
    toggleBtn.addEventListener("click", () => {
        if (tokenInput.type === "password") {
            tokenInput.type = "text";
            toggleBtn.textContent = "Hide";
        } else {
            tokenInput.type = "password";
            toggleBtn.textContent = "Show";
        }
    });

    // Save token.
    saveBtn.addEventListener("click", async () => {
        const token = tokenInput.value.trim();
        await browser.storage.local.set({ githubToken: token });
        showStatus(
            token ? "Token saved." : "Token cleared (empty value saved).",
            "success",
        );
    });

    // Clear token.
    clearBtn.addEventListener("click", async () => {
        tokenInput.value = "";
        await browser.storage.local.remove("githubToken");
        showStatus("Token cleared.", "success");
    });

    // Load any previously saved token on page open.
    const result = await browser.storage.local.get("githubToken");
    if (result.githubToken) {
        tokenInput.value = result.githubToken;
    }
}
