// New file: scripts/state/core.js

// --- Private State Container ---
const _state = {
  // These will be populated by initState using loaders
  taxonomy: {},
  selectedTags: new Set(),
  termQuantity: 3,
  customText: '',
  generatedIdeas: [],
  designDraft: [], // Loaded initially
  gameTitle: '', // Loaded initially
  designBrief: '',
  useDraftContext: true, // Loaded initially
  briefOptions: {}, // Loaded initially
  ideaDetailLevel: 'standard', // Loaded initially
};

// --- Subscription System ---
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
  savedDrafts: [], // Listener for changes in saved drafts list (triggered externally)
  savedIdeas: [], // Listener for changes in saved ideas list (triggered externally)
};

// --- Internal State Access ---
// Primarily used by stateGettersSetters.js
export function getState(key) {
    return _state[key];
}

export function setState(key, value) {
    if (_state.hasOwnProperty(key)) {
        _state[key] = value;
        // Note: notifyListeners is called separately by the setter function
        // after potential persistence logic.
    } else {
        console.warn(`Attempted to set unknown state key: ${key}`);
    }
}

// --- Notification ---
// Called by setter functions after state is updated and persisted
export function notifyListeners(key, value) {
  if (listeners[key]) {
    // Prepare value for notification (create copies for mutable types)
    let valueToNotify = value;
    if (valueToNotify instanceof Set) {
        valueToNotify = new Set(valueToNotify);
    } else if (Array.isArray(valueToNotify)) {
        valueToNotify = [...valueToNotify];
    } else if (typeof valueToNotify === 'object' && valueToNotify !== null) {
        valueToNotify = { ...valueToNotify };
    }
    // Call listeners with the copied value
    listeners[key].forEach(listener => listener(valueToNotify));
  }
}

// --- Public Subscription API ---
export function subscribe(key, callback) {
  if (listeners[key]) {
    listeners[key].push(callback);

    // Immediately invoke with current state value (using the notification mechanism to ensure copy)
    // Special handling for derived/external lists (savedDrafts, savedIdeas) - these will be notified
    // by the actions that modify localStorage (save/delete draft/idea) via notifyListeners.
    // Regular state properties are notified here.
    if (_state.hasOwnProperty(key)) {
        let valueToNotify = _state[key];
        if (valueToNotify instanceof Set) {
           valueToNotify = new Set(valueToNotify);
        } else if (Array.isArray(valueToNotify)) {
           valueToNotify = [...valueToNotify];
        } else if (typeof valueToNotify === 'object' && valueToNotify !== null) {
           valueToNotify = { ...valueToNotify };
       }
       callback(valueToNotify);
    } else if (key !== 'savedDrafts' && key !== 'savedIdeas') {
        // Don't warn for the derived listeners, but do for others
        console.warn(`Subscribing to key "${key}" which doesn't have a direct state value. It will only be notified explicitly.`);
    }

    // Return unsubscribe function
    return () => {
      listeners[key] = listeners[key].filter(fn => fn !== callback);
    };
  }
  console.warn(`Attempted to subscribe to non-existent state key or listener array: ${key}`);
  return () => {}; // Return no-op unsubscribe function
}
