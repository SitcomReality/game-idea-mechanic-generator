// New file: scripts/state/utils.js

// Function to validate draft data structure
export function isValidDraftData(data) {
    if (!Array.isArray(data)) {
        console.error("Invalid draft data: Not an array.");
        return false;
    }
    for (const item of data) {
        if (typeof item !== 'object' || item === null) {
            console.error("Invalid draft data: Array contains non-object elements.", item);
            return false;
        }
        if (item.type === 'html') {
            if (typeof item.text !== 'string') {
                console.error("Invalid draft data: HTML item missing 'text' string.", item);
                return false;
            }
        } else if (item.type === 'chip' || typeof item.type === 'undefined') { // Allow undefined type for backwards compatibility, treat as chip
            // Assuming chip-like object
            if (typeof item.text !== 'string') {
                console.error("Invalid draft data: Chip item missing 'text' string.", item);
                return false;
            }
            // Optional category check
            if (item.hasOwnProperty('category') && typeof item.category !== 'string' && item.category !== null) {
                console.error("Invalid draft data: Chip item has invalid 'category' type.", item);
                return false;
            }
            // Ensure description is a string if it exists
            if (item.hasOwnProperty('description') && typeof item.description !== 'string') {
                console.error("Invalid draft data: Chip item has non-string 'description'.", item);
                return false;
            }
        } else {
             console.error("Invalid draft data: Item has unknown or invalid 'type'.", item);
             return false;
        }
    }
    return true;
}

// Helper function to normalize category names (handles Theme/Setting)
// Often used by UI, but can be useful for consistent state representation too
export function normalizeCategoryName(categoryName) {
  if (categoryName === 'Theme') return 'Narrative Theme';
  if (categoryName === 'Setting') return 'Setting/Context';
  return categoryName || 'Uncategorized'; // Fallback
}