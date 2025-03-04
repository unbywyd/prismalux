export interface HighlightConfig {
    enableColors?: boolean;
    colors?: Record<string, string>;
}
export declare class PrismaHighlighter {
    private config;
    private static DEFAULT_COLORS;
    private static PRISMA_TYPES;
    constructor(config?: HighlightConfig);
    private colorize;
    highlight(schema: string): string;
}
declare const _default: any;
export default _default;
//# sourceMappingURL=highlighter.d.ts.map