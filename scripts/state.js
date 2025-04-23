// Central state management for the application
export function initState() {
  const DRAFT_STORAGE_KEY = 'gimg_designDraft';
  const TITLE_STORAGE_KEY = 'gimg_gameTitle'; // New key for game title
  const DRAFT_CONTEXT_STORAGE_KEY = 'gimg_useDraftContext';
  const BRIEF_OPTIONS_STORAGE_KEY = 'gimg_briefOptions'; 
  const IDEA_DETAIL_STORAGE_KEY = 'gimg_ideaDetailLevel'; 

  // Load initial draft from localStorage
  const initialDraft = (() => {
    try {
      const storedDraft = localStorage.getItem(DRAFT_STORAGE_KEY);
      if (storedDraft) {
        // Basic validation: Ensure it's an array
        const parsed = JSON.parse(storedDraft);
        return Array.isArray(parsed) ? parsed : [];
      }
      return [];
    } catch (error) {
      console.error('Error loading design draft from localStorage:', error);
      localStorage.removeItem(DRAFT_STORAGE_KEY); // Clear invalid data
      return [];
    }
  })();

  // Load initial game title from localStorage
  const initialGameTitle = (() => {
      try {
          const storedTitle = localStorage.getItem(TITLE_STORAGE_KEY);
          return storedTitle || "Untitled Game"; // Default if not found or empty
      } catch (error) {
          console.error('Error loading game title from localStorage:', error);
          localStorage.removeItem(TITLE_STORAGE_KEY); // Clear invalid data
          return "Untitled Game";
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
    gameTitle: initialGameTitle, // Add game title to state
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
    gameTitle: [], // Add listener array for game title
    designBrief: [],
    useDraftContext: [],
    briefOptions: [],
    ideaDetailLevel: [] 
  };

  // Save draft to localStorage helper
  function saveDraftToStorage(draft) {
    try {
      localStorage.setItem(DRAFT_STORAGE_KEY, JSON.stringify(draft));
    } catch (error) {
      console.error('Error saving design draft to localStorage:', error);
    }
  }

  // Save game title to localStorage helper
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

  // Notify listeners of state changes
  function notifyListeners(key) {
    if (listeners[key]) {
      listeners[key].forEach(listener => listener(_state[key]));
    }
  }

  // Function to validate imported draft data
  function isValidDraftData(data) {
    if (!Array.isArray(data)) {
      console.error("Import failed: Data is not an array.");
      return false;
    }
    for (const item of data) {
      if (typeof item !== 'object' || item === null) {
        console.error("Import failed: Array contains non-object elements.");
        return false;
      }
      if (item.type === 'html') {
        if (typeof item.text !== 'string') {
          console.error("Import failed: HTML item missing 'text' string.", item);
          return false;
        }
      } else {
        // Assuming chip-like object
        if (typeof item.text !== 'string') {
          console.error("Import failed: Chip item missing 'text' string.", item);
          return false;
        }
        // Category and description are optional but should be strings if present
        if (item.hasOwnProperty('category') && typeof item.category !== 'string') {
          console.error("Import failed: Chip item has non-string 'category'.", item);
          return false;
        }
         if (item.hasOwnProperty('description') && typeof item.description !== 'string') {
          console.error("Import failed: Chip item has non-string 'description'.", item);
          return false;
        }
      }
    }
    return true;
  }

  // Public API
  return {
    // Getters
    getTaxonomy: () => _state.taxonomy,
    getSelectedTags: () => new Set(_state.selectedTags),
    getTermQuantity: () => _state.termQuantity,
    getCustomText: () => _state.customText,
    getGeneratedIdeas: () => [..._state.generatedIdeas],
    getDesignDraft: () => [..._state.designDraft],
    getGameTitle: () => _state.gameTitle, // Add getter for game title
    getDesignBrief: () => _state.designBrief,
    getUseDraftContext: () => _state.useDraftContext,
    getBriefOptions: () => ({ ..._state.briefOptions }),
    getIdeaDetailLevel: () => _state.ideaDetailLevel, 

    // Setters
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
      saveDraftToStorage(_state.designDraft); 
      notifyListeners('designDraft');
    },

    removeFromDesignDraft: (index) => {
      _state.designDraft.splice(index, 1);
      saveDraftToStorage(_state.designDraft); 
      notifyListeners('designDraft');
    },

    setDesignDraft: (draft) => {
      _state.designDraft = draft;
      saveDraftToStorage(_state.designDraft); 
      notifyListeners('designDraft');
    },

    setGameTitle: (title) => { // Add setter for game title
        _state.gameTitle = title || "Untitled Game"; // Ensure not empty
        saveGameTitleToStorage(_state.gameTitle);
        notifyListeners('gameTitle');
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

    // Import/Export
    exportDesignDraft: () => {
        // Exporting only the draft content, title is handled separately by state persistence
        return JSON.stringify(_state.designDraft, null, 2); 
    },

    importDesignDraft: (jsonData) => {
      // Importing only draft content, title remains as is unless user changes it
      try {
        const data = JSON.parse(jsonData);
        if (isValidDraftData(data)) {
          _state.designDraft = data;
          saveDraftToStorage(_state.designDraft);
          notifyListeners('designDraft');
          return true; 
        } else {
          // Validation errors logged in isValidDraftData
          return false; 
        }
      } catch (error) {
        console.error('Error parsing imported draft data:', error);
        return false; 
      }
    },

    // Internal function exposed for specific use cases (like initial render)
    notifyListeners: notifyListeners,

    // Subscription methods
    subscribe: (key, callback) => {
      if (listeners[key]) {
        listeners[key].push(callback);
        // Immediately invoke with current state
        if (_state.hasOwnProperty(key)) {
          callback(_state[key]);
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