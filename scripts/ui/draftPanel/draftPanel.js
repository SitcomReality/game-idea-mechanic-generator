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
  state.subscribe('designDraft', (draft) => {
    renderDesignDraft(draftContainer, draft, state, addChipBtn); // Pass addChipBtn
  });

  // Initial render based on loaded state
  state.notifyListeners('designDraft'); // Trigger initial render
}