import { callLLMWithPrompt } from '../../llm/callLLM.js';
import { generateBriefPrompt } from '../../llm/briefPrompts.js'; // Updated import

export function initBriefPanel(state) {
  const briefContainer = document.getElementById('brief-container');
  const generateBriefBtn = document.getElementById('generate-brief-btn');
  const copyBriefBtn = document.getElementById('copy-brief-btn');
  const downloadBriefBtn = document.getElementById('download-brief-btn');

  // Brief Options Elements
  const briefTypeSelect = document.getElementById('brief-type-select');
  const briefSectionTogglesContainer = document.getElementById('brief-section-toggles');
  const briefTechContextSelect = document.getElementById('brief-tech-context-select');

  // Make brief container editable
  briefContainer.contentEditable = true;

  // --- Event Listeners for Options ---

  briefTypeSelect.addEventListener('change', (e) => {
    state.setBriefOption('briefType', e.target.value);
  });

  briefTechContextSelect.addEventListener('change', (e) => {
    state.setBriefOption('technicalContext', e.target.value);
  });

  // Add listeners for section toggles
  briefSectionTogglesContainer.querySelectorAll('input[type="checkbox"]').forEach(checkbox => {
    const sectionKey = checkbox.dataset.section;
    checkbox.addEventListener('change', (e) => {
      // Map dataset key to state key (camelCase)
      const stateKey = `include${sectionKey.charAt(0).toUpperCase() + sectionKey.slice(1)}`;
      state.setBriefOption(stateKey, e.target.checked);
    });
  });

  // --- State Subscription for Options ---

  state.subscribe('briefOptions', (options) => {
    // Sync UI with state
    briefTypeSelect.value = options.briefType;
    briefTechContextSelect.value = options.technicalContext;

    briefSectionTogglesContainer.querySelectorAll('input[type="checkbox"]').forEach(checkbox => {
      const sectionKey = checkbox.dataset.section;
      const stateKey = `include${sectionKey.charAt(0).toUpperCase() + sectionKey.slice(1)}`;
      checkbox.checked = options[stateKey];
    });
  });

  // Listen for content changes in the brief container
  briefContainer.addEventListener('input', () => {
    // NOTE: If the user edits the HTML directly, saving it back to state
    // might overwrite the original Markdown. This interaction needs careful consideration.
    // For now, we assume manual edits are intended to be kept as HTML.
    // To preserve Markdown, we'd need to avoid direct editing or implement
    // a Markdown editor component.
    // Let's stick to saving the *original markdown* from generation,
    // and treat edits as transient HTML display changes.
    // state.setDesignBrief(briefContainer.innerHTML); // Avoid this for now
  });

  /**
   * Convert Markdown to simple HTML. Only basic structure,
   * e.g., #, ##, ###, lists, bold, italics, paragraphs, code, etc.
   * For this small app, use a super-lightweight converter.
   */
  function renderMarkdownToHTML(markdown) {
    if (!markdown) return '';

    let html = markdown;

    // Code blocks (```...```)
    html = html.replace(/```(.*?)\n([\s\S]*?)\n```/g, (m, lang, code) => {
      const languageClass = lang ? ` class="language-${escapeHtml(lang.trim())}"` : '';
      return `<pre><code${languageClass}>${escapeHtml(code.trim())}</code></pre>`;
    });
    // Handle ```code``` without lang
    html = html.replace(/```([\s\S]*?)```/g, (m, code) => {
      return `<pre><code>${escapeHtml(code.trim())}</code></pre>`;
    });

    // Inline code (`code`)
    html = html.replace(/`([^`]+?)`/g, (m, code) => {
      return `<code>${escapeHtml(code.trim())}</code>`;
    });

    // Headers
    html = html.replace(/^###### (.*)$/gm, '<h6>$1</h6>');
    html = html.replace(/^##### (.*)$/gm, '<h5>$1</h5>');
    html = html.replace(/^#### (.*)$/gm, '<h4>$1</h4>');
    html = html.replace(/^### (.*)$/gm, '<h3>$1</h3>');
    html = html.replace(/^## (.*)$/gm, '<h2>$1</h2>');
    html = html.replace(/^# (.*)$/gm, '<h1>$1</h1>');

    // Bold (**text**)
    html = html.replace(/\*\*(.+?)\*\*/g, '<strong>$1</strong>');

    // Italic (*text* or _text_)
    html = html.replace(/(?<!\\)[*_](.+?)(?<!\\)[*_]/g, '<em>$1</em>');

    // Unordered List (lines starting with -, *, +)
    html = html.replace(/((?:^[*\-+] \s*.*(?:\n|$))+)/gm, function (match) {
      const items = match.trim().split(/\n/).map(line => {
        // Handle nested lists slightly better by keeping indentation
        const content = line.replace(/^[*\-+] \s*/, '');
        return `<li>${content}</li>`; // Process content recursively? No, keep simple.
      }).join('');
      return `<ul>${items}</ul>`;
    });

    // Numbered list (lines starting with 1. 2. etc)
    html = html.replace(/((?:^\d+\. \s*.*(?:\n|$))+)/gm, function (match) {
      const items = match.trim().split(/\n/).map(line => {
        const content = line.replace(/^\d+\. \s*/, '');
        return `<li>${content}</li>`;
      }).join('');
      return `<ol>${items}</ol>`;
    });

    // Paragraphs: Treat consecutive non-list, non-header, non-empty lines as paragraphs
    const blocks = html.split(/(\n\s*\n)/); // Split by double newlines
    html = blocks.map(block => {
      block = block.trim();
      if (!block) return '';
      // Check if it's already an HTML block element
      if (/^<(ul|ol|li|h[1-6]|pre|blockquote|hr|p)/i.test(block)) {
        return block; // Don't wrap existing block elements
      }
      // Wrap remaining lines in <p> tags
      return `<p>${block.replace(/\n/g, '<br>')}</p>`; // Use <br> for single line breaks within paragraphs
    }).join('\n'); // Re-join blocks

    // Clean up potential issues like <p><ul>...</ul></p>
    html = html.replace(/<p>(<(ul|ol|li|h[1-6]|pre|blockquote|hr)[^>]*>[\s\S]*?<\/\2>)<\/p>/gi, '$1');
    // Remove empty paragraphs
    html = html.replace(/<p>\s*<\/p>/g, '');


    return html;
  }

  // Escape HTML in code
  function escapeHtml(str) {
    return str.replace(/&/g, '&amp;')
      .replace(/</g, '&lt;')
      .replace(/>/g, '&gt;')
      .replace(/"/g, '&quot;')
      .replace(/'/g, '&#039;');
  }

  // Set up Generate Brief button
  generateBriefBtn.addEventListener('click', async () => {
    generateBriefBtn.disabled = true;
    generateBriefBtn.textContent = 'Generating...';

    try {
      const draft = state.getDesignDraft();
      const briefOptions = state.getBriefOptions(); // Get current options

      // Extract text from draft items
      let draftText = '';
      if (draft.length > 0) {
        if (draft[0].type === 'html') {
          // Extract text from HTML more robustly
          const tempDiv = document.createElement('div');
          tempDiv.innerHTML = draft[0].text;
          // Attempt to reconstruct paragraph breaks
          tempDiv.querySelectorAll('p, br, div, li').forEach(el => {
            el.appendChild(document.createTextNode('\n'));
          });
          draftText = tempDiv.textContent || tempDiv.innerText || '';
        } else {
          draftText = draft.map(item => `${item.category || ''}: ${item.text}`).join('\n');
        }
      }

      // Call LLM to generate the brief using dynamic prompt
      const filledPrompt = generateBriefPrompt(draftText, briefOptions); // Use the new prompt generator
      const generatedBrief = await callLLMWithPrompt(filledPrompt);

      // Render with basic Markdown → HTML formatting for readability
      const formatted = renderMarkdownToHTML(generatedBrief);

      // Update the brief container
      briefContainer.innerHTML = formatted;

      // Update state with the raw Markdown
      state.setDesignBrief(generatedBrief);

    } catch (error) {
      console.error('Error generating brief:', error);
      // Show error message
      const errorDiv = document.createElement('div');
      errorDiv.className = 'error-message';
      errorDiv.textContent = `Error generating brief: ${error.message}`;
      briefContainer.appendChild(errorDiv);
      state.setDesignBrief(''); // Clear state on error
    } finally {
      generateBriefBtn.disabled = false;
      generateBriefBtn.textContent = 'Generate Brief';
    }
  });

  // Set up Copy button
  copyBriefBtn.addEventListener('click', () => {
    // Get Markdown from state
    const brief = state.getDesignBrief();

    // Copy to clipboard
    navigator.clipboard.writeText(brief)
      .then(() => {
        copyBriefBtn.textContent = 'Copied!';
        setTimeout(() => {
          copyBriefBtn.textContent = 'Copy';
        }, 2000);
      })
      .catch(err => {
        console.error('Failed to copy:', err);
        copyBriefBtn.textContent = 'Failed';
        setTimeout(() => {
          copyBriefBtn.textContent = 'Copy';
        }, 2000);
      });
  });

  // Set up Download button
  downloadBriefBtn.addEventListener('click', () => {
    // Download as Markdown from state
    const brief = state.getDesignBrief();
    const blob = new Blob([brief], { type: 'text/markdown' });
    const url = URL.createObjectURL(blob);

    const a = document.createElement('a');
    a.href = url;
    a.download = 'game-design-brief.md';
    document.body.appendChild(a);
    a.click();
    setTimeout(() => {
      document.body.removeChild(a);
      URL.revokeObjectURL(url);
    }, 0);
  });

  // Render brief from state (always show as formatted HTML for readability)
  state.subscribe('designBrief', (brief) => {
    // If the brief is empty, show placeholder
    if (!brief) {
      briefContainer.innerHTML = '<p class="empty-state">Generate a design brief from your draft</p>';
      return;
    }

    // If user is currently editing, don't disturb them *unless* the underlying markdown state changed
    // This check is tricky. For simplicity, we'll re-render if the markdown state changes.
    // The user might lose transient HTML edits if they don't trigger a new generation.
    // if (document.activeElement === briefContainer) {
    //   return;
    // }

    briefContainer.innerHTML = renderMarkdownToHTML(brief);
  });

  // Initialize with empty state or existing brief
  const initialBrief = state.getDesignBrief();
  if (initialBrief) {
    briefContainer.innerHTML = renderMarkdownToHTML(initialBrief);
  } else {
    briefContainer.innerHTML = '<p class="empty-state">Generate a design brief from your draft</p>';
  }

  // Initialize options UI from state - The subscribe call already handles this.
}