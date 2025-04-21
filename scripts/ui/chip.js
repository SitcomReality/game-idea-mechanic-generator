import { showTooltip, hideTooltip } from './tooltipManager.js';

export function createChip({ text, category, tooltip = '', onDragStart, onDelete }) {
  const chip = document.createElement('div');
  chip.className = `chip ${category?.toLowerCase() || ''}`;
  chip.draggable = true;

  // Drag handle
  const dragHandle = document.createElement('span');
  dragHandle.className = 'chip-drag-handle';
  dragHandle.innerHTML = '⁞';
  chip.appendChild(dragHandle);

  // Category label (if provided)
  if (category) {
    const categorySpan = document.createElement('span');
    categorySpan.className = 'chip-category';
    categorySpan.textContent = category + ': ';
    chip.appendChild(categorySpan);
  }

  // Text label
  const label = document.createElement('span');
  label.className = 'chip-label';
  label.textContent = text;
  chip.appendChild(label);

  // Info button (if tooltip provided)
  if (tooltip) {
    const infoBtn = document.createElement('span');
    infoBtn.className = 'chip-info'; 
    infoBtn.textContent = 'i';
    infoBtn.dataset.tooltipText = tooltip; 

    // Add event listeners to show/hide the global tooltip
    infoBtn.addEventListener('mouseenter', (event) => {
      showTooltip(event.currentTarget, tooltip);
    });
    infoBtn.addEventListener('mouseleave', () => {
      hideTooltip();
    });
    // Add focus/blur for accessibility if needed
    infoBtn.addEventListener('focus', (event) => {
       showTooltip(event.currentTarget, tooltip);
    });
     infoBtn.addEventListener('blur', () => {
       hideTooltip();
    });


    chip.appendChild(infoBtn);
  }

  // Delete button
  if (onDelete) {
    const deleteBtn = document.createElement('span');
    deleteBtn.className = 'chip-delete';
    deleteBtn.textContent = '✕';
    deleteBtn.addEventListener('click', onDelete);
    chip.appendChild(deleteBtn);
  }

  // Drag events
  chip.addEventListener('dragstart', (event) => {
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