import { defineConfig } from "tsup";

export default defineConfig([
    {
        entry: ["src/index.ts"],
        format: ["esm"],
        outDir: "output/esm",
        sourcemap: true,
        dts: true,
        splitting: false,
        clean: true,
        target: "es2022",
        outExtension: () => ({ js: ".js" }),
    },

    {
        entry: ["src/index.cts"],
        format: ["cjs"],
        outDir: "output/cjs",
        sourcemap: true,
        splitting: false,
        clean: false,
        target: "es2022",
        outExtension: () => ({ js: ".cjs" }),
    },

    {
        entry: ["src/bin.ts"],
        format: ["esm"],
        outDir: "output",
        sourcemap: true,
        clean: false,
        target: "es2022",
        banner: {
            js: "#!/usr/bin/env node",
        },
    },
]);
