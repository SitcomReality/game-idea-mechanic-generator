// New file: scripts/ui/draftPanel/actions.js
import { callLLMWithPrompt } from '../../llm/callLLM.js';
import { COHERE_DRAFT } from '../../llm/prompts.js';
import { showTooltip, hideTooltip } from '../tooltipManager.js';

// Helper function to normalize category names (handles Theme/Setting)
function normalizeCategoryName(categoryName) {
  if (categoryName === 'Theme') return 'Narrative Theme';
  if (categoryName === 'Setting') return 'Setting/Context';
  return categoryName || 'Uncategorized'; // Fallback
}

// Helper function to estimate localStorage usage
function getLocalStorageUsage() {
    let totalBytes = 0;
    const storageLimitBytes = 5 * 1024 * 1024; // Estimate 5MB limit

    for (let i = 0; i < localStorage.length; i++) {
        const key = localStorage.key(i);
        const value = localStorage.getItem(key);
        // Estimate bytes: key length + value length (UTF-16 characters are 2 bytes each)
        if (key && value) {
             totalBytes += (key.length + value.length) * 2;
        }
    }

    const usedMB = (totalBytes / (1024 * 1024)).toFixed(2);
    const limitMB = (storageLimitBytes / (1024 * 1024)).toFixed(2);
    const percentageUsed = ((totalBytes / storageLimitBytes) * 100).toFixed(1);

    return {
        usedMB,
        limitMB,
        percentageUsed,
        totalBytes,
        storageLimitBytes
    };
}


