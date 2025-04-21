export function renderTagTree(container, taxonomy, state, basePath = []) {
  // Clear existing content *within the specific container*
  container.innerHTML = '';

  // Create the tree container (or use the provided one)
  const treeDiv = document.createElement('div');
  treeDiv.className = 'tag-tree'; // Keep class for potential styling

  // Helper function to build the tree recursively
  function buildTreeNode(node, path = []) {
    const nodeDiv = document.createElement('div');
    nodeDiv.className = 'tag-tree-node';

    const hasChildren = node && typeof node === 'object' && Object.keys(node).length > 0;
    const currentItemName = path[path.length - 1];
    const nodePath = [...path].join('.'); // Generate full path here

    if (hasChildren) {
      // Create toggle element for expandable nodes
      const toggleDiv = document.createElement('div');
      toggleDiv.className = 'tag-tree-toggle';

      // Create label with checkbox
      const label = document.createElement('label');
      label.className = 'tag-tree-label';

      const checkbox = document.createElement('input');
      checkbox.type = 'checkbox';
      checkbox.className = 'tag-tree-checkbox';
      checkbox.dataset.tagPath = nodePath; // Store the path on the element

      // Check if this node is selected
      checkbox.checked = state.getSelectedTags().has(nodePath);

      // Update state when checkbox changes
      checkbox.addEventListener('change', () => {
        if (checkbox.checked) {
          state.addSelectedTag(nodePath);
        } else {
          state.removeSelectedTag(nodePath);
        }
      });

      const nameSpan = document.createElement('span');
      // Use the last part of the path as the display name
      nameSpan.textContent = currentItemName;

      label.appendChild(checkbox);
      label.appendChild(nameSpan);

      toggleDiv.appendChild(label);
      nodeDiv.appendChild(toggleDiv);

      // Create container for children
      const childrenDiv = document.createElement('div');
      childrenDiv.className = 'tag-tree-children';

      // Add expand/collapse functionality
      toggleDiv.addEventListener('click', (e) => {
        // Prevent toggling when clicking directly on the checkbox or its label span
        if (e.target !== checkbox && e.target !== nameSpan) {
          toggleDiv.classList.toggle('expanded');
          childrenDiv.classList.toggle('expanded');
        }
      });

      // Build child nodes
      Object.keys(node).forEach(key => {
        const childPath = [...path, key];
        const childNode = buildTreeNode(node[key], childPath);
        childrenDiv.appendChild(childNode);
      });

      nodeDiv.appendChild(childrenDiv);
    } else {
      // Leaf node (no children)
      const label = document.createElement('label');
      label.className = 'tag-tree-label';

      const checkbox = document.createElement('input');
      checkbox.type = 'checkbox';
      checkbox.className = 'tag-tree-checkbox';
      checkbox.dataset.tagPath = nodePath; // Store the path on the element

      // Check if this node is selected
      checkbox.checked = state.getSelectedTags().has(nodePath);

      // Update state when checkbox changes
      checkbox.addEventListener('change', () => {
        if (checkbox.checked) {
          state.addSelectedTag(nodePath);
        } else {
          state.removeSelectedTag(nodePath);
        }
      });

      const nameSpan = document.createElement('span');
      nameSpan.textContent = currentItemName; // Use the last part of the path

      label.appendChild(checkbox);
      label.appendChild(nameSpan);

      nodeDiv.appendChild(label);
    }

    return nodeDiv;
  }

  // Build the tree starting from the passed taxonomy object, using basePath
  Object.keys(taxonomy).forEach(key => {
    const node = buildTreeNode(taxonomy[key], [...basePath, key]);
    treeDiv.appendChild(node);
  });

  container.appendChild(treeDiv);
}