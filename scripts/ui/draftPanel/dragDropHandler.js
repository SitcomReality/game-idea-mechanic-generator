// New file: scripts/ui/draftPanel/dragDropHandler.js

// Helper function to normalize category names (handles Theme/Setting)
function normalizeCategoryName(categoryName) {
  if (categoryName === 'Theme') return 'Narrative Theme';
  if (categoryName === 'Setting') return 'Setting/Context';
  return categoryName || 'Uncategorized'; // Fallback
}

export function initDragDropHandler(draftContainer, state) {

    draftContainer.addEventListener('dragover', (event) => {
      event.preventDefault();
      draftContainer.classList.add('drag-over');
    });

    draftContainer.addEventListener('dragleave', () => {
      draftContainer.classList.remove('drag-over');
    });

    draftContainer.addEventListener('drop', (event) => {
      event.preventDefault();
      draftContainer.classList.remove('drag-over');

      // Check if the draft is in HTML view - if so, don't allow drops
      if (draftContainer.classList.contains('html-view')) {
          console.warn("Cannot drop items into cohered HTML view.");
          return;
      }

      const data = event.dataTransfer.getData('application/json');
      if (data) {
        try {
          const idea = JSON.parse(data);
          // Ensure we add the necessary fields for a chip
          const chipData = {
              text: idea.text,
              // Normalize category on drop as well
              category: normalizeCategoryName(idea.category),
              description: idea.description || '', // Make sure description exists
              type: 'chip' // Mark as chip type
          };
          state.addToDesignDraft(chipData);
        } catch (error) {
          console.error('Error parsing dropped data:', error);
        }
      }
    });
}