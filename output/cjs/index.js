#!/usr/bin/env node
"use strict";
var __createBinding = (this && this.__createBinding) || (Object.create ? (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    var desc = Object.getOwnPropertyDescriptor(m, k);
    if (!desc || ("get" in desc ? !m.__esModule : desc.writable || desc.configurable)) {
      desc = { enumerable: true, get: function() { return m[k]; } };
    }
    Object.defineProperty(o, k2, desc);
}) : (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    o[k2] = m[k];
}));
var __setModuleDefault = (this && this.__setModuleDefault) || (Object.create ? (function(o, v) {
    Object.defineProperty(o, "default", { enumerable: true, value: v });
}) : function(o, v) {
    o["default"] = v;
});
var __importStar = (this && this.__importStar) || (function () {
    var ownKeys = function(o) {
        ownKeys = Object.getOwnPropertyNames || function (o) {
            var ar = [];
            for (var k in o) if (Object.prototype.hasOwnProperty.call(o, k)) ar[ar.length] = k;
            return ar;
        };
        return ownKeys(o);
    };
    return function (mod) {
        if (mod && mod.__esModule) return mod;
        var result = {};
        if (mod != null) for (var k = ownKeys(mod), i = 0; i < k.length; i++) if (k[i] !== "default") __createBinding(result, mod, k[i]);
        __setModuleDefault(result, mod);
        return result;
    };
})();
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.PrismaHighlighter = exports.loadPrismaSchema = void 0;
const fs_1 = __importDefault(require("fs"));
const path_1 = __importDefault(require("path"));
const highlighter_js_1 = __importStar(require("./highlighter.js"));
Object.defineProperty(exports, "PrismaHighlighter", { enumerable: true, get: function () { return highlighter_js_1.PrismaHighlighter; } });
// Загружаем Prisma Schema
const loadPrismaSchema = async (filePath) => {
    const cwd = process.cwd();
    let schemaPath = filePath ? path_1.default.resolve(cwd, filePath) : path_1.default.join(cwd, "prisma", "schema.prisma");
    if (!fs_1.default.existsSync(schemaPath)) {
        schemaPath = path_1.default.join(cwd, "schema.prisma");
        if (!fs_1.default.existsSync(schemaPath)) {
            throw new Error(`❌ Prisma schema file not found. Try: prismalux [path_to_schema]`);
        }
    }
    const schemaContent = await fs_1.default.promises.readFile(schemaPath, "utf-8");
    return { schema: schemaContent, path: schemaPath };
};
exports.loadPrismaSchema = loadPrismaSchema;
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
        const { schema, path } = await (0, exports.loadPrismaSchema)(filePath);
        console.log(`\n✨ Highlighting Prisma schema: ${path}\n`);
        console.log(highlighter_js_1.default.highlight(schema));
    }
    catch (error) {
        console.error(error instanceof Error ? error.message : "❌ An unknown error occurred.");
        process.exit(1);
    }
})();
// Экспортируем для ESM и CommonJS
const highlighterInstance = new highlighter_js_1.PrismaHighlighter();
exports.default = highlighterInstance.highlight.bind(highlighterInstance);
// CommonJS экспорт
if (typeof module !== "undefined") {
    module.exports = {
        PrismaHighlighter: highlighter_js_1.PrismaHighlighter,
        highlight: highlighterInstance.highlight.bind(highlighterInstance),
        loadPrismaSchema: exports.loadPrismaSchema
    };
}
//# sourceMappingURL=index.js.map