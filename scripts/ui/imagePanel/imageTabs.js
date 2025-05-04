// New file to handle image panel tabs
export function initImageTabs() {
  const tabButtons = document.querySelectorAll('.image-tab-button');
  const tabContents = document.querySelectorAll('.image-tab-content');
  
  // Function to switch tabs
  function switchTab(tabId) {
    // Hide all tab contents
    tabContents.forEach(content => {
      content.classList.remove('active');
    });
    
    // Deactivate all tab buttons
    tabButtons.forEach(button => {
      button.classList.remove('active');
    });
    
    // Activate the selected tab and content
    document.getElementById(tabId).classList.add('active');
    document.querySelector(`[data-tab="${tabId}"]`).classList.add('active');
  }
  
  // Add click handlers to tab buttons
  tabButtons.forEach(button => {
    button.addEventListener('click', () => {
      const tabId = button.getAttribute('data-tab');
      switchTab(tabId);
    });
  });
  
  // Initialize with the first tab active
  if (tabButtons.length > 0) {
    const firstTabId = tabButtons[0].getAttribute('data-tab');
    switchTab(firstTabId);
  }
}