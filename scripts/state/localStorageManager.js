const DRAFT_KEY_PREFIX = 'gimg_draft_';
const IDEA_KEY_PREFIX = 'gimg_idea_';
// const GENERATED_IDEAS_KEY_PREFIX = 'gimg_ideas_'; // Removed: Ideas are no longer tied to title
const CURRENT_GENERATED_IDEAS_KEY = 'gimg_current_ideas'; // New key for the single, persistent list
const TITLE_STORAGE_KEY = 'gimg_gameTitle';
const DRAFT_CONTEXT_STORAGE_KEY = 'gimg_useDraftContext';
const BRIEF_OPTIONS_STORAGE_KEY = 'gimg_briefOptions';
const IDEA_DETAIL_STORAGE_KEY = 'gimg_ideaDetailLevel';

// --- Drafts ---

export function saveDraft(title, draft) {
    try {
        const draftKey = DRAFT_KEY_PREFIX + title;
        if (!title || title.trim() === "") {
            console.warn("Cannot save draft with empty title.");
            return false; // Indicate failure
        }
        localStorage.setItem(draftKey, JSON.stringify(draft));
        return true; // Indicate success
    } catch (error) {
        console.error(`Error saving design draft "${title}" to localStorage:`, error);
        // Handle potential quota exceeded error
        if (error.name === 'QuotaExceededError') {
            alert('Could not save draft: Local storage quota exceeded. Please delete some saved drafts or ideas.');
        }
        return false; // Indicate failure
    }
}

export function loadDraft(title, isValidDraftData) {
    try {
        const draftKey = DRAFT_KEY_PREFIX + title;
        const storedDraft = localStorage.getItem(draftKey);
        if (storedDraft) {
            const parsed = JSON.parse(storedDraft);
            if (isValidDraftData(parsed)) {
                return parsed;
            } else {
                console.warn(`Invalid draft data found in localStorage for key ${draftKey}.`);
                // localStorage.removeItem(draftKey); // Optionally clear invalid data on load attempt
                return null; // Indicate failure (invalid data)
            }
        }
        return null; // Indicate failure (not found)
    } catch (error) {
        console.error(`Error loading design draft for title "${title}" from localStorage:`, error);
        // localStorage.removeItem(DRAFT_KEY_PREFIX + title); // Optionally clear potentially invalid data
        return null; // Indicate failure
    }
}

export function deleteDraft(title) {
    try {
        const draftKey = DRAFT_KEY_PREFIX + title;
        localStorage.removeItem(draftKey);
        return true;
    } catch (error) {
        console.error(`Error deleting draft "${title}" from localStorage:`, error);
        return false;
    }
}

export function getSavedDraftTitles() {
    const titles = [];
    try {
        for (let i = 0; i < localStorage.length; i++) {
            const key = localStorage.key(i);
            if (key && key.startsWith(DRAFT_KEY_PREFIX)) {
                titles.push(key.substring(DRAFT_KEY_PREFIX.length));
            }
        }
    } catch (error) {
        console.error("Error reading saved draft titles from localStorage:", error);
    }
    return titles.sort(); // Return sorted list
}

// --- Current Generated Ideas List ---

export function saveGeneratedIdeas(ideas) { 
    try {
        const ideasKey = CURRENT_GENERATED_IDEAS_KEY; 
        // Strip transient 'isNew' flag before saving
        const ideasToSave = ideas.map(idea => {
            const { isNew, ...rest } = idea; // Destructure to remove isNew
            return rest;
        });
        // Basic validation before saving
        if (!Array.isArray(ideasToSave) || !ideasToSave.every(idea => typeof idea === 'object' && idea !== null && typeof idea.text === 'string')) {
            console.warn(`Invalid generated ideas data structure. Save cancelled.`);
            return false;
        }
        localStorage.setItem(ideasKey, JSON.stringify(ideasToSave));
        return true;
    } catch (error) {
        console.error(`Error saving current generated ideas to localStorage:`, error);
        if (error.name === 'QuotaExceededError') {
            alert('Could not save generated ideas: Local storage quota exceeded.');
        }
        return false;
    }
}

export function loadGeneratedIdeas() { 
    try {
        const ideasKey = CURRENT_GENERATED_IDEAS_KEY; 
        const storedIdeas = localStorage.getItem(ideasKey);
        return storedIdeas ? JSON.parse(storedIdeas) : null; // Return parsed array or null
    } catch (error) {
        console.error(`Error loading current generated ideas from localStorage:`, error);
        return null;
    }
}

// --- Last Opened Title ---

export function saveLastOpenedTitle(title) {
    try {
        localStorage.setItem(TITLE_STORAGE_KEY, title);
    } catch (error) {
        console.error('Error saving game title to localStorage:', error);
    }
}

export function loadLastOpenedTitle() {
    try {
        const storedTitle = localStorage.getItem(TITLE_STORAGE_KEY);
        return storedTitle || null; // Return null if not found
    } catch (error) {
        console.error('Error loading game title from localStorage:', error);
        localStorage.removeItem(TITLE_STORAGE_KEY); // Clear potentially invalid data
        return null;
    }
}

// --- Ideas ---

