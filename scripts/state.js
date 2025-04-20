// Central state management for the application
export function initState() {
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
    designDraft: [],
    designBrief: ''
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
    designBrief: []
  };
  
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
      notifyListeners('designDraft');
    },
    
    removeFromDesignDraft: (index) => {
      _state.designDraft.splice(index, 1);
      notifyListeners('designDraft');
    },
    
    setDesignDraft: (draft) => {
      _state.designDraft = draft;
      notifyListeners('designDraft');
    },
    
    setDesignBrief: (brief) => {
      _state.designBrief = brief;
      notifyListeners('designBrief');
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

