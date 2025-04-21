import { generateGameIdea } from '../llm/callLLM.js';

export async function generateIdeasFromLLM(selectedTags, quantity, customText, enabledSections, designDraft) {
  try {
    // Convert enabled sections to categories for the LLM prompt
    const enabledCategories = [];
    if (enabledSections.mechanics) enabledCategories.push('Mechanic');
    if (enabledSections.themes) enabledCategories.push('Theme');
    if (enabledSections.settings) enabledCategories.push('Setting');
    if (enabledSections.systems) enabledCategories.push('System');

    // Combine enabled categories with selected tags
    const categories = new Set([
      ...enabledCategories,
      ...selectedTags
    ]);

    // Extract text content from the design draft
    let draftText = '';
    if (designDraft && designDraft.length > 0) {
        draftText = designDraft.map(item => {
            if (item.type === 'html') {
                // Basic text extraction from HTML
                const tempDiv = document.createElement('div');
                tempDiv.innerHTML = item.text;
                return tempDiv.textContent || tempDiv.innerText || '';
            }
            return `${item.category || ''}: ${item.text}`;
        }).join('\n');
    }


    // Generate ideas using the LLM
    const ideas = await generateGameIdea({
      categories,
      quantity,
      customText,
      draftContext: draftText // Pass the extracted draft text
    });

    return ideas;
  } catch (error) {
    console.error('Error generating ideas from LLM:', error);
    throw new Error(`LLM generation failed: ${error.message}`);
  }
}