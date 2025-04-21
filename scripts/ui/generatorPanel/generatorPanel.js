import { renderTagTree } from '../tagTree.js';
import { createChip } from '../chip.js';
import { generateIdeasFromLLM } from '../../generators/llmGenerator.js';
import { showTooltip, hideTooltip } from '../tooltipManager.js';

// Helper function to recursively flatten the taxonomy into a list of selectable tag paths
function getAllTagPaths(taxonomy, currentPath = []) {
  let paths = [];
  if (!taxonomy || typeof taxonomy !== 'object') {
    return paths; // Should not happen with valid taxonomy, but good safeguard
  }

  Object.entries(taxonomy).forEach(([key, value]) => {
    const newPath = [...currentPath, key];
    const pathString = newPath.join('.');

    // Add the current path as it represents a selectable node (category or leaf)
    paths.push(pathString);

    // If value is an object, recurse into children
    if (typeof value === 'object' && Object.keys(value).length > 0) {
      paths = paths.concat(getAllTagPaths(value, newPath));
    }
  });

  return paths;
}

// Helper function to create CSS-friendly class names from TOP-LEVEL categories
function getCategoryClassName(categoryName) {
  if (!categoryName) return 'category-default';
  // Normalize common short names first
  if (categoryName === 'Theme') categoryName = 'Narrative Theme';
  if (categoryName === 'Setting') categoryName = 'Setting/Context';
  // Split by '.' and take the first part (top-level category)
  const topLevelCategory = categoryName.split('.')[0];
  // Convert to lowercase and replace spaces/slashes with hyphens
  return `category-${topLevelCategory.toLowerCase().replace(/[\s/]+/g, '-')}`;
}

// Helper function to normalize category names
function normalizeCategoryName(categoryName) {
  if (categoryName === 'Theme') return 'Narrative Theme';
  if (categoryName === 'Setting') return 'Setting/Context';
  return categoryName || 'Uncategorized'; // Provide a default if null/undefined
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
  const sectionToggleContainer = document.getElementById('section-toggle-container');
  const generateButton = document.getElementById('generate-ideas-btn');
  const ideasContainer = document.getElementById('generated-ideas-container');
  const selectedTagsListContainer = document.getElementById('selected-tags-list');
  const ideaDetailLevelSelect = document.getElementById('idea-detail-level');

  let firstTab = true;
  let allPathsCache = [];

  state.subscribe('taxonomy', (taxonomy) => {
    // Clear existing tabs
    tabButtonsContainer.innerHTML = '';
    tabContentContainer.innerHTML = '';
    firstTab = true; // Reset for re-renders

    // Regenerate the cache of all tag paths
    allPathsCache = getAllTagPaths(taxonomy);
    // console.log("All Tag Paths:", allPathsCache); // For debugging

    // Create tabs for each top-level category
    Object.entries(taxonomy).forEach(([categoryName, categoryData]) => {
      // Create Tab Button
      const tabButton = document.createElement('button');
      // Use the top-level category name for the class
      const categoryClassName = getCategoryClassName(categoryName);
      tabButton.className = `tab-button ${categoryClassName}`; // Add category class
      tabButton.textContent = categoryName;
      tabButton.dataset.targetTab = categoryName.replace(/[\s/]+/g, '-').toLowerCase(); // Create a unique ID
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
    // After rendering trees, ensure checkboxes are synced with initial state
    syncTagTreeCheckboxes(state.getSelectedTags());
  });

  // Function to render the list of selected tags
  function renderSelectedTagsList(selectedTagsSet) {
    selectedTagsListContainer.innerHTML = ''; // Clear previous list

    if (selectedTagsSet.size === 0) {
      selectedTagsListContainer.innerHTML = '<li class="empty-state">No tags selected</li>';
      return;
    }

    const sortedTags = Array.from(selectedTagsSet).sort(); // Sort alphabetically

    sortedTags.forEach(tagPath => {
      const listItem = document.createElement('li');
      listItem.className = 'selected-tag-item';

      const pathSpan = document.createElement('span');
      pathSpan.className = 'selected-tag-path';
      pathSpan.textContent = tagPath;

      const deselectBtn = document.createElement('button');
      deselectBtn.className = 'selected-tag-deselect-btn';
      deselectBtn.setAttribute('aria-label', `Deselect ${tagPath}`);
      deselectBtn.innerHTML = '&times;'; // Use HTML entity for 'x'
      deselectBtn.title = `Deselect ${tagPath}`;
      deselectBtn.addEventListener('click', () => {
        state.removeSelectedTag(tagPath);
      });

      listItem.appendChild(pathSpan);
      listItem.appendChild(deselectBtn);
      selectedTagsListContainer.appendChild(listItem);
    });
  }

  // Function to update the checkboxes in the tag trees based on state
  function syncTagTreeCheckboxes(selectedTagsSet) {
    // Find all checkboxes within the tab content container
    const allCheckboxes = tabContentContainer.querySelectorAll('.tag-tree-checkbox');

    allCheckboxes.forEach(checkbox => {
      const checkboxPath = checkbox.dataset.tagPath;
      if (checkboxPath) {
        // Only update if the checked status is different from the state
        const shouldBeChecked = selectedTagsSet.has(checkboxPath);
        if (checkbox.checked !== shouldBeChecked) {
            checkbox.checked = shouldBeChecked;
        }
      }
    });
  }

  // Subscribe to selectedTags changes to update the list AND sync checkboxes
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
      const ideaDetailLevel = state.getIdeaDetailLevel();

      let ideas = [];
      const draftContextForLLM = useDraftContext ? designDraft : null;

      ideas = await generateIdeasFromLLM(
        selectedTags,
        quantity,
        customText,
        enabledSections,
        draftContextForLLM,
        ideaDetailLevel
      );

      // Normalize category names before setting state
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

  // Add tooltips to control buttons
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
      // Pass description instead of tooltip
      const chip = createChip({
        text: idea.text,
        category: idea.category,
        description: idea.description || '', // Use description field
        onDragStart: (event) => {
          // Chip's dragstart handler now stringifies the data itself
          // event.dataTransfer.setData('application/json', JSON.stringify(idea));
        },
        onDelete: () => {
          const updatedIdeas = state.getGeneratedIdeas().filter(i => i !== idea);
          state.setGeneratedIdeas(updatedIdeas);
        }
      });
      chipsContainer.appendChild(chip);
    });

    ideasContainer.appendChild(chipsContainer);
  });

  // Initialize components with current state
  state.setGeneratedIdeas([]);
  state.setUseDraftContext(state.getUseDraftContext());
  state.setIdeaDetailLevel(state.getIdeaDetailLevel());
  renderSelectedTagsList(state.getSelectedTags());
  syncTagTreeCheckboxes(state.getSelectedTags());
}