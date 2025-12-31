
import { ChatContextManager } from './contextManager';
import { CONTEXT_COLORS, CONTEXT_ICONS, ContextItem } from './contextTypes';

/**
 * Creates the unified context chips area element.
 * Subscribes to ChatContextManager updates.
 */
export function createContextChipsArea(doc: Document): HTMLElement {
    const contextManager = ChatContextManager.getInstance();

    const container = doc.createElement('div');
    container.id = 'unified-context-chips';
    container.id = 'unified-context-chips';
    container.style.display = 'none';
    container.style.flexWrap = 'wrap';
    container.style.gap = '6px';
    container.style.padding = '8px';
    container.style.backgroundColor = 'var(--background-secondary, #f5f5f5)';
    container.style.borderRadius = '6px';
    container.style.border = '1px solid var(--border-primary, #ddd)';
    container.style.marginBottom = '6px';

    // Label Container (Header)
    const header = doc.createElement('div');
    header.style.width = '100%';
    header.style.display = 'flex';
    header.style.justifyContent = 'space-between';
    header.style.alignItems = 'center';
    header.style.marginBottom = '6px';

    // Label Text
    const label = doc.createElement('span');
    label.style.fontSize = '11px';
    label.style.color = 'var(--text-secondary, #666)';
    label.style.fontWeight = '600';
    header.appendChild(label);

    // Clear All Button
    const clearBtn = doc.createElement('span');
    clearBtn.innerText = 'Clear All';
    clearBtn.style.fontSize = '10px';
    clearBtn.style.color = 'var(--text-tertiary, #888)';
    clearBtn.style.cursor = 'pointer';
    clearBtn.style.textDecoration = 'underline';
    clearBtn.style.opacity = '0.8';
    clearBtn.addEventListener('mouseenter', () => clearBtn.style.opacity = '1');
    clearBtn.addEventListener('mouseleave', () => clearBtn.style.opacity = '0.8');
    clearBtn.addEventListener('click', () => {
        ChatContextManager.getInstance().clearAll();
    });
    header.appendChild(clearBtn);

    container.appendChild(header);

    // Initial listener
    contextManager.addListener((items) => {
        updateChips(doc, container, label, items);
    });

    return container;
}

function updateChips(
    doc: Document,
    container: HTMLElement,
    label: HTMLElement,
    items: ContextItem[]
) {
    // Clear existing chips (keep header which is firstChild)
    while (container.childNodes.length > 1) {
        container.removeChild(container.lastChild as Node);
    }

    if (items.length === 0) {
        container.style.display = 'none';
        return;
    }

    container.style.display = 'flex';
    label.innerText = `📎 Context (${items.length}):`;

    items.forEach((item, index) => {
        const chip = doc.createElement('div');
        const color = CONTEXT_COLORS[item.type] || '#007AFF';

        chip.style.display = 'inline-flex';
        chip.style.alignItems = 'center';
        chip.style.gap = '4px';
        chip.style.padding = '4px 8px';
        chip.style.backgroundColor = color;
        chip.style.color = '#fff';
        chip.style.borderRadius = '12px';
        chip.style.fontSize = '11px';
        chip.style.fontWeight = '500';
        chip.style.cursor = 'default';
        chip.style.maxWidth = '200px';
        chip.style.overflow = 'hidden';
        chip.style.boxShadow = '0 1px 2px rgba(0,0,0,0.1)';

        // Icon + Name
        const icon = CONTEXT_ICONS[item.type] || '';
        const nameText = item.displayName.length > 25
            ? item.displayName.substring(0, 22) + '...'
            : item.displayName;

        chip.title = `${icon} ${item.fullName || item.displayName} (${item.type})`;
        chip.innerText = `${icon} ${nameText}`;

        // Remove Button
        const removeBtn = doc.createElement('span');
        removeBtn.innerText = '✕';
        removeBtn.style.marginLeft = '6px';
        removeBtn.style.cursor = 'pointer';
        removeBtn.style.opacity = '0.8';
        removeBtn.style.fontSize = '10px';
        removeBtn.style.fontWeight = 'bold';

        removeBtn.addEventListener('click', (e) => {
            e.stopPropagation();
            ChatContextManager.getInstance().removeAtIndex(index);
        });

        removeBtn.addEventListener('mouseenter', () => {
            removeBtn.style.opacity = '1';
        });
        removeBtn.addEventListener('mouseleave', () => {
            removeBtn.style.opacity = '0.8';
        });

        chip.appendChild(removeBtn);
        container.appendChild(chip);
    });
}
