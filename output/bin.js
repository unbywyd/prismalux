#!/usr/bin/env node

// src/bin.ts
import fs from "fs";
import path from "path";

// src/highlighter.ts
var PrismaHighlighter = class _PrismaHighlighter {
  config;
  static DEFAULT_COLORS = {
    reset: "\x1B[0m",
    gray: "\x1B[90m",
    whiteBold: "\x1B[1;37m",
    cyanBold: "\x1B[1;36m",
    purple: "\x1B[38;5;201m",
    lightPurple: "\x1B[38;5;177m",
    purpleDark: "\x1B[38;5;93m",
    darkBlue: "\x1B[38;5;63m",
    lightBlue: "\x1B[38;5;111m",
    yellow: "\x1B[33m",
    yellowBold: "\x1B[1;33m",
    yellowBright: "\x1B[93m",
    orange: "\x1B[38;5;208m",
    green: "\x1B[32m",
    greenBright: "\x1B[92m",
    cyan: "\x1B[36m",
    cyanLight: "\x1B[96m",
    greenDark: "\x1B[38;5;22m"
  };
  static PRISMA_TYPES = /* @__PURE__ */ new Set([
    "String",
    "Int",
    "Boolean",
    "DateTime",
    "Json",
    "Float",
    "Decimal",
    "BigInt",
    "Bytes"
  ]);
  constructor(config = {}) {
    this.config = {
      enableColors: config.enableColors ?? true,
      colors: { ..._PrismaHighlighter.DEFAULT_COLORS, ...config.colors }
    };
  }
  colorize(text, color) {
    if (!this.config.enableColors) return text;
    return `${this.config.colors[color] || ""}${text}${this.config.colors.reset}`;
  }
  highlight(schema) {
    return schema.replace(/\r\n/g, "\n").split("\n").map((_line) => {
      const line = _line.replace(
        /@\w+(?=\s|$)/g,
        (match) => this.colorize(match, "greenBright")
      ).replace(/(@\w+)(\()([^()]*)(\))/g, (_, annotation, openBracket, args2, closeBracket) => {
        const content = args2.split(",").map((arg) => {
          if (/^\s*"([^"]+)"\s*$/.test(arg)) return this.colorize(arg, "purpleDark");
          if (arg.includes(":")) {
            const [key, value] = arg.split(":").map((part) => part.trim());
            const coloredValue = value.replace(
              /\[(.*?)\]/g,
              (_2, inner) => `${this.colorize("[", "yellowBright")}${this.colorize(inner, "orange")}${this.colorize("]", "yellowBright")}`
            );
            return `${this.colorize(key, "yellowBright")}: ${coloredValue}`;
          }
          return this.colorize(arg, "cyan");
        }).join(", ");
        return this.colorize(annotation, "yellow") + this.colorize(openBracket, "yellowBold") + content + this.colorize(closeBracket, "yellowBold");
      }).replace(/(@\w+)(\s*\(\s*)(.+)(\s*\))/g, (_, annotation, openBracket, value, closeBracket) => {
        return this.colorize(annotation, "yellow") + this.colorize(openBracket, "yellowBright") + this.colorize(value, "cyan") + this.colorize(closeBracket, "yellowBright");
      }).replace(
        /\b(model|enum)\s+([A-Z][a-zA-Z0-9_]*)/g,
        (_, keyword, modelName) => `${this.colorize(keyword, "cyanBold")} ${this.colorize(modelName, "purple")}`
      ).replace(
        /\/\/(.*)$/gm,
        (_, comment) => this.colorize("// " + comment, "green")
      ).replace(
        /\/\*([\s\S]*?)\*\//g,
        (_, content) => this.colorize(`/*${content}*/`, "greenDark")
      ).replace(/^(\s*\S+)(.*)$/, (match, firstPart, secondPart) => {
        if (!secondPart.trim() && !["{", "}"].includes(firstPart.trim())) return this.colorize(match, "cyan");
        return firstPart + (secondPart || "").replace(
          /(?<!["'])(?<=\s|^)([A-Z][a-zA-Z0-9_]*)(\?)?(\[\])?(?![^()]*\))/g,
          (match2, type, optional) => {
            const isOptional = optional !== void 0;
            if (_PrismaHighlighter.PRISMA_TYPES.has(type)) {
              return isOptional ? this.colorize(match2, "gray") : this.colorize(match2, "lightBlue");
            } else {
              return isOptional ? this.colorize(match2, "lightPurple") : this.colorize(match2, "purple");
            }
          }
        );
      });
      return line;
    }).join("\n").replace(/\b(generator|datasource)\s+(\w+)\s*({)([\s\S]*?)(})/g, (match, blockType, name, openBrace, content, closeBrace) => {
      const highlightedContent = content.replace(/\b(provider|output|url)\b/g, (key) => this.colorize(key, "yellowBright")).replace(/"([^"]+)"/g, (_, value) => `"${this.colorize(value, "gray")}"`);
      return `${this.colorize(blockType, "greenBright")} ${this.colorize(name, "purple")} ${this.colorize(openBrace, "gray")}${highlightedContent}${this.colorize(closeBrace, "gray")}`;
    });
  }
};
var highlighter = new PrismaHighlighter();
var highlighter_default = highlighter;

