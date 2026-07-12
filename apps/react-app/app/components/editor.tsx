// @ts-nocheck
import React, { useCallback, useMemo } from 'react';
import { ComposableEditor } from '@atlaskit/editor-core/composable-editor';
import { useUniversalPreset } from '@atlaskit/editor-core/preset-universal';
import { EditorContext } from '@atlaskit/editor-core';
import { createADFFromHTML } from '@atlaskit/editor-common/dist/esm/utils/create-adf-from-html';
import type { JSONDocNode } from '@atlaskit/editor-json-transformer';

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

// Generate premium mock study guide HTML content
function getInitialHTMLForPage(pageId: string, title: string): string {
  if (pageId === '196647') { // Signals
    return `
      <h2>Overview</h2>
      <p>Signals are a system that granularly tracks how and where your state is used, allowing the framework to optimize rendering updates. In Angular 16+, signals provide a new reactive primitive that operates independently of Zone.js change detection.</p>
      <p><strong>Interview Tip:</strong> Contrast Signals with RxJS. Signals are synchronous and excellent for state/UI binding, while RxJS is asynchronous and perfect for events/data streams.</p>
      <h2>Core Concepts</h2>
      <ul>
        <li>Writable Signals: declared via <code>signal(initialValue)</code> and updated using <code>.set()</code> or <code>.update()</code></li>
        <li>Computed Signals: read-only values derived from other signals using <code>computed()</code></li>
        <li>Effects: side-effect listeners that run whenever their dependency signals change, using <code>effect()</code></li>
      </ul>
    `;
  }
  if (pageId === '1638412') { // Closures
    return `
      <h2>Overview</h2>
      <p>A closure is the combination of a function bundled together with references to its surrounding state (the lexical environment). In other words, a closure gives an inner function access to the outer function's scope even after the outer function has returned.</p>
      <p><strong>Interview Warning:</strong> Be prepared to discuss memory implications! Closures retain references to their outer scope variables, which prevents them from being garbage-collected.</p>
    `;
  }
  return `
    <h2>Study Notes: ${title}</h2>
    <p>This document contains the preparation material and code snippets for the topic ${title}. You can edit this text directly using the Atlaskit Comfluence Editor.</p>
    <p>Topic focus: Explain the core definition, the primary usecase, and any performance trade-offs.</p>
  `;
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
}: EditorProps) {
  const appearance: AtlasEditorAppearance = 'full-width';
  const contentWidth: AtlasEditorContentWidth = 'full-width';
  const placeholder = defaultPlaceholder;
  const mode: AtlasEditorMode = defaultMode;
  const minHeight = defaultMinHeight;

  // Select study guide content if selectedPage exists
  const rawContent = useMemo(() => {
    if (!selectedPage) return '';
    return getInitialHTMLForPage(selectedPage.id, selectedPage.label);
  }, [selectedPage]);

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
    // Sync text edits to keep title reactive if title is edited, etc.
    try {
      const adf = editorView.state.doc.toJSON();
      // Inspect ADF for title change or content updates
    } catch (e) {
      console.error(e);
    }
  }, []);

  if (!selectedPage) {
    return (
      <div style={{ padding: '40px', color: 'var(--text-soft)' }}>
        <h2>Welcome to the Course</h2>
        <p>Please select a topic from the sidebar to start editing using the Atlaskit Confluence Editor.</p>
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
              onClick={handleComplete}
              style={{
                background: completedIds.has(selectedPage.id) ? 'var(--good)' : 'var(--accent)',
                color: 'var(--panel)',
                border: 'none',
                borderRadius: '4px',
                padding: '6px 14px',
                fontSize: '12.5px',
                fontWeight: 600,
                cursor: 'pointer',
              }}
            >
              {completedIds.has(selectedPage.id) ? 'Published ✓' : 'Publish'}
            </button>
          </div>
        </div>
        <div style={{ flex: 1, overflow: 'auto', padding: '20px' }}>
          <ComposableEditor
            preset={preset}
            appearance={resolvedAppearance}
            onChange={handleChange}
          />
        </div>
      </div>
    </EditorContext>
  );
}