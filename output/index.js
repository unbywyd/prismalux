#!/usr/bin/env node
import fs from "fs";
import path from "path";
import highlighter, { PrismaHighlighter } from "./highlighter.js";
// Функция для загрузки Prisma Schema
export const loadPrismaSchema = async (filePath) => {
    const cwd = process.cwd();
    let schemaPath = filePath ? path.resolve(cwd, filePath) : path.join(cwd, "prisma", "schema.prisma");
    if (!fs.existsSync(schemaPath)) {
        schemaPath = path.join(cwd, "schema.prisma");
        if (!fs.existsSync(schemaPath)) {
            throw new Error(`❌ Prisma schema file not found. Try: prismalux --path=[path_to_schema]`);
        }
    }
    const schemaContent = await fs.promises.readFile(schemaPath, "utf-8");
    return { schema: schemaContent, path: schemaPath };
};
// Функция для парсинга аргументов CLI
const parseArgs = (args) => {
    const options = {};
    args.forEach(arg => {
        const match = arg.match(/^--(\w+)(?:=(.+))?$/);
        if (match) {
            const [, key, value] = match;
            options[key] = value !== undefined ? value : true;
        }
    });
    return options;
};
// CLI: process.argv
const args = process.argv.slice(2);
const options = parseArgs(args);
// Обработка флагов --help и --version
if (options.help || options.h) {
    console.log(`
Usage: prismalux --path=[path_to_schema] [--filter=modelName]

Options:
  --help, -h      Show this help message
  --version, -v   Show the installed version
  --path=[path]   Specify a Prisma schema file (default: ./prisma/schema.prisma)
  --filter=[name] Highlight only the specified model or enum
  `);
    process.exit(0);
}
if (options.version || options.v) {
    console.log("Prismalux v0.1.0");
    process.exit(0);
}
// Фильтрация модели/enum
const filterSchemaPart = (schema, filterName) => {
    const regex = new RegExp(`\\b(model|enum)\\s+${filterName}\\s*{[\\s\\S]*?}`, "g");
    const match = schema.match(regex);
    return match ? match.join("\n") : null;
};
// Загрузка и рендеринг Prisma Schema
(async () => {
    try {
        const filePath = typeof options.path === "string" ? options.path : undefined;
        const { schema, path } = await loadPrismaSchema(filePath);
        console.log(`\n✨ Highlighting Prisma schema: ${path}\n`);
        let schemaToHighlight = schema;
        if (typeof options.filter === "string") {
            const filteredSchema = filterSchemaPart(schema, options.filter);
            if (!filteredSchema) {
                console.error(`❌ No model or enum found for "${options.filter}".`);
                process.exit(1);
            }
            schemaToHighlight = filteredSchema;
        }
        console.log(highlighter.highlight(schemaToHighlight));
    }
    catch (error) {
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
//# sourceMappingURL=index.js.map