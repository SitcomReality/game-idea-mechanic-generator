import { showTooltip, hideTooltip } from './tooltipManager.js';

// Helper function to normalize category names before generating class names
function normalizeCategoryNameForClass(categoryName) {
  if (categoryName === 'Theme') return 'Narrative Theme';
  if (categoryName === 'Setting') return 'Setting/Context';
  return categoryName || 'default'; // Fallback
}

// Helper function to create CSS-friendly class names from categories
function getCategoryClassName(categoryName) {
  // Normalize first to handle short names
  const normalizedName = normalizeCategoryNameForClass(categoryName);
  // Split by '.' and take the first part (top-level category)
  const topLevelCategory = normalizedName.split('.')[0];
  // Convert to lowercase and replace spaces/slashes with hyphens
  return `category-${topLevelCategory.toLowerCase().replace(/[\s/]+/g, '-')}`;
}

// Accept state as argument to save ideas
// Accept isNew flag
export function createChip({ text, category, description = '', onDragStart, onDelete, state, isNew = false }) {
  const chip = document.createElement('div');
  const categoryClassName = getCategoryClassName(category);
  chip.className = `chip ${categoryClassName}${isNew ? ' chip--new' : ''}`; // Add new class if needed
  chip.draggable = true;

  // Main visible part of the chip (category, label, toggle indicator)
  const chipHeader = document.createElement('div');
  chipHeader.className = 'chip-header';

  // Container for category and label
  const contentDiv = document.createElement('div');
  contentDiv.className = 'chip-content';

  // Category label (if provided)
  const displayCategory = category || '';
  if (displayCategory) {
    const categorySpan = document.createElement('span');
    categorySpan.className = 'chip-category';
    categorySpan.textContent = displayCategory;
    contentDiv.appendChild(categorySpan);
  }

  // Text label
  const label = document.createElement('span');
  label.className = 'chip-label';
  label.textContent = text;
  contentDiv.appendChild(label);

  // Add "NEW" badge if applicable
  if (isNew) {
      const newBadge = document.createElement('span');
      newBadge.className = 'chip-new-badge';
      newBadge.textContent = 'NEW';
      contentDiv.appendChild(newBadge); // Add badge within the content area
  }
  chipHeader.appendChild(contentDiv);

  // Toggle Indicator (only if there's a description)
  if (description) {
    const toggleIndicator = document.createElement('span');
    toggleIndicator.className = 'chip-toggle-indicator';
    toggleIndicator.innerHTML = '►'; // Use a simple character for now
    chipHeader.appendChild(toggleIndicator);
  }

  chip.appendChild(chipHeader);


  // Details section (hidden by default)
  let detailsDiv = null;
  if (description) {
    detailsDiv = document.createElement('div');
    detailsDiv.className = 'chip-details';
    detailsDiv.textContent = description;
    chip.appendChild(detailsDiv); // Add it to the chip, but it will be hidden by CSS
  }


  // Container for action buttons (copy, save, delete)
  const actionsDiv = document.createElement('div');
  actionsDiv.className = 'chip-actions';

  // Copy button (if description provided)
  if (description) {
    const copyBtn = document.createElement('button');
    copyBtn.className = 'chip-copy';
    copyBtn.innerHTML = '📋'; // Copy emoji or icon
    copyBtn.setAttribute('aria-label', 'Copy details');
    copyBtn.title = 'Copy details'; // Tooltip for the button itself

    copyBtn.addEventListener('click', (e) => {
      e.stopPropagation(); // Prevent toggle/drag start
      navigator.clipboard.writeText(description).then(() => {
        copyBtn.innerHTML = '✓'; // Checkmark for success
        copyBtn.title = 'Copied!';
        setTimeout(() => {
          copyBtn.innerHTML = '📋'; // Revert icon
          copyBtn.title = 'Copy details';
        }, 1500);
      }).catch(err => {
        console.error('Failed to copy text: ', err);
        copyBtn.innerHTML = '✗'; // Error indicator
         copyBtn.title = 'Copy failed';
        setTimeout(() => {
          copyBtn.innerHTML = '📋'; // Revert icon
          copyBtn.title = 'Copy details';
        }, 1500);
      });
    });
    actionsDiv.appendChild(copyBtn);
  }

  // Save button (only appears on generated idea chips, not draft chips)
  if (state && typeof state.saveIdea === 'function') { // Check if save function is available (means it's likely an idea chip)
      const saveBtn = document.createElement('button');
      saveBtn.className = 'chip-save'; // New class for styling
      saveBtn.innerHTML = '💾'; // Save emoji/icon
      saveBtn.setAttribute('aria-label', 'Save idea');
      saveBtn.title = 'Save this idea';

      saveBtn.addEventListener('click', (e) => {
          e.stopPropagation(); // Prevent toggle/drag start
          const ideaData = { text, category, description };
          // Generate a somewhat unique key
          const keyTextPart = text.substring(0, 25).replace(/[^a-zA-Z0-9]/g, '_'); // Sanitize and shorten text for key
          const key = `gimg_idea_${keyTextPart}_${Date.now()}`;
          try {
              state.saveIdea(key, ideaData);
              saveBtn.innerHTML = '✓'; // Indicate success
              saveBtn.title = 'Saved!';
              setTimeout(() => {
                  saveBtn.innerHTML = '💾'; // Revert icon
                  saveBtn.title = 'Save this idea';
              }, 1500);
          } catch (error) {
              console.error('Failed to save idea:', error);
              saveBtn.innerHTML = '✗'; // Indicate error
              saveBtn.title = 'Save failed';
              setTimeout(() => {
                  saveBtn.innerHTML = '💾'; // Revert icon
                  saveBtn.title = 'Save this idea';
              }, 1500);
          }
      });
      actionsDiv.appendChild(saveBtn);
  }

  // Delete button
  if (onDelete) {
    const deleteBtn = document.createElement('button');
    deleteBtn.className = 'chip-delete';
    deleteBtn.innerHTML = '&times;';
    deleteBtn.setAttribute('aria-label', 'Delete item');
    deleteBtn.title = 'Delete';
    deleteBtn.addEventListener('click', (e) => {
        e.stopPropagation(); // Prevent toggle/drag start
        onDelete();
    });
    actionsDiv.appendChild(deleteBtn);
  }

  // Only add actions container if it has children
  if (actionsDiv.hasChildNodes()) {
      chipHeader.appendChild(actionsDiv); // Add actions to the header part
  }


  // --- Event Listeners ---

  // Toggle expand/collapse on header click (if description exists)
  if (description) {
    chipHeader.addEventListener('click', (event) => {
      // Prevent toggle if clicking on action buttons
      if (!event.target.closest('.chip-actions')) {
        chip.classList.toggle('expanded');
      }
    });
    chipHeader.classList.add('clickable'); // Add class for cursor style
  }


  // Drag events
  chip.addEventListener('dragstart', (event) => {
    // Don't start drag if clicking on buttons inside chip
    if (event.target.closest('.chip-actions')) {
      event.preventDefault();
      return;
    }
    // Don't start drag if the chip is expanded (might interfere with text selection)
    if (chip.classList.contains('expanded')) {
        event.preventDefault();
        return;
    }

    chip.classList.add('dragging');
    if (onDragStart) {
      // Pass the necessary data for the drop target
      const dataToTransfer = {
        text: text,
        category: category,
        description: description,
        type: 'chip' // Explicitly mark as chip type for draft panel
      };
      event.dataTransfer.setData('application/json', JSON.stringify(dataToTransfer));
    }
    // hideTooltip(); // Might not be needed anymore
  });

  chip.addEventListener('dragend', () => {
    chip.classList.remove('dragging');
  });

  return chip;
}