/**
 * Minimal markdown-to-HTML renderer.
 * Supports: headers, bold, italic, code blocks, inline code,
 * blockquotes, horizontal rules, unordered/ordered lists, paragraphs, links.
 */
export function renderMarkdown(md: string): string {
  let html = md;

  // Escape HTML special chars first (except in code blocks we handle separately)
  // Process code blocks FIRST to protect content
  const codeBlocks: string[] = [];
  html = html.replace(/```[\w]*\n?([\s\S]*?)```/g, (_match, code: string) => {
    const idx = codeBlocks.length;
    codeBlocks.push(`<pre><code>${escapeHtml(code.trim())}</code></pre>`);
    return `%%CODE_BLOCK_${idx}%%`;
  });

  // Inline code
  const inlineCodes: string[] = [];
  html = html.replace(/`([^`]+)`/g, (_match, code: string) => {
    const idx = inlineCodes.length;
    inlineCodes.push(`<code>${escapeHtml(code)}</code>`);
    return `%%INLINE_CODE_${idx}%%`;
  });

  // Horizontal rules
  html = html.replace(/^[-*_]{3,}\s*$/gm, "<hr>");

  // Headers
  html = html.replace(/^######\s+(.+)$/gm, "<h6>$1</h6>");
  html = html.replace(/^#####\s+(.+)$/gm, "<h5>$1</h5>");
  html = html.replace(/^####\s+(.+)$/gm, "<h4>$1</h4>");
  html = html.replace(/^###\s+(.+)$/gm, "<h3>$1</h3>");
  html = html.replace(/^##\s+(.+)$/gm, "<h2>$1</h2>");
  html = html.replace(/^#\s+(.+)$/gm, "<h1>$1</h1>");

  // Blockquotes
  html = html.replace(/^>\s+(.+)$/gm, "<blockquote>$1</blockquote>");

  // Bold + italic
  html = html.replace(/\*\*\*(.+?)\*\*\*/g, "<strong><em>$1</em></strong>");
  html = html.replace(/___(.+?)___/g, "<strong><em>$1</em></strong>");
  html = html.replace(/\*\*(.+?)\*\*/g, "<strong>$1</strong>");
  html = html.replace(/__(.+?)__/g, "<strong>$1</strong>");
  html = html.replace(/\*(.+?)\*/g, "<em>$1</em>");
  html = html.replace(/_([^_]+)_/g, "<em>$1</em>");

  // Links
  html = html.replace(
    /\[([^\]]+)\]\((https?:\/\/[^)]+)\)/g,
    '<a href="$2" target="_blank" rel="noopener noreferrer">$1</a>',
  );

  // Unordered lists
  html = html.replace(/((?:^[ \t]*[-*+]\s+.+\n?)+)/gm, (block: string) => {
    const items = block
      .trim()
      .split("\n")
      .map((line: string) => line.replace(/^[ \t]*[-*+]\s+/, "").trim())
      .filter(Boolean)
      .map((item: string) => `<li>${item}</li>`)
      .join("");
    return `<ul>${items}</ul>`;
  });

  // Ordered lists
  html = html.replace(/((?:^[ \t]*\d+\.\s+.+\n?)+)/gm, (block: string) => {
    const items = block
      .trim()
      .split("\n")
      .map((line: string) => line.replace(/^[ \t]*\d+\.\s+/, "").trim())
      .filter(Boolean)
      .map((item: string) => `<li>${item}</li>`)
      .join("");
    return `<ol>${items}</ol>`;
  });

  // Paragraphs: double newlines → paragraph breaks
  // Split into blocks and wrap non-block-elements in <p>
  const blocks = html.split(/\n\n+/);
  html = blocks
    .map((block) => {
      const trimmed = block.trim();
      if (!trimmed) return "";
      // Don't wrap if already a block element
      if (/^<(h[1-6]|ul|ol|blockquote|pre|hr|p)/.test(trimmed)) {
        return trimmed;
      }
      // Handle single newlines as <br> within paragraph
      return `<p>${trimmed.replace(/\n/g, "<br>")}</p>`;
    })
    .filter(Boolean)
    .join("\n");

  // Restore inline codes
  inlineCodes.forEach((code, i) => {
    html = html.replace(`%%INLINE_CODE_${i}%%`, code);
  });

  // Restore code blocks
  codeBlocks.forEach((block, i) => {
    html = html.replace(`%%CODE_BLOCK_${i}%%`, block);
  });

  return html;
}

function escapeHtml(str: string): string {
  return str
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;");
}

/**
 * Extract a plain-text excerpt from markdown, stripping all markup.
 */
export function markdownExcerpt(md: string, maxLen = 160): string {
  const plain = md
    .replace(/```[\s\S]*?```/g, "")
    .replace(/`[^`]+`/g, "")
    .replace(/^#{1,6}\s+/gm, "")
    .replace(/\*\*\*(.+?)\*\*\*/g, "$1")
    .replace(/\*\*(.+?)\*\*/g, "$1")
    .replace(/\*(.+?)\*/g, "$1")
    .replace(/_(.+?)_/g, "$1")
    .replace(/\[([^\]]+)\]\([^)]+\)/g, "$1")
    .replace(/^>\s+/gm, "")
    .replace(/^[-*+]\s+/gm, "")
    .replace(/\n+/g, " ")
    .trim();
  return plain.length > maxLen ? `${plain.slice(0, maxLen)}…` : plain;
}
