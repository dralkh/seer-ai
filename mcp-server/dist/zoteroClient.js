/**
 * Zotero HTTP Client
 *
 * Makes HTTP requests to the Zotero plugin's API endpoints.
 */
const DEFAULT_ZOTERO_URL = "http://127.0.0.1:23119";
export class ZoteroClient {
    baseUrl;
    timeout;
    constructor(config) {
        this.baseUrl = config?.baseUrl || process.env.ZOTERO_API_URL || DEFAULT_ZOTERO_URL;
        this.timeout = config?.timeout || 30000;
    }
    /**
     * Check if Zotero is running and the API is available
     */
    async healthCheck() {
        try {
            const response = await this.request("GET", "/seerai/health", undefined);
            return response.status === "ok";
        }
        catch {
            return false;
        }
    }
    /**
     * Call a Zotero tool
     */
    async callTool(toolName, args) {
        const endpoint = `/seerai/${toolName}`;
        return this.request("POST", endpoint, args);
    }
    async request(method, path, body) {
        const url = `${this.baseUrl}${path}`;
        const controller = new AbortController();
        const timeoutId = setTimeout(() => controller.abort(), this.timeout);
        try {
            const options = {
                method,
                headers: {
                    "Content-Type": "application/json",
                },
                signal: controller.signal,
            };
            if (body && method === "POST") {
                options.body = JSON.stringify(body);
            }
            const response = await fetch(url, options);
            if (!response.ok) {
                const text = await response.text();
                throw new Error(`HTTP ${response.status}: ${text}`);
            }
            return response.json();
        }
        finally {
            clearTimeout(timeoutId);
        }
    }
}
// Singleton instance
let clientInstance = null;
export function getZoteroClient() {
    if (!clientInstance) {
        clientInstance = new ZoteroClient();
    }
    return clientInstance;
}
