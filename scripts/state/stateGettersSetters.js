import { getState, setState, notifyListeners } from './core.js';
import * as storage from './localStorageManager.js';
import { isValidDraftData } from './utils.js';

// --- Getters --- Get state directly from core

export const getTaxonomy = () => getState('taxonomy'); // Typically treated as immutable once loaded
export const getSelectedTags = () => new Set(getState('selectedTags')); // Return copy
export const getTermQuantity = () => getState('termQuantity');
export const getCustomText = () => getState('customText');
export const getGeneratedIdeas = () => [...getState('generatedIdeas')]; // Return copy
export const getDesignDraft = () => [...getState('designDraft')]; // Return copy
export const getGameTitle = () => getState('gameTitle');
export const getDesignBrief = () => getState('designBrief');
export const getUseDraftContext = () => getState('useDraftContext');
export const getBriefOptions = () => ({ ...getState('briefOptions') }); // Return copy
export const getIdeaDetailLevel = () => getState('ideaDetailLevel');

// --- Setters / Actions --- Update core state + handle persistence + notify

export function setTaxonomy(taxonomy) {
    setState('taxonomy', taxonomy);
    notifyListeners('taxonomy', getState('taxonomy'));
}

export function setSelectedTags(tags) {
    const newSet = new Set(tags);
    setState('selectedTags', newSet);
    notifyListeners('selectedTags', getState('selectedTags'));
}

export function addSelectedTag(tag) {
    const currentSet = getState('selectedTags');
    currentSet.add(tag);
    setState('selectedTags', currentSet); // Update state with the mutated set
    notifyListeners('selectedTags', getState('selectedTags')); // Notify with a copy
}

export function removeSelectedTag(tag) {
    const currentSet = getState('selectedTags');
    currentSet.delete(tag);
    setState('selectedTags', currentSet); // Update state with the mutated set
    notifyListeners('selectedTags', getState('selectedTags')); // Notify with a copy
}

export function setTermQuantity(quantity) {
    setState('termQuantity', quantity);
    notifyListeners('termQuantity', getState('termQuantity'));
}

export function setCustomText(text) {
    setState('customText', text);
    notifyListeners('customText', getState('customText'));
}

export function setGeneratedIdeas(ideas) {
    setState('generatedIdeas', ideas);
    // Persist generated ideas whenever they are set, using the global key
    storage.saveGeneratedIdeas(ideas);
    notifyListeners('generatedIdeas', getState('generatedIdeas'));
}

export function addToGeneratedIdeas(idea) {
    const currentIdeas = getState('generatedIdeas');
    currentIdeas.push(idea);
    setState('generatedIdeas', currentIdeas); // Update state with the mutated array
    // Persist generated ideas whenever one is added, using the global key
    storage.saveGeneratedIdeas(currentIdeas);
    notifyListeners('generatedIdeas', getState('generatedIdeas')); // Notify with a copy
}

export function setDesignDraft(draft) {
    if (isValidDraftData(draft)) {
        setState('designDraft', draft);
        // **AUTOSAVE**: Save draft to localStorage under the current title whenever it's set
        const currentTitle = getState('gameTitle');
        storage.saveDraft(currentTitle, draft);
        notifyListeners('designDraft', getState('designDraft'));
    } else {
        console.error("Attempted to set invalid design draft. Operation cancelled.");
    }
}

export function addToDesignDraft(item) {
    const currentDraft = getState('designDraft');
    // If current draft is HTML, replace it instead of adding
    if (currentDraft.length === 1 && currentDraft[0]?.type === 'html') {
         console.warn("Adding chip to a cohered HTML draft. Replacing HTML with the new chip.");
         setState('designDraft', [item]);
    } else {
        currentDraft.push(item);
        setState('designDraft', currentDraft);
    }
    // **AUTOSAVE**: Save draft to localStorage under the current title after adding an item
    const currentTitle = getState('gameTitle');
    storage.saveDraft(currentTitle, getState('designDraft'));
    notifyListeners('designDraft', getState('designDraft'));
}

export function removeFromDesignDraft(index) {
    const currentDraft = getState('designDraft');
    if (index >= 0 && index < currentDraft.length) {
        currentDraft.splice(index, 1);
        setState('designDraft', currentDraft);
        // **AUTOSAVE**: Save draft to localStorage under the current title after removing an item
        const currentTitle = getState('gameTitle');
        storage.saveDraft(currentTitle, getState('designDraft'));
        notifyListeners('designDraft', getState('designDraft'));
    } else {
        console.warn(`Attempted to remove draft item at invalid index: ${index}`);
    }
}

