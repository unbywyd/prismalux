#!/usr/bin/env node
import fs from "fs";
import path from "path";
import highlighter, { PrismaHighlighter } from "./highlighter.js";
// Загружаем Prisma Schema
export const loadPrismaSchema = async (filePath?: string): Promise<{ schema: string; path: string }> => {
    const cwd = process.cwd();
    let schemaPath = filePath ? path.resolve(cwd, filePath) : path.join(cwd, "prisma", "schema.prisma");

    if (!fs.existsSync(schemaPath)) {
        schemaPath = path.join(cwd, "schema.prisma");
        if (!fs.existsSync(schemaPath)) {
            throw new Error(`❌ Prisma schema file not found. Try: prismalux [path_to_schema]`);
        }
    }

    const schemaContent = await fs.promises.readFile(schemaPath, "utf-8");
    return { schema: schemaContent, path: schemaPath };
};

// CLI: process.argv
const args = process.argv.slice(2);

if (args.includes("--help") || args.includes("-h")) {
    console.log(`
Usage: prismalux [path_to_schema]

Options:
  --help, -h      Show this help message
  --version, -v   Show the installed version
  `);
    process.exit(0);
}

if (args.includes("--version") || args.includes("-v")) {
    console.log("Prismalux v0.1.0");
    process.exit(0);
}

// Если есть путь — используем его, иначе ищем schema.prisma
(async () => {
    try {
        const filePath = args.length > 0 ? args[0] : undefined;
        const { schema, path } = await loadPrismaSchema(filePath);

        console.log(`\n✨ Highlighting Prisma schema: ${path}\n`);
        console.log(highlighter.highlight(schema));
    } catch (error) {
        console.error(error instanceof Error ? error.message : "❌ An unknown error occurred.");
        process.exit(1);
    }
})();

// Экспортируем для ESM и CommonJS
const highlighterInstance = new PrismaHighlighter();
export default highlighterInstance.highlight.bind(highlighterInstance);
export { PrismaHighlighter };

// CommonJS экспорт
if (typeof module !== "undefined") {
    module.exports = {
        PrismaHighlighter,
        highlight: highlighterInstance.highlight.bind(highlighterInstance),
        loadPrismaSchema
    };
}
