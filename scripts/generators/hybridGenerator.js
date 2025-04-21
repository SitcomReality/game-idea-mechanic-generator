import { generateIdeasFromWordlists } from './wordlistGenerator.js';
import { generateIdeasFromLLM } from './llmGenerator.js';

export async function generateIdeasHybrid(selectedTags, quantity, customText, enabledSections, designDraft) {
  try {
    // Split the quantity between wordlists and LLM
    const wordlistQuantity = Math.ceil(quantity / 2);
    const llmQuantity = quantity - wordlistQuantity;

    // Get ideas from both sources in parallel
    const [wordlistIdeas, llmIdeas] = await Promise.all([
      generateIdeasFromWordlists(selectedTags, wordlistQuantity, enabledSections),
      generateIdeasFromLLM(selectedTags, llmQuantity, customText, enabledSections, designDraft)
    ]);

    // Combine the results
    const combinedIdeas = [...wordlistIdeas, ...llmIdeas];

    // Note: The LLM part already considers the draft context.
    // If further refinement based on the *combined* list and draft is needed,
    // another LLM call could be made here, but for now, simply combining is sufficient.

    return combinedIdeas;
  } catch (error) {
    console.error('Error generating hybrid ideas:', error);
    throw new Error(`Hybrid generation failed: ${error.message}`);
  }
}