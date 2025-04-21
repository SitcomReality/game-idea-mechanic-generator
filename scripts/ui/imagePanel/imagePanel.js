// New file: scripts/ui/imagePanel/imagePanel.js
import { callLLMWithPrompt } from '../../llm/callLLM.js';
import { GENERATE_IMAGE_PROMPT } from '../../llm/prompts.js';

// Helper function to extract text content from different sources
function getTextFromSource(source, state) {
  switch (source) {
    case 'ideas':
      const ideas = state.getGeneratedIdeas();
      if (!ideas || ideas.length === 0) return '';
      return ideas.map(idea => `${idea.category || 'Concept'}: ${idea.text} - ${idea.description || ''}`).join('\n');

    case 'draft':
      const draft = state.getDesignDraft();
      if (!draft || draft.length === 0) return '';
      // Handle both chip-based and HTML-based drafts
      if (draft.length === 1 && draft[0]?.type === 'html') {
        const tempDiv = document.createElement('div');
        tempDiv.innerHTML = draft[0].text;
        return tempDiv.textContent || tempDiv.innerText || '';
      } else {
        return draft.map(item => `${item.category || 'Concept'}: ${item.text}${item.description ? ` (${item.description})` : ''}`).join('\n');
      }

    case 'brief':
      // Brief is stored as Markdown in state
      return state.getDesignBrief() || '';

    default:
      console.warn('Unknown image generation source:', source);
      return '';
  }
}

export function initImagePanel(state) {
  const imagePanel = document.getElementById('image-panel');
  const sourceRadios = imagePanel.querySelectorAll('input[name="image-source"]');
  const aspectRatioSelect = document.getElementById('aspect-ratio-select');
  const imageStyleInput = document.getElementById('image-style-input');
  const generateImageBtn = document.getElementById('generate-image-btn');
  const imageDisplayArea = document.getElementById('image-display-area');
  const generatedImage = document.getElementById('generated-image');
  const imagePlaceholder = document.getElementById('image-placeholder');
  const placeholderText = document.getElementById('image-placeholder-text');
  const loadingSpinner = document.getElementById('image-loading-spinner');
  const promptDisplayArea = document.getElementById('image-prompt-display-area');
  const promptTextElement = document.getElementById('image-prompt-text');
  const copyPromptBtn = document.getElementById('copy-image-prompt-btn');

  let currentImageUrl = '';
  let currentImagePrompt = '';

  function setLoading(isLoading, message = 'Generating...') {
    generateImageBtn.disabled = isLoading;
    generateImageBtn.textContent = isLoading ? message : 'Generate Image';
    loadingSpinner.style.display = isLoading ? 'block' : 'none';
    if (isLoading) {
      placeholderText.textContent = message;
      generatedImage.style.display = 'none';
      imagePlaceholder.style.display = 'flex'; // Show placeholder with spinner/message
      promptDisplayArea.style.display = 'none'; // Hide old prompt
    }
  }

  function displayError(errorMessage) {
    placeholderText.textContent = `Error: ${errorMessage}`;
    generatedImage.style.display = 'none';
    imagePlaceholder.style.display = 'flex';
    loadingSpinner.style.display = 'none';
    promptDisplayArea.style.display = 'none';
  }

  generateImageBtn.addEventListener('click', async () => {
    let selectedSource = 'ideas'; // Default
    sourceRadios.forEach(radio => {
      if (radio.checked) {
        selectedSource = radio.value;
      }
    });

    const conceptText = getTextFromSource(selectedSource, state);
    const aspectRatio = aspectRatioSelect.value;
    const styleModifiers = imageStyleInput.value.trim();

    if (!conceptText.trim()) {
      displayError(`Source '${selectedSource}' is empty.`);
      return;
    }

    setLoading(true, 'Generating image prompt...');

    try {
      // 1. Generate the Image Prompt using LLM
      let imagePromptTemplate = GENERATE_IMAGE_PROMPT;
      imagePromptTemplate = imagePromptTemplate.replace('{{conceptDescription}}', conceptText);
      imagePromptTemplate = imagePromptTemplate.replace('{{styleModifiers}}', styleModifiers);

      currentImagePrompt = await callLLMWithPrompt(imagePromptTemplate);
      promptTextElement.textContent = currentImagePrompt;
      promptDisplayArea.style.display = 'block'; // Show prompt area

      setLoading(true, 'Generating image...'); // Update loading message

      // 2. Generate the Image using the generated prompt
      const imageResult = await websim.imageGen({
        prompt: currentImagePrompt,
        aspect_ratio: aspectRatio,
      });

      currentImageUrl = imageResult.url;

      // 3. Display the Image
      generatedImage.onload = () => {
        generatedImage.style.display = 'block';
        imagePlaceholder.style.display = 'none';
        setLoading(false);
      };
      generatedImage.onerror = () => {
         displayError('Failed to load generated image.');
         setLoading(false);
      }
      generatedImage.src = currentImageUrl; // Set src after attaching onload/onerror

    } catch (error) {
      console.error('Image generation failed:', error);
      displayError(error.message || 'An unknown error occurred.');
      setLoading(false);
    }
  });

  copyPromptBtn.addEventListener('click', () => {
    if (currentImagePrompt) {
      navigator.clipboard.writeText(currentImagePrompt).then(() => {
        copyPromptBtn.textContent = 'Copied!';
        setTimeout(() => copyPromptBtn.textContent = 'Copy Prompt', 1500);
      }).catch(err => {
        console.error('Failed to copy prompt:', err);
        copyPromptBtn.textContent = 'Error';
        setTimeout(() => copyPromptBtn.textContent = 'Copy Prompt', 1500);
      });
    }
  });

  // Initial state setup can go here if needed
}