#!/usr/bin/env node
"use strict";
/**
 * Prismalux - Prisma Schema Highlighter
 * Developed by Artyom Gorlovetskiy (unbywyd)
 * Website: https://unbywyd.com
 *
 * This tool helps you to highlight and filter Prisma schema files directly from the command line.
 */
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
// Function to load Prisma Schema
const loadPrismaSchema = async (inputPath) => {
    const cwd = process.cwd();
    let schemaPath = null;
    // Check if a path is provided
    if (inputPath) {
        // Determine if the path is absolute or relative
        const resolvedPath = path_1.default.isAbsolute(inputPath) ? inputPath : path_1.default.resolve(cwd, inputPath);
        if (fs_1.default.existsSync(resolvedPath)) {
            const stat = fs_1.default.statSync(resolvedPath);
            if (stat.isDirectory()) {
                // If it's a directory, look for `schema.prisma`
                const possibleSchemaPaths = [
                    path_1.default.join(resolvedPath, "prisma", "schema.prisma"),
                    path_1.default.join(resolvedPath, "schema.prisma")
                ];
                schemaPath = possibleSchemaPaths.find(fs_1.default.existsSync) || null;
            }
            else if (stat.isFile()) {
                // If it's a file, use it directly
                schemaPath = resolvedPath;
            }
        }
        if (!schemaPath) {
            throw new Error(`❌ Path "${inputPath}" does not point to a valid Prisma schema file or directory.`);
        }
    }
    else {
        // If no path is provided, look in standard locations
        const possibleSchemaPaths = [
            path_1.default.join(cwd, "prisma", "schema.prisma"),
            path_1.default.join(cwd, "schema.prisma")
        ];
        schemaPath = possibleSchemaPaths.find(fs_1.default.existsSync) || null;
    }
    // If no file is found, throw an error
    if (!schemaPath) {
        throw new Error(`❌ Prisma schema file not found. Try: prismalux --path=[path_to_schema]`);
    }
    // Read the file
    const schemaContent = await fs_1.default.promises.readFile(schemaPath, "utf-8");
    // Check if it's really a Prisma schema (look for keywords)
    if (!/^\s*(generator|datasource|client)\b/m.test(schemaContent)) {
        throw new Error(`❌ The file at "${schemaPath}" does not appear to be a valid Prisma schema.`);
    }
    return { schema: schemaContent, path: schemaPath };
};
exports.loadPrismaSchema = loadPrismaSchema;
// Function to parse CLI arguments
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
// Handling --help and --version flags
if (options.help || options.h) {
    console.log(`
Usage: prismalux --path=[path_to_schema] [--filter=modelName]

Options:
  --help, -h            Show this help message
  --version, -v         Show the installed version
  --path=[path]         Specify a Prisma schema file (default: ./prisma/schema.prisma)
  --filter=[name], --f  Highlight only the specified model or enum
  `);
    process.exit(0);
}
if (options.version || options.v) {
    console.log("Prismalux v0.1.0");
    process.exit(0);
}
// Filtering model/enum
const filterSchemaPart = (schema, filterName) => {
    const regex = new RegExp(`\\b(model|enum)\\s+${filterName}\\s*{[\\s\\S]*?}`, "g");
    const match = schema.match(regex);
    return match ? match.join("\n") : null;
};
// Loading and rendering Prisma Schema
(async () => {
    try {
        const filePath = typeof options.path === "string" ? options.path : undefined;
        const { schema, path } = await (0, exports.loadPrismaSchema)(filePath);
        console.log(`\n✨ Highlighting Prisma schema: ${path}\n`);
        let schemaToHighlight = schema;
        const filter = options?.filter || options?.f;
        if (typeof filter === "string") {
            const filteredSchema = filterSchemaPart(schema, filter);
            if (!filteredSchema) {
                console.error(`❌ No model or enum found for "${filter}".`);
                process.exit(1);
            }
            schemaToHighlight = filteredSchema;
        }
        console.log(highlighter_js_1.default.highlight(schemaToHighlight));
    }
    catch (error) {
        console.error(error instanceof Error ? error.message : "❌ An unknown error occurred.");
        process.exit(1);
    }
})();
// Exporting for ESM and CommonJS
const highlighterInstance = new highlighter_js_1.PrismaHighlighter();
exports.default = highlighterInstance.highlight.bind(highlighterInstance);
// CommonJS export
if (typeof module !== "undefined") {
    module.exports = {
        PrismaHighlighter: highlighter_js_1.PrismaHighlighter,
        highlight: highlighterInstance.highlight.bind(highlighterInstance),
        loadPrismaSchema: exports.loadPrismaSchema
    };
}
//# sourceMappingURL=index.js.map