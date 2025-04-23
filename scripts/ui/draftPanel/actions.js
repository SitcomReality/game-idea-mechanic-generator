// New file: scripts/ui/draftPanel/actions.js
import { callLLMWithPrompt } from '../../llm/callLLM.js';
import { COHERE_DRAFT } from '../../llm/prompts.js';

// Helper function to normalize category names (handles Theme/Setting)
function normalizeCategoryName(categoryName) {
  if (categoryName === 'Theme') return 'Narrative Theme';
  if (categoryName === 'Setting') return 'Setting/Context';
  return categoryName || 'Uncategorized'; // Fallback
}

export function initDraftActions(state) {
    const cohereDraftBtn = document.getElementById('cohere-draft-btn');
    const clearDraftBtn = document.getElementById('clear-draft-btn');
    const exportDraftBtn = document.getElementById('export-draft-btn');
    const importDraftBtn = document.getElementById('import-draft-btn');
    const importDraftInput = document.getElementById('import-draft-input'); // Hidden file input

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
}