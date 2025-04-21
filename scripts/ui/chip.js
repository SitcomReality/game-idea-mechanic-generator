import { showTooltip, hideTooltip } from './tooltipManager.js';

// Helper function to create CSS-friendly class names from categories
function getCategoryClassName(categoryName) {
  if (!categoryName) return 'category-default';
  return `category-${categoryName.toLowerCase().replace(/[\s/]+/g, '-')}`;
}

export function createChip({ text, category, tooltip = '', onDragStart, onDelete }) {
  const chip = document.createElement('div');
  const categoryClassName = getCategoryClassName(category); // Generate class name
  chip.className = `chip ${categoryClassName}`; // Add category class
  chip.draggable = true;

  // Container for category and label
  const contentDiv = document.createElement('div');
  contentDiv.className = 'chip-content';

  // Category label (if provided)
  if (category) {
    const categorySpan = document.createElement('span');
    categorySpan.className = 'chip-category';
    categorySpan.textContent = category; // Just the category name
    contentDiv.appendChild(categorySpan);
  }

  // Text label
  const label = document.createElement('span');
  label.className = 'chip-label';
  label.textContent = text;
  contentDiv.appendChild(label);

  chip.appendChild(contentDiv);

  // Container for action buttons (info, delete)
  const actionsDiv = document.createElement('div');
  actionsDiv.className = 'chip-actions';

  // Info button (if tooltip provided)
  if (tooltip) {
    const infoBtn = document.createElement('button'); // Changed to button for accessibility
    infoBtn.className = 'chip-info';
    infoBtn.innerHTML = '<i>i</i>'; // Use italic 'i' or an icon font
    infoBtn.setAttribute('aria-label', 'More information');
    infoBtn.dataset.tooltipText = tooltip;

    // Add event listeners to show/hide the global tooltip
    infoBtn.addEventListener('mouseenter', (event) => {
      showTooltip(event.currentTarget, tooltip);
    });
    infoBtn.addEventListener('mouseleave', () => {
      hideTooltip();
    });
    // Add focus/blur for accessibility
    infoBtn.addEventListener('focus', (event) => {
       showTooltip(event.currentTarget, tooltip);
    });
     infoBtn.addEventListener('blur', () => {
       hideTooltip();
    });

    actionsDiv.appendChild(infoBtn);
  }

  // Delete button
  if (onDelete) {
    const deleteBtn = document.createElement('button'); // Changed to button for accessibility
    deleteBtn.className = 'chip-delete';
    deleteBtn.innerHTML = '&times;'; // Use HTML entity for 'x'
    deleteBtn.setAttribute('aria-label', 'Delete item');
    deleteBtn.addEventListener('click', (e) => {
        e.stopPropagation(); // Prevent drag start when clicking delete
        onDelete();
    });
    actionsDiv.appendChild(deleteBtn);
  }

  // Only add actions container if it has children
  if (actionsDiv.hasChildNodes()) {
      chip.appendChild(actionsDiv);
  }

  // Drag events
  chip.addEventListener('dragstart', (event) => {
    // Don't start drag if clicking on buttons inside chip
    if (event.target.closest('.chip-actions')) {
      event.preventDefault();
      return;
    }
    chip.classList.add('dragging');
    if (onDragStart) {
      onDragStart(event);
    }
    hideTooltip();
  });

  chip.addEventListener('dragend', () => {
    chip.classList.remove('dragging');
  });

  return chip;
}