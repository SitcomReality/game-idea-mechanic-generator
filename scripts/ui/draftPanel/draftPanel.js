import { initState } from '../../state.js'; 
import { renderDesignDraft } from './renderDraft.js';
import { initTitleHandler } from './titleHandler.js';
import { initDragDropHandler } from './dragDropHandler.js';
import { initDraftActions } from './actions.js';
import { initAddChipModal } from './addChipModal.js';

export function initDraftPanel(state) {
  const draftContainer = document.getElementById('draft-container');

  // Initialize sub-modules, passing state and relevant elements
  const { addChipBtn } = initAddChipModal(state); // Get button reference
  initTitleHandler(state);
  initDragDropHandler(draftContainer, state);
  initDraftActions(state);

  // --- Rendering based on state ---
  // Subscribe to draft changes to trigger re-render
  // The subscribe function in state.js calls the callback immediately with the current state,
  // so the initial render is handled automatically.
  state.subscribe('designDraft', (draft) => {
    renderDesignDraft(draftContainer, draft, state, addChipBtn); // Pass addChipBtn
  });

  // Initial render based on loaded state - REMOVED as subscribe handles it.
  // state.notifyListeners('designDraft'); // Trigger initial render - THIS IS THE ERROR
}