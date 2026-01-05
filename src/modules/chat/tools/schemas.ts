/**
 * Zod Schemas for Tool Parameter Validation
 * Provides runtime validation with rich error feedback for self-correction
 * 
 * @see agentic.md Section 4.1 - "Zod serves as the Source of Truth"
 */

import { z } from "zod";
import { TOOL_NAMES, ToolName } from "./toolTypes";

// ==================== Search & Discovery ====================

export const SearchLibraryParamsSchema = z.object({
    query: z.string().describe("Search query for titles, authors, abstracts, and full text"),
    filters: z.object({
        year_from: z.number().int().optional().describe("Minimum publication year (inclusive)"),
        year_to: z.number().int().optional().describe("Maximum publication year (inclusive)"),
        authors: z.array(z.string()).optional().describe("Author names to filter by"),
        tags: z.array(z.string()).optional().describe("Tags to filter by"),
        collection: z.string().optional().describe("Collection name to filter by"),
        item_types: z.array(z.enum([
            "journalArticle", "book", "bookSection", "conferencePaper",
            "report", "thesis", "webpage", "preprint"
        ])).optional().describe("Item types to include"),
    }).optional().describe("Optional filters to narrow search results"),
    limit: z.number().int().min(1).max(50).default(10).optional()
        .describe("Maximum number of results (default: 10, max: 50)"),
});

export const GetItemMetadataParamsSchema = z.object({
    item_id: z.number().int().positive().describe("The Zotero item ID"),
});

export const SearchExternalParamsSchema = z.object({
    query: z.string().min(1).describe("Search query for Semantic Scholar"),
    year: z.string().optional().describe("Year range, e.g., '2020-2024' or '2023-'"),
    limit: z.number().int().min(1).max(50).default(10).optional(),
    openAccessPdf: z.boolean().optional().describe("Only return papers with open access PDFs"),
});

// ==================== Content Reading ====================

export const ReadItemContentParamsSchema = z.object({
    item_id: z.number().int().positive().describe("The Zotero item ID to read content from"),
    include_notes: z.boolean().default(true).optional()
        .describe("Include attached notes in content"),
    include_pdf: z.boolean().default(true).optional()
        .describe("Include PDF text content if available"),
    trigger_ocr: z.boolean().default(false).optional()
        .describe("Trigger OCR if no text content is found"),
    max_length: z.number().int().min(0).optional()
        .describe("Maximum content length (0 for no limit)"),
});

// ==================== Note Creation ====================

export const CreateNoteParamsSchema = z.object({
    parent_item_id: z.number().int().positive().optional()
        .describe("Parent item ID to attach note to"),
    collection_id: z.number().int().positive().optional()
        .describe("Collection ID for orphan note"),
    title: z.string().min(1).describe("Note title"),
    content: z.string().min(1).describe("Note content in Markdown"),
    tags: z.array(z.string()).optional().describe("Tags to add to the note"),
}).refine(
    data => data.parent_item_id !== undefined || data.collection_id !== undefined,
    { message: "Either parent_item_id or collection_id must be provided" }
);

// ==================== Context Management ====================

const ContextItemSchema = z.object({
    type: z.enum(["paper", "tag", "author", "collection", "topic", "table"])
        .describe("Type of context item"),
    id: z.union([z.number(), z.string()]).optional()
        .describe("Item ID"),
    name: z.string().optional()
        .describe("Item name (for display)"),
});

export const AddToContextParamsSchema = z.object({
    items: z.array(ContextItemSchema).min(1)
        .describe("Items to add to the conversation context"),
});

export const RemoveFromContextParamsSchema = z.object({
    items: z.array(z.object({
        type: z.enum(["paper", "tag", "author", "collection", "topic", "table"]),
        id: z.union([z.number(), z.string()]).optional(),
    })).min(1).describe("Items to remove from context"),
});

// ==================== Table Operations ====================

export const ListTablesParamsSchema = z.object({}).describe("No parameters needed");

export const CreateTableParamsSchema = z.object({
    name: z.string().min(1).describe("Name for the new table"),
    item_ids: z.array(z.number().int().positive()).optional()
        .describe("Initial paper IDs to add to the table"),
});

export const AddToTableParamsSchema = z.object({
    table_id: z.string().min(1).describe("ID of the target table"),
    item_ids: z.array(z.number().int().positive()).min(1)
        .describe("Paper IDs to add to the table"),
});

export const CreateTableColumnParamsSchema = z.object({
    table_id: z.string().min(1).describe("ID of the target table"),
    column_name: z.string().min(1).describe("Name for the new column"),
    ai_prompt: z.string().min(1)
        .describe("AI prompt template for generating column data"),
});

export const GenerateTableDataParamsSchema = z.object({
    table_id: z.string().min(1).describe("ID of the target table"),
    column_id: z.string().optional()
        .describe("Specific column ID to generate (all if not provided)"),
    item_ids: z.array(z.number().int().positive()).optional()
        .describe("Specific item IDs to generate for (all if not provided)"),
});