export function setGameTitle(title) {
    const cleanTitle = title ? title.trim() : '';
    const finalTitle = cleanTitle || "Untitled Game"; // Ensure not empty
    const previousTitle = getState('gameTitle');

    // Only update and persist if the title actually changes
    if (finalTitle !== previousTitle) {
        // When the title changes, we need to handle the draft content.
        // Option 1: Load the draft associated with the new title.
        // Option 2: Keep the current draft content and associate it with the new title (potentially overwriting).
        // Option 1 seems more intuitive for explicit title changes via typing/loading.
        // Let's load the draft for the new title. If none exists, clear the draft.
        const existingDraftForNewTitle = storage.loadDraft(finalTitle, isValidDraftData);
        setState('designDraft', existingDraftForNewTitle || []); // Load or clear draft

        setState('gameTitle', finalTitle);
        storage.saveLastOpenedTitle(finalTitle); // Persist last opened title

        // Notify title change *after* potential draft change
        notifyListeners('gameTitle', finalTitle);
        // Notify draft change if it occurred
        notifyListeners('designDraft', getState('designDraft'));

    }
}

export function setDesignBrief(brief) {
    setState('designBrief', brief);
    notifyListeners('designBrief', getState('designBrief'));
}

export function setUseDraftContext(useContext) {
    setState('useDraftContext', useContext);
    storage.saveSetting(storage.DRAFT_CONTEXT_STORAGE_KEY, useContext); // Persist
    notifyListeners('useDraftContext', getState('useDraftContext'));
}

export function setBriefOption(optionKey, value) {
    const currentOptions = getState('briefOptions');
    if (currentOptions.hasOwnProperty(optionKey)) {
        currentOptions[optionKey] = value;
        setState('briefOptions', currentOptions);
        storage.saveSetting(storage.BRIEF_OPTIONS_STORAGE_KEY, currentOptions); // Persist
        notifyListeners('briefOptions', getState('briefOptions'));
    } else {
        console.warn(`Attempted to set unknown brief option: ${optionKey}`);
    }
}

export function setIdeaDetailLevel(level) {
    if (['brief', 'standard', 'detailed'].includes(level)) {
        setState('ideaDetailLevel', level);
        storage.saveSetting(storage.IDEA_DETAIL_STORAGE_KEY, level); // Persist
        notifyListeners('ideaDetailLevel', getState('ideaDetailLevel'));
    } else {
        console.warn(`Attempted to set invalid idea detail level: ${level}`);
    }
}

// --- Actions involving Persistence ---

export function saveCurrentDraftUnderTitle(title) {
    const draft = getState('designDraft');
    // The saveDraft function is now called automatically on changes.
    // This button's primary function might now be more about *confirming* the state
    // under a specific title, especially if the user changed the title *without* blur.
    // Let's ensure the *current* state is saved under the *current* title when clicked.
    if (storage.saveDraft(title, draft)) {
        // If save succeeds, ensure the current game title state matches
        // and persist it as the last opened title
        setGameTitle(title); // This handles state update, persistence, and notification
        notifyListeners('savedDrafts', storage.getSavedDraftTitles()); // Notify list change
        return true; // Indicate success
    }
    return false; // Indicate failure
}

export function loadDraftByTitle(title) {
    const draft = storage.loadDraft(title, isValidDraftData);
    if (draft) {
        // Update draft state - This will also trigger the autosave under the *new* title.
        setState('designDraft', draft);
        notifyListeners('designDraft', getState('designDraft'));

        // Update the current game title state and persist as last opened
        // This handles title state update and notification. It will NOT reload the draft again.
        setState('gameTitle', title); // Directly set state to avoid re-loading draft
        storage.saveLastOpenedTitle(title);
        notifyListeners('gameTitle', title);

    } else {
        console.error(`Failed to load draft for title "${title}"`);
        alert(`Could not load draft "${title}". It might be missing or corrupted.`);
    }
}

export function deleteDraftByTitle(title) {
    const currentTitle = getState('gameTitle');
    if (storage.deleteDraft(title)) {
        notifyListeners('savedDrafts', storage.getSavedDraftTitles()); // Notify list change
        // If the deleted draft was the currently loaded one, clear the draft panel and reset title
        if (currentTitle === title) {
             setState('designDraft', []);
             // Also save the empty draft under the (now default) title
             storage.saveDraft("Untitled Game", []);
             notifyListeners('designDraft', getState('designDraft'));
             // Reset title state and persist it
             setState('gameTitle', "Untitled Game");
             storage.saveLastOpenedTitle("Untitled Game");
             notifyListeners('gameTitle', "Untitled Game");
        }
    }
}

export function saveIdea(key, ideaData) {
    if (storage.saveIdea(key, ideaData)) {
        notifyListeners('savedIdeas', storage.getSavedIdeaKeys()); // Notify list change
    }
}

export function deleteIdeaByKey(key) {
    if (storage.deleteIdea(key)) {
        notifyListeners('savedIdeas', storage.getSavedIdeaKeys()); // Notify list change
    }
}

// --- Expose LocalStorage Getters needed by UI ---
export const getSavedGameTitles = storage.getSavedDraftTitles;
export const getSavedIdeaKeys = storage.getSavedIdeaKeys;
export const loadIdeaFromStorage = storage.loadIdea; // Exposed for Load Ideas Modal