import { useCallback, useEffect, useMemo, useState, type CSSProperties, type ReactNode } from 'react';
import { Link, useNavigate, useParams } from 'react-router-dom';
import { ChevronRight, Search, Star, Lock, Share2, MoreHorizontal, Plus, PanelLeftClose, PanelLeftOpen, Copy, CornerDownRight, Pencil, Trash2, ArrowRight, Link2, EyeOff } from 'lucide-react';
import { flattenResourcePages, resourcesService, type ResourcePage, type ResourceTreeNode } from '../services/resources.service';
import { adfToHtml } from '../utils/adf-to-html';

export default function ResourcesPage() {
  const { '*': pagePath } = useParams();
  const navigate = useNavigate();
  const [tree, setTree] = useState<ResourceTreeNode[]>([]);
  const [selectedPage, setSelectedPage] = useState<ResourcePage | null>(null);
  const [treeLoading, setTreeLoading] = useState(true);
  const [pageLoading, setPageLoading] = useState(false);
  const [treeError, setTreeError] = useState('');
  const [pageError, setPageError] = useState('');
  const [saveError, setSaveError] = useState('');
  const [saved, setSaved] = useState(false);
  const [mobileOpen, setMobileOpen] = useState(false);
  const [search, setSearch] = useState('');
  const [searchOpen, setSearchOpen] = useState(false);
  const [expanded, setExpanded] = useState<Set<string>>(new Set());
  const [sidebarCollapsed, setSidebarCollapsed] = useState(false);
  const [sidebarWidth, setSidebarWidth] = useState(() => {
    const stored = Number(localStorage.getItem('resources-sidebar-width'));
    return Number.isFinite(stored) && stored >= 240 && stored <= 480 ? stored : 280;
  });
  const [resizingSidebar, setResizingSidebar] = useState(false);
  const [actionMenu, setActionMenu] = useState<string | null>(null);
  const [modal, setModal] = useState<{
    kind: 'create' | 'rename' | 'copy' | 'move' | 'delete';
    title: string;
    parentId?: string;
    pageId?: string;
  } | null>(null);
  const [completed, setCompleted] = useState<Set<string>>(() => {
    try {
      const stored = JSON.parse(localStorage.getItem('resource-completed-pages') || '[]');
      return new Set(Array.isArray(stored) ? stored.filter((id): id is string => typeof id === 'string') : []);
    } catch {
      return new Set();
    }
  });

  const pages = useMemo(() => flattenResourcePages(tree), [tree]);
  const folderCount = useMemo(() => countNodes(tree, 'folder'), [tree]);
  const spaceCount = useMemo(() => countNodes(tree, 'space'), [tree]);
  const progress = pages.length ? Math.round((completed.size / pages.length) * 100) : 0;

  const loadTree = useCallback(async () => {
    const controller = new AbortController();
    setTreeLoading(true);
    setTreeError('');
    try {
      const nodes = await resourcesService.getTree(undefined, controller.signal);
      setTree(nodes);
      setExpanded(collectExpandableNodeIds(nodes));
      if (!pagePath) {
        const firstPage = flattenResourcePages(nodes)[0];
        if (firstPage) navigate(`/resources/${firstPage.id}`, { replace: true });
      }
    } catch (error) {
      if (!(error instanceof DOMException && error.name === 'AbortError')) {
        setTreeError(error instanceof Error ? error.message : 'Unable to load Confluence folders');
      }
    } finally {
      setTreeLoading(false);
    }
    return () => controller.abort();
  }, [navigate]);

  useEffect(() => {
    void loadTree();
  }, [loadTree]);

  useEffect(() => {
    localStorage.setItem('resource-completed-pages', JSON.stringify([...completed]));
  }, [completed]);

  useEffect(() => {
    localStorage.setItem('resources-sidebar-width', String(sidebarWidth));
  }, [sidebarWidth]);

  function startSidebarResize(event: React.PointerEvent<HTMLDivElement>) {
    event.preventDefault();
    setResizingSidebar(true);
    event.currentTarget.setPointerCapture(event.pointerId);
  }

  function resizeSidebar(event: React.PointerEvent<HTMLDivElement>) {
    if (!resizingSidebar) return;
    const viewportPadding = window.innerWidth < 768 ? 0 : 240;
    const maxWidth = Math.min(480, window.innerWidth - viewportPadding);
    setSidebarWidth(Math.max(240, Math.min(maxWidth, event.clientX)));
  }

  function stopSidebarResize() {
    setResizingSidebar(false);
  }

  useEffect(() => {
    if (!pagePath && pages.length) {
      navigate(`/resources/${pages[0].id}`, { replace: true });
    }
  }, [navigate, pagePath, pages]);

  useEffect(() => {
    if (!pagePath || !pages.length) return;
    const pageExists = pages.some(page => page.id === pagePath);
    if (!pageExists) {
      navigate(`/resources/${pages[0].id}`, { replace: true });
      return;
    }

    const controller = new AbortController();
    setPageLoading(true);
    setPageError('');
    resourcesService.getPage(pagePath, controller.signal)
      .then(setSelectedPage)
      .catch(error => {
        if (!(error instanceof DOMException && error.name === 'AbortError')) {
          setPageError(error instanceof Error ? error.message : 'Unable to load page');
        }
      })
      .finally(() => setPageLoading(false));
    return () => controller.abort();
  }, [navigate, pagePath, pages]);

  async function savePage() {
    if (!selectedPage) return;
    setSaveError('');
    setSaved(false);
    try {
      const body = adfToHtml(selectedPage.body);
      const updated = await resourcesService.updatePage(selectedPage.id, selectedPage.title, body);
      setSelectedPage(updated);
      setSaved(true);
    } catch (error) {
      setSaveError(error instanceof Error ? error.message : 'Unable to save page');
    }
  }

  function openCreate(parentId?: string) {
    setActionMenu(null);
    setModal({ kind: 'create', title: '', parentId });
  }

  function openRename(pageId: string, title: string) {
    setActionMenu(null);
    setModal({ kind: 'rename', title, pageId });
  }

  function openCopy(pageId: string, title: string, parentId?: string | null) {
    setActionMenu(null);
    setModal({ kind: 'copy', title: `${title} copy`, pageId, parentId: parentId ?? undefined });
  }

  function openMove(pageId: string, title: string, parentId?: string | null) {
    setActionMenu(null);
    setModal({ kind: 'move', title, pageId, parentId: parentId ?? undefined });
  }

  function openDelete(pageId: string, title: string) {
    setActionMenu(null);
    setModal({ kind: 'delete', title, pageId });
  }

  async function submitModal() {
    if (!modal) return;
    setSaveError('');
    try {
      if (modal.kind === 'create') {
        const spaceKey = selectedPage?.spaceKey || 'SUM';
        const created = await resourcesService.createPage(modal.title.trim(), spaceKey, modal.parentId);
        await loadTree();
        setModal(null);
        navigate(`/resources/${created.id}`);
        return;
      }

      if (!modal.pageId) return;
      if (modal.kind === 'rename') {
        const page = await resourcesService.getPage(modal.pageId);
        const updated = await resourcesService.updatePage(modal.pageId, modal.title.trim(), adfToHtml(page.body));
        setSelectedPage(updated);
        await loadTree();
        setModal(null);
        return;
      }

      if (modal.kind === 'copy') {
        const source = await resourcesService.getPage(modal.pageId);
        const created = await resourcesService.createPage(
          modal.title.trim(),
          source.spaceKey || selectedPage?.spaceKey || 'SUM',
          modal.parentId,
          adfToHtml(source.body),
        );
        await loadTree();
        setModal(null);
        navigate(`/resources/${created.id}`);
        return;
      }

      if (modal.kind === 'move') {
        const page = await resourcesService.getPage(modal.pageId);
        await resourcesService.updatePage(modal.pageId, page.title, adfToHtml(page.body), modal.parentId);
        await loadTree();
        setModal(null);
        return;
      }

      if (modal.kind === 'delete') {
        await resourcesService.deletePage(modal.pageId);
        setModal(null);
        await loadTree();
        const remaining = flattenResourcePages(tree).filter(page => page.id !== modal.pageId);
        if (remaining[0]) navigate(`/resources/${remaining[0].id}`, { replace: true });
        else navigate('/resources', { replace: true });
      }
    } catch (error) {
      setSaveError(error instanceof Error ? error.message : 'Unable to complete action');
    }
  }

  function completePage() {
    if (!selectedPage) return;
    setCompleted(current => new Set(current).add(selectedPage.id));
    const index = pages.findIndex(page => page.id === selectedPage.id);
    if (index >= 0 && index < pages.length - 1) navigate(`/resources/${pages[index + 1].id}`);
  }

  function toggleNode(id: string) {
    setExpanded(current => {
      const next = new Set(current);
      if (next.has(id)) next.delete(id);
      else next.add(id);
      return next;
    });
  }

  function renderNode(node: ResourceTreeNode, depth = 0): ReactNode {
    const matchesSearch = !search || node.title.toLowerCase().includes(search.toLowerCase());
    if (node.type === 'page') {
      if (!node.children?.length) {
        if (!matchesSearch) return null;
        return (
          <div className="resources-sidebar-row" style={{ paddingLeft: depth * 12 }} key={node.id}>
            <Link
              to={`/resources/${node.id}`}
              onClick={() => setMobileOpen(false)}
              className={`resources-sidebar-page ${pagePath === node.id ? 'active' : ''}`}
            >
              <span className="resources-page-status">{completed.has(node.id) ? '✓' : '○'}</span>
              <span>{node.title}</span>
            </Link>
            <button
              type="button"
              className="resources-node-more"
              aria-label={`Actions for ${node.title}`}
              onClick={() => setActionMenu(actionMenu === `page-${node.id}` ? null : `page-${node.id}`)}
            >
              <MoreHorizontal size={14} />
            </button>
            {actionMenu === `page-${node.id}` && (
              <div className="resources-node-menu" role="menu">
                <button type="button" role="menuitem" onClick={() => openCreate(node.id)}><CornerDownRight size={15} /> Create subpage</button>
                <button type="button" role="menuitem" onClick={() => openRename(node.id, node.title)}><Pencil size={15} /> Rename</button>
                <button type="button" role="menuitem" onClick={() => openCopy(node.id, node.title, node.parentId)}><Copy size={15} /> Copy</button>
                <button type="button" role="menuitem" onClick={() => openMove(node.id, node.title, node.parentId)}><ArrowRight size={15} /> Move</button>
                <button type="button" role="menuitem" className="danger" onClick={() => openDelete(node.id, node.title)}><Trash2 size={15} /> Delete</button>
              </div>
            )}
          </div>
        );
      }
      const isExpanded = search ? true : expanded.has(node.id);
      return (
        <div className="resources-sidebar-section" key={node.id}>
          <div className="resources-parent-page" style={{ paddingLeft: depth * 12 }}>
            <button type="button" className="resources-node-toggle" onClick={() => toggleNode(node.id)} aria-label="Toggle children">{isExpanded ? '▾' : '›'}</button>
            <Link
              to={`/resources/${node.id}`}
              onClick={() => setMobileOpen(false)}
              className={`resources-sidebar-page ${pagePath === node.id ? 'active' : ''}`}
            >
              <span className="resources-page-status">{completed.has(node.id) ? '✓' : '○'}</span>
              <span>{node.title}</span>
            </Link>
            <button
              type="button"
              className="resources-node-more"
              aria-label={`Actions for ${node.title}`}
              onClick={() => setActionMenu(actionMenu === `page-${node.id}` ? null : `page-${node.id}`)}
            >
              <MoreHorizontal size={14} />
            </button>
            {actionMenu === `page-${node.id}` && (
              <div className="resources-node-menu" role="menu">
                <button type="button" role="menuitem" onClick={() => openCreate(node.id)}><CornerDownRight size={15} /> Create subpage</button>
                <button type="button" role="menuitem" onClick={() => openRename(node.id, node.title)}><Pencil size={15} /> Rename</button>
                <button type="button" role="menuitem" onClick={() => openCopy(node.id, node.title, node.parentId)}><Copy size={15} /> Copy</button>
                <button type="button" role="menuitem" onClick={() => openMove(node.id, node.title, node.parentId)}><ArrowRight size={15} /> Move</button>
                <button type="button" role="menuitem" className="danger" onClick={() => openDelete(node.id, node.title)}><Trash2 size={15} /> Delete</button>
              </div>
            )}
          </div>
          {isExpanded && node.children.map(child => renderNode(child, depth + 1))}
        </div>
      );
    }

    const hasMatches = !search || matchesSearch || nodeHasMatch(node, search);
    if (!hasMatches) return null;
    const isExpanded = search ? true : expanded.has(node.id);
    return (
      <div className="resources-sidebar-section" key={node.id}>
        <div className="resources-parent-page" style={{ paddingLeft: depth * 12 }}>
          <button type="button" className="resources-node-toggle" onClick={() => toggleNode(node.id)} aria-label="Toggle children">
            {isExpanded ? '▾' : '›'}
          </button>
          <button type="button" className="resources-sidebar-title" style={{ flex: 1 }} onClick={() => toggleNode(node.id)}>
            <span>{node.type === 'space' ? '⌘' : ''}</span>
            <strong>{node.title}</strong>
          </button>
          {node.type === 'folder' && (
            <button
              type="button"
              className="resources-node-more"
              aria-label={`Actions for ${node.title}`}
              onClick={() => setActionMenu(actionMenu === `folder-${node.id}` ? null : `folder-${node.id}`)}
            ><MoreHorizontal size={14} /></button>
          )}
          {actionMenu === `folder-${node.id}` && (
            <div className="resources-node-menu" role="menu">
              <button type="button" role="menuitem" onClick={() => openCreate(node.id)}><CornerDownRight size={15} /> Create page</button>
            </div>
          )}
        </div>
        {isExpanded && node.children?.map(child => renderNode(child, depth + 1))}
      </div>
    );
  }

  const html = selectedPage ? adfToHtml(selectedPage.body) : '';
  const breadcrumb = [];
  let current = pages.find(page => page.id === pagePath);
  while (current?.parentId) {
    const parent = findNode(tree, current.parentId);
    if (!parent) break;
    breadcrumb.unshift(parent.title);
    current = parent.type === 'page' ? parent : undefined;
  }

  return (
    <div className="resources-theme-root docs-root">
      <header className="resources-docs-header">
        <button type="button" className="resources-mobile-menu" onClick={() => setMobileOpen(true)} aria-label="Open sidebar">☰</button>
        <Link to="/resources" className="resources-docs-brand" aria-label="Confluence resources">
          <span className="resources-brand-mark" aria-hidden="true"><span /><span /></span>
          <span className="resources-brand-name">Resources</span>
        </Link>
        <div className="resources-docs-header-spacer" />
        <label className="confluence-search" onClick={() => setSearchOpen(true)}>
          <Search size={16} />
          {searchOpen && <input value={search} onChange={event => setSearch(event.target.value)} placeholder="Search in Resources" aria-label="Search pages" autoFocus />}
          {!searchOpen && <span>Search</span>}
        </label>
        <button className="confluence-create-button" type="button" onClick={() => openCreate()} aria-label="Create page">
          <Plus size={18} /><span>Create</span>
        </button>
        <button className="confluence-avatar" type="button" aria-label="Account menu">SN</button>
      </header>
      <div
        className={`resources-main-row ${sidebarCollapsed ? 'sidebar-collapsed' : ''} ${resizingSidebar ? 'sidebar-resizing' : ''}`}
        style={{ '--resources-sidebar-width': `${sidebarWidth}px` } as CSSProperties}
      >
        <aside className={`resources-sidebar sidebar-desktop ${mobileOpen ? 'mobile-open' : ''}`}>
          {mobileOpen && <button type="button" className="resources-mobile-close" onClick={() => setMobileOpen(false)} aria-label="Close sidebar">×</button>}
          <div className="confluence-space-header">
            <div className="confluence-space-icon">S</div>
            <div>
              <strong>Sumanth</strong>
              <span>Knowledge base</span>
            </div>
            <button type="button" aria-label="Space actions" onClick={() => setActionMenu(actionMenu === 'space' ? null : 'space')}><MoreHorizontal size={18} /></button>
            {actionMenu === 'space' && (
              <div className="resources-space-menu" role="menu">
                <button type="button" onClick={() => openCreate()}><Plus size={15} /> Create page</button>
                <button type="button" onClick={() => setSidebarCollapsed(true)}><EyeOff size={15} /> Hide sidebar</button>
              </div>
            )}
          </div>
          <nav className="confluence-space-tabs" aria-label="Space navigation">
            <button type="button" onClick={() => {
              const overview = pages.find(page => page.title.toLowerCase() === 'overview') ?? pages[0];
              if (overview) navigate(`/resources/${overview.id}`);
            }}>Overview</button>
            <button type="button" className="active">Pages</button>
            <button type="button" onClick={() => setSearch('blog')}>Blog</button>
          </nav>
          <div className="confluence-resource-stats" aria-label="Resource statistics">
            <div><strong>{pages.length.toLocaleString()}</strong><span>Pages</span></div>
            <div><strong>{folderCount.toLocaleString()}</strong><span>Folders</span></div>
            <div><strong>{spaceCount.toLocaleString()}</strong><span>Spaces</span></div>
          </div>
          <div className="confluence-sidebar-actions">
            <button type="button" onClick={() => openCreate()}><Plus size={15} /> Create</button>
            <button type="button" aria-label="More options"><MoreHorizontal size={16} /></button>
          </div>
          {treeLoading ? <div className="resources-loading">Loading Confluence…</div> : null}
          {treeError ? (
            <div className="resources-error"><span>{treeError}</span><button type="button" onClick={() => void loadTree()}>Retry</button></div>
          ) : (
            <nav aria-label="Confluence resource pages">{tree.map(node => renderNode(node))}</nav>
          )}
        </aside>
        {!sidebarCollapsed && (
          <div
            className="resources-sidebar-resizer"
            role="separator"
            aria-label="Resize sidebar"
            aria-orientation="vertical"
            aria-valuemin={240}
            aria-valuemax={480}
            aria-valuenow={sidebarWidth}
            tabIndex={0}
            onPointerDown={startSidebarResize}
            onPointerMove={resizeSidebar}
            onPointerUp={stopSidebarResize}
            onPointerCancel={stopSidebarResize}
            onDoubleClick={() => setSidebarWidth(280)}
            onKeyDown={event => {
              if (event.key === 'ArrowLeft') setSidebarWidth(width => Math.max(240, width - 16));
              if (event.key === 'ArrowRight') setSidebarWidth(width => Math.min(480, width + 16));
            }}
          />
        )}
        <section className="docs-editor-shell">
          <div className="docs-actionbar">
            <button
              type="button"
              className="resources-sidebar-toggle"
              aria-label={sidebarCollapsed ? 'Show sidebar' : 'Hide sidebar'}
              onClick={() => setSidebarCollapsed(value => !value)}
            >
              {sidebarCollapsed ? <PanelLeftOpen size={17} /> : <PanelLeftClose size={17} />}
            </button>
            <div className="docs-breadcrumb">
              <span className="breadcrumb-space">Sumanth</span>
              <ChevronRight size={14} />
              {breadcrumb.map(item => <span className="breadcrumb-item" key={item}>{item}<ChevronRight size={14} /></span>)}
              <strong>{selectedPage?.title ?? 'Loading'}</strong>
            </div>
            <div className="docs-actions">
              <button type="button" className="confluence-lock-button" aria-label="Page restrictions"><Lock size={16} /></button>
              <button
                type="button"
                className={`confluence-star-button ${selectedPage && completed.has(selectedPage.id) ? 'active' : ''}`}
                aria-label="Watch page"
                onClick={() => selectedPage && setCompleted(current => new Set(current).add(selectedPage.id))}
              ><Star size={16} /></button>
              <button type="button" className="confluence-share-button" onClick={() => void navigator.clipboard?.writeText(window.location.href)}><Share2 size={15} /> Share</button>
              <button type="button" className="docs-save-button" onClick={() => void savePage()}>{saved ? 'Saved' : 'Save'}</button>
              <div className="resources-page-menu-wrap">
                <button
                  type="button"
                  className="confluence-more-button"
                  aria-label="More page actions"
                  onClick={() => setActionMenu(actionMenu === 'page-more' ? null : 'page-more')}
                ><MoreHorizontal size={18} /></button>
                {actionMenu === 'page-more' && selectedPage && (
                  <div className="resources-page-menu" role="menu">
                    <button type="button" onClick={() => openCreate(selectedPage.id)}><CornerDownRight size={15} /> Create subpage</button>
                    <button type="button" onClick={() => openRename(selectedPage.id, selectedPage.title)}><Pencil size={15} /> Rename</button>
                    <button type="button" onClick={() => openCopy(selectedPage.id, selectedPage.title, selectedPage.parentId)}><Copy size={15} /> Copy</button>
                    <button type="button" onClick={() => openMove(selectedPage.id, selectedPage.title, selectedPage.parentId)}><ArrowRight size={15} /> Move</button>
                    <button type="button" onClick={() => void navigator.clipboard?.writeText(window.location.href)}><Link2 size={15} /> Copy link</button>
                    <button type="button" className="danger" onClick={() => openDelete(selectedPage.id, selectedPage.title)}><Trash2 size={15} /> Move to trash</button>
                  </div>
                )}
              </div>
            </div>
          </div>
          <div className="docs-editor-scroll">
            <div className="docs-article-layout">
              <article className="docs-article">
                {pageLoading ? <div className="resources-loading">Loading page…</div> : null}
                {pageError ? <div className="resources-error"><span>{pageError}</span><button type="button" onClick={() => pagePath && navigate(`/resources/${pagePath}`, { replace: true })}>Retry</button></div> : null}
                {saveError ? <div className="resources-error"><span>{saveError}</span></div> : null}
                {!pageLoading && selectedPage && (
                  <>
                    <header className="docs-article-header">
                      <h1>{selectedPage.title}</h1>
                      <div className="confluence-page-meta">
                        <span className="confluence-page-owner">SN</span>
                        <span>{selectedPage.lastModifiedBy || 'Sumanth'}</span>
                        <span>updated {selectedPage.lastModifiedAt ? new Date(selectedPage.lastModifiedAt).toLocaleDateString(undefined, { day: 'numeric', month: 'short', year: 'numeric' }) : 'recently'}</span>
                      </div>
                    </header>
                    <div className="resources-editor-content" dangerouslySetInnerHTML={{ __html: html }} />
                  </>
                )}
              </article>
              <aside className="docs-toc"><div className="docs-toc-inner"><div className="docs-toc-title">Confluence content</div></div></aside>
            </div>
          </div>
        </section>
      </div>
      {modal && (
        <div className="resources-modal-backdrop" role="presentation" onMouseDown={event => {
          if (event.target === event.currentTarget) setModal(null);
        }}>
          <div className="resources-action-modal" role="dialog" aria-modal="true" aria-labelledby="resources-modal-title">
            <div className="resources-action-modal-header">
              <h2 id="resources-modal-title">
                {modal.kind === 'create' ? (modal.parentId ? 'Create subpage' : 'Create page') :
                  modal.kind === 'rename' ? 'Rename page' :
                  modal.kind === 'copy' ? 'Copy page' :
                  modal.kind === 'move' ? 'Move page' : 'Move page to trash'}
              </h2>
              <button type="button" onClick={() => setModal(null)} aria-label="Close">×</button>
            </div>
            <div className="resources-action-modal-body">
              {modal.kind === 'delete' ? (
                <p>Move <strong>{modal.title}</strong> to trash? You can restore it from Confluence.</p>
              ) : modal.kind === 'move' ? (
                <label>
                  New parent
                  <select value={modal.parentId ?? ''} onChange={event => setModal({ ...modal, parentId: event.target.value || undefined })}>
                    <option value="">Space root</option>
                    {pages.filter(page => page.id !== modal.pageId).map(page => (
                      <option key={page.id} value={page.id}>{page.title}</option>
                    ))}
                  </select>
                </label>
              ) : (
                <label>
                  {modal.kind === 'rename' ? 'Page name' : modal.kind === 'copy' ? 'Copied page name' : 'Page title'}
                  <input
                    value={modal.title}
                    onChange={event => setModal({ ...modal, title: event.target.value })}
                    placeholder="Enter a title"
                    autoFocus
                    onKeyDown={event => {
                      if (event.key === 'Enter') void submitModal();
                    }}
                  />
                </label>
              )}
              {saveError && <div className="resources-modal-error">{saveError}</div>}
            </div>
            <div className="resources-action-modal-footer">
              <button type="button" className="resources-modal-cancel" onClick={() => setModal(null)}>Cancel</button>
              <button
                type="button"
                className={modal.kind === 'delete' ? 'resources-modal-danger' : 'resources-modal-primary'}
                disabled={(modal.kind !== 'delete' && modal.kind !== 'move' && !modal.title.trim())}
                onClick={() => void submitModal()}
              >
                {modal.kind === 'delete' ? 'Move to trash' : modal.kind === 'move' ? 'Move' : modal.kind === 'copy' ? 'Copy' : modal.kind === 'rename' ? 'Rename' : 'Create'}
              </button>
            </div>
          </div>
        </div>
      )}
      {mobileOpen && <button type="button" className="resources-mobile-backdrop" onClick={() => setMobileOpen(false)} aria-label="Close sidebar overlay" />}
    </div>
  );
}

function findNode(nodes: ResourceTreeNode[], id: string): ResourceTreeNode | undefined {
  for (const node of nodes) {
    if (node.id === id) return node;
    const child = findNode(node.children ?? [], id);
    if (child) return child;
  }
  return undefined;
}

function countNodes(nodes: ResourceTreeNode[], type: ResourceTreeNode['type']): number {
  return nodes.reduce((total, node) => {
    return total + (node.type === type ? 1 : 0) + countNodes(node.children ?? [], type);
  }, 0);
}

function collectExpandableNodeIds(nodes: ResourceTreeNode[]): Set<string> {
  const ids = new Set<string>();
  const visit = (node: ResourceTreeNode) => {
    if (node.children?.length) ids.add(node.id);
  };
  nodes.forEach(visit);
  return ids;
}

function nodeHasMatch(node: ResourceTreeNode, search: string): boolean {
  if (!search) return true;
  const query = search.toLowerCase();
  return node.children?.some(child =>
    child.title.toLowerCase().includes(query) || nodeHasMatch(child, search)
  ) ?? false;
}
