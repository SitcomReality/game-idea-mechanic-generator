import { initState } from './state.js';
import { initGeneratorPanel } from './ui/generatorPanel/generatorPanel.js';
import { initDraftPanel } from './ui/draftPanel/draftPanel.js';
import { initBriefPanel } from './ui/briefPanel/briefPanel.js';
import { loadTaxonomy } from './data/taxonomyLoader.js';
import { initTooltipManager } from './ui/tooltipManager.js';

// Set current year in footer
document.getElementById('year').textContent = new Date().getFullYear();

// Initialize app state
const state = initState();

// Initialize UI components when data is loaded
async function initApp() {
  try {
    // Initialize tooltip manager first
    initTooltipManager();

    // Load taxonomy data
    const taxonomy = await loadTaxonomy();
    state.setTaxonomy(taxonomy);

    // Initialize UI components
    initGeneratorPanel(state);
    initDraftPanel(state);
    initBriefPanel(state);

    // Set default source - Removed as LLM is the only source now
    // state.setGeneratorSource('wordlists');

    console.log('GIMG initialized successfully');
  } catch (error) {
    console.error('Failed to initialize GIMG:', error);
    // Show error message to the user
    document.body.innerHTML = `
      <div class="error-container">
        <h2>Failed to initialize Game-Idea & Mechanic Generator</h2>
        <p>Error: ${error.message}</p>
        <button onclick="location.reload()">Retry</button>
      </div>
    `;
  }
}

// Start the application
initApp();