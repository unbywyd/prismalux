#!/usr/bin/env node
/**
 * Prismalux - Prisma Schema Highlighter
 * Developed by Artyom Gorlovetskiy (unbywyd)
 * Website: https://unbywyd.com
 *
 * This tool helps you to highlight and filter Prisma schema files directly from the command line.
 */
import { PrismaHighlighter } from "./highlighter.js";
// Exporting for ESM and CommonJS
const highlighterInstance = new PrismaHighlighter();
export default highlighterInstance;
export { PrismaHighlighter };
// CommonJS export
if (typeof module !== "undefined") {
    module.exports = {
        PrismaHighlighter,
    };
}
//# sourceMappingURL=index.js.map