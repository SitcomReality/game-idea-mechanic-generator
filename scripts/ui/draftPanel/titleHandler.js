// New file: scripts/ui/draftPanel/titleHandler.js
import { generateGameTitleFromDraft } from '../../llm/callLLM.js';
import { showTooltip, hideTooltip } from '../tooltipManager.js';

// Helper function to normalize category names (handles Theme/Setting)
function normalizeCategoryName(categoryName) {
  if (categoryName === 'Theme') return 'Narrative Theme';
  if (categoryName === 'Setting') return 'Setting/Context';
  return categoryName || 'Uncategorized'; // Fallback
}


export function initTitleHandler(state) {
    const draftTitleElement = document.getElementById('draft-title'); // Title element
    const generateTitleBtn = document.getElementById('generate-title-btn'); // Title generation button

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

    // --- State Subscription ---
    state.subscribe('gameTitle', (title) => {
        if (document.activeElement !== draftTitleElement) { // Avoid interrupting typing
            draftTitleElement.textContent = title;
        }
    });

    // --- Initialization ---
    draftTitleElement.textContent = state.getGameTitle(); // Set initial title
}