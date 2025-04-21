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

    const categoriesText = categories.size > 0
      ? `Focus on these categories: ${Array.from(categories).join(', ')}.`
      : 'Generate a diverse mix of mechanics, themes, and settings.';

    const userText = customText
      ? `Incorporate these concepts if possible: ${customText}`
      : '';

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
          content: `Generate ${quantity} unique game mechanics, themes, or setting elements. ${categoriesText} ${userText} ${draftContextText}

          Format your response as a JSON array of objects, each with:
          - category: The category (Mechanic, Theme, Setting, System, etc.)
          - text: The name or brief description of the game element
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