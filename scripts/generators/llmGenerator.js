import { generateGameIdea } from '../llm/callLLM.js';

export async function generateIdeasFromLLM(selectedTags, quantity, customText, enabledSections, designDraftContext) {
  try {
    const enabledCategories = [];
    if (enabledSections.mechanics) enabledCategories.push('Mechanic');
    if (enabledSections.themes) enabledCategories.push('Theme');
    if (enabledSections.settings) enabledCategories.push('Setting');
    if (enabledSections.systems) enabledCategories.push('System');

    const categories = new Set([
      ...enabledCategories,
      ...selectedTags
    ]);

    let draftText = '';
    if (designDraftContext && designDraftContext.length > 0) {
        draftText = designDraftContext.map(item => {
            if (item.type === 'html') {
                const tempDiv = document.createElement('div');
                tempDiv.innerHTML = item.text;
                return tempDiv.textContent || tempDiv.innerText || '';
            }
            return `${item.category || ''}: ${item.text}`;
        }).join('\n');
    }

    const ideas = await generateGameIdea({
      categories,
      quantity,
      customText,
      draftContext: draftText 
    });

    return ideas;
  } catch (error) {
    console.error('Error generating ideas from LLM:', error);
    throw new Error(`LLM generation failed: ${error.message}`);
  }
}