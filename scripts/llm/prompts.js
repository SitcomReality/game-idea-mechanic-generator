export const COHERE_DRAFT = `
Analyze the following game design elements (notes, keywords, mechanics, themes, etc.). Your goal is to synthesize these elements into a coherent description.

**Adapt your output based on the nature of the provided elements:**

*   **If the elements cover a broad range** (e.g., mechanics, theme, setting, UI), synthesize them into a concise game concept, highlighting the core gameplay loop and player experience implied by the combination.
*   **If the elements are more focused** (e.g., only mechanics, or only theme and setting), synthesize them into a focused description of that aspect. Do *not* invent a full game concept if the elements don't support it. Instead, describe how these specific elements could work together or relate to each other. For example, if given only UI elements, describe the potential user experience or interface philosophy. If given only narrative themes, describe the resulting mood or story potential.

**Input Game Design Elements:**
{{draftContent}}

**Instructions:**
- Base your synthesis *only* on the provided elements. Do not invent features not clearly implied.
- Connect the elements logically.
- If creating a game concept, keep it brief (1-3 paragraphs).
- If describing a focused aspect, be clear and concise.
- Use clear language suitable for a design document.
- Format the output using basic Markdown (paragraphs, maybe lists).
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