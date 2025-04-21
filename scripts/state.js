// Central state management for the application
export function initState() {
  const DRAFT_STORAGE_KEY = 'gimg_designDraft';
  const DRAFT_CONTEXT_STORAGE_KEY = 'gimg_useDraftContext';
  const BRIEF_OPTIONS_STORAGE_KEY = 'gimg_briefOptions'; // New key

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


  // Private state
  const _state = {
    taxonomy: {},
    selectedTags: new Set(),
    termQuantity: 3,
    customText: '',
    enabledSections: {
      mechanics: true,
      themes: true,
      settings: true,
      systems: true
    },
    generatedIdeas: [],
    designDraft: initialDraft, // Load from storage
    designBrief: '',
    useDraftContext: initialUseDraftContext, // Load from storage, default true
    briefOptions: initialBriefOptions // Load from storage
  };

  // Subscription system
  const listeners = {
    taxonomy: [],
    selectedTags: [],
    termQuantity: [],
    customText: [],
    enabledSections: [],
    generatedIdeas: [],
    designDraft: [],
    designBrief: [],
    useDraftContext: [],
    briefOptions: [] // New listener array
  };

  // Save draft to localStorage helper
  function saveDraftToStorage(draft) {
    try {
      localStorage.setItem(DRAFT_STORAGE_KEY, JSON.stringify(draft));
    } catch (error) {
      console.error('Error saving design draft to localStorage:', error);
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
    getEnabledSections: () => ({..._state.enabledSections}),
    getGeneratedIdeas: () => [..._state.generatedIdeas],
    getDesignDraft: () => [..._state.designDraft],
    getDesignBrief: () => _state.designBrief,
    getUseDraftContext: () => _state.useDraftContext,
    getBriefOptions: () => ({ ..._state.briefOptions }), // Return a copy

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

    setEnabledSection: (section, enabled) => {
      _state.enabledSections[section] = enabled;
      notifyListeners('enabledSections');
    },

    setGeneratedIdeas: (ideas) => {
      _state.generatedIdeas = ideas;
      notifyListeners('generatedIdeas');
    },

    addToDesignDraft: (item) => {
      _state.designDraft.push(item);
      saveDraftToStorage(_state.designDraft); // Save to storage
      notifyListeners('designDraft');
    },

    removeFromDesignDraft: (index) => {
      _state.designDraft.splice(index, 1);
      saveDraftToStorage(_state.designDraft); // Save to storage
      notifyListeners('designDraft');
    },

    setDesignDraft: (draft) => {
      _state.designDraft = draft;
      saveDraftToStorage(_state.designDraft); // Save to storage
      notifyListeners('designDraft');
    },

    setDesignBrief: (brief) => {
      _state.designBrief = brief;
      notifyListeners('designBrief');
    },

    setUseDraftContext: (useContext) => {
      _state.useDraftContext = useContext;
      saveDraftContextSettingToStorage(useContext); // Save to storage
      notifyListeners('useDraftContext');
    },

    setBriefOption: (optionKey, value) => {
      if (_state.briefOptions.hasOwnProperty(optionKey)) {
          _state.briefOptions[optionKey] = value;
          saveBriefOptionsToStorage(_state.briefOptions); // Save on change
          notifyListeners('briefOptions');
      } else {
          console.warn(`Attempted to set unknown brief option: ${optionKey}`);
      }
    },

    // Import/Export
    exportDesignDraft: () => {
        return JSON.stringify(_state.designDraft, null, 2); // Pretty print JSON
    },

    importDesignDraft: (jsonData) => {
      try {
        const data = JSON.parse(jsonData);
        if (isValidDraftData(data)) {
          _state.designDraft = data;
          saveDraftToStorage(_state.designDraft);
          notifyListeners('designDraft');
          return true; // Indicate success
        } else {
          // Validation errors logged in isValidDraftData
          return false; // Indicate failure
        }
      } catch (error) {
        console.error('Error parsing imported draft data:', error);
        return false; // Indicate failure
      }
    },

    // Internal function exposed for specific use cases (like initial render)
    notifyListeners: notifyListeners, // <-- EXPOSE THE FUNCTION HERE

    // Subscription methods
    subscribe: (key, callback) => {
      if (listeners[key]) {
        listeners[key].push(callback);
        // Immediately invoke with current state
        // Check if _state[key] exists before calling callback
        if (_state.hasOwnProperty(key)) {
          callback(_state[key]);
        }
        // Return unsubscribe function
        return () => {
          listeners[key] = listeners[key].filter(fn => fn !== callback);
        };
      }
      console.warn(`Attempted to subscribe to non-existent state key: ${key}`);
      return () => {}; // No-op if key doesn't exist
    }
  };
}