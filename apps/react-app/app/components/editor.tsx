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
      <div style={{ flex: 1, display: 'flex', flexDirection: 'column', height: '100vh', background: 'var(--bg)' }}>
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '0 28px', height: '48px', background: 'var(--panel)', borderBottom: '1px solid var(--border)', flexShrink: 0 }}>
          <div style={{ fontSize: '13px', fontWeight: 500, color: 'var(--text)' }}>
            Editing: <strong style={{ color: 'var(--accent)' }}>{selectedPage.label}</strong>
          </div>
          <div style={{ display: 'flex', gap: '8px', marginLeft: 'auto' }}>
            <button
              onClick={() => void onSave(draftBody || pageContent?.body || '')}
              style={{
                background: saving ? 'var(--text-faint)' : 'var(--accent)',
                color: 'var(--panel)',
                border: 'none',
                borderRadius: '4px',
                padding: '6px 14px',
                fontSize: '12.5px',
                fontWeight: 600,
                cursor: saving ? 'wait' : 'pointer',
              }}
              disabled={saving}
            >
              {saving ? 'Saving…' : 'Save'}
            </button>
            <button
              onClick={handleComplete}
              style={{
                background: completedIds.has(selectedPage.id) ? 'var(--good)' : 'transparent',
                color: completedIds.has(selectedPage.id) ? 'var(--panel)' : 'var(--text)',
                border: '1px solid var(--border-strong)',
                borderRadius: '4px',
                padding: '6px 14px',
                fontSize: '12.5px',
                fontWeight: 600,
                cursor: 'pointer',
              }}
            >
              {completedIds.has(selectedPage.id) ? 'Completed ✓' : 'Mark complete'}
            </button>
          </div>
        </div>
        <div style={{ flex: 1, overflow: 'auto', padding: '20px' }}>
          {saveError && (
            <div style={{ maxWidth: '760px', margin: '0 auto 12px', color: 'var(--bad)', fontSize: '13px' }}>
              {saveError}
            </div>
          )}
          <ComposableEditor
            key={selectedPage.id}
            preset={preset}
            appearance={resolvedAppearance}
            onChange={handleChange}
          />
        </div>
      </div>
    </EditorContext>
  );
}