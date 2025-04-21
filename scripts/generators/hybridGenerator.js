import { generateIdeasFromWordlists } from './wordlistGenerator.js';
import { generateIdeasFromLLM } from './llmGenerator.js';

export async function generateIdeasHybrid(selectedTags, quantity, customText, enabledSections, designDraftContext) {
  try {
    // Split the quantity between wordlists and LLM
    const wordlistQuantity = Math.ceil(quantity / 2);
    const llmQuantity = quantity - wordlistQuantity;

    // Get ideas from both sources in parallel
    // Pass designDraftContext directly to generateIdeasFromLLM
    const [wordlistIdeas, llmIdeas] = await Promise.all([
      generateIdeasFromWordlists(selectedTags, wordlistQuantity, enabledSections),
      generateIdeasFromLLM(selectedTags, llmQuantity, customText, enabledSections, designDraftContext)
    ]);

    // Combine the results
    const combinedIdeas = [...wordlistIdeas, ...llmIdeas];

    return combinedIdeas;
  } catch (error) {
    console.error('Error generating hybrid ideas:', error);
    throw new Error(`Hybrid generation failed: ${error.message}`);
  }
}