export function initDraftActions(state) {
    const cohereDraftBtn = document.getElementById('cohere-draft-btn');
    const clearDraftBtn = document.getElementById('clear-draft-btn');
    const exportDraftBtn = document.getElementById('export-draft-btn');
    const importDraftBtn = document.getElementById('import-draft-btn');
    const importDraftInput = document.getElementById('import-draft-input');
    const saveDraftBtn = document.getElementById('save-draft-btn');
    const loadDraftBtn = document.getElementById('load-draft-btn');

    // Modals and their elements
    const loadDraftModal = document.getElementById('load-draft-modal');
    const loadDraftModalCloseBtn = document.getElementById('load-draft-modal-close');
    const loadDraftModalCancelBtn = document.getElementById('load-draft-modal-cancel');
    const savedDraftsList = document.getElementById('saved-drafts-list');
    const localStorageInfoElement = document.getElementById('local-storage-info'); // Get the new element

    // --- Cohere ---
    if (cohereDraftBtn) {
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
              return `${normalizeCategoryName(item.category) || 'Concept'}: ${item.text}${item.description ? ` (${item.description})` : ''}`;
            }).join('\n---\n');

            if (!draftText.trim()) {
                alert("Draft is empty. Add some ideas before cohering.");
                return;
            }

            const promptTemplate = COHERE_DRAFT;
            const filledPrompt = promptTemplate.replace('{{draftContent}}', draftText);

            const coherentDraft = await callLLMWithPrompt(filledPrompt);
            // Simple markdown to basic HTML conversion (needs improvement for lists, etc.)
            const coherentHtml = `<div class="coherent-draft"><p>${coherentDraft.replace(/\n\n+/g, '</p><p>').replace(/\n/g, '<br>')}</p></div>`.replace(/<p><br><\/p>/g, '').replace('<p><p>', '<p>'); // Clean up potential empty paragraphs

            state.setDesignDraft([{ text: coherentHtml, type: 'html' }]);

          } catch (error) {
            console.error('Error cohering draft:', error);
            alert(`Error cohering draft: ${error.message}`);
          } finally {
            cohereDraftBtn.disabled = false;
            cohereDraftBtn.textContent = 'Cohere Draft';
          }
      });
      // Add tooltip for cohere button
      cohereDraftBtn.addEventListener('mouseenter', (e) => showTooltip(e.currentTarget, cohereDraftBtn.title));
      cohereDraftBtn.addEventListener('mouseleave', hideTooltip);
    } else { console.warn("Cohere Draft button not found"); }

    // --- Clear ---
    if (clearDraftBtn) {
      clearDraftBtn.addEventListener('click', () => {
          if (state.getDesignDraft().length > 0 && window.confirm('Are you sure you want to clear the entire design draft? This cannot be undone.')) {
            state.setDesignDraft([]);
            // Optionally reset title too? Depends on desired behavior.
            // state.setGameTitle("Untitled Game");
          }
      });
      clearDraftBtn.addEventListener('mouseenter', (e) => showTooltip(e.currentTarget, clearDraftBtn.title));
      clearDraftBtn.addEventListener('mouseleave', hideTooltip);
    } else { console.warn("Clear Draft button not found"); }

    // --- Save ---
    if (saveDraftBtn) {
      saveDraftBtn.addEventListener('click', () => {
        const currentTitle = state.getGameTitle();
        if (!currentTitle || currentTitle === "Untitled Game") {
            alert("Please give your game a title before saving.");
            // Optionally focus the title input: document.getElementById('draft-title').focus();
            return;
        }
        try {
            state.saveCurrentDraftUnderTitle(currentTitle);
            saveDraftBtn.textContent = 'Saved!';
            setTimeout(() => { saveDraftBtn.textContent = 'Save'; }, 1500);
        } catch (error) {
             console.error(`Error saving draft "${currentTitle}":`, error);
             alert(`Failed to save draft: ${error.message}`);
             saveDraftBtn.textContent = 'Error!';
             setTimeout(() => { saveDraftBtn.textContent = 'Save'; }, 1500);
        }
      });
      saveDraftBtn.addEventListener('mouseenter', (e) => showTooltip(e.currentTarget, saveDraftBtn.title));
      saveDraftBtn.addEventListener('mouseleave', hideTooltip);
    } else { console.warn("Save Draft button not found"); }

    // --- Load Modal Logic ---
    function showLoadDraftModal() {
        populateSavedDraftsList();
        // Calculate and display storage usage
        const usage = getLocalStorageUsage();
        if (localStorageInfoElement) {
            localStorageInfoElement.textContent = `Storage Used: ${usage.usedMB} MB / ${usage.limitMB} MB (${usage.percentageUsed}%)`;
        }
        loadDraftModal.classList.add('active');
    }

    function hideLoadDraftModal() {
        loadDraftModal.classList.remove('active');
    }

    function populateSavedDraftsList() {
        savedDraftsList.innerHTML = ''; // Clear existing list
        const savedTitles = state.getSavedGameTitles();

        if (savedTitles.length === 0) {
            savedDraftsList.innerHTML = '<li class="empty-state">No saved drafts found.</li>';
            return;
        }

        savedTitles.forEach(title => {
            const listItem = document.createElement('li');
            listItem.className = 'saved-draft-item';

            const titleSpan = document.createElement('span');
            titleSpan.textContent = title;
            titleSpan.className = 'saved-draft-title';
            titleSpan.title = `Load "${title}"`; // Tooltip for loading
            titleSpan.addEventListener('click', () => {
                if (window.confirm(`Load draft "${title}"? This will replace the current draft and title.`)) {
                    state.loadDraftByTitle(title); // State handles updating draft and title
                    hideLoadDraftModal();
                }
            });

            const deleteBtn = document.createElement('button');
            deleteBtn.className = 'saved-draft-delete-btn danger-btn small-btn';
            deleteBtn.innerHTML = '🗑️'; // Trash can emoji
            deleteBtn.title = `Delete "${title}"`;
            deleteBtn.setAttribute('aria-label', `Delete draft ${title}`);
            deleteBtn.addEventListener('click', (e) => {
                e.stopPropagation(); // Prevent triggering load
                if (window.confirm(`Are you sure you want to permanently delete the draft "${title}"?`)) {
                    state.deleteDraftByTitle(title);
                    populateSavedDraftsList(); // Re-populate the list after deletion
                    // Update storage info after deletion
                     const usage = getLocalStorageUsage();
                     if (localStorageInfoElement) {
                         localStorageInfoElement.textContent = `Storage Used: ${usage.usedMB} MB / ${usage.limitMB} MB (${usage.percentageUsed}%)`;
                     }
                }
            });

            listItem.appendChild(titleSpan);
            listItem.appendChild(deleteBtn);
            savedDraftsList.appendChild(listItem);
        });
    }

    if (loadDraftBtn) {
        loadDraftBtn.addEventListener('click', showLoadDraftModal);
        loadDraftBtn.addEventListener('mouseenter', (e) => showTooltip(e.currentTarget, loadDraftBtn.title));
        loadDraftBtn.addEventListener('mouseleave', hideTooltip);
    } else { console.warn("Load Draft button not found"); }

    if (loadDraftModalCloseBtn) {
        loadDraftModalCloseBtn.addEventListener('click', hideLoadDraftModal);
    } else { console.warn("Load Draft Modal Close button not found"); }

    if (loadDraftModalCancelBtn) {
        loadDraftModalCancelBtn.addEventListener('click', hideLoadDraftModal);
    } else { console.warn("Load Draft Modal Cancel button not found"); }

    if (loadDraftModal) {
        loadDraftModal.addEventListener('click', (event) => {
            if (event.target === loadDraftModal) { // Click on backdrop
                hideLoadDraftModal();
            }
        });
    } else { console.warn("Load Draft Modal not found"); }


    // --- Export ---
    if (exportDraftBtn) {
      exportDraftBtn.addEventListener('click', () => {
          try {
            const currentTitle = state.getGameTitle();
            const draft = state.getDesignDraft();
            const draftJson = JSON.stringify(draft, null, 2); // Pretty print JSON
            const blob = new Blob([draftJson], { type: 'application/json' });
            const url = URL.createObjectURL(blob);
            const a = document.createElement('a');
            a.href = url;
            // Create a filename from the title
            const filename = (currentTitle || 'untitled_game').replace(/[^a-z0-9]/gi, '_').toLowerCase() + '_draft';
            a.download = `${filename}.json`;
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
      exportDraftBtn.addEventListener('mouseenter', (e) => showTooltip(e.currentTarget, exportDraftBtn.title));
      exportDraftBtn.addEventListener('mouseleave', hideTooltip);
    } else { console.warn("Export Draft button not found"); }

    // --- Import ---
    if (importDraftBtn && importDraftInput) {
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
              const importedDraft = JSON.parse(fileContent);
              // Validate before setting state
              if (state.isValidDraftData(importedDraft)) { // Use validation from state
                 if (window.confirm("Importing this draft will replace the current draft. Continue?")) {
                    state.setDesignDraft(importedDraft);
                    // Extract filename to suggest a title?
                    const filenameWithoutExt = file.name.replace(/\.[^/.]+$/, "");
                    const suggestedTitle = filenameWithoutExt.replace(/_draft$/i, '').replace(/_/g, ' ').replace(/\b\w/g, l => l.toUpperCase()); // Basic title case, remove _draft suffix
                    if (suggestedTitle && suggestedTitle !== state.getGameTitle()) {
                        if (window.confirm(`Update game title to "${suggestedTitle}" based on filename?`)) {
                            state.setGameTitle(suggestedTitle);
                        }
                    }
                    console.log("Draft imported successfully.");
                 }
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
      importDraftBtn.addEventListener('mouseenter', (e) => showTooltip(e.currentTarget, importDraftBtn.title));
      importDraftBtn.addEventListener('mouseleave', hideTooltip);
    } else {
        if (!importDraftBtn) console.warn("Import Draft button not found");
        if (!importDraftInput) console.warn("Import Draft file input not found");
    }
}