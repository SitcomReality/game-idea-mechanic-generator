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
    
    // Add tooltip and event listener
    const tooltipEl = document.createElement('div');
    tooltipEl.className = 'tooltip-content';
    tooltipEl.textContent = tooltip;
    
    // Initially hide tooltip
    tooltipEl.style.display = 'none';
    
    infoBtn.appendChild(tooltipEl);

    // Toggle tooltip on click event
    infoBtn.addEventListener('click', (e) => {
      tooltipEl.style.display = tooltipEl.style.display === 'none' ? 'block' : 'none';
      e.stopPropagation(); // Prevent bubbling
    });

    chip.appendChild(infoBtn);
    
    // Close tooltip when clicking outside
    document.addEventListener('click', (e) => {
      if (!infoBtn.contains(e.target)) {
        tooltipEl.style.display = 'none';
      }
    });
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
  });
  
  chip.addEventListener('dragend', () => {
    chip.classList.remove('dragging');
  });
  
  return chip;
}