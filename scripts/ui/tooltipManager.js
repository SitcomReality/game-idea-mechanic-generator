// Manages a single global tooltip element

let tooltipElement = null;
const TOOLTIP_OFFSET = 8; // Pixels distance from the element

export function initTooltipManager() {
  if (!tooltipElement) {
    tooltipElement = document.createElement('div');
    tooltipElement.id = 'global-tooltip';
    // Initial styles are set in tooltip.css
    document.body.appendChild(tooltipElement);
  }
}

export function showTooltip(targetElement, text) {
  if (!tooltipElement) {
    console.warn('Tooltip Manager not initialized');
    return;
  }

  tooltipElement.textContent = text;
  tooltipElement.classList.remove('tooltip-top', 'tooltip-bottom'); // Reset placement class

  // Calculate position
  const targetRect = targetElement.getBoundingClientRect();
  const tooltipRect = tooltipElement.getBoundingClientRect(); // Get initial size

  let top, left;

  // Default position: above the target element
  top = targetRect.top - tooltipElement.offsetHeight - TOOLTIP_OFFSET;
  left = targetRect.left + (targetRect.width / 2) - (tooltipElement.offsetWidth / 2);
  tooltipElement.classList.add('tooltip-top');


  // Check for top overflow
  if (top < 0) {
    // Place below instead
    top = targetRect.bottom + TOOLTIP_OFFSET;
    tooltipElement.classList.remove('tooltip-top');
    tooltipElement.classList.add('tooltip-bottom');
  }

  // Check for left overflow
  if (left < 0) {
    left = TOOLTIP_OFFSET; // Add some padding from edge
  }

  // Check for right overflow
  const viewportWidth = window.innerWidth;
  if (left + tooltipElement.offsetWidth > viewportWidth) {
    left = viewportWidth - tooltipElement.offsetWidth - TOOLTIP_OFFSET; // Add padding
  }


  tooltipElement.style.top = `${top}px`;
  tooltipElement.style.left = `${left}px`;

  // Make visible after positioning
  tooltipElement.classList.add('visible');
}

export function hideTooltip() {
  if (tooltipElement) {
    tooltipElement.classList.remove('visible');
     // Optional: Reset position slightly after hiding to prevent brief flash in old position on next show
    // tooltipElement.style.top = '-9999px';
    // tooltipElement.style.left = '-9999px';
  }
}

// Optional: Hide tooltip on scroll or resize to prevent detachment
// window.addEventListener('scroll', hideTooltip, true); // Use capture phase
// window.addEventListener('resize', hideTooltip);