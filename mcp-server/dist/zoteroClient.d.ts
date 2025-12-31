/**
 * Zotero HTTP Client
 *
 * Makes HTTP requests to the Zotero plugin's API endpoints.
 */
export interface ZoteroClientConfig {
    baseUrl: string;
    timeout?: number;
}
export interface ZoteroResponse {
    success: boolean;
    data?: unknown;
    error?: string;
    summary?: string;
}
export declare class ZoteroClient {
    private baseUrl;
    private timeout;
    constructor(config?: Partial<ZoteroClientConfig>);
    /**
     * Check if Zotero is running and the API is available
     */
    healthCheck(): Promise<boolean>;
    /**
     * Call a Zotero tool
     */
    callTool(toolName: string, args: Record<string, unknown>): Promise<ZoteroResponse>;
    private request;
}
export declare function getZoteroClient(): ZoteroClient;
