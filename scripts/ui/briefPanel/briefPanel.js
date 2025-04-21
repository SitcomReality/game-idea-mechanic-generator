import { callLLMWithPrompt } from '../../llm/callLLM.js';
import { MAKE_BRIEF } from '../../llm/prompts.js';

export function initBriefPanel(state) {
  const briefContainer = document.getElementById('brief-container');
  const generateBriefBtn = document.getElementById('generate-brief-btn');
  const copyBriefBtn = document.getElementById('copy-brief-btn');
  const downloadBriefBtn = document.getElementById('download-brief-btn');
  
  // Make brief container editable
  briefContainer.contentEditable = true;
  
  // Listen for content changes in the brief container
  briefContainer.addEventListener('input', () => {
    state.setDesignBrief(briefContainer.innerHTML);
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
    html = html.replace(/```([^`]+)```/g, (m, code) => {
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

    // Italic (*text*)
    html = html.replace(/\*(.+?)\*/g, '<em>$1</em>');

    // Unordered List (lines starting with - or *)
    // Replace consecutive lines with <ul><li>...</li>...</ul>
    html = html.replace(/((?:^[-*]\s.*$\n?)+)/gm, function (match) {
      const items = match.trim().split(/\n/).map(line => {
        return `<li>${line.replace(/^[-*]\s/, '')}</li>`;
      }).join('');
      return `<ul>${items}</ul>`;
    });

    // Numbered list (lines starting with 1. 2. etc)
    html = html.replace(/((?:^\d+\.\s.*$\n?)+)/gm, function (match) {
      const items = match.trim().split(/\n/).map(line => {
        return `<li>${line.replace(/^\d+\.\s/, '')}</li>`;
      }).join('');
      return `<ol>${items}</ol>`;
    });

    // Paragraphs: non-list, non-header, non-empty lines break into paragraphs
    // First, split into lines
    const lines = html.split('\n');
    let inListOrPre = false;
    html = lines.map(line => {
      if (
        /^<ul>|^<\/ul>|^<ol>|^<\/ol>|^<li>|^<\/li>|^<h\d>|^<\/h\d>|^<pre>|^<\/pre>/i.test(line) ||
        inListOrPre
      ) {
        // Track <pre> blocks to avoid wrapping code
        if (/<pre>/.test(line)) inListOrPre = true;
        if (/<\/pre>/.test(line)) inListOrPre = false;
        return line;
      } else if (line.trim() === '') {
        return '';
      } else {
        return `<p>${line.trim()}</p>`;
      }
    }).join('\n');

    // Remove repeated <p> tags for list items, headers, or block elements inside <p>...</p>
    // Remove <p> wrapping <ul> or <ol>
    html = html.replace(/<p>(<(ul|ol)[^>]*>[\s\S]*?<\/\2>)<\/p>/g, '$1');
    // Remove <p> wrapping <h1>..<h6> or <pre>
    html = html.replace(/<p>(<(h[1-6]|pre)[^>]*>[\s\S]*?<\/\2>)<\/p>/g, '$1');

    // Replace multiple <p></p> (empty) with nothing
    html = html.replace(/<p>\s*<\/p>/g, '');

    return html;
  }

  // Escape HTML in code
  function escapeHtml(str) {
    return str.replace(/&/g, '&amp;')
      .replace(/</g, '&lt;')
      .replace(/>/g, '&gt;');
  }
  
  // Set up Generate Brief button
  generateBriefBtn.addEventListener('click', async () => {
    generateBriefBtn.disabled = true;
    generateBriefBtn.textContent = 'Generating...';
    
    try {
      const draft = state.getDesignDraft();
      
      // Extract text from draft items
      let draftText = '';
      if (draft.length > 0) {
        if (draft[0].type === 'html') {
          // Extract text from HTML
          const tempDiv = document.createElement('div');
          tempDiv.innerHTML = draft[0].text;
          draftText = tempDiv.textContent || tempDiv.innerText || '';
        } else {
          draftText = draft.map(item => `${item.category || ''}: ${item.text}`).join('\n');
        }
      }
      
      // Call LLM to generate the brief
      const promptTemplate = MAKE_BRIEF;
      const filledPrompt = promptTemplate.replace('{{draftContent}}', draftText);
      
      const generatedBrief = await callLLMWithPrompt(filledPrompt);

      // Render with basic Markdown → HTML formatting for readability
      const formatted = renderMarkdownToHTML(generatedBrief);

      // Update the brief container
      briefContainer.innerHTML = formatted;

      // Update state
      state.setDesignBrief(generatedBrief); // Save as original markdown
    } catch (error) {
      console.error('Error generating brief:', error);
      // Show error message
      const errorDiv = document.createElement('div');
      errorDiv.className = 'error-message';
      errorDiv.textContent = `Error: ${error.message}`;
      briefContainer.appendChild(errorDiv);
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
    
    // If user is currently editing, don't disturb them
    if (document.activeElement === briefContainer) {
      return;
    }
    
    briefContainer.innerHTML = renderMarkdownToHTML(brief);
  });
  
  // Initialize with empty state
  state.setDesignBrief('');
}