// New file: scripts/ui/generatorPanel/loadIdeasModal.js

// Helper function to estimate localStorage usage (copied from draftPanel/actions.js)
function getLocalStorageUsage() {
    let totalBytes = 0;
    const storageLimitBytes = 5 * 1024 * 1024; // Estimate 5MB limit

    for (let i = 0; i < localStorage.length; i++) {
        const key = localStorage.key(i);
        const value = localStorage.getItem(key);
        // Estimate bytes: key length + value length (UTF-16 characters are 2 bytes each)
        if (key && value) {
             totalBytes += (key.length + value.length) * 2;
        }
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

            listItem.appendChild(contentDiv);
            ideasListContainer.appendChild(listItem);
        });
    }

    loadIdeasBtn.addEventListener('click', showModal);
    closeBtn.addEventListener('click', hideModal);
    cancelBtn.addEventListener('click', hideModal);
    modal.addEventListener('click', (event) => {
        if (event.target === modal) {
            hideModal();
        }
    });
}