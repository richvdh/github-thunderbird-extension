import { fileURLToPath, URL } from "node:url";
import { defineConfig } from "vite";
import fs from "node:fs";
import path from "node:path";
import pkg from "./package.json";

/// Plugin to inject the package version into maniefst.json
function injectVersion() {
    return {
        name: "inject-version",
        buildStart() {
            const root = this.environment._topLevelConfig.root;
            const outPath = path.resolve(root, "public/manifest.json");
            const template = JSON.parse(
                fs.readFileSync(
                    path.resolve(root, "manifest.template.json"),
                    "utf-8",
                ),
            );
            template.version = pkg.version;
            fs.writeFileSync(outPath, JSON.stringify(template, null, 2));
        },
    };
}

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
        minify: false,
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
    test: {
        include: ["../test/**/*.test.ts"],
    },
    plugins: [injectVersion()],
});
