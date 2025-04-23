export const GENERATE_GAME_TITLE = 'Generate a game title based on the following draft content: {{draftContent}}';

export async function callLLMWithPrompt(prompt) {
  try {
    const completion = await websim.chat.completions.create({
      messages: [
        {
          role: "system",
          content: "You are an expert game designer with years of experience creating compelling game mechanics, themes, and systems. Your specialty is writing clear, concise, and actionable game design documents."
        },
        {
          role: "user",
          content: prompt
        }
      ]
    });

    return completion.content;
  } catch (error) {
    console.error('LLM call failed:', error);
    throw new Error(`LLM request failed: ${error.message}`);
  }
}

export async function generateGameIdea(parameters) {
  try {
    const { categories, quantity, customText, draftContext, ideaDetailLevel } = parameters;

    // Determine instruction based on input
    let primaryInstruction = '';
    const hasCategories = categories && categories.size > 0;
    const hasCustomText = customText && customText.trim() !== '';

    if (hasCategories && hasCustomText) {
      primaryInstruction = `Focus on these categories/tags: ${Array.from(categories).join(', ')}. Also incorporate these custom concepts: ${customText}`;
    } else if (hasCategories) {
      primaryInstruction = `Focus on these categories/tags: ${Array.from(categories).join(', ')}.`;
    } else if (hasCustomText) {
      primaryInstruction = `Focus on these custom concepts: ${customText}`;
    } else {
      // No tags or custom text provided
      primaryInstruction = 'Generate a diverse mix of random mechanics, themes, settings, or other game elements.';
    }

    const draftContextText = draftContext && draftContext.trim() !== ''
      ? `Generate ideas that complement or build upon the following existing design draft elements:\n${draftContext}`
      : '';

    let descriptionInstruction = "description: A slightly longer explanation (1-2 sentences) of how it works or what it means";
    if (ideaDetailLevel === 'brief') {
      descriptionInstruction = "description: A very short phrase (3-7 words) explaining the core concept.";
    } else if (ideaDetailLevel === 'detailed') {
      descriptionInstruction = "description: A more detailed explanation (2-4 sentences) exploring nuances, potential applications, or related concepts.";
    }

    const completion = await websim.chat.completions.create({
      messages: [
        {
          role: "system",
          content: `You are an expert game designer who specializes in generating creative game ideas and mechanics that build upon existing concepts. Format your response as JSON with category, text, and description fields. Adjust the length of the description based on user preference.`
        },
        {
          role: "user",
          content: `Generate ${quantity} unique game elements. ${primaryInstruction} ${draftContextText}

          Format your response as a JSON array of objects, each with:
          - category: The category (e.g., Mechanic, Narrative Theme, Setting/Context, UI, etc.) or a specific tag path if relevant (e.g., Mechanic.Combat.Melee).
          - text: The name or brief description of the game element.
          - ${descriptionInstruction}`
        }
      ],
      json: true
    });

    return JSON.parse(completion.content);
  } catch (error) {
    console.error('Game idea generation failed:', error);
    throw new Error(`Failed to generate game ideas: ${error.message}`);
  }
}

export async function generateGameTitleFromDraft(draftContent) {
  try {
    if (!draftContent || draftContent.trim() === '') {
        throw new Error("Draft content is empty, cannot generate title.");
    }

    const promptTemplate = GENERATE_GAME_TITLE; 
    const filledPrompt = promptTemplate.replace('{{draftContent}}', draftContent);

    const completion = await websim.chat.completions.create({
      messages: [
        {
          role: "system",
          content: "You are a creative copywriter specializing in naming video games. You generate catchy and relevant titles based on game concepts. You will be provided with a description of a game (or some specific facets/mechanics) of a game and you should respond only with a suitable title."
        },
        {
          role: "user",
          content: "Invent a title for this game: " + filledPrompt
        }
      ],
      json: true 
    });

    const suggestedTitle = JSON.parse(completion.content);

    if (!suggestedTitle || suggestedTitle.length === 0) {
        console.warn("LLM returned an empty string or didn't respond, using a default title.");
        return ["Generated Title", "Concept Quest", "Draft Dash"][Math.floor(Math.random() * 3)]; 
    }

    return suggestedTitle;

  } catch (error) {
    console.error('Game title generation failed:', error);
    return ["Creative Spark", "Concept Forge", "Idea Prime"][Math.floor(Math.random() * 3)];
  }
}