export function saveIdea(key, ideaData) {
    try {
        if (!key || !key.startsWith(IDEA_KEY_PREFIX)) {
            console.warn("Invalid key provided for saving idea:", key);
            return false;
        }
        localStorage.setItem(key, JSON.stringify(ideaData));
        return true;
    } catch (error) {
        console.error(`Error saving idea with key "${key}" to localStorage:`, error);
         if (error.name === 'QuotaExceededError') {
            alert('Could not save idea: Local storage quota exceeded. Please delete some saved drafts or ideas.');
        }
        return false;
    }
}

export function loadIdea(key) {
    try {
        if (!key || !key.startsWith(IDEA_KEY_PREFIX)) {
            console.warn("Invalid key provided for loading idea:", key);
            return null;
        }
        const storedIdea = localStorage.getItem(key);
        if (storedIdea) {
            const parsed = JSON.parse(storedIdea);
            // Add basic validation for idea structure
            if (parsed && typeof parsed.text === 'string' && (typeof parsed.category === 'string' || parsed.category === null)) {
                 // Ensure description is always a string, even if empty
                 parsed.description = parsed.description || '';
                return parsed;
            } else {
                console.warn(`Invalid idea data found in localStorage for key ${key}.`);
                return null; // Indicate failure
            }
        }
        return null; // No idea found for this key
    } catch (error) {
        console.error(`Error loading idea for key "${key}" from localStorage:`, error);
        return null; // Indicate failure
    }
}

export function deleteIdea(key) {
    try {
        if (!key || !key.startsWith(IDEA_KEY_PREFIX)) {
            console.warn("Invalid key provided for deleting idea:", key);
            return false;
        }
        localStorage.removeItem(key);
        return true;
    } catch (error) {
        console.error(`Error deleting idea with key "${key}" from localStorage:`, error);
        return false;
    }
}

export function getSavedIdeaKeys() {
    const keys = [];
    try {
        for (let i = 0; i < localStorage.length; i++) {
            const key = localStorage.key(i);
            if (key && key.startsWith(IDEA_KEY_PREFIX)) {
                keys.push(key);
            }
        }
    } catch (error) {
        console.error("Error reading saved idea keys from localStorage:", error);
    }
    return keys.sort();
}

// --- Settings ---

export function saveSetting(key, value) {
    try {
        localStorage.setItem(key, JSON.stringify(value));
    } catch (error) {
        console.error(`Error saving setting "${key}" to localStorage:`, error);
        // Handle potential quota exceeded error
        if (error.name === 'QuotaExceededError') {
            alert(`Could not save setting "${key}": Local storage quota exceeded.`);
        }
    }
}

export function loadSetting(key, defaultValue) {
    try {
        const storedValue = localStorage.getItem(key);
        return storedValue !== null ? JSON.parse(storedValue) : defaultValue;
    } catch (error) {
        console.error(`Error loading setting "${key}" from localStorage:`, error);
        localStorage.removeItem(key); // Clear potentially invalid data
        return defaultValue;
    }
}

// --- Specific Settings Loaders ---

export function loadUseDraftContextSetting() {
    return loadSetting(DRAFT_CONTEXT_STORAGE_KEY, true); // Default true
}

export function loadBriefOptionsSetting() {
    const defaults = {
        briefType: 'full',
        includeTargetAudience: true,
        includeTechnical: true,
        includeFileStructure: false,
        includeVibeCoding: false, 
        technicalContext: 'agnostic'
    };
    const loaded = loadSetting(BRIEF_OPTIONS_STORAGE_KEY, defaults);
    // Ensure all default keys exist in the loaded object
    return { ...defaults, ...loaded };
}

export function loadIdeaDetailLevelSetting() {
    const loaded = loadSetting(IDEA_DETAIL_STORAGE_KEY, 'standard'); // Default standard
    return ['brief', 'standard', 'detailed'].includes(loaded) ? loaded : 'standard';
}

// --- Storage Usage ---

export function getLocalStorageUsage() {
    let totalBytes = 0;
    const storageLimitBytes = 5 * 1024 * 1024; // Estimate 5MB limit

    try {
        for (let i = 0; i < localStorage.length; i++) {
            const key = localStorage.key(i);
            const value = localStorage.getItem(key);
            // Estimate bytes: key length + value length (UTF-16 characters are 2 bytes each)
            if (key && value) {
                 totalBytes += (key.length + value.length) * 2;
            }
        }
    } catch (error) {
        console.error("Error calculating localStorage usage:", error);
        // Return default values or indicate error?
        return {
            usedMB: 'Error',
            limitMB: (storageLimitBytes / (1024 * 1024)).toFixed(2),
            percentageUsed: 'Error',
            totalBytes: 0,
            storageLimitBytes
        };
    }

    const usedMB = (totalBytes / (1024 * 1024)).toFixed(2);
    const limitMB = (storageLimitBytes / (1024 * 1024)).toFixed(2);
    const percentageUsed = ((totalBytes / storageLimitBytes) * 100).toFixed(1);

    return {
        usedMB,
        limitMB,
        percentageUsed,
        totalBytes,
        storageLimitBytes
    };
}