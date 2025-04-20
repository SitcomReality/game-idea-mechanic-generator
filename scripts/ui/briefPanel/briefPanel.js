import { callLLMWithPrompt } from '../../llm/callLLM.js';
import { MAKE_BRIEF } from '../../llm/prompts.js';

export function initBriefPanel(state) {
  const briefContainer = document.getElementById('brief-container');
  const generateBriefBtn = document.getElementById('generate-brief-btn');
  const copyBriefBtn = document.getElementById('copy-brief-btn');
  const downloadBriefBtn = document.getElementById('download-brief-btn');
  
  // Make brief container editable
  briefContainer.contentEditable = true;
  
  // Listen for content changes in the brief container
  briefContainer.addEventListener('input', () => {
    state.setDesignBrief(briefContainer.innerHTML);
  });
  
  // Set up Generate Brief button
  generateBriefBtn.addEventListener('click', async () => {
    generateBriefBtn.disabled = true;
    generateBriefBtn.textContent = 'Generating...';
    
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
      }
      
      // Call LLM to generate the brief
      const promptTemplate = MAKE_BRIEF;
      const filledPrompt = promptTemplate.replace('{{draftContent}}', draftText);
      
      const generatedBrief = await callLLMWithPrompt(filledPrompt);
      
      // Update the brief container
      briefContainer.innerHTML = generatedBrief;
      
      // Update state
      state.setDesignBrief(generatedBrief);
    } catch (error) {
      console.error('Error generating brief:', error);
      // Show error message
      const errorDiv = document.createElement('div');
      errorDiv.className = 'error-message';
      errorDiv.textContent = `Error: ${error.message}`;
      briefContainer.appendChild(errorDiv);
    } finally {
      generateBriefBtn.disabled = false;
      generateBriefBtn.textContent = 'Generate Brief';
    }
  });
  
  // Set up Copy button
  copyBriefBtn.addEventListener('click', () => {
    const brief = state.getDesignBrief();
    
    // Copy to clipboard
    navigator.clipboard.writeText(brief)
      .then(() => {
        // Show success message
        copyBriefBtn.textContent = 'Copied!';
        setTimeout(() => {
          copyBriefBtn.textContent = 'Copy';
        }, 2000);
      })
      .catch(err => {
        console.error('Failed to copy:', err);
        copyBriefBtn.textContent = 'Failed';
        setTimeout(() => {
          copyBriefBtn.textContent = 'Copy';
        }, 2000);
      });
  });
  
  // Set up Download button
  downloadBriefBtn.addEventListener('click', () => {
    const brief = state.getDesignBrief();
    
    // Create a blob and download it
    const blob = new Blob([brief], { type: 'text/markdown' });
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
  
  // Render brief from state
  state.subscribe('designBrief', (brief) => {
    // If the brief is empty, show placeholder
    if (!brief) {
      briefContainer.innerHTML = '<p class="empty-state">Generate a design brief from your draft</p>';
      return;
    }
    
    // If user is currently editing, don't disturb them
    if (document.activeElement === briefContainer) {
      return;
    }
    
    // Otherwise, update the brief container
    briefContainer.innerHTML = brief;
  });
  
  // Initialize with empty state
  state.setDesignBrief('');
}

