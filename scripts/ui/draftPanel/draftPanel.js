import { createChip } from '../chip.js';
import { callLLMWithPrompt } from '../../llm/callLLM.js';
import { COHERE_DRAFT } from '../../llm/prompts.js';

// Helper function to get top-level category name for grouping
function getTopLevelCategory(item) {
    let category = item.category || 'Uncategorized'; // Default if no category
    // Normalize common short names first
    if (category === 'Theme') category = 'Narrative Theme';
    if (category === 'Setting') category = 'Setting/Context';
    // Split by '.' and take the first part (top-level category)
    return category.split('.')[0];
}

// Helper function to create CSS-friendly class names from categories
function getCategoryClassName(categoryName) {
  if (!categoryName) return 'category-default';
  // Convert to lowercase and replace spaces/slashes with hyphens
  return `category-${categoryName.toLowerCase().replace(/[\s/]+/g, '-')}`;
}


export function initDraftPanel(state) {
  const draftContainer = document.getElementById('draft-container');
  const cohereDraftBtn = document.getElementById('cohere-draft-btn');
  const clearDraftBtn = document.getElementById('clear-draft-btn');
  const exportDraftBtn = document.getElementById('export-draft-btn');
  const importDraftBtn = document.getElementById('import-draft-btn');
  const importDraftInput = document.getElementById('import-draft-input'); // Hidden file input

  // Make container editable ONLY when showing raw HTML content
  // draftContainer.contentEditable = true; // REMOVED - Will be set dynamically

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
            category: idea.category,
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
        return `${item.category || 'Concept'}: ${item.text}${item.description ? ` (${item.description})` : ''}`;
      }).join('\n---\n'); // Separate items clearly

      if (!draftText.trim()) {
          alert("Draft is empty. Add some ideas before cohering.");
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
    if (window.confirm('Are you sure you want to clear the entire design draft? This cannot be undone.')) {
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
  state.subscribe('designDraft', (draft) => {
    draftContainer.innerHTML = ''; // Clear existing content

    // Case 1: Draft is a single HTML block (e.g., after cohering)
    if (draft.length === 1 && draft[0]?.type === 'html') {
        draftContainer.contentEditable = true; // Enable editing for HTML block
        draftContainer.innerHTML = draft[0].text;
        // Add a class to indicate it's raw HTML view vs categorized view? Optional.
        draftContainer.classList.add('html-view');
        draftContainer.classList.remove('categorized-view');
        return;
    }

    // Case 2: Draft is empty or contains chips (or is invalid - treat as empty)
    draftContainer.contentEditable = false; // Disable editing for categorized view
    draftContainer.classList.remove('html-view');
    draftContainer.classList.add('categorized-view');

    if (draft.length === 0) {
      draftContainer.innerHTML = '<p class="empty-state">Drag ideas here or start typing to build your design draft</p>';
      return;
    }

    // --- Group chips by category ---
    const groupedChips = {};
    const chipItems = draft.filter(item => item.type === 'chip'); // Process only chips

    chipItems.forEach((item, index) => {
        const category = getTopLevelCategory(item);
        if (!groupedChips[category]) {
            groupedChips[category] = [];
        }
        // Store the item and its original index in the draft array
        groupedChips[category].push({ item, originalIndex: draft.indexOf(item) });
    });

    // --- Render categorized sections ---
    // Sort categories alphabetically for consistent order
    const sortedCategories = Object.keys(groupedChips).sort();

    sortedCategories.forEach(categoryName => {
        const chipsInCategory = groupedChips[categoryName];

        // Create <details> element for the section
        const detailsSection = document.createElement('details');
        detailsSection.className = 'draft-category-section';
        detailsSection.open = true; // Default to open

        // Create <summary> element for the heading
        const summaryHeading = document.createElement('summary');
        const categoryClassName = getCategoryClassName(categoryName); // Get class for styling
        summaryHeading.className = `draft-category-summary ${categoryClassName}`;
        summaryHeading.textContent = `${categoryName} (${chipsInCategory.length})`;

        // Create container for the chips within this section
        const chipsContainerDiv = document.createElement('div');
        chipsContainerDiv.className = 'chips-container';

        // Create and append each chip
        chipsInCategory.forEach(({ item, originalIndex }) => {
            const chip = createChip({
                text: item.text,
                category: item.category, // Pass the original category for display/styling on chip itself
                tooltip: item.description || '',
                onDelete: () => {
                    // Use the original index to remove from the state's draft array
                    state.removeFromDesignDraft(originalIndex);
                }
                // Dragging chips *within* the draft isn't supported in this structure easily
            });
            chipsContainerDiv.appendChild(chip);
        });

        detailsSection.appendChild(summaryHeading);
        detailsSection.appendChild(chipsContainerDiv);
        draftContainer.appendChild(detailsSection);
    });
  });

  // Initial render based on loaded state
  state.notifyListeners('designDraft'); // Trigger initial render explicitly

}