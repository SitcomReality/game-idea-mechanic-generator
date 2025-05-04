// New file for random inspiration tab functionality
import { callLLMWithPrompt } from '../../llm/callLLM.js';

export function initRandomInspirationTab(state) {
  // Get DOM elements
  const randomPromptBtn = document.getElementById('generate-random-prompt-btn');
  const randomTypeSelect = document.getElementById('random-type-select');
  const useSelectedTagsCheckbox = document.getElementById('use-selected-tags');
  const randomStyleSelect = document.getElementById('random-style-select');
  const randomAspectRatioSelect = document.getElementById('random-aspect-ratio-select');
  
  // Handler for random inspiration generation
  async function generateRandomInspiration() {
    // Show loading state
    const imageDisplayArea = document.getElementById('image-display-area');
    const imagePlaceholder = document.getElementById('image-placeholder');
    const placeholderText = document.getElementById('image-placeholder-text');
    const loadingSpinner = document.getElementById('image-loading-spinner');
    const promptDisplayArea = document.getElementById('image-prompt-display-area');
    const promptTextElement = document.getElementById('image-prompt-text');
    const generatedImage = document.getElementById('generated-image');
    
    // Set loading state
    randomPromptBtn.disabled = true;
    randomPromptBtn.textContent = 'Generating...';
    loadingSpinner.style.display = 'block';
    placeholderText.textContent = 'Generating random inspiration...';
    imagePlaceholder.style.display = 'flex';
    generatedImage.style.display = 'none';
    promptDisplayArea.style.display = 'none';
    
    try {
      // Build the prompt for the LLM
      let promptBase = "Generate a creative and detailed image prompt for game concept art. ";
      
      // Add type modifier
      const randomType = randomTypeSelect.value;
      switch (randomType) {
        case 'screenshot':
          promptBase += "Make it look like a screenshot from a game. ";
          break;
        case 'ui':
          promptBase += "Create a game UI/UX design. ";
          break;
        case 'character':
          promptBase += "Design a character for a game. ";
          break;
        case 'environment':
          promptBase += "Create a game environment or level. ";
          break;
        case 'concept':
        default:
          promptBase += "Create general concept art for a game. ";
          break;
      }
      
      // Add selected tags if requested
      if (useSelectedTagsCheckbox.checked) {
        const selectedTags = Array.from(state.getSelectedTags());
        if (selectedTags.length > 0) {
          promptBase += `Incorporate these elements or themes: ${selectedTags.join(', ')}. `;
        }
      }
      
      // Add style modifier
      const style = randomStyleSelect.value;
      if (style !== 'any') {
        promptBase += `Use a ${style} art style. `;
      }
      
      // Generate the image prompt using the LLM
      const imagePrompt = await callLLMWithPrompt(promptBase + "The prompt should be detailed, visual, and not include any meta-instructions.");
      
      // Display the prompt
      promptTextElement.textContent = imagePrompt;
      promptDisplayArea.style.display = 'block';
      
      // Generate the image
      placeholderText.textContent = 'Generating image...';
      
      const imageResult = await websim.imageGen({
        prompt: imagePrompt,
        aspect_ratio: randomAspectRatioSelect.value,
      });
      
      // Display the image
      generatedImage.onload = () => {
        generatedImage.style.display = 'block';
        imagePlaceholder.style.display = 'none';
      };
      generatedImage.onerror = () => {
        placeholderText.textContent = 'Failed to load generated image.';
        imagePlaceholder.style.display = 'flex';
        loadingSpinner.style.display = 'none';
      };
      generatedImage.src = imageResult.url;
      
    } catch (error) {
      console.error('Random inspiration generation failed:', error);
      placeholderText.textContent = `Error: ${error.message || 'An unknown error occurred'}`;
      loadingSpinner.style.display = 'none';
    } finally {
      randomPromptBtn.disabled = false;
      randomPromptBtn.textContent = 'Generate Random Inspiration';
    }
  }
  
  // Set up event listener
  if (randomPromptBtn) {
    randomPromptBtn.addEventListener('click', generateRandomInspiration);
  } else {
    console.warn('Random inspiration button not found in DOM');
  }
}