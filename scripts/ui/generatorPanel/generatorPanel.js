import { renderTagTree } from '../tagTree.js';
import { createChip } from '../chip.js';
import { generateIdeasFromLLM } from '../../generators/llmGenerator.js';

export function initGeneratorPanel(state) {
  const panel = document.getElementById('generator-panel');
  // Containers for the new tab structure
  const tabButtonsContainer = document.getElementById('taxonomy-tab-buttons');
  const tabContentContainer = document.getElementById('taxonomy-tab-content');
  const termQuantityInput = document.getElementById('term-quantity');
  const termQuantityDisplay = document.getElementById('term-quantity-display');
  const customTextInput = document.getElementById('custom-text');
  const useDraftContextCheckbox = document.getElementById('use-draft-context');
  const sectionToggleContainer = document.getElementById('section-toggle-container');
  const generateButton = document.getElementById('generate-ideas-btn');
  const ideasContainer = document.getElementById('generated-ideas-container');

  let firstTab = true; // Flag to make the first tab active initially

  state.subscribe('taxonomy', (taxonomy) => {
    // Clear existing tabs
    tabButtonsContainer.innerHTML = '';
    tabContentContainer.innerHTML = '';
    firstTab = true; // Reset for re-renders

    // Create tabs for each top-level category
    Object.entries(taxonomy).forEach(([categoryName, categoryData]) => {
      // Create Tab Button
      const tabButton = document.createElement('button');
      tabButton.className = 'tab-button';
      tabButton.textContent = categoryName;
      tabButton.dataset.targetTab = categoryName.replace(/\s+/g, '-').toLowerCase(); // Create a unique ID
      tabButtonsContainer.appendChild(tabButton);

      // Create Tab Content Panel
      const tabContent = document.createElement('div');
      tabContent.className = 'tab-content';
      tabContent.id = tabButton.dataset.targetTab;

      // Render the tag tree for this category inside the tab content
      renderTagTree(tabContent, categoryData, state, [categoryName]); // Pass the category name as the initial path
      tabContentContainer.appendChild(tabContent);

      // Add click listener to switch tabs
      tabButton.addEventListener('click', () => {
        // Deactivate all buttons and hide all content
        tabButtonsContainer.querySelectorAll('.tab-button').forEach(btn => btn.classList.remove('active'));
        tabContentContainer.querySelectorAll('.tab-content').forEach(content => content.classList.remove('active'));

        // Activate the clicked button and show its content
        tabButton.classList.add('active');
        tabContent.classList.add('active');
      });

      // Activate the first tab by default
      if (firstTab) {
        tabButton.classList.add('active');
        tabContent.classList.add('active');
        firstTab = false;
      }
    });
  });

  termQuantityInput.addEventListener('input', () => {
    const value = termQuantityInput.value;
    termQuantityDisplay.textContent = value;
    state.setTermQuantity(parseInt(value));
  });

  customTextInput.addEventListener('input', () => {
    state.setCustomText(customTextInput.value);
  });

  useDraftContextCheckbox.addEventListener('change', () => {
    state.setUseDraftContext(useDraftContextCheckbox.checked);
  });

  state.subscribe('useDraftContext', (useContext) => {
    useDraftContextCheckbox.checked = useContext;
  });

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

  generateButton.addEventListener('click', async () => {
    generateButton.disabled = true;
    generateButton.textContent = 'Generating...';

    try {
      const quantity = state.getTermQuantity();
      const customText = state.getCustomText();
      const selectedTags = state.getSelectedTags();
      const enabledSections = state.getEnabledSections();
      const designDraft = state.getDesignDraft();
      const useDraftContext = state.getUseDraftContext();

      let ideas = [];
      const draftContextForLLM = useDraftContext ? designDraft : null;

      ideas = await generateIdeasFromLLM(selectedTags, quantity, customText, enabledSections, draftContextForLLM);

      state.setGeneratedIdeas(ideas);
    } catch (error) {
      console.error('Error generating ideas:', error);
      ideasContainer.innerHTML = `<div class="error-message">Error generating ideas: ${error.message}</div>`;
    } finally {
      generateButton.disabled = false;
      generateButton.textContent = 'Generate Ideas';
    }
  });

  state.subscribe('generatedIdeas', (ideas) => {
    ideasContainer.innerHTML = '';

    if (!ideas || ideas.length === 0) {
      ideasContainer.innerHTML = '<p class="empty-state">Generate ideas to see results here</p>';
      return;
    }

    const groupedIdeas = ideas.reduce((acc, idea) => {
      const category = idea.category || 'Uncategorized';
      if (!acc[category]) {
        acc[category] = [];
      }
      acc[category].push(idea);
      return acc;
    }, {});

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
            event.dataTransfer.setData('application/json', JSON.stringify(idea));
          },
          onDelete: () => {
            const updatedIdeas = state.getGeneratedIdeas().filter(i => i !== idea);
            state.setGeneratedIdeas(updatedIdeas);
          }
        });

        chipsContainer.appendChild(chip);
      });

      categoryDiv.appendChild(chipsContainer);
      ideasContainer.appendChild(categoryDiv);
    });
  });

  state.setGeneratedIdeas([]);
  state.setUseDraftContext(state.getUseDraftContext());
}