// src/bin.ts
var loadPrismaSchema = async (inputPath) => {
  const cwd = process.cwd();
  let schemaPath = null;
  if (inputPath) {
    const resolvedPath = path.isAbsolute(inputPath) ? inputPath : path.resolve(cwd, inputPath);
    if (fs.existsSync(resolvedPath)) {
      const stat = fs.statSync(resolvedPath);
      if (stat.isDirectory()) {
        const possibleSchemaPaths = [
          path.join(resolvedPath, "prisma", "schema.prisma"),
          path.join(resolvedPath, "schema.prisma")
        ];
        schemaPath = possibleSchemaPaths.find(fs.existsSync) || null;
      } else if (stat.isFile()) {
        schemaPath = resolvedPath;
      }
    }
    if (!schemaPath) {
      throw new Error(`\u274C Path "${inputPath}" does not point to a valid Prisma schema file or directory.`);
    }
  } else {
    const possibleSchemaPaths = [
      path.join(cwd, "prisma", "schema.prisma"),
      path.join(cwd, "schema.prisma")
    ];
    schemaPath = possibleSchemaPaths.find(fs.existsSync) || null;
  }
  if (!schemaPath) {
    throw new Error(`\u274C Prisma schema file not found. Try: prismalux --path=[path_to_schema]`);
  }
  const schemaContent = await fs.promises.readFile(schemaPath, "utf-8");
  if (!/^\s*(generator|datasource|client)\b/m.test(schemaContent)) {
    throw new Error(`\u274C The file at "${schemaPath}" does not appear to be a valid Prisma schema.`);
  }
  return { schema: schemaContent, path: schemaPath };
};
var parseArgs = (args2) => {
  const options2 = {};
  args2.forEach((arg) => {
    const match = arg.match(/^--(\w+)(?:=(.+))?$/);
    if (match) {
      const [, key, value] = match;
      options2[key] = value !== void 0 ? value : true;
    }
  });
  return options2;
};
var args = process.argv.slice(2);
var options = parseArgs(args);
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
var filterSchemaPart = (schema, filterInput) => {
  const filterNames = filterInput.split(/[,| ]+/).map((name) => name.trim()).filter((name) => name.length > 0);
  if (filterNames.length === 0) {
    console.error("\u274C No valid model or enum names provided.");
    return null;
  }
  let results = [];
  for (const filterName of filterNames) {
    const regex = new RegExp(`\\b(model|enum)\\s+${filterName}\\s*{[\\s\\S]*?}`, "g");
    const match = schema.match(regex);
    if (match) {
      results.push(...match);
    }
  }
  return results.length > 0 ? results.join("\n\n") : null;
};
(async () => {
  try {
    const filePath = typeof options.path === "string" ? options.path : void 0;
    const { schema, path: path2 } = await loadPrismaSchema(filePath);
    console.log(`
\u2728 Highlighting Prisma schema: ${path2}
`);
    let schemaToHighlight = schema;
    const filter = options?.filter || options?.f;
    if (typeof filter === "string") {
      const filteredSchema = filterSchemaPart(schema, filter);
      if (!filteredSchema) {
        console.error(`\u274C No model or enum found for "${filter}".`);
        process.exit(1);
      }
      schemaToHighlight = filteredSchema;
    }
    console.log(highlighter_default.highlight(schemaToHighlight));
  } catch (error) {
    console.error(error instanceof Error ? error.message : "\u274C An unknown error occurred.");
    process.exit(1);
  }
})();
export {
  loadPrismaSchema
};
//# sourceMappingURL=bin.js.map