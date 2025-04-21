import { getWordlists } from '../data/wordlistLoader.js';

export async function generateIdeasFromWordlists(selectedTags, quantity, enabledSections) {
  try {
    // Get available wordlists
    const wordlists = await getWordlists();
    
    // Filter wordlists based on enabled sections
    const filteredLists = {};
    
    if (enabledSections.mechanics && wordlists.Mechanics) {
      filteredLists.Mechanics = wordlists.Mechanics;
    }
    if (enabledSections.themes && wordlists.Themes) {
      filteredLists.Themes = wordlists.Themes;
    }
    if (enabledSections.settings && wordlists.Settings) {
      filteredLists.Settings = wordlists.Settings;
    }
    if (enabledSections.systems && wordlists.Systems) {
      filteredLists.Systems = wordlists.Systems;
    }
    
    // If no lists are enabled or available, throw an error
    if (Object.keys(filteredLists).length === 0) {
      throw new Error('No wordlists available for the selected sections');
    }
    
    // Filter terms by selected tags (if any)
    const filteredTerms = {};
    
    if (selectedTags.size > 0) {
      const tagsArray = Array.from(selectedTags);
      
      Object.keys(filteredLists).forEach(listKey => {
        filteredTerms[listKey] = filteredLists[listKey].filter(item => {
          // If the item doesn't have tags, exclude it when tags are selected
          if (!item.tags || item.tags.length === 0) {
            return false;
          }
          
          // Check if any of the item's tags match the selected tags
          // Include the item if any tag matches any part of the taxonomy path
          return item.tags.some(tag => {
            return tagsArray.some(selectedTag => {
              // Check if tag is exactly the selected tag
              if (tag === selectedTag) return true;
              
              // Check if tag starts with the selected tag (parent-child relationship)
              if (tag.startsWith(selectedTag + '.')) return true;
              
              // Check if selected tag starts with the tag (child-parent relationship)
              if (selectedTag.startsWith(tag + '.')) return true;
              
              return false;
            });
          });
        });
      });
    } else {
      // If no tags selected, use all terms
      filteredTerms = { ...filteredLists };
    }
    
    // Generate random selections from each list
    const results = [];
    
    // Calculate how many items to pick from each category
    const enabledCategories = Object.keys(filteredTerms);
    const termsPerCategory = Math.ceil(quantity / enabledCategories.length);
    
    enabledCategories.forEach(category => {
      const terms = filteredTerms[category];
      
      // Skip empty lists
      if (!terms || terms.length === 0) return;
      
      // Randomly select terms
      const selectedTerms = selectRandomTerms(terms, termsPerCategory);
      
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