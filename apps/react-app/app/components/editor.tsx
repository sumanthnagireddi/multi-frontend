// @ts-nocheck
import React, { useCallback, useEffect, useMemo, useState } from 'react';
import { ComposableEditor } from '@atlaskit/editor-core/composable-editor';
import { useUniversalPreset } from '@atlaskit/editor-core/preset-universal';
import { EditorContext } from '@atlaskit/editor-core';
import { createADFFromHTML } from '@atlaskit/editor-common/dist/esm/utils/create-adf-from-html';
import type { JSONDocNode } from '@atlaskit/editor-json-transformer';
import type { ResourcePage } from '@unified-frontend-monorepo/workspace-data';

export type AtlasEditorAppearance = 'comment' | 'full-page' | 'full-width';
export type AtlasEditorMode = 'edit' | 'view';
export type AtlasEditorContentWidth = 'full-width' | 'narrow';
export type AtlasEditorContent = JSONDocNode | string;

export type WidgetDocumentChangeDetail = {
  adf: JSONDocNode;
  serialized: string;
  timestamp: string;
};

interface EditorProps {
  activeNav: string;
  setActiveNav: (val: string) => void;
  selectedPage: any;
  onSelectPage: (item: any) => void;
  completedIds: Set<string>;
  handleComplete: () => void;
  name: string;
  setName: (val: string) => void;
  started: boolean;
  setStarted: (val: boolean) => void;
  done: number;
  total: number;
  progress: number;
  allPages: any[];
  onUpdatePageTitle: (pageId: string, newTitle: string) => void;
  pageContent: ResourcePage | null;
  pageLoading: boolean;
  pageError: string;
  saving: boolean;
  saveError: string;
  onSave: (body: string) => Promise<void>;
  treeLoading: boolean;
  treeError: string;
  onRetryTree: () => Promise<void>;
}

const defaultPlaceholder = 'Start writing here...';
const defaultAppearance: AtlasEditorAppearance = 'full-width';
const defaultContentWidth: AtlasEditorContentWidth = 'full-width';
const defaultMinHeight = 520;
const defaultMode: AtlasEditorMode = 'edit';

function escapeHtmlText(content: string) {
  return content
    .replaceAll('&', '&amp;')
    .replaceAll('<', '&lt;')
    .replaceAll('>', '&gt;');
}

function normalizeStringContent(content: string): string {
  const trimmed = content.trim();

  if (!trimmed) {
    return '<p></p>';
  }

  if (/<[a-z][\s\S]*>/i.test(trimmed)) {
    return trimmed;
  }

  return `<p>${escapeHtmlText(content)}</p>`;
}

function normalizeInitialContent(content?: AtlasEditorContent) {
  if (!content || typeof content !== 'string') {
    return content;
  }

  const trimmed = content.trim();
  if (trimmed.startsWith('{')) {
    try {
      const parsed = JSON.parse(trimmed);
      if (parsed?.type === 'doc' && Array.isArray(parsed.content)) {
        return parsed as JSONDocNode;
      }
    } catch {
      // Fall through to HTML/plain-text normalization.
    }
  }

  return createADFFromHTML(normalizeStringContent(content));
}

function resolveContentWidth(
  appearance?: AtlasEditorAppearance,
  contentWidth?: AtlasEditorContentWidth,
): AtlasEditorContentWidth {
  if (contentWidth) {
    return contentWidth;
  }

  if (appearance === 'full-page') {
    return 'narrow';
  }

  return defaultContentWidth;
}

function resolveAppearance(appearance?: AtlasEditorAppearance): any {
  if (appearance === 'full-width') {
    return 'full-page';
  }
  return appearance || defaultAppearance;
}

