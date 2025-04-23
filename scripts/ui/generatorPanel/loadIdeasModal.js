// New file: scripts/ui/generatorPanel/loadIdeasModal.js
import { showTooltip, hideTooltip } from '../tooltipManager.js'; // Import tooltip functions

// Helper function to estimate localStorage usage (copied from draftPanel/actions.js)
function getLocalStorageUsage() {
    let totalBytes = 0;
    const storageLimitBytes = 5 * 1024 * 1024; // Estimate 5MB limit

    try {
        for (let i = 0; i < localStorage.length; i++) {
            const key = localStorage.key(i);
            const value = localStorage.getItem(key);
            // Estimate bytes: key length + value length (UTF-16 characters are 2 bytes each)
            if (key && value) {
                 totalBytes += (key.length + value.length) * 2;
            }
        }
    } catch (error) {
        console.error("Error calculating localStorage usage:", error);
        return {
            usedMB: 'Error',
            limitMB: (storageLimitBytes / (1024 * 1024)).toFixed(2),
            percentageUsed: 'Error',
            totalBytes: 0,
            storageLimitBytes
        };
    }

    const usedMB = (totalBytes / (1024 * 1024)).toFixed(2);
    const limitMB = (storageLimitBytes / (1024 * 1024)).toFixed(2);
    const percentageUsed = ((totalBytes / storageLimitBytes) * 100).toFixed(1);

    return {
        usedMB,
        limitMB,
        percentageUsed,
        totalBytes,
        storageLimitBytes
    };
}

export function initLoadIdeasModal(state) {
    const loadIdeasBtn = document.getElementById('load-ideas-btn'); // Trigger button
    const modal = document.getElementById('load-ideas-modal');
    const closeBtn = document.getElementById('load-ideas-modal-close');
    const cancelBtn = document.getElementById('load-ideas-modal-cancel');
    const ideasListContainer = document.getElementById('saved-ideas-list');
    const storageInfoElement = document.getElementById('local-storage-info-ideas');

    function showModal() {
        populateSavedIdeasList();
        // Calculate and display storage usage
        const usage = getLocalStorageUsage();
        if (storageInfoElement) {
            storageInfoElement.textContent = `Storage Used: ${usage.usedMB} MB / ${usage.limitMB} MB (${usage.percentageUsed}%)`;
        }
        modal.classList.add('active');
    }

    function hideModal() {
        modal.classList.remove('active');
    }

    function populateSavedIdeasList() {
        ideasListContainer.innerHTML = ''; // Clear existing list
        const savedIdeaKeys = state.getSavedIdeaKeys(); // Use helper from state

        if (savedIdeaKeys.length === 0) {
            ideasListContainer.innerHTML = '<li class="empty-state">No saved ideas found.</li>';
            return;
        }

        savedIdeaKeys.forEach(key => {
            const ideaData = state.loadIdeaFromStorage(key); // Use helper from state
            if (!ideaData) {
                console.warn(`Could not load data for key: ${key}`);
                return; // Skip if data is missing or invalid
            }

            const listItem = document.createElement('li');
            listItem.className = 'saved-idea-item';

            // Content (clickable area to load)
            const contentDiv = document.createElement('div');
            contentDiv.className = 'saved-idea-content';
            contentDiv.title = `Load "${ideaData.text}"`;

            const categorySpan = document.createElement('span');
            categorySpan.className = 'saved-idea-category';
            categorySpan.textContent = ideaData.category || 'Uncategorized';
            contentDiv.appendChild(categorySpan);

            const textSpan = document.createElement('span');
            textSpan.className = 'saved-idea-text';
            textSpan.textContent = ideaData.text;
            contentDiv.appendChild(textSpan);

            // Add description if it exists
            if (ideaData.description) {
                const descriptionSpan = document.createElement('span');
                descriptionSpan.className = 'saved-idea-description'; // Added class for potential styling
                descriptionSpan.textContent = ` - ${ideaData.description}`; // Simple append
                descriptionSpan.style.fontSize = '0.8rem';
                descriptionSpan.style.color = 'var(--text-secondary)';
                contentDiv.appendChild(descriptionSpan);
            }

            contentDiv.addEventListener('click', () => {
                // Add the loaded idea to the *current* generated ideas list
                const ideaToAdd = {
                    text: ideaData.text,
                    category: ideaData.category,
                    description: ideaData.description || ''
                    // No need for drag/delete handlers here, they are added when the chip is created by generatorPanel
                };
                state.addToGeneratedIdeas(ideaToAdd); // Add to state's generatedIdeas array
                hideModal(); // Close modal after loading
            });

            // Delete button
            const deleteBtn = document.createElement('button');
            deleteBtn.className = 'saved-idea-delete-btn small-btn'; // Added class
            deleteBtn.innerHTML = '🗑️'; // Trash can emoji
            deleteBtn.setAttribute('aria-label', `Delete idea "${ideaData.text}"`);
            deleteBtn.title = `Delete idea "${ideaData.text}"`;
            deleteBtn.addEventListener('click', (e) => {
                e.stopPropagation(); // Prevent triggering load
                if (window.confirm(`Are you sure you want to permanently delete the idea "${ideaData.text}"?`)) {
                    state.deleteIdeaByKey(key); // Call state action to delete
                    populateSavedIdeasList(); // Re-populate the list
                    // Update storage info after deletion
                    const usage = getLocalStorageUsage();
                    if (storageInfoElement) {
                         storageInfoElement.textContent = `Storage Used: ${usage.usedMB} MB / ${usage.limitMB} MB (${usage.percentageUsed}%)`;
                     }
                }
            });

            listItem.appendChild(contentDiv);
            listItem.appendChild(deleteBtn); // Add delete button
            ideasListContainer.appendChild(listItem);
        });
    }

    // Subscribe to changes in saved ideas list to keep modal updated
    state.subscribe('savedIdeas', (keys) => {
        // Only repopulate if the modal is currently active
        if (modal.classList.contains('active')) {
             populateSavedIdeasList();
             // Update storage info when list changes while modal is open
             const usage = getLocalStorageUsage();
             if (storageInfoElement) {
                  storageInfoElement.textContent = `Storage Used: ${usage.usedMB} MB / ${usage.limitMB} MB (${usage.percentageUsed}%)`;
             }
        }
    });

    loadIdeasBtn.addEventListener('click', showModal);
    closeBtn.addEventListener('click', hideModal);
    cancelBtn.addEventListener('click', hideModal);
    modal.addEventListener('click', (event) => {
        if (event.target === modal) {
            hideModal();
        }
    });
}