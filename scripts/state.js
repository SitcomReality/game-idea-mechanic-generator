// Central state management for the application
export function initState() {
  const DRAFT_STORAGE_KEY = 'gimg_designDraft';
  const DRAFT_CONTEXT_STORAGE_KEY = 'gimg_useDraftContext';

  // Load initial draft from localStorage
  const initialDraft = (() => {
    try {
      const storedDraft = localStorage.getItem(DRAFT_STORAGE_KEY);
      return storedDraft ? JSON.parse(storedDraft) : [];
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


  // Private state
  const _state = {
    taxonomy: {},
    selectedTags: new Set(),
    generatorSource: 'wordlists', // 'wordlists', 'llm', or 'hybrid'
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
    useDraftContext: initialUseDraftContext // Load from storage, default true
  };
  
  // Subscription system
  const listeners = {
    taxonomy: [],
    selectedTags: [],
    generatorSource: [],
    termQuantity: [],
    customText: [],
    enabledSections: [],
    generatedIdeas: [],
    designDraft: [],
    designBrief: [],
    useDraftContext: [] // Add listener key
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
  
  // Notify listeners of state changes
  function notifyListeners(key) {
    if (listeners[key]) {
      listeners[key].forEach(listener => listener(_state[key]));
    }
  }
  
  // Public API
  return {
    // Getters
    getTaxonomy: () => _state.taxonomy,
    getSelectedTags: () => new Set(_state.selectedTags),
    getGeneratorSource: () => _state.generatorSource,
    getTermQuantity: () => _state.termQuantity,
    getCustomText: () => _state.customText,
    getEnabledSections: () => ({..._state.enabledSections}),
    getGeneratedIdeas: () => [..._state.generatedIdeas],
    getDesignDraft: () => [..._state.designDraft],
    getDesignBrief: () => _state.designBrief,
    getUseDraftContext: () => _state.useDraftContext, // Add getter
    
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
    
    setGeneratorSource: (source) => {
      _state.generatorSource = source;
      notifyListeners('generatorSource');
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

    setUseDraftContext: (useContext) => { // Add setter
        _state.useDraftContext = useContext;
        saveDraftContextSettingToStorage(useContext); // Save to storage
        notifyListeners('useDraftContext');
    },
    
    // Subscription methods
    subscribe: (key, callback) => {
      if (listeners[key]) {
        listeners[key].push(callback);
        // Immediately invoke with current state
        callback(_state[key]);
        // Return unsubscribe function
        return () => {
          listeners[key] = listeners[key].filter(fn => fn !== callback);
        };
      }
      return () => {}; // No-op if key doesn't exist
    }
  };
}