export function Editor({
  activeNav,
  setActiveNav,
  selectedPage,
  onSelectPage,
  completedIds,
  handleComplete,
  name,
  setName,
  started,
  setStarted,
  done,
  total,
  progress,
  allPages,
  onUpdatePageTitle,
  pageContent,
  pageLoading,
  pageError,
  saving,
  saveError,
  onSave,
  treeLoading,
  treeError,
  onRetryTree,
}: EditorProps) {
  const appearance: AtlasEditorAppearance = 'full-width';
  const contentWidth: AtlasEditorContentWidth = 'full-width';
  const placeholder = defaultPlaceholder;
  const mode: AtlasEditorMode = defaultMode;
  const minHeight = defaultMinHeight;
  const [draftBody, setDraftBody] = useState('');

  useEffect(() => {
    setDraftBody(pageContent?.body || '');
  }, [pageContent?.id, pageContent?.body]);

  // Select study guide content if selectedPage exists
  const rawContent = useMemo(() => {
    return pageContent?.body || '';
  }, [pageContent]);

  const resolvedContentWidth = resolveContentWidth(appearance, contentWidth);
  const resolvedAppearance = resolveAppearance(appearance);
  
  const initialContent = useMemo(() => normalizeInitialContent(rawContent), [rawContent]);

  const tableOfContents = useMemo(() => {
    if (!rawContent || typeof rawContent !== 'string') return [];
    if (rawContent.trim().startsWith('{')) {
      try {
        const parsed = JSON.parse(rawContent);
        const items: Array<{ id: string; text: string; level: number }> = [];
        const visit = (node: any) => {
          if (node?.type === 'heading' && node.attrs?.level) {
            const text = (node.content || []).map((child: any) => child.text || '').join('').trim();
            if (text) {
              items.push({
                id: text.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/(^-|-$)/g, ''),
                text,
                level: Number(node.attrs.level),
              });
            }
          }
          node?.content?.forEach(visit);
        };
        visit(parsed);
        return items;
      } catch {
        // Fall through to HTML parsing.
      }
    }
    if (!/<h[1-3][\s>]/i.test(rawContent)) return [];
    const container = document.createElement('div');
    container.innerHTML = rawContent;
    return Array.from(container.querySelectorAll('h1, h2, h3')).map((heading, index) => {
      const text = heading.textContent?.trim() || '';
      const level = Number(heading.tagName.substring(1));
      return {
        id: heading.id || text.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/(^-|-$)/g, '') || `section-${index}`,
        text,
        level,
      };
    }).filter(item => item.text);
  }, [rawContent]);

  const editorProps = useMemo(() => ({
    appearance: resolvedAppearance,
    placeholder,
    defaultValue: initialContent,
    disabled: mode === 'view',
    allowTables: {
      allowColumnResizing: true,
      allowMergeCells: true,
      allowNumberColumn: true,
      allowHeaderRow: true,
      allowHeaderColumn: true,
    },
    allowPanel: true,
    allowStatus: true,
    allowDate: true,
    allowLayouts: true,
    allowTextAlignment: true,
    allowTextColor: true,
    allowUndoRedoButtons: true,
    codeBlock: {
      allowCopyToClipboard: true,
    },
    quickInsert: true,
  }), [resolvedAppearance, placeholder, initialContent, mode]);

  const preset = useUniversalPreset({
    props: editorProps,
  });

  const handleChange = useCallback((editorView: any) => {
    try {
      const editable = editorView.dom;
      setDraftBody(editable?.innerHTML || '');
    } catch (e) {
      console.error(e);
    }
  }, []);

  if (!selectedPage) {
    return (
      <div style={{ flex: 1, display: 'grid', placeItems: 'center', padding: '40px', textAlign: 'center' }}>
        <div style={{ maxWidth: '440px' }}>
          {treeLoading ? (
            <>
              <span className="material-symbols-outlined" style={{ fontSize: '36px', color: 'var(--accent)' }}>progress_activity</span>
              <h2>Loading resources</h2>
              <p>Syncing the resource tree from the backend.</p>
            </>
          ) : treeError ? (
            <>
              <span className="material-symbols-outlined" style={{ fontSize: '36px', color: 'var(--bad)' }}>cloud_off</span>
              <h2>Resources unavailable</h2>
              <p>{treeError}</p>
              <button onClick={() => void onRetryTree()} style={{ marginTop: '12px' }}>Retry</button>
            </>
          ) : (
            <>
              <span className="material-symbols-outlined" style={{ fontSize: '36px', color: 'var(--accent)' }}>menu_book</span>
              <h2>Interview Resources</h2>
              <p>Select a topic from the sidebar to load its synced content.</p>
            </>
          )}
        </div>
      </div>
    );
  }

  if (pageLoading) {
    return (
      <div style={{ flex: 1, display: 'grid', placeItems: 'center', color: 'var(--text-soft)' }}>
        <div style={{ textAlign: 'center' }}>
          <span className="material-symbols-outlined" style={{ display: 'block', fontSize: '32px', marginBottom: '8px' }}>progress_activity</span>
          Loading page…
        </div>
      </div>
    );
  }

  if (pageError) {
    return (
      <div style={{ flex: 1, display: 'grid', placeItems: 'center', padding: '40px', textAlign: 'center' }}>
        <div>
          <span className="material-symbols-outlined" style={{ fontSize: '32px', color: 'var(--bad)' }}>error</span>
          <h2>Page could not be loaded</h2>
          <p style={{ color: 'var(--text-soft)' }}>{pageError}</p>
        </div>
      </div>
    );
  }

  return (
    <EditorContext>
      <div className="docs-editor-shell">
        <div className="docs-actionbar">
          <div className="docs-breadcrumb">
            Resources <span>/</span> <strong>{selectedPage.label}</strong>
          </div>
          <div className="docs-actions">
            <button
              className="docs-save-button"
              onClick={() => void onSave(draftBody || pageContent?.body || '')}
              style={{
                border: 'none',
                cursor: saving ? 'wait' : 'pointer',
              }}
              disabled={saving}
            >
              {saving ? 'Saving…' : 'Save'}
            </button>
            <button
              className="docs-complete-button"
              onClick={handleComplete}
              style={{
                background: completedIds.has(selectedPage.id) ? 'var(--good)' : 'transparent',
                color: completedIds.has(selectedPage.id) ? 'var(--panel)' : 'var(--text)',
                cursor: 'pointer',
              }}
            >
              {completedIds.has(selectedPage.id) ? 'Completed ✓' : 'Mark complete'}
            </button>
          </div>
        </div>
        <div className="docs-editor-scroll">
          {saveError && (
            <div style={{ maxWidth: '760px', margin: '0 auto 12px', color: 'var(--bad)', fontSize: '13px' }}>
              {saveError}
            </div>
          )}
          <main className="docs-article-layout">
            <article className="docs-article">
              <header className="docs-article-header">
                <h1>{selectedPage.label}</h1>
                <p>Interview resource and study guide.</p>
                <button className="docs-markdown-button" type="button">
                  <span aria-hidden="true">M↓</span>
                  <span>View as Markdown</span>
                </button>
              </header>
              <div className="docs-editor-content">
                <ComposableEditor
                  key={selectedPage.id}
                  preset={preset}
                  appearance={resolvedAppearance}
                  onChange={handleChange}
                />
              </div>
            </article>
            <aside className="docs-toc" aria-label="On this page">
              <div className="docs-toc-inner">
                <div className="docs-toc-title">On this page</div>
                {tableOfContents.length > 0 ? tableOfContents.map(item => (
                  <button
                    key={`${item.id}-${item.text}`}
                    type="button"
                    className={item.level === 3 ? 'toc-level-3' : ''}
                    onClick={() => {
                      const target = document.querySelector(`[id="${CSS.escape(item.id)}"]`);
                      target?.scrollIntoView({ behavior: 'smooth', block: 'start' });
                    }}
                  >
                    {item.text}
                  </button>
                )) : (
                  <button type="button" className="toc-current">{selectedPage.label}</button>
                )}
              </div>
            </aside>
          </main>
        </div>
      </div>
    </EditorContext>
  );
}