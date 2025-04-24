// New file to handle dynamic brief prompt generation

export function generateBriefPrompt(draftContent, options) {
  let prompt = `Transform the following game concept/draft into the requested output format, formatted using Markdown.\n\n`;
  prompt += `Input Game Concept/Draft:\n---\n${draftContent}\n---\n\n`;

  // --- Brief Focus ---
  switch (options.briefType) {
    case 'synopsis':
      prompt += `Generate a **Short Synopsis / Overview** (1-3 paragraphs) suitable for a pitch or quick summary. Focus on the core concept, player experience, and unique selling points. Avoid deep technical details or exhaustive feature lists.\n`;
      break;
    case 'loop':
      prompt += `Focus specifically on defining the **Core Gameplay Loop**. Describe the primary actions the player takes repeatedly and how these actions connect.\n`;
      break;
    case 'mechanics':
      prompt += `Focus primarily on detailing the **Core Mechanics**. List and explain the key gameplay systems and player interactions derived from the draft.\n`;
      break;
    case 'narrative':
       prompt += `Focus on outlining the **Narrative Structure and Key Themes**. Describe the potential story, setting context, and thematic elements present in the draft.\n`;
       break;
    case 'full':
    default:
      prompt += `Create a **Full Game Design Brief**. Structure it professionally as a starting point for development.\n`;
      break;
  }

  // --- Standard Sections (Adjusted by Focus) ---
  // Add standard sections *only* if it's a 'full' brief or a focused brief that needs them. Synopsis should be more free-form.
  if (options.briefType !== 'synopsis') {
    prompt += `Include the following standard sections, adapting their depth based on the requested focus:\n`;
    prompt += `- **Game Overview / High Concept:** (1-2 sentences summarizing the core idea)\n`;
    if (options.briefType === 'full' || options.briefType === 'mechanics') {
      prompt += `- **Core Mechanics:** (Bulleted list of main gameplay systems)\n`;
    }
    if (options.briefType === 'full' || options.briefType === 'loop') {
       prompt += `- **Core Gameplay Loop:** (Describe the player's main cycle of actions)\n`;
    }
    prompt += `- **Player Experience:** (What the player does, feels, experiences)\n`;
    if (options.briefType === 'full' || options.briefType === 'narrative') {
       prompt += `- **Theme & Setting:** (Brief description of the world and mood)\n`;
    }
  }


  // --- Optional Sections (Only for 'full' brief) ---
  if (options.briefType === 'full') {
    let optionalSections = [];
    if (options.includeTargetAudience) {
      optionalSections.push("- **Target Audience:** (Who is this game for?)");
    }
    if (options.includeTechnical) {
      optionalSections.push(`- **Technical Considerations:** (Platform targets, key tech challenges based on the '${options.technicalContext}' context)`);
    }
    if (options.includeFileStructure && options.technicalContext === 'web') {
      optionalSections.push("- **Suggested Web Project Structure:** (Basic folder/file layout for a JS webgame)");
    } else if (options.includeFileStructure) {
       optionalSections.push("- **Suggested Project Structure:** (General code/asset organization)");
    }

    if (optionalSections.length > 0) {
      prompt += `\nOptionally include these sections if relevant:\n`;
      prompt += optionalSections.join('\n') + '\n';
    }
  }

  // --- General Instructions ---
  prompt += `\n**Instructions:**\n`;
  prompt += `- Base the output *only* on the provided Input Game Concept/Draft. Do not invent features not clearly implied.\n`;
  prompt += `- Use clear, concise language suitable for the requested format (Synopsis vs. Brief).\n`;
  prompt += `- Format the entire output using Markdown (headers, lists, bold text, etc.).\n`;
  if (options.briefType === 'full' && options.technicalContext === 'web') {
     prompt += `- For Technical Considerations, focus on aspects relevant to web development (e.g., DOM manipulation, canvas, JS libraries, performance).\n`;
  }
  prompt += `- Keep the output focused and avoid unnecessary jargon.\n`;
  if (options.briefType === 'synopsis') {
    prompt += `- Ensure the synopsis is engaging and easy to understand for someone unfamiliar with the concept.\n`;
  }

  return prompt;
}