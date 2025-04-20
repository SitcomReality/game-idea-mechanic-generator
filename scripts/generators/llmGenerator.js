import { generateGameIdea } from '../llm/callLLM.js';

export async function generateIdeasFromLLM(selectedTags, quantity, customText, enabledSections) {
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
    
    // Generate ideas using the LLM
    const ideas = await generateGameIdea({
      categories,
      quantity,
      customText
    });
    
    return ideas;
  } catch (error) {
    console.error('Error generating ideas from LLM:', error);
    throw new Error(`LLM generation failed: ${error.message}`);
  }
}

