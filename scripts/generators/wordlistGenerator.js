import { getWordlists } from '../data/wordlistLoader.js';

export async function generateIdeasFromWordlists(selectedTags, quantity, enabledSections) {
  try {
    // Get available wordlists
    const wordlists = await getWordlists();
    
    // Filter wordlists based on enabled sections
    const filteredLists = {};
    Object.keys(wordlists).forEach(key => {
      // Map wordlist keys to section keys (e.g., "mechanics" -> "mechanics")
      const sectionKey = key.toLowerCase();
      if (enabledSections[sectionKey]) {
        filteredLists[key] = wordlists[key];
      }
    });
    
    // If no lists are enabled or available, throw an error
    if (Object.keys(filteredLists).length === 0) {
      throw new Error('No wordlists available for the selected sections');
    }
    
    // Filter terms by selected tags (if any)
    const filteredTerms = {};
    if (selectedTags.size > 0) {
      Object.keys(filteredLists).forEach(listKey => {
        filteredTerms[listKey] = filteredLists[listKey].filter(item => {
          // Check if any of the item's tags match the selected tags
          return item.tags && item.tags.some(tag => selectedTags.has(tag));
        });
      });
    } else {
      // If no tags selected, use all terms
      filteredTerms = { ...filteredLists };
    }
    
    // Generate random selections from each list
    const results = [];
    
    Object.keys(filteredTerms).forEach(category => {
      const terms = filteredTerms[category];
      
      // Skip empty lists
      if (!terms || terms.length === 0) return;
      
      // Calculate how many items to pick from this category
      // For simplicity, we'll distribute evenly, but you could implement
      // more sophisticated distribution logic
      const categoryQuantity = Math.ceil(quantity / Object.keys(filteredTerms).length);
      
      // Randomly select terms
      const selectedTerms = selectRandomTerms(terms, categoryQuantity);
      
      // Add to results
      selectedTerms.forEach(term => {
        results.push({
          category,
          text: term.text,
          description: term.description || '',
          tags: term.tags || []
        });
      });
    });
    
    return results;
  } catch (error) {
    console.error('Error generating ideas from wordlists:', error);
    throw new Error(`Wordlist generation failed: ${error.message}`);
  }
}

// Helper function to randomly select terms from a list
function selectRandomTerms(termList, count) {
  // If there aren't enough terms, return all of them
  if (termList.length <= count) {
    return [...termList];
  }
  
  // Otherwise, randomly select 'count' terms
  const selected = [];
  const indices = new Set();
  
  while (indices.size < count) {
    const randomIndex = Math.floor(Math.random() * termList.length);
    if (!indices.has(randomIndex)) {
      indices.add(randomIndex);
      selected.push(termList[randomIndex]);
    }
  }
  
  return selected;
}

