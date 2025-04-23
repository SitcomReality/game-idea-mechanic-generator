// New file: scripts/ui/draftPanel/addChipModal.js

// Helper function to normalize category names (handles Theme/Setting)
function normalizeCategoryName(categoryName) {
  if (categoryName === 'Theme') return 'Narrative Theme';
  if (categoryName === 'Setting') return 'Setting/Context';
  return categoryName || 'Uncategorized'; // Fallback
}

export function initAddChipModal(state) {
  // New elements for manual chip addition
  const addChipBtn = document.getElementById('add-chip-btn');
  const addChipModal = document.getElementById('add-chip-modal');
  const addChipForm = document.getElementById('add-chip-form');
  const chipTextInput = document.getElementById('chip-text-input');
  const chipDetailsInput = document.getElementById('chip-details-input');
  const chipCategorySelect = document.getElementById('chip-category-select');
  const chipCustomCategoryGroup = document.getElementById('chip-custom-category-group');
  const chipCustomCategoryInput = document.getElementById('chip-custom-category-input');
  const addChipModalCloseBtn = document.getElementById('add-chip-modal-close');
  const addChipModalCancelBtn = document.getElementById('add-chip-modal-cancel');

  // --- Populate Category Select in Modal ---
  function populateCategorySelect() {
    const taxonomy = state.getTaxonomy();
    if (!taxonomy || Object.keys(taxonomy).length === 0) {
        console.warn("Taxonomy not loaded yet, cannot populate category select.");
        return; // Don't run if taxonomy isn't ready
    }
    // Clear existing options except the defaults
    const existingOptions = chipCategorySelect.querySelectorAll('option:not([value="Uncategorized"]):not([value="__custom__"])');
    existingOptions.forEach(option => option.remove());

    // Get top-level categories
    const topLevelCategories = Object.keys(taxonomy).sort();

    // Create options and insert before the "Other/Custom" option
    const customOption = chipCategorySelect.querySelector('option[value="__custom__"]');
    topLevelCategories.forEach(categoryName => {
      const option = document.createElement('option');
      option.value = categoryName;
      option.textContent = categoryName;
      chipCategorySelect.insertBefore(option, customOption);
    });
  }

  // Populate initially and subscribe to taxonomy changes (if dynamic taxonomy loading is ever added)
  populateCategorySelect();
  // Only subscribe if taxonomy might actually change after initial load
  // state.subscribe('taxonomy', populateCategorySelect);

  // --- Modal Show/Hide Logic ---
  function showAddChipModal() {
    addChipForm.reset(); // Clear form on open
    chipCustomCategoryGroup.style.display = 'none'; // Hide custom input initially
    addChipModal.classList.add('active');
    chipTextInput.focus();
  }

  function hideAddChipModal() {
    addChipModal.classList.remove('active');
  }

  // --- Event Listeners ---

  addChipBtn.addEventListener('click', showAddChipModal);
  addChipModalCloseBtn.addEventListener('click', hideAddChipModal);
  addChipModalCancelBtn.addEventListener('click', hideAddChipModal);

  // Hide modal if backdrop is clicked
  addChipModal.addEventListener('click', (event) => {
    if (event.target === addChipModal) {
      hideAddChipModal();
    }
  });

  // Show/Hide Custom Category Input
  chipCategorySelect.addEventListener('change', () => {
    if (chipCategorySelect.value === '__custom__') {
      chipCustomCategoryGroup.style.display = 'block';
      chipCustomCategoryInput.required = true; // Make required if visible
      chipCustomCategoryInput.focus();
    } else {
      chipCustomCategoryGroup.style.display = 'none';
      chipCustomCategoryInput.required = false;
      chipCustomCategoryInput.value = ''; // Clear value when hidden
    }
  });

  // Handle Form Submission
  addChipForm.addEventListener('submit', (event) => {
    event.preventDefault();

    const text = chipTextInput.value.trim();
    if (!text) {
      alert('Chip text cannot be empty.');
      chipTextInput.focus();
      return;
    }

    const description = chipDetailsInput.value.trim();
    let category = chipCategorySelect.value;

    if (category === '__custom__') {
      category = chipCustomCategoryInput.value.trim();
      if (!category) {
        alert('Please enter a custom category name.');
        chipCustomCategoryInput.focus();
        return;
      }
    }

    // Ensure Uncategorized if somehow nothing is selected
    if (!category || category === '__custom__') { // Also handle case where user selects custom but enters nothing
        category = 'Uncategorized';
    }

    const newChipData = {
      text,
      description,
      category: normalizeCategoryName(category), // Normalize before saving
      type: 'chip' // Mark as chip type explicitly
    };

    state.addToDesignDraft(newChipData);
    hideAddChipModal();
  });

  // Return the button element so the main init can access it if needed
  return { addChipBtn };
}
