# Game-Idea & Mechanic Generator (GIMG)

A dark-themed, single-screen web application that allows game designers to generate, curate, and refine game ideas and mechanics with maximum granularity and control using a Language Model (LLM).

## Features

- **Three-step workflow**:
  1. **Generate Ideas**: Use an LLM to generate terms based on selected tags and options; results are editable.
  2. **Populate Design Draft**: Send edited text to LLM for coherence; user drags/keeps pieces.
  3. **Generate Design Brief**: Send draft to LLM for polished, developer-ready doc.

- **Ultra-granular feature selection** via hierarchical "Mechanic/Theme/Setting" taxonomy.
- **Dark/"emo" aesthetic**, compact layout, minimal cognitive load.
- **User-selectable content**: Toggle which output sections appear.
- **Draggable DOM chips**: All user-selectable tags, phrases, and sentences rendered as independent draggable elements.
- **Draft Context**: Use the current design draft to influence new idea generation.

## Setup

1. Clone the repository
2. Open `index.html` in a modern web browser
3. No build process required - the application runs entirely in the browser

## Architecture

- **Modular Code**: One concern = one file, with tiny, isolated modules
- **ES Modules**: Using native JavaScript modules
- **No Framework**: Built with vanilla JS + lit-html for templating (optional)

## Customization

- Modify the taxonomy in `/data/taxonomy.json`
- Adjust LLM prompts in `/scripts/llm/prompts.js`

## Contributing

1. Keep modules under ~200 LOC
2. Follow the one logical concern per file principle
3. Use ES modules; avoid dependencies unless critical

## License

MIT

