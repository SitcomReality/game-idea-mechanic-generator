// New file: scripts/data/instructions/designDraftPlaceholder.js

export const designDraftPlaceholderText = `
<div class="placeholder-instructions">
  <h4>Build Your Concept:</h4>
  <ol start="4"> 
    <li>
      <strong>Drag & Drop Ideas (Right Panel):</strong> Pull interesting chips from the "Generated Ideas" panel (middle) into this area. Chips will automatically group by category.
    </li>
    <li>
      <strong>Organize & Edit:</strong>
      <ul>
          <li>Click a category header (e.g., "Mechanic") to expand/collapse it.</li>
          <li>Click a chip's header to see its details (if any).</li>
          <li>Use the <span class="icon-inline">&times;</span> on a chip to remove it from the draft.</li>
          <li>Edit the <strong>Game Title</strong> above. Your draft autosaves under the current title.</li>
          <li>Use the <strong>Save/Load</strong> buttons to manage different versions of your drafts.</li>
      </ul>
    </li>
    <li>
      <strong>(Optional) Cohere Draft:</strong>
      <ul>
          <li>Click "Cohere Draft" to have AI turn your chips into a descriptive paragraph.</li>
          <li><strong>Warning:</strong> This replaces your chips and is irreversible. <strong>Save your draft first</strong> if you want to keep the chips editable!</li>
          <li>You *don't* need to cohere the draft to generate a Brief or Image.</li>
      </ul>
    </li>
  </ol>
  <p>Next: Generate a structured <strong>Design Brief</strong> (below left) or <strong>Concept Art</strong> (below right) from this draft!</p>
</div>
`;