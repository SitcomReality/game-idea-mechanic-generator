import { renderTagTree } from '../tagTree.js';
import { createChip } from '../chip.js';
import { generateIdeasFromLLM } from '../../generators/llmGenerator.js';
import { showTooltip, hideTooltip } from '../tooltipManager.js';
import { initLoadIdeasModal } from './loadIdeasModal.js';
import { initAddIdeaModal } from './addIdeaModal.js';

function getAllTagPaths(taxonomy, currentPath = []) {
  let paths = [];
  if (!taxonomy || typeof taxonomy !== 'object') {
    return paths; 
  }

  Object.entries(taxonomy).forEach(([key, value]) => {
    const newPath = [...currentPath, key];
    const pathString = newPath.join('.');

    paths.push(pathString);

    if (typeof value === 'object' && Object.keys(value).length > 0) {
      paths = paths.concat(getAllTagPaths(value, newPath));
    }
  });

  return paths;
}

function getCategoryClassName(categoryName) {
  if (!categoryName) return 'category-default';
  if (categoryName === 'Theme') categoryName = 'Narrative Theme';
  if (categoryName === 'Setting') categoryName = 'Setting/Context';
  const topLevelCategory = categoryName.split('.')[0];
  return `category-${topLevelCategory.toLowerCase().replace(/[\s/]+/g, '-')}`;
}

function normalizeCategoryName(categoryName) {
  if (categoryName === 'Theme') return 'Narrative Theme';
  if (categoryName === 'Setting') return 'Setting/Context';
  return categoryName || 'Uncategorized'; 
}

