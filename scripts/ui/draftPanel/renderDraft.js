// New file: scripts/ui/draftPanel/renderDraft.js
import { createChip } from '../chip.js';

// Helper function to get top-level category name for grouping
function getTopLevelCategory(item) {
    let category = normalizeCategoryName(item.category) || 'Uncategorized'; // Use normalization and default
    // Split by '.' and take the first part (top-level category)
    return category.split('.')[0];
}

// Helper function to create CSS-friendly class names from categories
function getCategoryClassName(categoryName) {
  if (!categoryName) return 'category-default';
  // Use normalized top-level category
  const topLevelCategory = getTopLevelCategory({ category: categoryName });
  // Convert to lowercase and replace spaces/slashes with hyphens
  return `category-${topLevelCategory.toLowerCase().replace(/[\s/]+/g, '-')}`;
}

// Helper function to normalize category names (handles Theme/Setting)
function normalizeCategoryName(categoryName) {
  if (categoryName === 'Theme') return 'Narrative Theme';
  if (categoryName === 'Setting') return 'Setting/Context';
  return categoryName || 'Uncategorized'; // Fallback
}


export function renderDesignDraft(draftContainer, draft, state, addChipBtn) {
  // Clear only the *chip container*, leave the title section untouched
  draftContainer.innerHTML = '';

  // Case 1: Draft is a single HTML block (e.g., after cohering)
  if (draft.length === 1 && draft[0]?.type === 'html') {
      draftContainer.contentEditable = true; // Enable editing for HTML block
      draftContainer.innerHTML = draft[0].text;
      draftContainer.classList.add('html-view');
      draftContainer.classList.remove('categorized-view');
      // Disable Add Chip button when in HTML view
      if (addChipBtn) {
          addChipBtn.disabled = true;
          addChipBtn.title = "Cannot add chips while in cohered view. Clear draft to add new chips.";
      }
      // Handle input only when contentEditable is true (i.e., for HTML block)
      draftContainer.addEventListener('input', handleHtmlInput);
      return;
  }

  // Case 2: Draft is empty or contains chips (or is invalid - treat as empty)
  draftContainer.contentEditable = false; // Disable editing for categorized view
  draftContainer.classList.remove('html-view');
  draftContainer.classList.add('categorized-view');
  // Enable Add Chip button when in chip view
  if (addChipBtn) {
      addChipBtn.disabled = false;
      addChipBtn.title = "Add a custom chip"; // Reset title
  }
  // Remove input listener if it was added previously for HTML view
  draftContainer.removeEventListener('input', handleHtmlInput);


  if (draft.length === 0) {
    draftContainer.innerHTML = '<p class="empty-state">Drag ideas here or click "Add Chip" to build your design draft</p>';
    return;
  }

  // --- Group chips by category ---
  const groupedChips = {};
  // Ensure we only process valid chip-like items
  const chipItems = draft.filter(item => item && typeof item === 'object' && item.text && item.type !== 'html');

  chipItems.forEach((item, index) => {
      // Use normalized category name for grouping
      const category = getTopLevelCategory(item);
      if (!groupedChips[category]) {
          groupedChips[category] = [];
      }
      // Store the item and its original index in the draft array
      // Find original index in the FULL draft array, as chipItems is filtered
      const originalIndex = draft.findIndex(draftItem => draftItem === item);
      groupedChips[category].push({ item, originalIndex });
  });

  // --- Render categorized sections ---
  const sortedCategories = Object.keys(groupedChips).sort();

  sortedCategories.forEach(categoryName => {
      const chipsInCategory = groupedChips[categoryName];
      if (!chipsInCategory || chipsInCategory.length === 0) return; // Skip empty categories just in case

      const detailsSection = document.createElement('details');
      detailsSection.className = 'draft-category-section';
      detailsSection.open = true; // Default to open

      const summaryHeading = document.createElement('summary');
      const categoryClassName = getCategoryClassName(categoryName); // Use helper for class
      summaryHeading.className = `draft-category-summary ${categoryClassName}`;
      summaryHeading.textContent = `${categoryName} (${chipsInCategory.length})`;

      const chipsContainerDiv = document.createElement('div');
      chipsContainerDiv.className = 'chips-container';

      // Create and append each chip
      chipsInCategory.forEach(({ item, originalIndex }) => {
          if (!item || typeof item.text === 'undefined') {
               console.warn("Skipping invalid item in draft:", item);
               return; // Skip rendering invalid items
          }
          const chip = createChip({
              text: item.text,
              category: normalizeCategoryName(item.category), // Pass normalized category
              description: item.description || '', // Use description
              onDelete: () => {
                  // Make sure to remove using the correct original index
                  state.removeFromDesignDraft(originalIndex);
              },
              // Dragging chips *within* the draft isn't needed/supported here
              onDragStart: null, // Keep null for now
              state: state // Pass state to enable save button
          });
          chipsContainerDiv.appendChild(chip);
      });

      detailsSection.appendChild(summaryHeading);
      detailsSection.appendChild(chipsContainerDiv);
      draftContainer.appendChild(detailsSection);
  });

  // Internal helper function for HTML input listener
  function handleHtmlInput() {
    if (!draftContainer.contentEditable) return;

    const content = draftContainer.innerHTML;
    const currentDraft = state.getDesignDraft();
    // Only update if it's currently a single HTML block state
    if (currentDraft.length === 1 && currentDraft[0].type === 'html') {
        state.setDesignDraft([{ text: content, type: 'html' }]);
    } else {
        console.warn("Input event fired on non-editable or non-HTML draft state. Ignoring.");
    }
  }
}