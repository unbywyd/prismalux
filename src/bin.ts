#!/usr/bin/env node
/**
 * Prismalux - Prisma Schema Highlighter
 * Developed by Artyom Gorlovetskiy (unbywyd)
 * Website: https://unbywyd.com
 * 
 * This tool helps you to highlight and filter Prisma schema files directly from the command line.
 */

import fs from "fs";
import path from "path";
import highlighter from "./highlighter.js";

// Function to load Prisma Schema
export const loadPrismaSchema = async (inputPath?: string): Promise<{ schema: string; path: string }> => {
    const cwd = process.cwd();
    let schemaPath: string | null = null;

    // Check if a path is provided
    if (inputPath) {
        // Determine if the path is absolute or relative
        const resolvedPath = path.isAbsolute(inputPath) ? inputPath : path.resolve(cwd, inputPath);

        if (fs.existsSync(resolvedPath)) {
            const stat = fs.statSync(resolvedPath);

            if (stat.isDirectory()) {
                // If it's a directory, look for `schema.prisma`
                const possibleSchemaPaths = [
                    path.join(resolvedPath, "prisma", "schema.prisma"),
                    path.join(resolvedPath, "schema.prisma")
                ];

                schemaPath = possibleSchemaPaths.find(fs.existsSync) || null;
            } else if (stat.isFile()) {
                // If it's a file, use it directly
                schemaPath = resolvedPath;
            }
        }

        if (!schemaPath) {
            throw new Error(`❌ Path "${inputPath}" does not point to a valid Prisma schema file or directory.`);
        }
    } else {
        // If no path is provided, look in standard locations
        const possibleSchemaPaths = [
            path.join(cwd, "prisma", "schema.prisma"),
            path.join(cwd, "schema.prisma")
        ];
        schemaPath = possibleSchemaPaths.find(fs.existsSync) || null;
    }

    // If no file is found, throw an error
    if (!schemaPath) {
        throw new Error(`❌ Prisma schema file not found. Try: prismalux --path=[path_to_schema]`);
    }

    // Read the file
    const schemaContent = await fs.promises.readFile(schemaPath, "utf-8");

    // Check if it's really a Prisma schema (look for keywords)
    if (!/^\s*(generator|datasource|client)\b/m.test(schemaContent)) {
        throw new Error(`❌ The file at "${schemaPath}" does not appear to be a valid Prisma schema.`);
    }

    return { schema: schemaContent, path: schemaPath };
};


// Function to parse CLI arguments
const parseArgs = (args: string[]) => {
    const options: Record<string, string | boolean> = {};
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
const filterSchemaPart = (schema: string, filterInput: string): string | null => {
    const filterNames = filterInput.split(/[,| ]+/).map(name => name.trim()).filter(name => name.length > 0);

    if (filterNames.length === 0) {
        console.error("❌ No valid model or enum names provided.");
        return null;
    }
    let results: string[] = [];

    for (const filterName of filterNames) {
        const regex = new RegExp(`\\b(model|enum)\\s+${filterName}\\s*{[\\s\\S]*?}`, "g");
        const match = schema.match(regex);
        if (match) {
            results.push(...match);
        }
    }
    return results.length > 0 ? results.join("\n\n") : null;
};


// Loading and rendering Prisma Schema
(async () => {
    try {
        const filePath = typeof options.path === "string" ? options.path : undefined;
        const { schema, path } = await loadPrismaSchema(filePath);

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

        console.log(highlighter.highlight(schemaToHighlight));
    } catch (error) {
        console.error(error instanceof Error ? error.message : "❌ An unknown error occurred.");
        process.exit(1);
    }
})();