export function initGeneratorPanel(state) {
  const panel = document.getElementById('generator-panel');
  const tabButtonsContainer = document.getElementById('taxonomy-tab-buttons');
  const tabContentContainer = document.getElementById('taxonomy-tab-content');
  const randomTagButton = document.getElementById('random-tag-btn');
  const clearTagsButton = document.getElementById('clear-tags-btn');
  const termQuantityInput = document.getElementById('term-quantity');
  const termQuantityDisplay = document.getElementById('term-quantity-display');
  const customTextInput = document.getElementById('custom-text');
  const useDraftContextCheckbox = document.getElementById('use-draft-context');
  const generateButton = document.getElementById('generate-ideas-btn');
  const ideasContainer = document.getElementById('generated-ideas-container');
  const selectedTagsListContainer = document.getElementById('selected-tags-list');
  const ideaDetailLevelSelect = document.getElementById('idea-detail-level');
  const loadIdeasButton = document.getElementById('load-ideas-btn');

  let firstTab = true;
  let allPathsCache = [];

  initLoadIdeasModal(state);
  initAddIdeaModal(state);

  state.subscribe('taxonomy', (taxonomy) => {
    tabButtonsContainer.innerHTML = '';
    tabContentContainer.innerHTML = '';
    firstTab = true; 

    allPathsCache = getAllTagPaths(taxonomy);

    Object.entries(taxonomy).forEach(([categoryName, categoryData]) => {
      const tabButton = document.createElement('button');
      const categoryClassName = getCategoryClassName(categoryName);
      tabButton.className = `tab-button ${categoryClassName}`; 
      tabButton.textContent = categoryName;
      tabButton.dataset.targetTab = categoryName.replace(/[\s/]+/g, '-').toLowerCase(); 
      tabButtonsContainer.appendChild(tabButton);

      const tabContent = document.createElement('div');
      tabContent.className = 'tab-content';
      tabContent.id = tabButton.dataset.targetTab;

      renderTagTree(tabContent, categoryData, state, [categoryName]); 
      tabContentContainer.appendChild(tabContent);

      tabButton.addEventListener('click', () => {
        tabButtonsContainer.querySelectorAll('.tab-button').forEach(btn => btn.classList.remove('active'));
        tabContentContainer.querySelectorAll('.tab-content').forEach(content => content.classList.remove('active'));

        tabButton.classList.add('active');
        tabContent.classList.add('active');
      });

      if (firstTab) {
        tabButton.classList.add('active');
        tabContent.classList.add('active');
        firstTab = false;
      }
    });
    syncTagTreeCheckboxes(state.getSelectedTags());
  });

  function renderSelectedTagsList(selectedTagsSet) {
    selectedTagsListContainer.innerHTML = ''; 

    if (selectedTagsSet.size === 0) {
      selectedTagsListContainer.innerHTML = '<li class="empty-state">No tags selected</li>';
      return;
    }

    const sortedTags = Array.from(selectedTagsSet).sort(); 

    sortedTags.forEach(tagPath => {
      const listItem = document.createElement('li');
      listItem.className = 'selected-tag-item';

      const pathSpan = document.createElement('span');
      pathSpan.className = 'selected-tag-path';
      pathSpan.textContent = tagPath;

      const deselectBtn = document.createElement('button');
      deselectBtn.className = 'selected-tag-deselect-btn';
      deselectBtn.setAttribute('aria-label', `Deselect ${tagPath}`);
      deselectBtn.innerHTML = '&times;'; 
      deselectBtn.title = `Deselect ${tagPath}`;
      deselectBtn.addEventListener('click', () => {
        state.removeSelectedTag(tagPath);
      });

      listItem.appendChild(pathSpan);
      listItem.appendChild(deselectBtn);
      selectedTagsListContainer.appendChild(listItem);
    });
  }

  function syncTagTreeCheckboxes(selectedTagsSet) {
    const allCheckboxes = tabContentContainer.querySelectorAll('.tag-tree-checkbox');

    allCheckboxes.forEach(checkbox => {
      const checkboxPath = checkbox.dataset.tagPath;
      if (checkboxPath) {
        const shouldBeChecked = selectedTagsSet.has(checkboxPath);
        if (checkbox.checked !== shouldBeChecked) {
            checkbox.checked = shouldBeChecked;
        }
      }
    });
  }

  state.subscribe('selectedTags', (selectedTagsSet) => {
    renderSelectedTagsList(selectedTagsSet);
    syncTagTreeCheckboxes(selectedTagsSet);
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

  ideaDetailLevelSelect.addEventListener('change', () => {
    state.setIdeaDetailLevel(ideaDetailLevelSelect.value);
  });
  state.subscribe('ideaDetailLevel', (level) => {
    ideaDetailLevelSelect.value = level;
  });

  generateButton.addEventListener('click', async () => {
    generateButton.disabled = true;
    generateButton.textContent = 'Generating...';

    try {
      const quantity = state.getTermQuantity();
      const customText = state.getCustomText();
      const selectedTags = state.getSelectedTags();
      const designDraft = state.getDesignDraft();
      const useDraftContext = state.getUseDraftContext();
      const ideaDetailLevel = state.getIdeaDetailLevel();

      let ideas = [];
      const draftContextForLLM = useDraftContext ? designDraft : null;

      ideas = await generateIdeasFromLLM(
        selectedTags,
        quantity,
        customText,
        draftContextForLLM,
        ideaDetailLevel
      );

      // --- Add validation here ---
      if (!Array.isArray(ideas)) {
          console.error("LLM did not return an array for generated ideas:", ideas);
          throw new Error("Received invalid data format from idea generator.");
      }
      // Ensure basic structure before normalization and saving
      ideas = ideas.filter(idea => idea && typeof idea === 'object' && typeof idea.text === 'string');

      const normalizedIdeas = ideas.map(idea => ({
        ...idea,
        category: normalizeCategoryName(idea.category)
      }));

      state.setGeneratedIdeas(normalizedIdeas);

    } catch (error) {
      console.error('Error generating ideas:', error);
      ideasContainer.innerHTML = `<div class="error-message">Error generating ideas: ${error.message}</div>`;
    } finally {
      generateButton.disabled = false;
      generateButton.textContent = 'Generate Ideas';
    }
  });

  loadIdeasButton.addEventListener('click', () => {
  });
  loadIdeasButton.addEventListener('mouseenter', (e) => showTooltip(e.currentTarget, loadIdeasButton.title));
  loadIdeasButton.addEventListener('mouseleave', hideTooltip);

  randomTagButton.addEventListener('mouseenter', (e) => showTooltip(e.currentTarget, 'Select a random tag from the full taxonomy'));
  randomTagButton.addEventListener('mouseleave', hideTooltip);
  randomTagButton.addEventListener('focus', (e) => showTooltip(e.currentTarget, 'Select a random tag from the full taxonomy'));
  randomTagButton.addEventListener('blur', hideTooltip);

  clearTagsButton.addEventListener('mouseenter', (e) => showTooltip(e.currentTarget, 'Clear all selected tags'));
  clearTagsButton.addEventListener('mouseleave', hideTooltip);
  clearTagsButton.addEventListener('focus', (e) => showTooltip(e.currentTarget, 'Clear all selected tags'));
  clearTagsButton.addEventListener('blur', hideTooltip);

  randomTagButton.addEventListener('click', () => {
    if (allPathsCache.length === 0) {
      console.warn('No tag paths available to select from.');
      return;
    }
    const randomIndex = Math.floor(Math.random() * allPathsCache.length);
    const randomTagPath = allPathsCache[randomIndex];
    state.addSelectedTag(randomTagPath);
  });

  clearTagsButton.addEventListener('click', () => {
    if (state.getSelectedTags().size > 0) {
      if (window.confirm('Are you sure you want to clear all selected tags?')) {
        state.setSelectedTags(new Set());
      }
    }
  });

  state.subscribe('generatedIdeas', (ideas) => {
    ideasContainer.innerHTML = '';

    if (!ideas || ideas.length === 0) {
      ideasContainer.innerHTML = '<p class="empty-state">Generate ideas to see results here</p>';
      return;
    }
    const chipsContainer = document.createElement('div');
    chipsContainer.className = 'chip-container';

    ideas.forEach(idea => {
      const chip = createChip({
        text: idea.text,
        category: idea.category,
        description: idea.description || '',
        onDragStart: (event) => {
        },
        onDelete: () => {
          const updatedIdeas = state.getGeneratedIdeas().filter(i => i !== idea);
          state.setGeneratedIdeas(updatedIdeas);
        },
        state: state 
      });
      chipsContainer.appendChild(chip);
    });

    ideasContainer.appendChild(chipsContainer);
  });

  state.setGeneratedIdeas([]);
  state.setUseDraftContext(state.getUseDraftContext());
  state.setIdeaDetailLevel(state.getIdeaDetailLevel());
  renderSelectedTagsList(state.getSelectedTags());
  syncTagTreeCheckboxes(state.getSelectedTags());
}