import { createChip } from '../chip.js';
import { callLLMWithPrompt } from '../../llm/callLLM.js';
import { COHERE_DRAFT } from '../../llm/prompts.js';

export function initDraftPanel(state) {
  const draftContainer = document.getElementById('draft-container');
  const cohereDraftBtn = document.getElementById('cohere-draft-btn');
  
  // Make draft container editable
  draftContainer.contentEditable = true;
  
  // Set up drop zone for draggable items
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
    
    // Get the dropped data
    const data = event.dataTransfer.getData('application/json');
    if (data) {
      try {
        const idea = JSON.parse(data);
        state.addToDesignDraft(idea);
      } catch (error) {
        console.error('Error parsing dropped data:', error);
      }
    }
  });
  
  // Listen for content changes in the draft container
  draftContainer.addEventListener('input', () => {
    // Extract text content from draft container
    // This is a simplified approach - in a full implementation,
    // you might want to preserve more structure
    const content = draftContainer.innerHTML;
    state.setDesignDraft([{ text: content, type: 'html' }]);
  });
  
  // Set up Cohere Draft button
  cohereDraftBtn.addEventListener('click', async () => {
    cohereDraftBtn.disabled = true;
    cohereDraftBtn.textContent = 'Processing...';
    
    try {
      const draft = state.getDesignDraft();
      
      // Extract text from draft items
      const draftText = draft.map(item => {
        if (item.type === 'html') {
          return item.text;
        }
        return `${item.category || ''}: ${item.text}`;
      }).join('\n');
      
      // Call LLM to cohere the draft
      const promptTemplate = COHERE_DRAFT;
      const filledPrompt = promptTemplate.replace('{{draftContent}}', draftText);
      
      const coherentDraft = await callLLMWithPrompt(filledPrompt);
      
      // Update the draft container with the coherent text
      draftContainer.innerHTML = `<div class="coherent-draft">${coherentDraft}</div>`;
      
      // Update state
      state.setDesignDraft([{ text: coherentDraft, type: 'html' }]);
    } catch (error) {
      console.error('Error cohering draft:', error);
      // Show error message
      const errorDiv = document.createElement('div');
      errorDiv.className = 'error-message';
      errorDiv.textContent = `Error: ${error.message}`;
      draftContainer.appendChild(errorDiv);
    } finally {
      cohereDraftBtn.disabled = false;
      cohereDraftBtn.textContent = 'Cohere Draft';
    }
  });
  
  // Render draft items from state
  state.subscribe('designDraft', (draft) => {
    // If the draft is empty, show placeholder
    if (draft.length === 0) {
      draftContainer.innerHTML = '<p class="empty-state">Drag ideas here to build your design draft</p>';
      return;
    }
    
    // If user is currently editing, don't disturb them
    if (document.activeElement === draftContainer) {
      return;
    }
    
    // Otherwise, render draft items
    // This is a simplified approach - in a full implementation,
    // you would want to preserve the structure and editability
    draftContainer.innerHTML = '';
    
    draft.forEach(item => {
      if (item.type === 'html') {
        // If it's HTML content, insert it directly
        draftContainer.innerHTML = item.text;
      } else {
        // Otherwise create a chip for each item
        const chip = createChip({
          text: item.text,
          category: item.category,
          tooltip: item.description || '',
          onDelete: () => {
            const updatedDraft = state.getDesignDraft().filter(i => i !== item);
            state.setDesignDraft(updatedDraft);
          }
        });
        draftContainer.appendChild(chip);
      }
    });
  });
  
  // Initialize with empty state
  state.setDesignDraft([]);
}

