import { createChip } from '../chip.js';
import { callLLMWithPrompt, generateGameTitleFromDraft } from '../../llm/callLLM.js';
import { COHERE_DRAFT } from '../../llm/prompts.js';
import { showTooltip, hideTooltip } from '../tooltipManager.js';

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

export function initDraftPanel(state) {
  const draftContainer = document.getElementById('draft-container');
  const draftTitleElement = document.getElementById('draft-title'); // Title element
  const generateTitleBtn = document.getElementById('generate-title-btn'); // Title generation button
  const cohereDraftBtn = document.getElementById('cohere-draft-btn');
  const clearDraftBtn = document.getElementById('clear-draft-btn');
  const exportDraftBtn = document.getElementById('export-draft-btn');
  const importDraftBtn = document.getElementById('import-draft-btn');
  const importDraftInput = document.getElementById('import-draft-input'); // Hidden file input

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
  // Optional: If taxonomy could change later, subscribe:
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
    if (!category) {
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

  // --- Event Listeners for Title ---
  draftTitleElement.addEventListener('blur', () => {
      const newTitle = draftTitleElement.textContent.trim();
      if (newTitle !== state.getGameTitle()) {
          state.setGameTitle(newTitle || "Untitled Game"); // Update state on blur if changed
      }
  });

  // Prevent newline characters in title on paste/enter
  draftTitleElement.addEventListener('keydown', (event) => {
      if (event.key === 'Enter') {
          event.preventDefault(); // Prevent new line
          draftTitleElement.blur(); // Trigger blur to save
      }
  });
  draftTitleElement.addEventListener('paste', (event) => {
    event.preventDefault();
    const text = (event.clipboardData || window.clipboardData).getData('text/plain');
    // Insert text without line breaks
    document.execCommand('insertText', false, text.replace(/(\r\n|\n|\r)/gm, " "));
  });

  generateTitleBtn.addEventListener('click', async () => {
    generateTitleBtn.disabled = true;
    generateTitleBtn.classList.add('loading'); // Add loading class for spinner

    try {
        const draft = state.getDesignDraft();
        // Format draft content for the title generation prompt
        const draftText = draft.map(item => {
            if (item.type === 'html') {
                const tempDiv = document.createElement('div');
                tempDiv.innerHTML = item.text;
                return tempDiv.textContent || tempDiv.innerText || '';
            }
            return `${normalizeCategoryName(item.category) || 'Concept'}: ${item.text}${item.description ? ` (${item.description})` : ''}`;
        }).join('\n');

        if (!draftText.trim()) {
            alert("Draft is empty. Add some ideas before generating a title.");
            return; // Exit early
        }

        const generatedTitle = await generateGameTitleFromDraft(draftText);
        draftTitleElement.textContent = generatedTitle; // Update the UI element
        state.setGameTitle(generatedTitle); // Update the state

    } catch (error) {
        console.error('Error generating title:', error);
        alert(`Error generating title: ${error.message}`);
    } finally {
        generateTitleBtn.disabled = false;
        generateTitleBtn.classList.remove('loading'); // Remove loading class
    }
  });

    // Tooltip for generate title button
    generateTitleBtn.addEventListener('mouseenter', (e) => showTooltip(e.currentTarget, 'Generate a game title based on the current draft'));
    generateTitleBtn.addEventListener('mouseleave', hideTooltip);
    generateTitleBtn.addEventListener('focus', (e) => showTooltip(e.currentTarget, 'Generate a game title based on the current draft'));
    generateTitleBtn.addEventListener('blur', hideTooltip);

  // --- Drag and Drop / Existing Logic ---
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

  // Handle input only when contentEditable is true (i.e., for HTML block)
  draftContainer.addEventListener('input', () => {
      if (!draftContainer.contentEditable) return;

      const content = draftContainer.innerHTML;
      const currentDraft = state.getDesignDraft();
      // Only update if it's currently a single HTML block state
      if (currentDraft.length === 1 && currentDraft[0].type === 'html') {
          state.setDesignDraft([{ text: content, type: 'html' }]);
      } else {
          console.warn("Input event fired on non-editable or non-HTML draft state. Ignoring.");
      }
  });

  cohereDraftBtn.addEventListener('click', async () => {
    cohereDraftBtn.disabled = true;
    cohereDraftBtn.textContent = 'Processing...';

    try {
      const draft = state.getDesignDraft();

      const draftText = draft.map(item => {
        if (item.type === 'html') {
          const tempDiv = document.createElement('div');
          tempDiv.innerHTML = item.text;
          return tempDiv.textContent || tempDiv.innerText || '';
        }
        // Format chip data clearly for the LLM
        // Use normalized category name for LLM prompt
        return `${normalizeCategoryName(item.category) || 'Concept'}: ${item.text}${item.description ? ` (${item.description})` : ''}`;
      }).join('\n---\n'); // Separate items clearly

      if (!draftText.trim()) {
          alert("Draft is empty. Add some ideas before cohering.");
          cohereDraftBtn.disabled = false; // Re-enable button
          cohereDraftBtn.textContent = 'Cohere Draft';
          return; // Exit early if draft is effectively empty
      }

      const promptTemplate = COHERE_DRAFT;
      const filledPrompt = promptTemplate.replace('{{draftContent}}', draftText);

      const coherentDraft = await callLLMWithPrompt(filledPrompt);

      // Format as simple HTML - basic paragraph/line break handling
      // More robust Markdown conversion could be used here if needed.
      const coherentHtml = `<div class="coherent-draft">${coherentDraft.replace(/\n\n+/g, '</p><p>').replace(/\n/g, '<br>')}</div>`.replace('<p><br>', '<p>');

      // Replace entire draft with the cohered HTML content
      state.setDesignDraft([{ text: coherentHtml, type: 'html' }]);

    } catch (error) {
      console.error('Error cohering draft:', error);
      alert(`Error cohering draft: ${error.message}`); // Show error to user
    } finally {
      cohereDraftBtn.disabled = false;
      cohereDraftBtn.textContent = 'Cohere Draft';
    }
  });

  clearDraftBtn.addEventListener('click', () => {
    if (state.getDesignDraft().length > 0 && window.confirm('Are you sure you want to clear the entire design draft? This cannot be undone.')) {
      state.setDesignDraft([]);
    }
  });

  // --- Import/Export ---
  exportDraftBtn.addEventListener('click', () => {
    try {
      const draftJson = state.exportDesignDraft();
      const blob = new Blob([draftJson], { type: 'application/json' });
      const url = URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = 'design-draft.json';
      document.body.appendChild(a);
      a.click();
      setTimeout(() => {
        document.body.removeChild(a);
        URL.revokeObjectURL(url);
      }, 0);
    } catch (error) {
        console.error("Error exporting draft:", error);
        alert("Failed to export draft. See console for details.");
    }
  });

  importDraftBtn.addEventListener('click', () => {
    importDraftInput.click(); // Trigger the hidden file input
  });

  importDraftInput.addEventListener('change', (event) => {
    const file = event.target.files[0];
    if (!file) {
      return; // No file selected
    }

    const reader = new FileReader();
    reader.onload = (e) => {
      const fileContent = e.target.result;
      try {
        const success = state.importDesignDraft(fileContent);
        if (success) {
           console.log("Draft imported successfully.");
           // Optionally show a success message to the user
        } else {
           alert("Failed to import draft: Invalid file format or content. See console for details.");
        }
      } catch (error) {
        console.error("Error processing imported file:", error);
        alert(`Failed to import draft: ${error.message}`);
      } finally {
        // Reset the input value so the change event fires again for the same file
        importDraftInput.value = '';
      }
    };
    reader.onerror = (e) => {
        console.error("Error reading file:", e);
        alert("Error reading file.");
        importDraftInput.value = ''; // Reset input
    };
    reader.readAsText(file);
  });

  // --- Rendering based on state ---
  state.subscribe('gameTitle', (title) => {
      if (document.activeElement !== draftTitleElement) { // Avoid interrupting typing
          draftTitleElement.textContent = title;
      }
  });

  state.subscribe('designDraft', (draft) => {
    // Clear only the *chip container*, leave the title section untouched
    draftContainer.innerHTML = '';

    // Case 1: Draft is a single HTML block (e.g., after cohering)
    if (draft.length === 1 && draft[0]?.type === 'html') {
        draftContainer.contentEditable = true; // Enable editing for HTML block
        draftContainer.innerHTML = draft[0].text;
        draftContainer.classList.add('html-view');
        draftContainer.classList.remove('categorized-view');
        // Disable Add Chip button when in HTML view
        addChipBtn.disabled = true;
        addChipBtn.title = "Cannot add chips while in cohered view. Clear draft to add new chips.";
        return;
    }

    // Case 2: Draft is empty or contains chips (or is invalid - treat as empty)
    draftContainer.contentEditable = false; // Disable editing for categorized view
    draftContainer.classList.remove('html-view');
    draftContainer.classList.add('categorized-view');
    // Enable Add Chip button when in chip view
    addChipBtn.disabled = false;
    addChipBtn.title = "";


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
                onDragStart: null // Keep null for now
            });
            chipsContainerDiv.appendChild(chip);
        });

        detailsSection.appendChild(summaryHeading);
        detailsSection.appendChild(chipsContainerDiv);
        draftContainer.appendChild(detailsSection);
    });
  });

  // Initial render based on loaded state
  draftTitleElement.textContent = state.getGameTitle(); // Set initial title
  state.notifyListeners('designDraft'); // Render draft content
}