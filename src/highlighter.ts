export interface HighlightConfig {
    enableColors?: boolean; // Flag to enable/disable colors
    colors?: Record<string, string>; // Custom color scheme
}

export class PrismaHighlighter {
    private config: Required<HighlightConfig>;

    private static DEFAULT_COLORS = {
        reset: "\x1b[0m",
        gray: "\x1b[90m",
        whiteBold: "\x1b[1;37m",
        cyanBold: "\x1b[1;36m",
        purple: "\x1b[38;5;201m",
        lightPurple: "\x1b[38;5;177m",
        purpleDark: "\x1b[38;5;93m",
        darkBlue: "\x1b[38;5;63m",
        lightBlue: "\x1b[38;5;111m",
        yellow: "\x1b[33m",
        yellowBold: "\x1b[1;33m",
        yellowBright: "\x1b[93m",
        orange: "\x1b[38;5;208m",
        green: "\x1b[32m",
        greenBright: "\x1b[92m",
        cyan: "\x1b[36m",
        cyanLight: "\x1b[96m",
    };

    private static PRISMA_TYPES = new Set([
        "String", "Int", "Boolean", "DateTime", "Json",
        "Float", "Decimal", "BigInt", "Bytes"
    ]);

    constructor(config: HighlightConfig = {}) {
        this.config = {
            enableColors: config.enableColors ?? true,
            colors: { ...PrismaHighlighter.DEFAULT_COLORS, ...config.colors }
        };
    }

    private colorize(text: string, color: keyof typeof PrismaHighlighter.DEFAULT_COLORS): string {
        if (!this.config.enableColors) return text;
        return `${this.config.colors[color] || ""}${text}${this.config.colors.reset}`;
    }

    public highlight(schema: string): string {
        return schema
            .replace(/\r\n/g, "\n")
            .split("\n")
            .map(line => {
                // Highlight annotations without arguments (@id, @unique)
                line = line.replace(/@\w+(?=\s|$)/g, match => this.colorize(match, "greenBright"));

                // Highlight annotations with arguments (@relation(...), @default(...))
                line = line.replace(/(@\w+)(\()([^()]*)(\))/g, (_, annotation, openBracket, args, closeBracket) => {
                    const content = args.split(',').map((arg: string) => {
                        if (/^\s*"([^"]+)"\s*$/.test(arg)) {
                            return this.colorize(arg, "purpleDark"); // "MainUserContact"
                        }
                        if (arg.includes(":")) {
                            const [key, value] = arg.split(":").map(part => part.trim());
                            const coloredKey = this.colorize(key, "yellowBright");
                            const coloredValue = value.replace(/\[(.*?)\]/g, (_, inner) =>
                                `${this.colorize("[", "yellowBright")}${this.colorize(inner, "orange")}${this.colorize("]", "yellowBright")}`
                            );
                            return `${coloredKey}: ${coloredValue}`;
                        }
                        return this.colorize(arg, "cyan");
                    }).join(", ");

                    return this.colorize(annotation, "yellow") + this.colorize(openBracket, "yellowBold") + content + this.colorize(closeBracket, "yellowBold");
                });

                // Highlight annotations with function calls (@default(now()))
                line = line.replace(/(@\w+)(\s*\(\s*)(.+)(\s*\))/g, (_, annotation, openBracket, value, closeBracket) => {
                    return this.colorize(annotation, "yellow") + this.colorize(openBracket, "yellowBright") + this.colorize(value, "cyan") + this.colorize(closeBracket, "yellowBright");
                });

                // Highlight `model`, `enum`
                line = line.replace(/\b(model|enum)\s+([A-Z][a-zA-Z0-9_]*)/g, (_, keyword, modelName) =>
                    `${this.colorize(keyword, "cyanBold")} ${this.colorize(modelName, "purple")}`
                );

                // Highlight comments `// comment`
                line = line.replace(/\/\/(.*)$/gm, (_, comment) => this.colorize("// " + comment, "green"));

                // Highlight multiline comments `/* comment */`
                line = line.replace(/\/\*([\s\S]*?)\*\//g, (_, content) => this.colorize(`/*${content}*/`, "green"));

                // Highlight types (standard and custom)

                line = line.replace(/^(\s*\S+)(.*)$/, (match, firstPart, secondPart) => {
                    // If the second part is empty, just return the string unchanged
                    if (!secondPart.trim() && !["{", "}"].includes(firstPart.trim())) {
                        return this.colorize(match, "cyan");
                    }

                    return firstPart + (secondPart || "").replace(
                        /(?<!["'])(?<=\s|^)([A-Z][a-zA-Z0-9_]*)(\?)?(\[\])?(?![^()]*\))/g,
                        (match, type, optional) => {
                            console.log("type: " + type);
                            const isOptional = optional !== undefined;
                            if (PrismaHighlighter.PRISMA_TYPES.has(type)) {
                                return isOptional
                                    ? this.colorize(match, "gray")
                                    : this.colorize(match, "lightBlue");
                            } else {
                                return isOptional
                                    ? this.colorize(match, "lightPurple")
                                    : this.colorize(match, "purple");
                            }
                        }
                    );
                });


                return line;
            })
            .join("\n");
    }
}

const highlighter = new PrismaHighlighter();
export default highlighter;