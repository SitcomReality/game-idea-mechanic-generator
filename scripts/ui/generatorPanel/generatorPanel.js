import { renderTagTree } from '../tagTree.js';
import { createChip } from '../chip.js';
import { generateIdeasFromWordlists } from '../../generators/wordlistGenerator.js';
import { generateIdeasFromLLM } from '../../generators/llmGenerator.js';
import { generateIdeasHybrid } from '../../generators/hybridGenerator.js';

export function initGeneratorPanel(state) {
  const panel = document.getElementById('generator-panel');
  const tagTreeContainer = document.getElementById('tag-tree-container');
  const termQuantityInput = document.getElementById('term-quantity');
  const termQuantityDisplay = document.getElementById('term-quantity-display');
  const customTextInput = document.getElementById('custom-text');
  const sectionToggleContainer = document.getElementById('section-toggle-container');
  const generateButton = document.getElementById('generate-ideas-btn');
  const ideasContainer = document.getElementById('generated-ideas-container');
  const sourceButtons = panel.querySelectorAll('[data-source]');
  
  // Render tag tree from taxonomy
  state.subscribe('taxonomy', (taxonomy) => {
    renderTagTree(tagTreeContainer, taxonomy, state);
  });
  
  // Set up term quantity slider
  termQuantityInput.addEventListener('input', () => {
    const value = termQuantityInput.value;
    termQuantityDisplay.textContent = value;
    state.setTermQuantity(parseInt(value));
  });
  
  // Set up custom text input
  customTextInput.addEventListener('input', () => {
    state.setCustomText(customTextInput.value);
  });
  
  // Setup section toggles
  const sections = {
    mechanics: 'Mechanics',
    themes: 'Themes',
    settings: 'Settings',
    systems: 'Systems'
  };
  
  Object.entries(sections).forEach(([key, label]) => {
    const toggleDiv = document.createElement('div');
    toggleDiv.className = 'toggle-item';
    
    const checkbox = document.createElement('input');
    checkbox.type = 'checkbox';
    checkbox.id = `toggle-${key}`;
    checkbox.checked = state.getEnabledSections()[key];
    
    checkbox.addEventListener('change', () => {
      state.setEnabledSection(key, checkbox.checked);
    });
    
    const toggleLabel = document.createElement('label');
    toggleLabel.htmlFor = `toggle-${key}`;
    toggleLabel.textContent = label;
    
    toggleDiv.appendChild(checkbox);
    toggleDiv.appendChild(toggleLabel);
    sectionToggleContainer.appendChild(toggleDiv);
  });
  
  // Set up source buttons
  sourceButtons.forEach(button => {
    button.addEventListener('click', () => {
      // Remove active class from all buttons
      sourceButtons.forEach(btn => btn.classList.remove('active'));
      // Add active class to clicked button
      button.classList.add('active');
      // Update state
      state.setGeneratorSource(button.dataset.source);
    });
  });
  
  // Subscribe to source changes
  state.subscribe('generatorSource', (source) => {
    sourceButtons.forEach(btn => {
      btn.classList.toggle('active', btn.dataset.source === source);
    });
  });
  
  // Set up generate button
  generateButton.addEventListener('click', async () => {
    generateButton.disabled = true;
    generateButton.textContent = 'Generating...';
    ideasContainer.innerHTML = ''; // Clear previous results/messages immediately
    
    try {
      const source = state.getGeneratorSource();
      const quantity = state.getTermQuantity();
      const customText = state.getCustomText();
      const selectedTags = state.getSelectedTags();
      const enabledSections = state.getEnabledSections();
      
      let ideas = [];
      
      switch (source) {
        case 'wordlists':
          ideas = await generateIdeasFromWordlists(selectedTags, quantity, enabledSections);
          break;
        case 'llm':
          ideas = await generateIdeasFromLLM(selectedTags, quantity, customText, enabledSections);
          break;
        case 'hybrid':
          ideas = await generateIdeasHybrid(selectedTags, quantity, customText, enabledSections);
          break;
      }
      
      // Check for empty results specifically for wordlists
      if (ideas.length === 0 && source === 'wordlists') {
        ideasContainer.innerHTML = `<p class="empty-state">No matching terms found in wordlists for the selected criteria. Try broadening your selection or enabling more sections.</p>`;
        state.setGeneratedIdeas([]); // Ensure state reflects empty results
      } else if (ideas.length === 0) {
         ideasContainer.innerHTML = `<p class="empty-state">No ideas generated. Try adjusting the parameters.</p>`;
         state.setGeneratedIdeas([]); // Ensure state reflects empty results
      } else {
        state.setGeneratedIdeas(ideas); // Update state, which triggers rendering via subscription
      }
      
    } catch (error) {
      console.error('Error generating ideas:', error);
      // Display error message directly in the container
      ideasContainer.innerHTML = `<div class="error-message">Error generating ideas: ${error.message}</div>`;
      state.setGeneratedIdeas([]); // Clear state in case of error
    } finally {
      generateButton.disabled = false;
      generateButton.textContent = 'Generate Ideas';
    }
  });
  
  // Render generated ideas
  state.subscribe('generatedIdeas', (ideas) => {
    // Only render if the container hasn't already been populated
    // by a specific message (empty results, error) in the click handler.
    // This prevents the generic empty state from overwriting specific feedback.
    if (ideasContainer.innerHTML === '') {
      if (ideas.length === 0) {
        // This default message will show if the state is cleared or initialized empty,
        // but not immediately after a failed wordlist generation attempt.
        ideasContainer.innerHTML = '<p class="empty-state">Generate ideas to see results here</p>';
        return;
      }
  
      // Group ideas by category
      const groupedIdeas = ideas.reduce((acc, idea) => {
        const categoryKey = idea.category || 'Uncategorized'; // Handle potentially missing category
        if (!acc[categoryKey]) {
          acc[categoryKey] = [];
        }
        acc[categoryKey].push(idea);
        return acc;
      }, {});
  
      // Create container for each category
      Object.entries(groupedIdeas).forEach(([category, categoryIdeas]) => {
        const categoryDiv = document.createElement('div');
        categoryDiv.className = 'idea-category';
  
        const categoryHeader = document.createElement('h3');
        categoryHeader.textContent = category;
        categoryDiv.appendChild(categoryHeader);
  
        const chipsContainer = document.createElement('div');
        chipsContainer.className = 'chip-container';
  
        categoryIdeas.forEach(idea => {
          const chip = createChip({
            text: idea.text,
            category: idea.category,
            tooltip: idea.description || '',
            onDragStart: (event) => {
              // Store idea data for draft panel
              event.dataTransfer.setData('application/json', JSON.stringify(idea));
            },
            onDelete: () => {
              // Remove idea from state
              const updatedIdeas = state.getGeneratedIdeas().filter(i => i !== idea);
              state.setGeneratedIdeas(updatedIdeas);
            }
          });
  
          chipsContainer.appendChild(chip);
        });
  
        categoryDiv.appendChild(chipsContainer);
        ideasContainer.appendChild(categoryDiv);
      });
    }
  });
  
  // Initialize with empty state message if no ideas are loaded initially
  if (state.getGeneratedIdeas().length === 0) {
     ideasContainer.innerHTML = '<p class="empty-state">Generate ideas to see results here</p>';
  }
}