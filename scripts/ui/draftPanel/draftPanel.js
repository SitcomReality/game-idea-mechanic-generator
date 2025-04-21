import { createChip } from '../chip.js';
import { callLLMWithPrompt } from '../../llm/callLLM.js';
import { COHERE_DRAFT } from '../../llm/prompts.js';

export function initDraftPanel(state) {
  const draftContainer = document.getElementById('draft-container');
  const cohereDraftBtn = document.getElementById('cohere-draft-btn');
  const clearDraftBtn = document.getElementById('clear-draft-btn');
  const exportDraftBtn = document.getElementById('export-draft-btn');
  const importDraftBtn = document.getElementById('import-draft-btn');
  const importDraftInput = document.getElementById('import-draft-input'); // Hidden file input

  draftContainer.contentEditable = true;

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
            type: 'chip' // Explicitly mark as chip type for clarity, though not strictly necessary with current logic
        };
        state.addToDesignDraft(chipData);
      } catch (error) {
        console.error('Error parsing dropped data:', error);
      }
    }
  });

  draftContainer.addEventListener('input', () => {
    // Debounce or throttle this if performance becomes an issue
    const content = draftContainer.innerHTML;
    // Check if the draft is supposed to be pure HTML (e.g., after cohering or manual edit)
    // If the state contains only one item and it's HTML, update it.
    // Otherwise, assume user editing creates an HTML block.
    const currentDraft = state.getDesignDraft();
    if (currentDraft.length === 1 && currentDraft[0].type === 'html') {
        state.setDesignDraft([{ text: content, type: 'html' }]);
    } else {
        // If the user edits a mixed content draft, we might want to replace it all with HTML.
        // Or, we could try to be smarter, but for now, treat manual edits as creating a single HTML block.
        console.warn("Manual edit detected on a mixed content draft. Replacing with HTML content.");
        state.setDesignDraft([{ text: content, type: 'html' }]);
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

      const promptTemplate = COHERE_DRAFT;
      const filledPrompt = promptTemplate.replace('{{draftContent}}', draftText);

      const coherentDraft = await callLLMWithPrompt(filledPrompt);

      const coherentHtml = `<div class="coherent-draft">${coherentDraft.replace(/\n/g, '<br>')}</div>`;
      // Replace entire draft with the cohered HTML content
      state.setDesignDraft([{ text: coherentHtml, type: 'html' }]);

    } catch (error) {
      console.error('Error cohering draft:', error);
      // Display error within the panel without overwriting content necessarily
      const errorDiv = document.createElement('div');
      errorDiv.className = 'error-message';
      errorDiv.textContent = `Error cohering draft: ${error.message}`;
      draftContainer.appendChild(errorDiv); // Append error message
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
    // Avoid disrupting user input if the content hasn't actually changed externally
    // This check is complex if mixing HTML and chips. Let's simplify:
    // Re-render fully unless the active element is the container AND it's pure HTML editing.
    const isEditingHTML = document.activeElement === draftContainer && draft.length === 1 && draft[0]?.type === 'html';

    if (isEditingHTML && draftContainer.innerHTML === draft[0].text) {
        // Content matches and user is editing, do nothing
        return;
    }

    draftContainer.innerHTML = ''; // Clear existing content

    if (draft.length === 0) {
      draftContainer.innerHTML = '<p class="empty-state">Drag ideas here or start typing to build your design draft</p>';
      return;
    }

    draft.forEach((item, index) => {
      if (item.type === 'html') {
        // If HTML type, just append its content. Assumes only one HTML block for simplicity now.
        draftContainer.innerHTML += item.text;
      } else {
        // Assume it's chip data
        const chip = createChip({
          text: item.text,
          category: item.category,
          tooltip: item.description || '',
          // Dragging chips *within* the draft isn't implemented, but could be added later
          // onDragStart: (event) => {
          //   event.dataTransfer.setData('application/json', JSON.stringify(item));
          //   event.dataTransfer.setData('text/plain', `${item.category || ''}: ${item.text}`);
          // },
          onDelete: () => {
            state.removeFromDesignDraft(index);
          }
        });
        draftContainer.appendChild(chip);
        draftContainer.appendChild(document.createTextNode(' ')); // Add space between chips
      }
    });
  });

  // Initial render based on loaded state
  const initialDraft = state.getDesignDraft();
  state.notifyListeners('designDraft'); // Trigger initial render explicitly

}