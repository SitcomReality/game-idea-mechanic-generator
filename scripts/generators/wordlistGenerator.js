import { getWordlists } from '../data/wordlistLoader.js';

// Helper function to randomly select items from an array
function selectRandomItems(arr, count) {
  if (!arr || arr.length === 0) return [];
  const shuffled = [...arr].sort(() => 0.5 - Math.random());
  return shuffled.slice(0, Math.min(count, shuffled.length));
}

// Helper function to check if a path matches selected tags
function pathMatchesTags(pathString, selectedTags) {
  if (selectedTags.size === 0) {
    return true; // No tags selected, matches everything
  }
  for (const tag of selectedTags) {
    // Check if path is the tag, a descendant, or an ancestor
    if (pathString === tag || pathString.startsWith(tag + '.') || tag.startsWith(pathString + '.')) {
      return true;
    }
  }
  return false;
}

// Recursive function to collect terms from the hierarchical structure
function collectTerms(node, currentPath, allCollectedTerms, selectedTags, enabledSections) {
  if (!node || typeof node !== 'object') {
    return;
  }

  const pathString = currentPath.join('.');
  const topLevelCategory = currentPath[0];

  // Check if the top-level category is enabled
  if (!enabledSections[topLevelCategory.toLowerCase()]) {
    return; // Skip this entire branch if the top-level section is disabled
  }

  // Check if the current path matches any selected tags (if any exist)
  if (selectedTags.size > 0 && !pathMatchesTags(pathString, selectedTags)) {
     // If tags are selected, but this path doesn't match, check children
     // but don't add terms from *this* node unless it's an exact match or ancestor.
     // However, a simpler approach for now: if path doesn't match, only recurse if it's an *ancestor* of a selected tag.
     let isAncestor = false;
     for (const tag of selectedTags) {
       if (tag.startsWith(pathString + '.')) {
         isAncestor = true;
         break;
       }
     }
     if (!isAncestor) return; // Stop traversing this branch if it doesn't match and isn't an ancestor
  }


  // Add terms from the current node if they exist and the path is valid
  if (Array.isArray(node._terms)) {
      // Only add if the path is directly relevant (exact match or descendant of a selected tag)
      if (pathMatchesTags(pathString, selectedTags)) {
        node._terms.forEach(term => {
          allCollectedTerms.push({
            // Use the top-level category for consistency
            category: topLevelCategory,
            text: term.text,
            description: term.description || '',
            // Add the full path as a tag for potential future use/filtering
            tags: [pathString]
          });
        });
      }
  }

  // Recurse into child nodes
  for (const key in node) {
    if (key !== '_terms') {
      collectTerms(node[key], [...currentPath, key], allCollectedTerms, selectedTags, enabledSections);
    }
  }
}

export async function generateIdeasFromWordlists(selectedTags, quantity, enabledSections) {
  try {
    const wordlists = await getWordlists();
    const allCollectedTerms = [];

    // Start collecting terms from the root of each top-level category
    for (const topLevelCategory in wordlists) {
      collectTerms(
        wordlists[topLevelCategory],
        [topLevelCategory], // Start path with the top-level category name
        allCollectedTerms,
        selectedTags,
        enabledSections
      );
    }

    // Deduplicate terms (based on text and category) in case they appear multiple times
    const uniqueTerms = Array.from(new Map(allCollectedTerms.map(term => [`${term.category}:${term.text}`, term])).values());


    if (uniqueTerms.length === 0) {
       console.warn('No terms found matching the criteria:', { selectedTags, enabledSections });
       // Return empty array or throw an error depending on desired behavior
       return [];
      // throw new Error('No wordlist terms found matching the current filters.');
    }

    // Select the requested quantity randomly from the collected terms
    const results = selectRandomItems(uniqueTerms, quantity);

    return results;

  } catch (error) {
    console.error('Error generating ideas from wordlists:', error);
    // Rethrow or handle more gracefully
    throw new Error(`Wordlist generation failed: ${error.message}`);
  }
}