export function renderTagTree(container, taxonomy, state) {
  // Clear existing content
  container.innerHTML = '';
  
  // Create the tree container
  const treeDiv = document.createElement('div');
  treeDiv.className = 'tag-tree';
  
  // Helper function to build the tree recursively
  function buildTreeNode(node, path = []) {
    const nodeDiv = document.createElement('div');
    nodeDiv.className = 'tag-tree-node';
    
    const hasChildren = node && typeof node === 'object' && Object.keys(node).length > 0;
    
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
      
      // Generate full path for this node
      const nodePath = [...path].join('.');
      
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
      nameSpan.textContent = path[path.length - 1] || 'Root';
      
      label.appendChild(checkbox);
      label.appendChild(nameSpan);
      
      toggleDiv.appendChild(label);
      nodeDiv.appendChild(toggleDiv);
      
      // Create container for children
      const childrenDiv = document.createElement('div');
      childrenDiv.className = 'tag-tree-children';
      
      // Add expand/collapse functionality
      toggleDiv.addEventListener('click', (e) => {
        if (e.target !== checkbox) {
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
      
      // Generate full path for this node
      const nodePath = [...path].join('.');
      
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
      nameSpan.textContent = path[path.length - 1];
      
      label.appendChild(checkbox);
      label.appendChild(nameSpan);
      
      nodeDiv.appendChild(label);
    }
    
    return nodeDiv;
  }
  
  // Build the whole tree
  const rootNode = buildTreeNode(taxonomy);
  treeDiv.appendChild(rootNode);
  container.appendChild(treeDiv);
}

