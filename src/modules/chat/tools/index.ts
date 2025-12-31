/**
 * Chat Tools Module
 * Exports all tool-related functionality
 */

// Types
export * from "./toolTypes";

// Schemas (Zod validation)
export {
    getSchemaForTool,
    validateToolArgs,
    safeValidateToolArgs,
    formatZodError,
    getToolSensitivity,
    requiresApproval,
} from "./schemas";

// Tool definitions
export { agentTools, getAgentTools, getToolByName } from "./toolDefinitions";

// Tool executor
export {
    executeToolCall,
    executeToolCalls,
    parseToolCall,
    formatToolResult,
    getAgentConfigFromPrefs,
} from "./toolExecutor";

// Individual tools (for direct use if needed)
export { executeSearchLibrary } from "./searchTool";
export { executeGetItemMetadata, executeReadItemContent } from "./readTool";
export { executeCreateNote } from "./noteTool";
export { executeAddToContext, executeRemoveFromContext, executeListContext } from "./contextTool";
export { executeListTables, executeCreateTableColumn, executeGenerateTableData, executeReadTable } from "./tableTool";
export { executeSearchWeb, executeReadWebPage } from "./webTool";
export { executeGetCitations, executeGetReferences } from "./citationTool";

