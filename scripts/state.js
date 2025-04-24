// Central state management facade for the application

// Removed core state logic, moved to ./state/core.js
// Removed localStorage interaction helpers, moved to ./state/localStorageManager.js
// Removed state getter/setter logic, moved to ./state/stateGettersSetters.js
// Removed validation logic, moved to ./state/utils.js

import { subscribe, setState } from './state/core.js';
import * as storage from './state/localStorageManager.js';
import * as actions from './state/stateGettersSetters.js';
import { isValidDraftData } from './state/utils.js';

export function initState() {
  // --- Initial State Loading ---
  // Populate the core state using loaders from localStorageManager

  const initialTitle = storage.loadLastOpenedTitle() || "Untitled Game";
  setState('gameTitle', initialTitle);

  // Load draft associated with the initial title
  const initialDraft = storage.loadDraft(initialTitle, isValidDraftData) || [];
  setState('designDraft', initialDraft);

  // Load the *single* persistent generated ideas list, independent of title
  const initialIdeas = storage.loadGeneratedIdeas() || [];
  setState('generatedIdeas', initialIdeas);

  // Load settings
  setState('useDraftContext', storage.loadUseDraftContextSetting());
  setState('briefOptions', storage.loadBriefOptionsSetting());
  setState('ideaDetailLevel', storage.loadIdeaDetailLevelSetting());

  // Load other defaults (these aren't persisted currently)
  setState('taxonomy', {}); // Will be populated by taxonomyLoader
  setState('selectedTags', new Set());
  setState('termQuantity', 3);
  setState('customText', '');
  setState('designBrief', '');

  // --- Public API ---
  // Combine all exported functions and helpers into a single object
  // This maintains the previous structure where `initState()` returns the full API.
  return {
    // Core subscribe function
    subscribe,

    // Getters from stateGettersSetters.js
    getTaxonomy: actions.getTaxonomy,
    getSelectedTags: actions.getSelectedTags,
    getTermQuantity: actions.getTermQuantity,
    getCustomText: actions.getCustomText,
    getGeneratedIdeas: actions.getGeneratedIdeas,
    getDesignDraft: actions.getDesignDraft,
    getGameTitle: actions.getGameTitle,
    getDesignBrief: actions.getDesignBrief,
    getUseDraftContext: actions.getUseDraftContext,
    getBriefOptions: actions.getBriefOptions,
    getIdeaDetailLevel: actions.getIdeaDetailLevel,
    getSavedGameTitles: actions.getSavedGameTitles, 
    getSavedIdeaKeys: actions.getSavedIdeaKeys, 

    // Setters/Actions from stateGettersSetters.js
    setTaxonomy: actions.setTaxonomy,
    setSelectedTags: actions.setSelectedTags,
    addSelectedTag: actions.addSelectedTag,
    removeSelectedTag: actions.removeSelectedTag,
    setTermQuantity: actions.setTermQuantity,
    setCustomText: actions.setCustomText,
    setGeneratedIdeas: actions.setGeneratedIdeas,
    addToGeneratedIdeas: actions.addToGeneratedIdeas,
    setDesignDraft: actions.setDesignDraft,
    addToDesignDraft: actions.addToDesignDraft,
    removeFromDesignDraft: actions.removeFromDesignDraft,
    setGameTitle: actions.setGameTitle,
    setDesignBrief: actions.setDesignBrief,
    setUseDraftContext: actions.setUseDraftContext,
    setBriefOption: actions.setBriefOption,
    setIdeaDetailLevel: actions.setIdeaDetailLevel,
    saveCurrentDraftUnderTitle: actions.saveCurrentDraftUnderTitle,
    loadDraftByTitle: actions.loadDraftByTitle,
    deleteDraftByTitle: actions.deleteDraftByTitle,
    saveIdea: actions.saveIdea,
    deleteIdeaByKey: actions.deleteIdeaByKey,

    // Utilities / Helpers exposed
    isValidDraftData: isValidDraftData, 
    loadIdeaFromStorage: actions.loadIdeaFromStorage, 
    getLocalStorageUsage: storage.getLocalStorageUsage, 
  };
}