type AdfNode = {
  type?: string;
  text?: string;
  attrs?: Record<string, unknown>;
  marks?: Array<{ type: string; attrs?: Record<string, unknown> }>;
  content?: AdfNode[];
};

const escapeHtml = (value: string) => value
  .replace(/&/g, '&amp;')
  .replace(/</g, '&lt;')
  .replace(/>/g, '&gt;')
  .replace(/"/g, '&quot;')
  .replace(/'/g, '&#039;');

function renderMarks(node: AdfNode): string {
  let value = escapeHtml(node.text ?? '');
  for (const mark of node.marks ?? []) {
    if (mark.type === 'strong') value = `<strong>${value}</strong>`;
    if (mark.type === 'em') value = `<em>${value}</em>`;
    if (mark.type === 'code') value = `<code>${value}</code>`;
    if (mark.type === 'strike') value = `<s>${value}</s>`;
    if (mark.type === 'underline') value = `<u>${value}</u>`;
    if (mark.type === 'subsup' && mark.attrs?.type === 'sub') value = `<sub>${value}</sub>`;
    if (mark.type === 'subsup' && mark.attrs?.type === 'sup') value = `<sup>${value}</sup>`;
    if (mark.type === 'link') {
      const href = escapeHtml(String(mark.attrs?.href ?? '#'));
      value = `<a href="${href}" target="_blank" rel="noopener noreferrer">${value}</a>`;
    }
    if (mark.type === 'textColor') {
      value = `<span style="color:${escapeHtml(String(mark.attrs?.color ?? 'inherit'))}">${value}</span>`;
    }
    if (mark.type === 'backgroundColor') {
      value = `<span class="adf-text-highlight" style="background-color:${escapeHtml(String(mark.attrs?.color ?? 'transparent'))}">${value}</span>`;
    }
    if (mark.type === 'annotation') {
      value = `<span class="adf-annotation">${value}</span>`;
    }
  }
  return value;
}

export function adfToHtml(body: string): string {
  if (!body) return '';
  let doc: AdfNode;
  try {
    doc = JSON.parse(body);
  } catch {
    return body;
  }

  const renderChildren = (nodes: AdfNode[] = []) => nodes.map(renderNode).join('');

  function renderNode(node: AdfNode): string {
    const children = renderChildren(node.content);
    switch (node.type) {
      case 'text': return renderMarks(node);
      case 'hardBreak': return '<br>';
      case 'paragraph': return `<p>${children}</p>`;
      case 'heading': {
        const level = Math.min(6, Math.max(1, Number(node.attrs?.level ?? 2)));
        return `<h${level}>${children}</h${level}>`;
      }
      case 'bulletList': return `<ul>${children}</ul>`;
      case 'orderedList': return `<ol>${children}</ol>`;
      case 'listItem': return `<li>${children}</li>`;
      case 'blockquote': return `<blockquote>${children}</blockquote>`;
      case 'codeBlock': {
        const language = escapeHtml(String(node.attrs?.language ?? ''));
        const label = language ? `<span class="adf-code-language">${language}</span>` : '';
        return `<div class="adf-code-block">${label}<pre><code${language ? ` data-language="${language}"` : ''}>${children}</code></pre></div>`;
      }
      case 'rule': return '<hr>';
      case 'table': return `<div class="adf-table-wrap"><table class="adf-table">${children}</table></div>`;
      case 'tableRow': return `<tr>${children}</tr>`;
      case 'tableHeader': {
        const colspan = Math.max(1, Number(node.attrs?.colspan ?? 1));
        const rowspan = Math.max(1, Number(node.attrs?.rowspan ?? 1));
        const background = node.attrs?.background ? ` style="background-color:${escapeHtml(String(node.attrs.background))}"` : '';
        return `<th colspan="${colspan}" rowspan="${rowspan}"${background}>${children}</th>`;
      }
      case 'tableCell': {
        const colspan = Math.max(1, Number(node.attrs?.colspan ?? 1));
        const rowspan = Math.max(1, Number(node.attrs?.rowspan ?? 1));
        const background = node.attrs?.background ? ` style="background-color:${escapeHtml(String(node.attrs.background))}"` : '';
        return `<td colspan="${colspan}" rowspan="${rowspan}"${background}>${children}</td>`;
      }
      case 'layoutSection': return `<div class="adf-layout">${children}</div>`;
      case 'layoutColumn': {
        const width = Math.min(100, Math.max(1, Number(node.attrs?.width ?? 50)));
        return `<div class="adf-layout-column" style="--adf-column-width:${width}%">${children}</div>`;
      }
      case 'panel': {
        const type = escapeHtml(String(node.attrs?.panelType ?? 'info'));
        const icon = type === 'note' ? 'i' : type === 'success' ? '✓' : type === 'warning' ? '!' : type === 'error' ? '×' : 'i';
        return `<div class="adf-panel adf-panel-${type}" role="note"><span class="adf-panel-icon" aria-hidden="true">${icon}</span><div class="adf-panel-content">${children}</div></div>`;
      }
      case 'expand': return `<details><summary>${escapeHtml(String(node.attrs?.title ?? 'Details'))}</summary>${children}</details>`;
      case 'nestedExpand': return `<details class="adf-nested-expand"><summary>${escapeHtml(String(node.attrs?.title ?? 'Details'))}</summary>${children}</details>`;
      case 'extension':
      case 'inlineExtension': {
        const attrs = node.attrs ?? {};
        const metadata = attrs.parameters && typeof attrs.parameters === 'object'
          ? (attrs.parameters as Record<string, unknown>).macroMetadata
          : undefined;
        const title = metadata && typeof metadata === 'object'
          ? String((metadata as Record<string, unknown>).title ?? '')
          : '';
        const key = String(attrs.extensionKey ?? 'macro');
        const label = title || key.replace(/[-_]/g, ' ').replace(/\b\w/g, letter => letter.toUpperCase());
        return node.type === 'inlineExtension'
          ? `<span class="adf-inline-extension" title="${escapeHtml(label)}">${escapeHtml(label)}</span>`
          : `<div class="adf-extension-card"><span class="adf-extension-icon">⌁</span><div><strong>${escapeHtml(label)}</strong><span>Confluence macro</span></div></div>`;
      }
      case 'mediaSingle':
      case 'mediaGroup':
        return `<figure>${children}</figure>`;
      case 'media':
        return '<div class="adf-media-placeholder"><span>Media attachment</span></div>';
      case 'caption': return `<figcaption>${children}</figcaption>`;
      case 'date': return escapeHtml(String(node.attrs?.timestamp ?? ''));
      case 'mention': return `<strong>@${escapeHtml(String(node.attrs?.text ?? node.attrs?.id ?? 'user'))}</strong>`;
      case 'status': {
        const status = escapeHtml(String(node.attrs?.text ?? node.attrs?.color ?? ''));
        const color = escapeHtml(String(node.attrs?.color ?? 'neutral'));
        return `<span class="status-pill adf-status-${color}">${status}</span>`;
      }
      case 'emoji': return `<span class="adf-emoji">${escapeHtml(String(node.attrs?.shortName ?? node.attrs?.text ?? ''))}</span>`;
      case 'placeholder': return `<span class="adf-placeholder">${escapeHtml(String(node.attrs?.text ?? 'Placeholder'))}</span>`;
      case 'inlineCard': {
        const url = String(node.attrs?.url ?? '');
        return `<a class="adf-card" href="${escapeHtml(url)}" target="_blank" rel="noopener noreferrer">${escapeHtml(url)}</a>`;
      }
      case 'blockCard': {
        const url = String(node.attrs?.url ?? '');
        return `<div class="adf-card-block"><a href="${escapeHtml(url)}" target="_blank" rel="noopener noreferrer">${escapeHtml(url)}</a></div>`;
      }
      case 'taskList': return `<div class="adf-task-list" role="list">${children}</div>`;
      case 'taskItem': {
        const state = String(node.attrs?.state ?? 'TODO');
        return `<div class="adf-task-item" role="listitem"><span class="${state === 'DONE' ? 'done' : ''}" aria-label="${state === 'DONE' ? 'Complete' : 'Incomplete'}">${state === 'DONE' ? '✓' : ''}</span><div>${children}</div></div>`;
      }
      case 'decisionList': return `<div class="adf-decision-list">${children}</div>`;
      case 'decisionItem':
        return `<div class="adf-decision-item"><span aria-hidden="true">✓</span><div>${children}</div></div>`;
      case 'doc':
      default: return children;
    }
  }

  return sanitizeHtml(renderChildren(doc.content));
}

export function sanitizeHtml(html: string): string {
  if (!html || typeof DOMParser === 'undefined') return html;
  const document = new DOMParser().parseFromString(html, 'text/html');
  document.querySelectorAll('script,style,iframe,object,embed,form').forEach(node => node.remove());
  document.body.querySelectorAll('*').forEach(element => {
    for (const attribute of [...element.attributes]) {
      const name = attribute.name.toLowerCase();
      if (name.startsWith('on') || (name === 'href' && /^\s*(javascript|data):/i.test(attribute.value))) {
        element.removeAttribute(attribute.name);
      }
    }
  });
  return document.body.innerHTML;
}
