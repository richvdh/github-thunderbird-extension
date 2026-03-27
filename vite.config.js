import { fileURLToPath, URL } from "node:url";
import { defineConfig } from "vite";

// https://vitejs.dev/config/
export default defineConfig({
    resolve: {
        alias: {
            "@": fileURLToPath(new URL("./src", import.meta.url)),
        },
    },
    build: {
        sourcemap: true,
        // minify: false,
        rolldownOptions: {
            input: {
                background: "src/background.ts",
                messageDisplay: "src/messageDisplay.ts",
            },
            output: {
                entryFileNames: "[name].js",
            },
        },
    },
});
