/**
 * Web Research Tools Implementation
 * Uses Firecrawl for searching the web and reading pages
 */

import {
    AgentConfig,
    ReadWebPageParams,
    SearchWebParams,
    ToolResult
} from "./toolTypes";
import { firecrawlService } from "../../firecrawl";

/**
 * Execute search_web tool
 */
export async function executeSearchWeb(
    params: SearchWebParams,
    _config: AgentConfig
): Promise<ToolResult> {
    try {
        const { query, limit = 5 } = params;

        if (!firecrawlService.isConfigured()) {
            return {
                success: false,
                error: "Firecrawl API is not configured. Please set the API key in settings."
            };
        }

        Zotero.debug(`[seerai] Tool: search_web query="${query}" limit=${limit}`);

        const results = await firecrawlService.webSearch(query, limit);

        return {
            success: true,
            data: {
                results: results.map(r => ({
                    title: r.title,
                    url: r.url,
                    description: r.description || ""
                })),
                total: results.length
            },
            summary: `Found ${results.length} web results for "${query}"`
        };

    } catch (error) {
        Zotero.debug(`[seerai] Tool: search_web error: ${error}`);
        return {
            success: false,
            error: error instanceof Error ? error.message : String(error)
        };
    }
}

/**
 * Execute read_webpage tool
 */
export async function executeReadWebPage(
    params: ReadWebPageParams,
    _config: AgentConfig
): Promise<ToolResult> {
    try {
        const { url } = params;

        if (!firecrawlService.isConfigured()) {
            return {
                success: false,
                error: "Firecrawl API is not configured. Please set the API key in settings."
            };
        }

        Zotero.debug(`[seerai] Tool: read_webpage url="${url}"`);

        const result = await firecrawlService.scrapeUrl(url);

        if (!result) {
            return {
                success: false,
                error: "Failed to scrape URL or no content returned."
            };
        }

        return {
            success: true,
            data: {
                markdown: result.markdown || "",
                title: result.metadata?.title || result.title || "",
                url: result.metadata?.sourceURL || result.url
            },
            summary: `Successfully read content from ${result.metadata?.title || url}`
        };

    } catch (error) {
        Zotero.debug(`[seerai] Tool: read_webpage error: ${error}`);
        return {
            success: false,
            error: error instanceof Error ? error.message : String(error)
        };
    }
}