export const ReadTableParamsSchema = z.object({
    table_id: z.string().optional()
        .describe("Table ID to read (most recent if not provided)"),
    include_data: z.boolean().default(true).optional()
        .describe("Include generated cell data"),
});

// ==================== External Import ====================

export const ImportPaperParamsSchema = z.object({
    paper_id: z.string().min(1).describe("Semantic Scholar paper ID"),
    target_collection_id: z.number().int().positive().optional()
        .describe("Collection ID to add the imported paper to"),
    trigger_ocr: z.boolean().optional()
        .describe("Automatically trigger OCR after import"),
});

// ==================== Collection Operations ====================

export const FindCollectionParamsSchema = z.object({
    name: z.string().min(1).describe("Collection name to search for"),
    library_id: z.number().int().optional().describe("Library ID to search in"),
    parent_collection_id: z.number().int().positive().optional()
        .describe("Parent collection ID to search within"),
});

export const CreateCollectionParamsSchema = z.object({
    name: z.string().min(1).describe("Name for the new collection"),
    parent_collection_id: z.number().int().positive().optional()
        .describe("Parent collection ID (creates nested collection)"),
    library_id: z.number().int().optional().describe("Library ID to create in"),
});

export const ListCollectionParamsSchema = z.object({
    collection_id: z.number().int().positive().describe("Collection ID to list contents of"),
});

export const MoveItemParamsSchema = z.object({
    item_id: z.number().int().positive().describe("Item ID to move"),
    target_collection_id: z.number().int().positive()
        .describe("Target collection ID"),
    remove_from_others: z.boolean().default(false).optional()
        .describe("Remove from other collections"),
});

export const RemoveItemFromCollectionParamsSchema = z.object({
    item_id: z.number().int().positive().describe("Item ID to remove"),
    collection_id: z.number().int().positive()
        .describe("Collection ID to remove from"),
});

// ==================== Tag Operations ====================

export const GenerateItemTagsParamsSchema = z.object({
    item_id: z.number().int().positive().describe("Zotero item ID to generate tags for"),
});

// ==================== Note Editing ====================

const EditNoteOperationSchema = z.object({
    type: z.enum(["replace", "insert", "append", "prepend", "delete"])
        .describe("Type of edit operation"),
    search: z.string().optional()
        .describe("Text to search for (required for 'replace' and 'delete')"),
    content: z.string().optional()
        .describe("New content to insert/append/prepend or replacement text"),
    position: z.string().optional()
        .describe("Position for 'insert': 'start', 'end', or CSS selector"),
    replace_all: z.boolean().default(false).optional()
        .describe("For 'replace': replace all occurrences (default: first only)"),
});

export const EditNoteParamsSchema = z.object({
    note_id: z.number().int().positive()
        .describe("ID of the existing note to edit"),
    operations: z.array(EditNoteOperationSchema).min(1)
        .describe("List of edit operations to apply in order"),
    convert_markdown: z.boolean().default(true).optional()
        .describe("Convert markdown content to HTML (default: true)"),
});

// ==================== Schema Registry ====================

/**
 * Map of tool names to their Zod schemas
 */
const schemaRegistry: Partial<Record<ToolName, z.ZodSchema>> = {
    [TOOL_NAMES.SEARCH_LIBRARY]: SearchLibraryParamsSchema,
    [TOOL_NAMES.GET_ITEM_METADATA]: GetItemMetadataParamsSchema,
    [TOOL_NAMES.READ_ITEM_CONTENT]: ReadItemContentParamsSchema,
    [TOOL_NAMES.CREATE_NOTE]: CreateNoteParamsSchema,
    [TOOL_NAMES.ADD_TO_CONTEXT]: AddToContextParamsSchema,
    [TOOL_NAMES.REMOVE_FROM_CONTEXT]: RemoveFromContextParamsSchema,
    [TOOL_NAMES.LIST_CONTEXT]: z.object({}), // No params
    [TOOL_NAMES.LIST_TABLES]: ListTablesParamsSchema,
    [TOOL_NAMES.CREATE_TABLE]: CreateTableParamsSchema,
    [TOOL_NAMES.ADD_TO_TABLE]: AddToTableParamsSchema,
    [TOOL_NAMES.CREATE_TABLE_COLUMN]: CreateTableColumnParamsSchema,
    [TOOL_NAMES.GENERATE_TABLE_DATA]: GenerateTableDataParamsSchema,
    [TOOL_NAMES.READ_TABLE]: ReadTableParamsSchema,
    [TOOL_NAMES.SEARCH_EXTERNAL]: SearchExternalParamsSchema,
    [TOOL_NAMES.IMPORT_PAPER]: ImportPaperParamsSchema,
    [TOOL_NAMES.MOVE_ITEM]: MoveItemParamsSchema,
    [TOOL_NAMES.REMOVE_ITEM_FROM_COLLECTION]: RemoveItemFromCollectionParamsSchema,
    [TOOL_NAMES.FIND_COLLECTION]: FindCollectionParamsSchema,
    [TOOL_NAMES.CREATE_COLLECTION]: CreateCollectionParamsSchema,
    [TOOL_NAMES.LIST_COLLECTION]: ListCollectionParamsSchema,
    [TOOL_NAMES.GENERATE_ITEM_TAGS]: GenerateItemTagsParamsSchema,
    [TOOL_NAMES.EDIT_NOTE]: EditNoteParamsSchema,
};

