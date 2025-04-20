export const COHERE_DRAFT = `
Take the following game design notes, fragments, or keywords and transform them into a coherent, well-structured game concept.

Your task is to create a fluid, logical connection between these elements without changing their core intent.
Focus on creating a coherent gameplay loop that incorporates these mechanics/themes.

Game Design Elements:
{{draftContent}}

Return a cohesive paragraph or two that ties these elements together into a compelling game concept.
Keep your response focused and concise. Don't add major new mechanics that weren't in the original list.
`;

export const MAKE_BRIEF = `
Transform the following game concept into a structured Game Design Brief.

The brief should be in Markdown format and include these sections:
- Game Overview (high concept, 1-2 sentences)
- Core Mechanics (bulleted list of the main gameplay systems)
- Player Experience (what the player does, feels, experiences)
- Theme & Setting
- Target Audience
- Technical Requirements (broad platform targets, major technical considerations)

Input Game Concept:
{{draftContent}}

Format the response as a professional design brief that a development team could use as a starting point.
Use the existing ideas only - don't invent completely new features not implied by the concept.
Keep the brief concise but complete.
`;

export const RAW_IDEAS = `
Generate a set of creative, diverse game mechanics, themes, or setting elements based on the following parameters:

Categories: {{categories}}
Quantity: {{quantity}}
Custom Elements: {{customText}}

For each element, provide:
1. A name or short description (1-5 words)
2. The category it belongs to
3. A brief explanation of how it works or what it signifies

Focus on elements that could create interesting gameplay experiences, narrative potential, or unique player interactions.
Aim for a mix of conventional and innovative ideas.
`;

