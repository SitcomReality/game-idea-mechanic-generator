import { generateIdeasFromWordlists } from './wordlistGenerator.js';
import { generateIdeasFromLLM } from './llmGenerator.js';

export async function generateIdeasHybrid(selectedTags, quantity, customText, enabledSections) {
  try {
    // Split the quantity between wordlists and LLM
    const wordlistQuantity = Math.ceil(quantity / 2);
    const llmQuantity = quantity - wordlistQuantity;
    
    // Get ideas from both sources in parallel
    const [wordlistIdeas, llmIdeas] = await Promise.all([
      generateIdeasFromWordlists(selectedTags, wordlistQuantity, enabledSections),
      generateIdeasFromLLM(selectedTags, llmQuantity, customText, enabledSections)
    ]);
    
    // Combine the results
    const combinedIdeas = [...wordlistIdeas, ...llmIdeas];
    
    // If custom text is provided, pass the combined ideas through the LLM
    // to ensure coherence with the custom text
    if (customText && customText.trim() !== '') {
      // In a real implementation, you might want to call the LLM again
      // to refine these ideas based on the custom text
      // For now, we'll just return the combined ideas
    }
    
    return combinedIdeas;
  } catch (error) {
    console.error('Error generating hybrid ideas:', error);
    throw new Error(`Hybrid generation failed: ${error.message}`);
  }
}

