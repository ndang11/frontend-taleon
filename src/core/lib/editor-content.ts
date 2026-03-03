export type TipTapNode = {
  type?: string;
  text?: string;
  marks?: Array<{ type?: string; attrs?: Record<string, unknown> }>;
  attrs?: Record<string, unknown>;
  content?: TipTapNode[];
};

export type TipTapDoc = {
  type?: string;
  content?: TipTapNode[];
};

const ENTITY_MAP: Record<string, string> = {
  "&nbsp;": " ",
  "&amp;": "&",
  "&lt;": "<",
  "&gt;": ">",
  "&quot;": '"',
  "&#39;": "'",
};

function decodeHtmlEntities(value: string): string {
  return value.replace(/&nbsp;|&amp;|&lt;|&gt;|&quot;|&#39;/g, (entity) => {
    return ENTITY_MAP[entity] ?? entity;
  });
}

function escapeHtml(value: string): string {
  return value
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;")
    .replace(/'/g, "&#39;");
}

function stripHtml(value: string): string {
  return decodeHtmlEntities(value.replace(/<[^>]*>/g, " "))
    .replace(/\s+/g, " ")
    .trim();
}

export function isTipTapDoc(content: unknown): content is TipTapDoc {
  return (
    typeof content === "object" &&
    content !== null &&
    (content as TipTapDoc).type === "doc" &&
    Array.isArray((content as TipTapDoc).content)
  );
}

function applyMarks(text: string, marks?: TipTapNode["marks"]): string {
  if (!marks || marks.length === 0) return text;

  return marks.reduce((acc, mark) => {
    switch (mark.type) {
      case "bold":
        return `<strong>${acc}</strong>`;
      case "italic":
        return `<em>${acc}</em>`;
      case "underline":
        return `<u>${acc}</u>`;
      case "strike":
        return `<s>${acc}</s>`;
      case "code":
        return `<code>${acc}</code>`;
      case "link": {
        const href =
          typeof mark.attrs?.href === "string" ? mark.attrs.href : "";
        const safeHref = href.replace(/"/g, "");
        return `<a href="${safeHref}">${acc}</a>`;
      }
      default:
        return acc;
    }
  }, text);
}

function renderNodesToHtml(nodes: TipTapNode[] = []): string {
  return nodes
    .map((node) => {
      const childrenHtml = renderNodesToHtml(node.content || []);

      switch (node.type) {
        case "text": {
          const escaped = escapeHtml(node.text || "");
          return applyMarks(escaped, node.marks);
        }
        case "paragraph":
          return `<p>${childrenHtml}</p>`;
        case "heading": {
          const level = Number(node.attrs?.level) || 2;
          const safeLevel = level >= 1 && level <= 6 ? level : 2;
          return `<h${safeLevel}>${childrenHtml}</h${safeLevel}>`;
        }
        case "bulletList":
          return `<ul>${childrenHtml}</ul>`;
        case "orderedList":
          return `<ol>${childrenHtml}</ol>`;
        case "listItem":
          return `<li>${childrenHtml}</li>`;
        case "blockquote":
          return `<blockquote>${childrenHtml}</blockquote>`;
        case "codeBlock":
          return `<pre><code>${childrenHtml}</code></pre>`;
        case "horizontalRule":
          return "<hr/>";
        case "hardBreak":
          return "<br/>";
        case "image": {
          const src = typeof node.attrs?.src === "string" ? node.attrs.src : "";
          const alt = typeof node.attrs?.alt === "string" ? node.attrs.alt : "";
          if (!src) return "";
          return `<img src="${src.replace(/"/g, "")}" alt="${escapeHtml(alt)}"/>`;
        }
        default:
          return childrenHtml;
      }
    })
    .join("");
}

function extractTextFromNodes(nodes: TipTapNode[] = []): string {
  return nodes
    .map((node) => {
      if (node.type === "text" && node.text) {
        return node.text;
      }

      const childText = extractTextFromNodes(node.content || []);
      if (
        [
          "paragraph",
          "heading",
          "listItem",
          "blockquote",
          "codeBlock",
        ].includes(node.type || "")
      ) {
        return `${childText} `;
      }

      return childText;
    })
    .join(" ")
    .replace(/\s+/g, " ")
    .trim();
}

function parseJsonContent(content: string): unknown {
  const trimmed = content.trim();
  if (!trimmed.startsWith("{") && !trimmed.startsWith("[")) {
    return null;
  }

  try {
    return JSON.parse(trimmed);
  } catch {
    return null;
  }
}

function fromEditorJsBlocks(content: { blocks?: any[] }): {
  html: string;
  text: string;
} {
  const blocks = Array.isArray(content.blocks) ? content.blocks : [];

  const html = blocks
    .map((block) => {
      if (block?.type === "header") {
        const level = Number(block?.data?.level) || 2;
        const safeLevel = level >= 1 && level <= 6 ? level : 2;
        return `<h${safeLevel}>${block?.data?.text || ""}</h${safeLevel}>`;
      }

      if (block?.type === "paragraph" || block?.type === "text") {
        return `<p>${block?.data?.text || ""}</p>`;
      }

      return "";
    })
    .join("");

  const text = stripHtml(html);
  return { html, text };
}

export function contentToHtml(content: unknown): string {
  if (!content) return "";

  if (typeof content === "string") {
    const parsed = parseJsonContent(content);

    if (isTipTapDoc(parsed)) {
      return renderNodesToHtml(parsed.content || []);
    }

    if (
      parsed &&
      typeof parsed === "object" &&
      Array.isArray((parsed as any).blocks)
    ) {
      return fromEditorJsBlocks(parsed as { blocks?: any[] }).html;
    }

    if (/<[^>]+>/.test(content)) {
      return content;
    }

    const plainText = content.trim();
    return plainText ? `<p>${escapeHtml(plainText)}</p>` : "";
  }

  if (isTipTapDoc(content)) {
    return renderNodesToHtml(content.content || []);
  }

  if (
    typeof content === "object" &&
    content !== null &&
    Array.isArray((content as any).blocks)
  ) {
    return fromEditorJsBlocks(content as { blocks?: any[] }).html;
  }

  return "";
}

export function contentToPlainText(content: unknown): string {
  if (!content) return "";

  if (typeof content === "string") {
    const parsed = parseJsonContent(content);

    if (isTipTapDoc(parsed)) {
      return extractTextFromNodes(parsed.content || []);
    }

    if (
      parsed &&
      typeof parsed === "object" &&
      Array.isArray((parsed as any).blocks)
    ) {
      return fromEditorJsBlocks(parsed as { blocks?: any[] }).text;
    }

    return stripHtml(content);
  }

  if (isTipTapDoc(content)) {
    return extractTextFromNodes(content.content || []);
  }

  if (
    typeof content === "object" &&
    content !== null &&
    Array.isArray((content as any).blocks)
  ) {
    return fromEditorJsBlocks(content as { blocks?: any[] }).text;
  }

  return "";
}

export function buildPostTitle(
  title: string | undefined,
  content: unknown,
): string {
  const candidateTitle = (title || "").trim();
  if (candidateTitle) return candidateTitle;

  const text = contentToPlainText(content);
  if (!text) return "Untitled Story";

  const words = text.split(/\s+/).filter(Boolean).slice(0, 8);
  if (words.length === 0) return "Untitled Story";

  return words.join(" ");
}

export function extractFirstImageSrc(content: unknown): string | null {
  const html = contentToHtml(content);
  if (!html) return null;

  const imgMatch = html.match(
    /<img[^>]+src\s*=\s*(?:"([^"]+)"|'([^']+)'|([^\s>]+))/i,
  );

  if (!imgMatch) return null;

  return (imgMatch[1] || imgMatch[2] || imgMatch[3] || "").trim() || null;
}

export function createExcerpt(
  content: unknown,
  maxLength: number = 200,
): string {
  const text = contentToPlainText(content);
  if (!text) return "";

  if (text.length <= maxLength) return text;
  return `${text.slice(0, maxLength).trimEnd()}...`;
}
