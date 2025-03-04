#!/usr/bin/env node
"use strict";
/**
 * Prismalux - Prisma Schema Highlighter
 * Developed by Artyom Gorlovetskiy (unbywyd)
 * Website: https://unbywyd.com
 *
 * This tool helps you to highlight and filter Prisma schema files directly from the command line.
 */
Object.defineProperty(exports, "__esModule", { value: true });
exports.PrismaHighlighter = void 0;
const highlighter_js_1 = require("./highlighter.js");
Object.defineProperty(exports, "PrismaHighlighter", { enumerable: true, get: function () { return highlighter_js_1.PrismaHighlighter; } });
// Exporting for ESM and CommonJS
const highlighterInstance = new highlighter_js_1.PrismaHighlighter();
exports.default = highlighterInstance;
// CommonJS export
if (typeof module !== "undefined") {
    module.exports = {
        PrismaHighlighter: highlighter_js_1.PrismaHighlighter,
    };
}
//# sourceMappingURL=index.js.map