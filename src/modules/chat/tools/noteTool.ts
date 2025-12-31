/**
 * Note Tool Implementation
 * Creates notes attached to Zotero items
 */

import {
    CreateNoteParams,
    CreateNoteResult,
    ToolResult,
    AgentConfig,
} from "./toolTypes";

/**
 * Convert markdown to HTML for Zotero notes
 */
function markdownToHtml(markdown: string): string {
    if (!markdown) return "";

    const lines = markdown.split("\n");
    const htmlParts: string[] = [];
    let inList = false;
    let listType: "ul" | "ol" = "ul";

    const flushList = () => {
        if (inList) {
            htmlParts.push(`</${listType}>`);
            inList = false;
        }
    };

    const parseInline = (text: string) => {
        return text
            .replace(/\*\*\*(.*?)\*\*\*/g, "<strong><em>$1</em></strong>")
            .replace(/\*\*(.*?)\*\*/g, "<strong>$1</strong>")
            .replace(/\*(.*?)\*/g, "<em>$1</em>")
            .replace(/`(.*?)`/g, "<code>$1</code>");
    };

    for (let line of lines) {
        const trimmed = line.trim();

        if (trimmed === "") {
            // If in list, don't flush yet, but don't add break either
            // This allows the next list item to keep the same list group
            if (!inList) {
                htmlParts.push("<br/>");
            }
            continue;
        }

        // Headers
        const headerMatch = line.match(/^(#{1,6})\s+(.*)$/);
        if (headerMatch) {
            flushList();
            const level = headerMatch[1].length;
            htmlParts.push(`<h${level}>${parseInline(headerMatch[2])}</h${level}>`);
            continue;
        }

        // Unordered List (- or *)
        const ulMatch = line.match(/^[\s]*[-*]\s+(.*)$/);
        if (ulMatch) {
            if (!inList || listType !== "ul") {
                flushList();
                htmlParts.push("<ul>");
                inList = true;
                listType = "ul";
            }
            htmlParts.push(`<li>${parseInline(ulMatch[1])}</li>`);
            continue;
        }

        // Ordered List (1. or 1))
        const olMatch = line.match(/^[\s]*\d+[\.\)]\s+(.*)$/);
        if (olMatch) {
            if (!inList || listType !== "ol") {
                flushList();
                htmlParts.push("<ol>");
                inList = true;
                listType = "ol";
            }
            htmlParts.push(`<li>${parseInline(olMatch[1])}</li>`);
            continue;
        }

        // Horizontal Rule
        if (trimmed === "---" || trimmed === "***") {
            flushList();
            htmlParts.push("<hr/>");
            continue;
        }

        // Regular text
        flushList();
        htmlParts.push(`<p>${parseInline(line)}</p>`);
    }

    flushList();
    return htmlParts.join("");
}


/**
 * Execute create_note tool
 */
export async function executeCreateNote(
    params: CreateNoteParams,
    _config: AgentConfig
): Promise<ToolResult> {
    try {
        const { parent_item_id, collection_id, title, content, tags } = params;

        if (!parent_item_id && !collection_id) {
            return {
                success: false,
                error: "Either parent_item_id or collection_id must be provided",
            };
        }

        Zotero.debug(`[seerai] Tool: create_note parent=${parent_item_id} col=${collection_id} title="${title}"`);

        let libraryID: number | undefined;
        let parentID: number | undefined;

        if (parent_item_id) {
            // Verify parent item exists
            const parentItem = Zotero.Items.get(parent_item_id as number);
            if (!parentItem) {
                return {
                    success: false,
                    error: `Parent item with ID ${parent_item_id} not found`,
                };
            }

            if (!parentItem.isRegularItem()) {
                return {
                    success: false,
                    error: `Item ${parent_item_id} is not a regular item`,
                };
            }
            libraryID = parentItem.libraryID;
            parentID = parentItem.id;
        } else if (collection_id) {
            // Verify collection exists
            const collection = Zotero.Collections.get(collection_id);
            if (!collection) {
                return {
                    success: false,
                    error: `Collection with ID ${collection_id} not found`,
                };
            }
            libraryID = collection.libraryID;
        }

        // Convert content to HTML if it looks like markdown
        let htmlContent = content;
        if (!content.trim().startsWith("<")) {
            htmlContent = markdownToHtml(content);
        }

        // Add title as first heading only if it's not already at the start of htmlContent
        const lowerHtml = htmlContent.toLowerCase();
        const lowerTitle = title.toLowerCase();

        // Basic check to avoid duplicate titles
        if (!lowerHtml.includes(`<h1>${lowerTitle}`) && !lowerHtml.includes(`<h2>${lowerTitle}`) && !lowerHtml.includes(`<strong>${lowerTitle}`)) {
            htmlContent = `<h1>${title}</h1>${htmlContent}`;
        }

        // Create note
        const note = new Zotero.Item("note");
        if (libraryID !== undefined) note.libraryID = libraryID;
        if (parentID !== undefined) note.parentID = parentID;

        note.setNote(htmlContent);

        // Add tags if provided
        if (tags && tags.length > 0) {
            for (const tag of tags) {
                note.addTag(tag);
            }
        }

        // Add a tag to identify AI-generated notes
        note.addTag("AI-Generated");

        // Save the note
        await note.saveTx();

        // If collection_id was provided, add the note to that collection
        if (collection_id) {
            note.addToCollection(collection_id);
            await note.saveTx();
        }

        Zotero.debug(`[seerai] Tool: create_note created note ID=${note.id}`);

        const result: CreateNoteResult = {
            note_id: note.id,
            parent_item_id: parentID,
        };

        return {
            success: true,
            data: result,
            summary: parentID
                ? `Created note "${title}" attached to item ${parent_item_id}`
                : `Created standalone note "${title}" in collection ${collection_id}`,
        };

    } catch (error) {
        Zotero.debug(`[seerai] Tool: create_note error: ${error}`);
        return {
            success: false,
            error: error instanceof Error ? error.message : String(error),
        };
    }
}