// ==================== Tool Sensitivity Registry ====================
// @see agentic.md Section 8.5 - Security via Human-in-the-Loop

/**
 * Tool sensitivity levels: READ (safe), WRITE (modifiable), DESTRUCTIVE (irreversible)
 */
type SensitivityLevel = "read" | "write" | "destructive";

/**
 * Map of tool names to their sensitivity levels
 */
const sensitivityRegistry: Record<ToolName, SensitivityLevel> = {
    // Read-only operations - always safe
    [TOOL_NAMES.SEARCH_LIBRARY]: "read",
    [TOOL_NAMES.GET_ITEM_METADATA]: "read",
    [TOOL_NAMES.READ_ITEM_CONTENT]: "read",
    [TOOL_NAMES.LIST_CONTEXT]: "read",
    [TOOL_NAMES.LIST_TABLES]: "read",
    [TOOL_NAMES.READ_TABLE]: "read",
    [TOOL_NAMES.SEARCH_EXTERNAL]: "read",
    [TOOL_NAMES.FIND_COLLECTION]: "read",
    [TOOL_NAMES.LIST_COLLECTION]: "read",

    // Write operations - can be undone or are additive
    [TOOL_NAMES.CREATE_NOTE]: "write",
    [TOOL_NAMES.ADD_TO_CONTEXT]: "write",
    [TOOL_NAMES.CREATE_TABLE]: "write",
    [TOOL_NAMES.ADD_TO_TABLE]: "write",
    [TOOL_NAMES.CREATE_TABLE_COLUMN]: "write",
    [TOOL_NAMES.GENERATE_TABLE_DATA]: "write",
    [TOOL_NAMES.IMPORT_PAPER]: "write",
    [TOOL_NAMES.CREATE_COLLECTION]: "write",
    [TOOL_NAMES.MOVE_ITEM]: "write",

    // Destructive operations - require extra caution
    [TOOL_NAMES.REMOVE_FROM_CONTEXT]: "destructive",
    [TOOL_NAMES.REMOVE_ITEM_FROM_COLLECTION]: "destructive",
    [TOOL_NAMES.SEARCH_WEB]: "read",
    [TOOL_NAMES.READ_WEBPAGE]: "read",
    [TOOL_NAMES.GET_CITATIONS]: "read",
    [TOOL_NAMES.GET_REFERENCES]: "read",
    [TOOL_NAMES.GENERATE_ITEM_TAGS]: "write",
    [TOOL_NAMES.EDIT_NOTE]: "write",
};

/**
 * Get the sensitivity level for a tool
 */
export function getToolSensitivity(toolName: string): SensitivityLevel {
    return sensitivityRegistry[toolName as ToolName] || "write";
}

/**
 * Check if a tool requires human approval based on sensitivity
 */
export function requiresApproval(toolName: string, config: { requireApprovalForDestructive: boolean }): boolean {
    if (!config.requireApprovalForDestructive) return false;
    return getToolSensitivity(toolName) === "destructive";
}

/**
 * Get the Zod schema for a tool name
 */
export function getSchemaForTool(toolName: string): z.ZodSchema | undefined {
    return schemaRegistry[toolName as ToolName];
}

/**
 * Validate tool arguments against the schema
 * Returns the parsed and validated arguments or throws ZodError
 */
export function validateToolArgs<T>(toolName: string, args: unknown): T {
    const schema = getSchemaForTool(toolName);
    if (!schema) {
        // No schema registered, pass through (but log warning)
        Zotero.debug(`[seerai] Warning: No Zod schema registered for tool: ${toolName}`);
        return args as T;
    }
    return schema.parse(args) as T;
}

/**
 * Safe validation that returns a result object instead of throwing
 */
export function safeValidateToolArgs<T>(
    toolName: string,
    args: unknown
): { success: true; data: T } | { success: false; error: z.ZodError } {
    const schema = getSchemaForTool(toolName);
    if (!schema) {
        return { success: true, data: args as T };
    }

    const result = schema.safeParse(args);
    if (result.success) {
        return { success: true, data: result.data as T };
    }
    return { success: false, error: result.error };
}

/**
 * Format Zod errors into a human-readable string for LLM feedback
 */
export function formatZodError(error: z.ZodError<unknown>): string {
    return error.issues.map((issue: z.ZodIssue) => {
        const path = issue.path.length > 0 ? `${issue.path.join('.')}: ` : '';
        return `${path}${issue.message}`;
    }).join('; ');
}
