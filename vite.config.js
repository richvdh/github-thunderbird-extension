import { fileURLToPath, URL } from "node:url";
import { defineConfig } from "vite";

// https://vitejs.dev/config/
export default defineConfig({
    root: "src",
    resolve: {
        alias: {
            "@": fileURLToPath(new URL("./src", import.meta.url)),
        },
    },
    build: {
        outDir: "../dist",
        emptyOutDir: true,
        sourcemap: true,
        // minify: false,
        rolldownOptions: {
            input: {
                background: "background.ts",
                messageDisplay: "messageDisplay.ts",
                options: "options/options.html",
            },
            output: {
                entryFileNames: "[name].js",
            },
        },
    },
});
