import { callLLMWithPrompt } from '../../llm/callLLM.js';
import { MAKE_BRIEF } from '../../llm/prompts.js';
import * as marked from 'marked';

export function initBriefPanel(state) {
  const briefContainer = document.getElementById('brief-container');
  const generateBriefBtn = document.getElementById('generate-brief-btn');
  const copyBriefBtn = document.getElementById('copy-brief-btn');
  const downloadBriefBtn = document.getElementById('download-brief-btn');

  let currentBriefMarkdown = ''; // Store the last generated Markdown content

  // Make brief container editable
  briefContainer.contentEditable = true;

  // Listen for content changes in the brief container
  briefContainer.addEventListener('input', () => {
    // Update the state with the current HTML content for persistence
    state.setDesignBrief(briefContainer.innerHTML);
    // Note: After editing, currentBriefMarkdown might be out of sync.
    // Copy/Download will still use the *last generated* markdown.
  });

  // Set up Generate Brief button
  generateBriefBtn.addEventListener('click', async () => {
    generateBriefBtn.disabled = true;
    generateBriefBtn.textContent = 'Generating...';
    briefContainer.innerHTML = '<p>Generating brief...</p>'; // Placeholder

    try {
      const draft = state.getDesignDraft();

      // Extract text from draft items
      let draftText = '';
      if (draft.length > 0) {
        if (draft[0].type === 'html') {
          // Extract text from HTML
          const tempDiv = document.createElement('div');
          tempDiv.innerHTML = draft[0].text;
          draftText = tempDiv.textContent || tempDiv.innerText || '';
        } else {
          draftText = draft.map(item => `${item.category || ''}: ${item.text}`).join('\n');
        }
      } else {
          briefContainer.innerHTML = '<p class="error-message">Cannot generate brief from empty draft.</p>';
           throw new Error('Draft is empty'); // Prevent LLM call with empty content
      }

      // Call LLM to generate the brief in Markdown
      const promptTemplate = MAKE_BRIEF;
      const filledPrompt = promptTemplate.replace('{{draftContent}}', draftText);

      const generatedMarkdown = await callLLMWithPrompt(filledPrompt);
      currentBriefMarkdown = generatedMarkdown; // Store the raw Markdown

      // Check if marked object and parse method exist
      if (!marked || typeof marked.parse !== 'function') {
          throw new Error("Markdown parser (marked.js) failed to load or its 'parse' method is not available.");
      }

      // Parse Markdown to HTML using the imported marked object's parse method
      const generatedHtml = marked.parse(currentBriefMarkdown);

      // Update the brief container display
      briefContainer.innerHTML = generatedHtml;

      // Update state with the generated HTML for persistence
      state.setDesignBrief(generatedHtml);

    } catch (error) {
      console.error('Error generating brief:', error);
      // Show error message in the container
      briefContainer.innerHTML = `<div class="error-message">Error generating brief: ${error.message}</div>`;
      currentBriefMarkdown = ''; // Clear markdown on error
      state.setDesignBrief(briefContainer.innerHTML); // Update state with error message
    } finally {
      generateBriefBtn.disabled = false;
      generateBriefBtn.textContent = 'Generate Brief';
    }
  });

  // Set up Copy button to copy the Markdown
  copyBriefBtn.addEventListener('click', () => {
    if (!currentBriefMarkdown) {
        alert('No brief generated yet, or generation failed.');
        return;
    }

    navigator.clipboard.writeText(currentBriefMarkdown)
      .then(() => {
        const originalText = copyBriefBtn.textContent;
        copyBriefBtn.textContent = 'Copied!';
        setTimeout(() => {
          copyBriefBtn.textContent = originalText;
        }, 2000);
      })
      .catch(err => {
        console.error('Failed to copy Markdown:', err);
         const originalText = copyBriefBtn.textContent;
        copyBriefBtn.textContent = 'Failed';
        setTimeout(() => {
          copyBriefBtn.textContent = originalText;
        }, 2000);
        alert('Failed to copy Markdown to clipboard.');
      });
  });

  // Set up Download button to download the Markdown
  downloadBriefBtn.addEventListener('click', () => {
     if (!currentBriefMarkdown) {
        alert('No brief generated yet, or generation failed.');
        return;
    }
    // Create a blob and download it
    const blob = new Blob([currentBriefMarkdown], { type: 'text/markdown;charset=utf-8' });
    const url = URL.createObjectURL(blob);

    const a = document.createElement('a');
    a.href = url;
    a.download = 'game-design-brief.md';
    document.body.appendChild(a);
    a.click();

    // Clean up
    setTimeout(() => {
      document.body.removeChild(a);
      URL.revokeObjectURL(url);
    }, 0);
  });

  // Render brief from state (which stores HTML after generation/edit)
  state.subscribe('designBrief', (briefHtml) => {
    // If user is currently editing, don't disturb them
    if (document.activeElement === briefContainer) {
      return;
    }

     // If the brief is empty or contains only placeholder/error messages, show placeholder
    if (!briefHtml || briefHtml.includes('empty-state') || briefHtml.includes('error-message') || briefHtml.trim() === '<p>Generating brief...</p>') {
       if (!briefHtml || briefHtml.trim() === '') { // Only show placeholder if truly empty
            briefContainer.innerHTML = '<p class="empty-state">Generate a design brief from your draft, or edit here.</p>';
       } else {
            // Keep existing content (likely placeholder or error)
             briefContainer.innerHTML = briefHtml;
       }
       currentBriefMarkdown = ''; // Ensure markdown is cleared if state is empty/error
    } else {
        // Otherwise, update the brief container with the HTML from the state
        briefContainer.innerHTML = briefHtml;
        // Note: We don't re-parse here, as the state already holds HTML.
        // We also don't know the original markdown if it was loaded from storage after edits.
        // `currentBriefMarkdown` only holds the *last generated* version in this session.
    }
  });

  // Initialize with current state value (might be from localStorage)
  const initialBrief = state.getDesignBrief();
  if (initialBrief) {
      briefContainer.innerHTML = initialBrief;
      // We can't reliably reconstruct currentBriefMarkdown from stored HTML
  } else {
      briefContainer.innerHTML = '<p class="empty-state">Generate a design brief from your draft, or edit here.</p>';
      // Set initial state only if it's truly empty to avoid overwriting placeholders/errors from failed load
      if (!state.getDesignBrief()) {
         state.setDesignBrief(briefContainer.innerHTML);
      }
  }
}