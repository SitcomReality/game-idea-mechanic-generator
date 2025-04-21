import { createChip } from '../chip.js';
import { callLLMWithPrompt } from '../../llm/callLLM.js';
import { COHERE_DRAFT } from '../../llm/prompts.js';

export function initDraftPanel(state) {
  const draftContainer = document.getElementById('draft-container');
  const cohereDraftBtn = document.getElementById('cohere-draft-btn');
  const clearDraftBtn = document.getElementById('clear-draft-btn'); 

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
        state.addToDesignDraft(idea);
      } catch (error) {
        console.error('Error parsing dropped data:', error);
      }
    }
  });
  
  draftContainer.addEventListener('input', () => {
    const content = draftContainer.innerHTML;
    state.setDesignDraft([{ text: content, type: 'html' }]);
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
        return `${item.category || ''}: ${item.text}`;
      }).join('\n');
      
      const promptTemplate = COHERE_DRAFT;
      const filledPrompt = promptTemplate.replace('{{draftContent}}', draftText);
      
      const coherentDraft = await callLLMWithPrompt(filledPrompt);
      
      const coherentHtml = `<div class="coherent-draft">${coherentDraft.replace(/\n/g, '<br>')}</div>`;
      draftContainer.innerHTML = coherentHtml;
      
      state.setDesignDraft([{ text: coherentHtml, type: 'html' }]);
    } catch (error) {
      console.error('Error cohering draft:', error);
      const errorDiv = document.createElement('div');
      errorDiv.className = 'error-message';
      errorDiv.textContent = `Error: ${error.message}`;
      draftContainer.appendChild(errorDiv);
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
  
  state.subscribe('designDraft', (draft) => {
    if (document.activeElement === draftContainer && draft.length > 0 && draft[0]?.type === 'html') {
      if (draftContainer.innerHTML !== draft[0].text) {
      } else {
        return; 
      }
    }

    draftContainer.innerHTML = ''; 

    if (draft.length === 0) {
      draftContainer.innerHTML = '<p class="empty-state">Drag ideas here or start typing to build your design draft</p>';
      return;
    }
    
    draft.forEach((item, index) => {
      if (item.type === 'html') {
        draftContainer.innerHTML = item.text; 
      } else {
        const chip = createChip({
          text: item.text,
          category: item.category,
          tooltip: item.description || '',
          onDelete: () => {
            state.removeFromDesignDraft(index); 
          }
        });
        draftContainer.appendChild(chip);
        draftContainer.appendChild(document.createTextNode(' '));
      }
    });
  });
}