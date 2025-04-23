// Central state management for the application
export function initState() {
  // const DRAFT_STORAGE_KEY = 'gimg_designDraft'; // No longer used for default load
  const TITLE_STORAGE_KEY = 'gimg_gameTitle'; // Key for last opened game title
  const DRAFT_CONTEXT_STORAGE_KEY = 'gimg_useDraftContext';
  const BRIEF_OPTIONS_STORAGE_KEY = 'gimg_briefOptions';
  const IDEA_DETAIL_STORAGE_KEY = 'gimg_ideaDetailLevel';
  const DRAFT_KEY_PREFIX = 'gimg_draft_'; // Prefix for saved draft keys
  const IDEA_KEY_PREFIX = 'gimg_idea_'; // Prefix for saved individual ideas

  // --- Initial State Loading ---

  // Load last opened game title, default to "Untitled Game"
  const initialGameTitle = (() => {
      try {
          const storedTitle = localStorage.getItem(TITLE_STORAGE_KEY);
          return storedTitle || "Untitled Game";
      } catch (error) {
          console.error('Error loading game title from localStorage:', error);
          localStorage.removeItem(TITLE_STORAGE_KEY); 
          return "Untitled Game";
      }
  })();

  // Load draft associated with the initial title, default to empty array
  const initialDraft = (() => {
    try {
      const draftKey = DRAFT_KEY_PREFIX + initialGameTitle;
      const storedDraft = localStorage.getItem(draftKey);
      if (storedDraft) {
        const parsed = JSON.parse(storedDraft);
        if (isValidDraftData(parsed)) {
             return parsed;
        } else {
            console.warn(`Invalid draft data found in localStorage for key ${draftKey}. Clearing.`);
            localStorage.removeItem(draftKey);
            return [];
        }
      }
      return []; // No draft found for this title
    } catch (error) {
      console.error(`Error loading design draft for title "${initialGameTitle}" from localStorage:`, error);
      localStorage.removeItem(DRAFT_KEY_PREFIX + initialGameTitle); // Clear potentially invalid data
      return [];
    }
  })();

  // Load initial draft context setting from localStorage
  const initialUseDraftContext = (() => {
    try {
      const storedValue = localStorage.getItem(DRAFT_CONTEXT_STORAGE_KEY);
      // Default to true if not found or invalid
      return storedValue === null ? true : JSON.parse(storedValue);
    } catch (error) {
      console.error('Error loading draft context setting from localStorage:', error);
      localStorage.removeItem(DRAFT_CONTEXT_STORAGE_KEY); // Clear invalid data
      return true;
    }
  })();

  // Load initial brief options from localStorage
  const initialBriefOptions = (() => {
    const defaults = {
      briefType: 'full',
      includeTargetAudience: true,
      includeTechnical: true,
      includeFileStructure: false,
      technicalContext: 'agnostic'
    };
    try {
        const storedOptions = localStorage.getItem(BRIEF_OPTIONS_STORAGE_KEY);
        return storedOptions ? { ...defaults, ...JSON.parse(storedOptions) } : defaults;
    } catch (error) {
        console.error('Error loading brief options from localStorage:', error);
        localStorage.removeItem(BRIEF_OPTIONS_STORAGE_KEY); // Clear invalid data
        return defaults;
    }
  })();

  // Load initial idea detail level from localStorage
  const initialIdeaDetailLevel = (() => {
    const storedValue = localStorage.getItem(IDEA_DETAIL_STORAGE_KEY);
    // Default to 'standard' if not found or invalid
    return ['brief', 'standard', 'detailed'].includes(storedValue) ? storedValue : 'standard';
  })();

  // Private state
  const _state = {
    taxonomy: {},
    selectedTags: new Set(),
    termQuantity: 3,
    customText: '',
    generatedIdeas: [],
    designDraft: initialDraft,
    gameTitle: initialGameTitle,
    designBrief: '',
    useDraftContext: initialUseDraftContext,
    briefOptions: initialBriefOptions,
    ideaDetailLevel: initialIdeaDetailLevel
  };

  // Subscription system
  const listeners = {
    taxonomy: [],
    selectedTags: [],
    termQuantity: [],
    customText: [],
    generatedIdeas: [],
    designDraft: [],
    gameTitle: [],
    designBrief: [],
    useDraftContext: [],
    briefOptions: [],
    ideaDetailLevel: [],
    savedDrafts: [], // Listener for changes in saved drafts list
    savedIdeas: [] // Listener for changes in saved ideas list
  };

  // --- LocalStorage Interaction Helpers ---

  // Save draft to localStorage under a specific title
  function saveDraftToStorage(title, draft) {
    try {
      const draftKey = DRAFT_KEY_PREFIX + title;
      if (!title || title.trim() === "") {
        console.warn("Cannot save draft with empty title.");
        return;
      }
      localStorage.setItem(draftKey, JSON.stringify(draft));
      // Also update the last opened title
      saveGameTitleToStorage(title);
      notifyListeners('savedDrafts'); // Notify that the list might have changed
    } catch (error) {
      console.error(`Error saving design draft "${title}" to localStorage:`, error);
    }
  }

  // Load draft from localStorage for a specific title
  function loadDraftFromStorage(title) {
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
                return null; // Indicate failure
            }
        }
        return null; // No draft found for this title
    } catch (error) {
        console.error(`Error loading design draft for title "${title}" from localStorage:`, error);
        // localStorage.removeItem(DRAFT_KEY_PREFIX + title); // Optionally clear potentially invalid data
        return null; // Indicate failure
    }
  }

  // Save game title (last opened) to localStorage helper
  function saveGameTitleToStorage(title) {
      try {
          localStorage.setItem(TITLE_STORAGE_KEY, title);
      } catch (error) {
          console.error('Error saving game title to localStorage:', error);
      }
  }

  // Save draft context setting to localStorage helper
  function saveDraftContextSettingToStorage(useContext) {
    try {
      localStorage.setItem(DRAFT_CONTEXT_STORAGE_KEY, JSON.stringify(useContext));
    } catch (error) {
      console.error('Error saving draft context setting to localStorage:', error);
    }
  }

  // Save brief options setting to localStorage helper
  function saveBriefOptionsToStorage(options) {
    try {
      localStorage.setItem(BRIEF_OPTIONS_STORAGE_KEY, JSON.stringify(options));
    } catch (error) {
      console.error('Error saving brief options to localStorage:', error);
    }
  }

  // Save idea detail level setting to localStorage helper
  function saveIdeaDetailLevelToStorage(level) {
    try {
      localStorage.setItem(IDEA_DETAIL_STORAGE_KEY, level);
    } catch (error) {
      console.error('Error saving idea detail level to localStorage:', error);
    }
  }

  // Save individual idea to localStorage
  function saveIdeaToStorage(key, ideaData) {
    try {
      if (!key || !key.startsWith(IDEA_KEY_PREFIX)) {
        console.warn("Invalid key provided for saving idea:", key);
        return;
      }
      localStorage.setItem(key, JSON.stringify(ideaData));
      notifyListeners('savedIdeas'); // Notify that the list might have changed
    } catch (error) {
      console.error(`Error saving idea with key "${key}" to localStorage:`, error);
    }
  }

  // Load individual idea from localStorage
  function loadIdeaFromStorage(key) {
    try {
        if (!key || !key.startsWith(IDEA_KEY_PREFIX)) {
           console.warn("Invalid key provided for loading idea:", key);
           return null;
        }
        const storedIdea = localStorage.getItem(key);
        if (storedIdea) {
            const parsed = JSON.parse(storedIdea);
            // Add basic validation for idea structure if needed
            if (parsed && typeof parsed.text === 'string' && typeof parsed.category === 'string') {
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

  // Get all saved idea keys
  function getSavedIdeaKeys() {
      const keys = [];
      for (let i = 0; i < localStorage.length; i++) {
          const key = localStorage.key(i);
          if (key.startsWith(IDEA_KEY_PREFIX)) {
              keys.push(key);
          }
      }
      // Sort by timestamp embedded in key? Or just alphabetically? Alphabetical for now.
      return keys.sort();
  }

  // Delete individual idea from localStorage
  function deleteIdeaFromStorage(key) {
    try {
        if (!key || !key.startsWith(IDEA_KEY_PREFIX)) {
           console.warn("Invalid key provided for deleting idea:", key);
           return;
        }
        localStorage.removeItem(key);
        notifyListeners('savedIdeas'); // Notify that the list has changed
    } catch (error) {
        console.error(`Error deleting idea with key "${key}" from localStorage:`, error);
    }
  }

  // Notify listeners of state changes
  function notifyListeners(key) {
    if (listeners[key]) {
      // Create a shallow copy of the state value to prevent accidental mutation
      let valueToNotify = _state[key];
      if (key === 'savedDrafts') {
          valueToNotify = getSavedGameTitles(); // Special case: notify with the list of titles
      } else if (key === 'savedIdeas') {
          valueToNotify = getSavedIdeaKeys(); // Special case: notify with the list of keys
      } else if (valueToNotify instanceof Set) {
          valueToNotify = new Set(valueToNotify);
      } else if (Array.isArray(valueToNotify)) {
          valueToNotify = [...valueToNotify];
      } else if (typeof valueToNotify === 'object' && valueToNotify !== null) {
          valueToNotify = { ...valueToNotify };
      }
      listeners[key].forEach(listener => listener(valueToNotify));
    }
  }

  // Function to validate draft data (used for load)
  function isValidDraftData(data) {
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
      } else {
        // Assuming chip-like object
        if (typeof item.text !== 'string') {
          console.error("Invalid draft data: Chip item missing 'text' string.", item);
          return false;
        }
        if (item.hasOwnProperty('category') && typeof item.category !== 'string' && item.category !== null) {
          console.error("Invalid draft data: Chip item has non-string 'category'.", item);
          return false;
        }
         if (item.hasOwnProperty('description') && typeof item.description !== 'string') {
          console.error("Invalid draft data: Chip item has non-string 'description'.", item);
          return false;
        }
         if (item.hasOwnProperty('type') && item.type !== 'chip' && item.type !== 'html') {
             console.error("Invalid draft data: Item has unknown 'type'.", item);
             return false;
         }
      }
    }
    return true;
  }

  // Helper function to get all saved game titles
  function getSavedGameTitles() {
      const titles = [];
      for (let i = 0; i < localStorage.length; i++) {
          const key = localStorage.key(i);
          if (key.startsWith(DRAFT_KEY_PREFIX)) {
              titles.push(key.substring(DRAFT_KEY_PREFIX.length));
          }
      }
      return titles.sort(); // Return sorted list
  }

  // Helper function to delete a draft from local storage
  function deleteDraftFromStorage(title) {
    try {
        const draftKey = DRAFT_KEY_PREFIX + title;
        localStorage.removeItem(draftKey);
        notifyListeners('savedDrafts'); // Notify that the list has changed
    } catch (error) {
        console.error(`Error deleting draft "${title}" from localStorage:`, error);
    }
  }

  // Public API
  return {
    // Getters
    getTaxonomy: () => _state.taxonomy,
    getSelectedTags: () => new Set(_state.selectedTags), // Return copy
    getTermQuantity: () => _state.termQuantity,
    getCustomText: () => _state.customText,
    getGeneratedIdeas: () => [..._state.generatedIdeas], // Return copy
    getDesignDraft: () => [..._state.designDraft], // Return copy
    getGameTitle: () => _state.gameTitle,
    getDesignBrief: () => _state.designBrief,
    getUseDraftContext: () => _state.useDraftContext,
    getBriefOptions: () => ({ ..._state.briefOptions }), // Return copy
    getIdeaDetailLevel: () => _state.ideaDetailLevel,
    getSavedGameTitles: getSavedGameTitles, // Expose helper
    isValidDraftData: isValidDraftData, // Expose validation function
    getSavedIdeaKeys: getSavedIdeaKeys, // Expose helper
    loadIdeaFromStorage: loadIdeaFromStorage, // Expose helper

    // Setters / Actions
    setTaxonomy: (taxonomy) => {
      _state.taxonomy = taxonomy;
      notifyListeners('taxonomy');
    },

    setSelectedTags: (tags) => {
      _state.selectedTags = new Set(tags);
      notifyListeners('selectedTags');
    },

    addSelectedTag: (tag) => {
      _state.selectedTags.add(tag);
      notifyListeners('selectedTags');
    },

    removeSelectedTag: (tag) => {
      _state.selectedTags.delete(tag);
      notifyListeners('selectedTags');
    },

    setTermQuantity: (quantity) => {
      _state.termQuantity = quantity;
      notifyListeners('termQuantity');
    },

    setCustomText: (text) => {
      _state.customText = text;
      notifyListeners('customText');
    },

    setGeneratedIdeas: (ideas) => {
      _state.generatedIdeas = ideas;
      notifyListeners('generatedIdeas');
    },

    addToDesignDraft: (item) => {
      _state.designDraft.push(item);
      // Don't auto-save on add, user must explicitly save
      // saveDraftToStorage(_state.gameTitle, _state.designDraft);
      notifyListeners('designDraft');
    },

    removeFromDesignDraft: (index) => {
      if (index >= 0 && index < _state.designDraft.length) {
          _state.designDraft.splice(index, 1);
          // Don't auto-save on remove
          // saveDraftToStorage(_state.gameTitle, _state.designDraft);
          notifyListeners('designDraft');
      } else {
          console.warn(`Attempted to remove draft item at invalid index: ${index}`);
      }
    },

    setDesignDraft: (draft) => {
      if (isValidDraftData(draft)) {
          _state.designDraft = draft;
          // Don't auto-save on set (used by load etc)
          // saveDraftToStorage(_state.gameTitle, _state.designDraft);
          notifyListeners('designDraft');
      } else {
          console.error("Attempted to set invalid design draft. Operation cancelled.");
      }
    },

    setGameTitle: (title) => {
        const cleanTitle = title ? title.trim() : '';
        _state.gameTitle = cleanTitle || "Untitled Game"; // Ensure not empty
        saveGameTitleToStorage(_state.gameTitle); // Save last opened title immediately
        notifyListeners('gameTitle');
        // Note: This does NOT automatically load the draft for the new title.
        // Load must be explicit via loadDraftByTitle.
    },

    setDesignBrief: (brief) => {
      _state.designBrief = brief;
      notifyListeners('designBrief');
    },

    setUseDraftContext: (useContext) => {
      _state.useDraftContext = useContext;
      saveDraftContextSettingToStorage(useContext);
      notifyListeners('useDraftContext');
    },

    setBriefOption: (optionKey, value) => {
      if (_state.briefOptions.hasOwnProperty(optionKey)) {
          _state.briefOptions[optionKey] = value;
          saveBriefOptionsToStorage(_state.briefOptions);
          notifyListeners('briefOptions');
      } else {
          console.warn(`Attempted to set unknown brief option: ${optionKey}`);
      }
    },

    setIdeaDetailLevel: (level) => {
      if (['brief', 'standard', 'detailed'].includes(level)) {
        _state.ideaDetailLevel = level;
        saveIdeaDetailLevelToStorage(level);
        notifyListeners('ideaDetailLevel');
      } else {
        console.warn(`Attempted to set invalid idea detail level: ${level}`);
      }
    },

    saveDesignDraft: (title) => {
      saveDraftToStorage(title, _state.designDraft);
    },

    saveCurrentDraftUnderTitle: (title) => { 
        const draft = _state.designDraft;
        saveDraftToStorage(title, draft);
        // Update the last opened title as well
        _state.gameTitle = title;
        saveGameTitleToStorage(title);
        notifyListeners('gameTitle'); // Notify title change
    },

    loadDraftByTitle: (title) => {
      const draft = loadDraftFromStorage(title);
      if (draft) {
        _state.designDraft = draft;
        _state.gameTitle = title; // Also update the current game title
        saveGameTitleToStorage(title); // Remember this as the last opened
        notifyListeners('designDraft');
        notifyListeners('gameTitle');
      } else {
        console.error(`Failed to load draft for title "${title}"`);
        // Should we clear the draft or leave it as is on failure? Leaving it for now.
      }
    },

    deleteDraftByTitle: (title) => { 
      deleteDraftFromStorage(title);
      // If the deleted draft was the currently loaded one, reset title?
      // if (_state.gameTitle === title) {
      //   _state.gameTitle = "Untitled Game";
      //   saveGameTitleToStorage(_state.gameTitle);
      //   notifyListeners('gameTitle');
      // }
    },

    addToGeneratedIdeas: (idea) => {
        _state.generatedIdeas.push(idea);
        notifyListeners('generatedIdeas');
    },

    saveIdea: (key, ideaData) => {
        saveIdeaToStorage(key, ideaData);
    },

    deleteIdeaByKey: (key) => {
        deleteIdeaFromStorage(key);
    },

    subscribe: (key, callback) => {
      if (listeners[key]) {
        listeners[key].push(callback);
        // Immediately invoke with current state (using the notification mechanism to ensure copy)
        // Special handling for savedDrafts and savedIdeas which derive from localStorage
        if (key === 'savedDrafts') {
            callback(getSavedGameTitles());
        } else if (key === 'savedIdeas') {
            callback(getSavedIdeaKeys());
        } else if (_state.hasOwnProperty(key)) {
            let valueToNotify = _state[key];
             if (valueToNotify instanceof Set) {
                valueToNotify = new Set(valueToNotify);
             } else if (Array.isArray(valueToNotify)) {
                valueToNotify = [...valueToNotify];
             } else if (typeof valueToNotify === 'object' && valueToNotify !== null) {
                valueToNotify = { ...valueToNotify };
            }
            callback(valueToNotify);
        }
        // Return unsubscribe function
        return () => {
          listeners[key] = listeners[key].filter(fn => fn !== callback);
        };
      }
      console.warn(`Attempted to subscribe to non-existent state key: ${key}`);
      return () => {};
    }
  };
}