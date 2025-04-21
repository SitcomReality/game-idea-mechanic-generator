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
  if (!tooltipElement || !text || !text.trim()) {
    // console.warn('Tooltip Manager not initialized or text is empty');
    return; // Don't show empty tooltips
  }

  tooltipElement.textContent = text;
  tooltipElement.classList.remove('tooltip-top', 'tooltip-bottom'); // Reset placement class

  // Make temporarily visible off-screen to calculate size correctly
  tooltipElement.style.visibility = 'hidden';
  tooltipElement.style.display = 'block'; // Use block instead of visibility for reliable size calc
  tooltipElement.style.opacity = '0'; // Keep invisible while measuring
  tooltipElement.style.top = '-9999px';
  tooltipElement.style.left = '-9999px';

  const targetRect = targetElement.getBoundingClientRect();
  const tooltipRect = tooltipElement.getBoundingClientRect(); // Get size


  let top, left;
  const viewportWidth = window.innerWidth;
  const viewportHeight = window.innerHeight; // Use innerHeight

  // Default position: above the target element
  top = targetRect.top - tooltipRect.height - TOOLTIP_OFFSET;
  left = targetRect.left + (targetRect.width / 2) - (tooltipRect.width / 2);
  tooltipElement.classList.add('tooltip-top');


  // Check for top overflow
  if (top < TOOLTIP_OFFSET) { // Add offset check
    // Place below instead
    top = targetRect.bottom + TOOLTIP_OFFSET;
    tooltipElement.classList.remove('tooltip-top');
    tooltipElement.classList.add('tooltip-bottom');
  }

  // Check for bottom overflow (if placed below)
  if (tooltipElement.classList.contains('tooltip-bottom') && top + tooltipRect.height > viewportHeight - TOOLTIP_OFFSET) {
     // Fallback to above if below also overflows (unlikely but possible)
     top = targetRect.top - tooltipRect.height - TOOLTIP_OFFSET;
     tooltipElement.classList.remove('tooltip-bottom');
     tooltipElement.classList.add('tooltip-top');
     // If it *still* overflows top, it might just be too big for the space.
     // We could clamp it to the edge, but let's keep it simple for now.
  }


  // Check for left overflow
  if (left < TOOLTIP_OFFSET) {
    left = TOOLTIP_OFFSET;
  }

  // Check for right overflow
  if (left + tooltipRect.width > viewportWidth - TOOLTIP_OFFSET) {
    left = viewportWidth - tooltipRect.width - TOOLTIP_OFFSET;
  }


  tooltipElement.style.top = `${window.scrollY + top}px`; // Add scrollY offset
  tooltipElement.style.left = `${window.scrollX + left}px`; // Add scrollX offset


  // Make visible after positioning
  tooltipElement.style.visibility = 'visible'; // Restore visibility
  tooltipElement.style.display = 'block'; // Ensure display is block
  tooltipElement.classList.add('visible'); // Use class for transition
  tooltipElement.style.opacity = '1'; // Fade in

}

export function hideTooltip() {
  if (tooltipElement) {
    tooltipElement.classList.remove('visible');
    tooltipElement.style.opacity = '0'; // Fade out

    // Optional: Reset position slightly after hiding to prevent brief flash
    // tooltipElement.style.top = '-9999px';
    // tooltipElement.style.left = '-9999px';
    // Consider adding a small delay before resetting position if using transitions
    // setTimeout(() => {
    //   if (!tooltipElement.classList.contains('visible')) { // Check if still hidden
    //      tooltipElement.style.display = 'none';
    //   }
    // }, 200); // Match transition duration
  }
}

// Re-enable listeners for robustness
window.addEventListener('scroll', hideTooltip, true); // Use capture phase
window.addEventListener('resize', hideTooltip);