#!/usr/bin/env node
/**
 * Prismalux - Prisma Schema Highlighter
 * Developed by Artyom Gorlovetskiy (unbywyd)
 * Website: https://unbywyd.com
 *
 * This tool helps you to highlight and filter Prisma schema files directly from the command line.
 */
import { PrismaHighlighter } from "./highlighter.js";
export declare const loadPrismaSchema: (inputPath?: string) => Promise<{
    schema: string;
    path: string;
}>;
declare const highlighterInstance: PrismaHighlighter;
export default highlighterInstance;
export { PrismaHighlighter };
//# sourceMappingURL=index.d.ts.map