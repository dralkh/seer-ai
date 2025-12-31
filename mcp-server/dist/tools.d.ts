/**
 * MCP Tool Definitions
 *
 * Defines all 20 Seer-AI tools in MCP format.
 */
import { z } from "zod";
export declare const TOOL_DEFINITIONS: {
    name: string;
    description: string;
    inputSchema: z.ZodObject<{}, "strip", z.ZodTypeAny, {}, {}>;
}[];
export type ToolName = typeof TOOL_DEFINITIONS[number]["name"];
