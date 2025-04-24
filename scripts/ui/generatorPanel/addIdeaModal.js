// New file: scripts/ui/generatorPanel/addIdeaModal.js

// Helper function to normalize category names (handles Theme/Setting)
function normalizeCategoryName(categoryName) {
  if (categoryName === 'Theme') return 'Narrative Theme';
  if (categoryName === 'Setting') return 'Setting/Context';
  return categoryName || 'Uncategorized'; // Fallback
}

export function initAddIdeaModal(state) {
  // Elements for manual idea addition
  const addIdeaBtn = document.getElementById('add-idea-btn');
  const addIdeaModal = document.getElementById('add-idea-modal');
  const addIdeaForm = document.getElementById('add-idea-form');
  const ideaTextInput = document.getElementById('idea-text-input');
  const ideaDetailsInput = document.getElementById('idea-details-input');
  const ideaCategorySelect = document.getElementById('idea-category-select');
  const ideaCustomCategoryGroup = document.getElementById('idea-custom-category-group');
  const ideaCustomCategoryInput = document.getElementById('idea-custom-category-input');
  const addIdeaModalCloseBtn = document.getElementById('add-idea-modal-close');
  const addIdeaModalCancelBtn = document.getElementById('add-idea-modal-cancel');

  // --- Populate Category Select in Modal ---
  function populateCategorySelect() {
    const taxonomy = state.getTaxonomy();
    if (!taxonomy || Object.keys(taxonomy).length === 0) {
        console.warn("Taxonomy not loaded yet, cannot populate category select.");
        return; // Don't run if taxonomy isn't ready
    }
    // Clear existing options except the defaults
    const existingOptions = ideaCategorySelect.querySelectorAll('option:not([value="Uncategorized"]):not([value="__custom__"])');
    existingOptions.forEach(option => option.remove());

    // Get top-level categories
    const topLevelCategories = Object.keys(taxonomy).sort();

    // Create options and insert before the "Other/Custom" option
    const customOption = ideaCategorySelect.querySelector('option[value="__custom__"]');
    topLevelCategories.forEach(categoryName => {
      const option = document.createElement('option');
      option.value = categoryName;
      option.textContent = categoryName;
      ideaCategorySelect.insertBefore(option, customOption);
    });
  }

  // Populate initially and subscribe to taxonomy changes (if dynamic taxonomy loading is ever added)
  populateCategorySelect();
  // Only subscribe if taxonomy might actually change after initial load
  // state.subscribe('taxonomy', populateCategorySelect);

  // --- Modal Show/Hide Logic ---
  function showAddIdeaModal() {
    addIdeaForm.reset(); // Clear form on open
    ideaCustomCategoryGroup.style.display = 'none'; // Hide custom input initially
    addIdeaModal.classList.add('active');
    ideaTextInput.focus();
  }

  function hideAddIdeaModal() {
    addIdeaModal.classList.remove('active');
  }

  // --- Event Listeners ---

  addIdeaBtn.addEventListener('click', showAddIdeaModal);
  addIdeaModalCloseBtn.addEventListener('click', hideAddIdeaModal);
  addIdeaModalCancelBtn.addEventListener('click', hideAddIdeaModal);

  // Show/Hide Custom Category Input
  ideaCategorySelect.addEventListener('change', () => {
    if (ideaCategorySelect.value === '__custom__') {
      ideaCustomCategoryGroup.style.display = 'block';
      ideaCustomCategoryInput.required = true; // Make required if visible
      ideaCustomCategoryInput.focus();
    } else {
      ideaCustomCategoryGroup.style.display = 'none';
      ideaCustomCategoryInput.required = false;
      ideaCustomCategoryInput.value = ''; // Clear value when hidden
    }
  });

  // Handle Form Submission
  addIdeaForm.addEventListener('submit', (event) => {
    event.preventDefault();

    const text = ideaTextInput.value.trim();
    if (!text) {
      alert('Idea text cannot be empty.');
      ideaTextInput.focus();
      return;
    }

    const description = ideaDetailsInput.value.trim();
    let category = ideaCategorySelect.value;

    if (category === '__custom__') {
      category = ideaCustomCategoryInput.value.trim();
      if (!category) {
        alert('Please enter a custom category name.');
        ideaCustomCategoryInput.focus();
        return;
      }
    }

    // Ensure Uncategorized if somehow nothing is selected
    if (!category || category === '__custom__') { // Also handle case where user selects custom but enters nothing
        category = 'Uncategorized';
    }

    const newIdeaData = {
      text,
      description,
      category: normalizeCategoryName(category), // Normalize before saving
      // type: 'chip' // Type is implicitly chip for generated ideas
    };

    state.addToGeneratedIdeas(newIdeaData); // Add to generated ideas state
    hideAddIdeaModal();
  });
}