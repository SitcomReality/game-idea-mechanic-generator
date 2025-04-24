import { renderTagTree } from '../tagTree.js';
import { createChip } from '../chip.js';
import { generateIdeasFromLLM } from '../../generators/llmGenerator.js';
import { showTooltip, hideTooltip } from '../tooltipManager.js';
import { initLoadIdeasModal } from './loadIdeasModal.js';
import { initAddIdeaModal } from './addIdeaModal.js';
import { generatedIdeasPlaceholderText } from '../../data/instructions/generatedIdeasPlaceholder.js'; // Import instructions

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
  const clearIdeasButton = document.getElementById('clear-ideas-btn');

  let firstTab = true;
  let allPathsCache = [];

  initLoadIdeasModal(state);
  initAddIdeaModal(state);

  // --- Subscribe to Taxonomy Changes ---
  state.subscribe('taxonomy', (taxonomy) => {
    // Clear existing tabs and content
    tabButtonsContainer.innerHTML = '';
    tabContentContainer.innerHTML = '';
    firstTab = true; // Reset for tab activation logic

    // Cache all tag paths for random selection
    allPathsCache = getAllTagPaths(taxonomy);

    // Create tabs and content for each top-level category
    Object.entries(taxonomy).forEach(([categoryName, categoryData]) => {
      const tabButton = document.createElement('button');
      const categoryClassName = getCategoryClassName(categoryName); // Helper function for styling
      tabButton.className = `tab-button ${categoryClassName}`; // Apply category-specific class
      tabButton.textContent = categoryName;
      tabButton.dataset.targetTab = categoryName.replace(/[\s/]+/g, '-').toLowerCase(); // Create a CSS-friendly ID
      tabButtonsContainer.appendChild(tabButton);

      const tabContent = document.createElement('div');
      tabContent.className = 'tab-content';
      tabContent.id = tabButton.dataset.targetTab;

      // Render the hierarchical tag tree for this category
      renderTagTree(tabContent, categoryData, state, [categoryName]); // Pass state and base path
      tabContentContainer.appendChild(tabContent);

      // Add click listener for tab switching
      tabButton.addEventListener('click', () => {
        // Deactivate all tabs and content
        tabButtonsContainer.querySelectorAll('.tab-button').forEach(btn => btn.classList.remove('active'));
        tabContentContainer.querySelectorAll('.tab-content').forEach(content => content.classList.remove('active'));

        // Activate the clicked tab and its content
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
    // Ensure checkboxes reflect the current state after taxonomy is rendered/re-rendered
    syncTagTreeCheckboxes(state.getSelectedTags());
  });

  // --- Functions for Selected Tags List ---
  function renderSelectedTagsList(selectedTagsSet) {
    selectedTagsListContainer.innerHTML = ''; // Clear current list

    if (selectedTagsSet.size === 0) {
      selectedTagsListContainer.innerHTML = '<li class="empty-state">No tags selected</li>';
      return;
    }

    const sortedTags = Array.from(selectedTagsSet).sort(); // Display alphabetically

    sortedTags.forEach(tagPath => {
      const listItem = document.createElement('li');
      listItem.className = 'selected-tag-item';

      const pathSpan = document.createElement('span');
      pathSpan.className = 'selected-tag-path';
      pathSpan.textContent = tagPath;

      const deselectBtn = document.createElement('button');
      deselectBtn.className = 'selected-tag-deselect-btn';
      deselectBtn.setAttribute('aria-label', `Deselect ${tagPath}`);
      deselectBtn.innerHTML = '&times;'; // Simple 'x' icon
      deselectBtn.title = `Deselect ${tagPath}`;
      deselectBtn.addEventListener('click', () => {
        state.removeSelectedTag(tagPath); // Update state on click
      });

      listItem.appendChild(pathSpan);
      listItem.appendChild(deselectBtn);
      selectedTagsListContainer.appendChild(listItem);
    });
  }

  function syncTagTreeCheckboxes(selectedTagsSet) {
    // Get all checkboxes within the tag trees
    const allCheckboxes = tabContentContainer.querySelectorAll('.tag-tree-checkbox');

    allCheckboxes.forEach(checkbox => {
      const checkboxPath = checkbox.dataset.tagPath; // Get the path associated with the checkbox
      if (checkboxPath) {
        const shouldBeChecked = selectedTagsSet.has(checkboxPath);
        // Only update the checkbox if its state doesn't match the global state
        if (checkbox.checked !== shouldBeChecked) {
            checkbox.checked = shouldBeChecked;
        }
      }
    });
  }

  // Subscribe to selectedTags changes to update the list and checkboxes
  state.subscribe('selectedTags', (selectedTagsSet) => {
    renderSelectedTagsList(selectedTagsSet);
    syncTagTreeCheckboxes(selectedTagsSet);
  });

  // --- Event Listeners for Generator Options ---

  termQuantityInput.addEventListener('input', () => {
    const value = termQuantityInput.value;
    termQuantityDisplay.textContent = value; // Update visual display
    state.setTermQuantity(parseInt(value)); // Update state
  });

  customTextInput.addEventListener('input', () => {
    state.setCustomText(customTextInput.value); // Update state on input
  });

  useDraftContextCheckbox.addEventListener('change', () => {
    state.setUseDraftContext(useDraftContextCheckbox.checked); // Update state on change
  });
  state.subscribe('useDraftContext', (useContext) => {
    useDraftContextCheckbox.checked = useContext;
  });

  ideaDetailLevelSelect.addEventListener('change', () => {
    state.setIdeaDetailLevel(ideaDetailLevelSelect.value); // Update state on change
  });
  state.subscribe('ideaDetailLevel', (level) => {
    ideaDetailLevelSelect.value = level;
  });

  // --- Event Listener for Generate Button ---
  generateButton.addEventListener('click', async () => {
    generateButton.disabled = true;
    generateButton.textContent = 'Generating...';

    try {
      // Get current settings from state
      const quantity = state.getTermQuantity();
      const customText = state.getCustomText();
      const selectedTags = state.getSelectedTags();
      const designDraft = state.getDesignDraft();
      const useDraftContext = state.getUseDraftContext();
      const ideaDetailLevel = state.getIdeaDetailLevel();

      let newlyGeneratedIdeas = [];
      const draftContextForLLM = useDraftContext ? designDraft : null;

      // Call the LLM generator function
      newlyGeneratedIdeas = await generateIdeasFromLLM(
        selectedTags,
        quantity,
        customText,
        draftContextForLLM,
        ideaDetailLevel
      );

      // --- Validate and Normalize Response ---
      if (!Array.isArray(newlyGeneratedIdeas)) {
          console.error("LLM did not return an array for generated ideas:", newlyGeneratedIdeas);
          throw new Error("Received invalid data format from idea generator.");
      }
      // Ensure basic structure before normalization
      newlyGeneratedIdeas = newlyGeneratedIdeas.filter(idea => idea && typeof idea === 'object' && typeof idea.text === 'string');
      // Normalize category names (e.g., 'Theme' -> 'Narrative Theme')
      const normalizedNewIdeas = newlyGeneratedIdeas.map(idea => ({
        ...idea,
        category: normalizeCategoryName(idea.category) // Use helper
      }));
      normalizedNewIdeas.forEach(idea => idea.isNew = true); // Mark new ideas

      // --- Combine new ideas with existing ones (prepend) ---
      const currentIdeas = state.getGeneratedIdeas();
      currentIdeas.forEach(idea => delete idea.isNew); // Remove 'new' status from old ideas

      // Combine with new ideas at the front
      const combinedIdeas = [...normalizedNewIdeas, ...currentIdeas];

      // Update the generated ideas state (this triggers saving and re-rendering)
      state.setGeneratedIdeas(combinedIdeas);

    } catch (error) {
      console.error('Error generating ideas:', error);
      // Display error message in the ideas container
      ideasContainer.innerHTML = `<div class="error-message">Error generating ideas: ${error.message}</div>`;
    } finally {
      // Re-enable the button
      generateButton.disabled = false;
      generateButton.textContent = 'Generate Ideas';
    }
  });

  // --- Load Saved Ideas Button ---
  loadIdeasButton.addEventListener('click', () => {
    // Logic is handled within initLoadIdeasModal
  });
  loadIdeasButton.addEventListener('mouseenter', (e) => showTooltip(e.currentTarget, loadIdeasButton.title));
  loadIdeasButton.addEventListener('mouseleave', hideTooltip);

  // --- Tooltips for Selected Tags Controls ---
  randomTagButton.addEventListener('mouseenter', (e) => showTooltip(e.currentTarget, 'Select a random tag from the full taxonomy'));
  randomTagButton.addEventListener('mouseleave', hideTooltip);
  randomTagButton.addEventListener('focus', (e) => showTooltip(e.currentTarget, 'Select a random tag from the full taxonomy'));
  randomTagButton.addEventListener('blur', hideTooltip);

  clearTagsButton.addEventListener('mouseenter', (e) => showTooltip(e.currentTarget, 'Clear all selected tags'));
  clearTagsButton.addEventListener('mouseleave', hideTooltip);
  clearTagsButton.addEventListener('focus', (e) => showTooltip(e.currentTarget, 'Clear all selected tags'));
  clearTagsButton.addEventListener('blur', hideTooltip);

  // --- Action Listeners for Selected Tags Controls ---
  randomTagButton.addEventListener('click', () => {
    if (allPathsCache.length === 0) {
      console.warn('No tag paths available to select from.');
      return;
    }
    const randomIndex = Math.floor(Math.random() * allPathsCache.length);
    const randomTagPath = allPathsCache[randomIndex];
    state.addSelectedTag(randomTagPath); // Update state
  });

  clearTagsButton.addEventListener('click', () => {
    if (state.getSelectedTags().size > 0) {
      if (window.confirm('Are you sure you want to clear all selected tags?')) {
        state.setSelectedTags(new Set()); // Update state with an empty set
      }
    }
  });

  // --- Clear Generated Ideas Button ---
  clearIdeasButton.addEventListener('click', () => {
    const currentIdeas = state.getGeneratedIdeas();
    if (currentIdeas.length > 0) {
      if (window.confirm('Are you sure you want to clear all generated ideas? This cannot be undone.')) {
        state.setGeneratedIdeas([]); // Clear the state, triggering autosave and re-render
      }
    } else {
      showTooltip(clearIdeasButton, 'Idea list is already empty'); // Show a temporary tooltip
      setTimeout(hideTooltip, 1500);
    }
  });
  clearIdeasButton.addEventListener('mouseenter', (e) => showTooltip(e.currentTarget, clearIdeasButton.title));
  clearIdeasButton.addEventListener('mouseleave', hideTooltip);

  // --- Subscribe to Generated Ideas State for Rendering ---
  state.subscribe('generatedIdeas', (ideas) => {
    ideasContainer.innerHTML = ''; // Clear existing content

    if (!ideas || ideas.length === 0) {
      ideasContainer.innerHTML = generatedIdeasPlaceholderText;
      return;
    }
    const chipsContainer = document.createElement('div');
    chipsContainer.className = 'chip-container'; // Use class for potential styling

    // Create and append a chip for each idea
    ideas.forEach((idea, index) => { // Get index for deletion
      const chip = createChip({
        text: idea.text,
        category: idea.category, // Already normalized when set
        description: idea.description || '',
        onDragStart: (event) => {
          // Prepare data for drag-and-drop
          const dataToTransfer = {
            text: idea.text,
            category: idea.category,
            description: idea.description,
            type: 'chip'
          };
          event.dataTransfer.setData('application/json', JSON.stringify(dataToTransfer));
        },
        onDelete: () => {
          // Ensure 'isNew' flags are removed from the array before filtering/updating
          const updatedIdeas = state.getGeneratedIdeas().filter((_, i) => i !== index);
          state.setGeneratedIdeas(updatedIdeas); // Update state (triggers save & re-render)
        },
        state: state, // Pass state for the "Save Idea" button within the chip
      }, idea.isNew); // Pass the isNew flag
      chipsContainer.appendChild(chip);
    });

    ideasContainer.appendChild(chipsContainer);
  });

  // --- Initial State Sync ---
  // Ensure UI elements reflect the initial state loaded from storage or defaults
  state.setUseDraftContext(state.getUseDraftContext());
  state.setIdeaDetailLevel(state.getIdeaDetailLevel());
  renderSelectedTagsList(state.getSelectedTags());
  syncTagTreeCheckboxes(state.getSelectedTags());
  // The initial render of generated ideas happens automatically via the subscribe call
}