import React, { useState, useEffect, useMemo } from 'react';
import { useParams, useNavigate } from 'react-router';
import { Sidebar } from '../../components/sidebar';
import { Editor } from '../../components/editor';
import { SIDEBAR_DATA, SidebarItem } from '../../constants/sidebar.consts';
import './resources.css';

// Count total pages recursively
function countPages(items: SidebarItem[]): number {
  return items.reduce((acc, item) => {
    if (item.type === 'page') return acc + 1;
    return acc + (item.children ? countPages(item.children) : 0);
  }, 0);
}

// Flatten pages for progress tracking
function flattenPages(items: SidebarItem[]): SidebarItem[] {
  const result: SidebarItem[] = [];
  for (const item of items) {
    if (item.type === 'page') result.push(item);
    if (item.children) result.push(...flattenPages(item.children));
  }
  return result;
}

export default function Resources() {
  const { pageId } = useParams();
  const navigate = useNavigate();
  
  const [sidebarData, setSidebarData] = useState<SidebarItem[]>(SIDEBAR_DATA);
  const [activeNav, setActiveNav] = useState('home');
  const [selectedPage, setSelectedPage] = useState<SidebarItem | null>(null);
  const [completedIds, setCompletedIds] = useState<Set<string>>(new Set());
  const [name, setName] = useState('');
  const [started, setStarted] = useState(false);
  const [mobileSidebarOpen, setMobileSidebarOpen] = useState(false);

  const total = countPages(sidebarData);
  const allPages = useMemo(() => flattenPages(sidebarData), [sidebarData]);
  const done = completedIds.size;
  const progress = total > 0 ? Math.round((done / total) * 100) : 0;

  // Sync route param pageId to selectedPage state
  useEffect(() => {
    if (pageId) {
      const matched = allPages.find(p => p.id === pageId);
      if (matched) {
        setSelectedPage(matched);
        setActiveNav('');
      } else {
        setSelectedPage(null);
        setActiveNav('home');
      }
    } else {
      setSelectedPage(null);
      setActiveNav('home');
    }
  }, [pageId, allPages]);

  const handleSelectPage = (item: SidebarItem | null) => {
    if (item) {
      navigate(`/resources/${item.id}`);
    } else {
      navigate('/resources');
    }
  };

  const handleComplete = () => {
    if (selectedPage && !completedIds.has(selectedPage.id)) {
      setCompletedIds(prev => new Set([...prev, selectedPage.id]));
      const idx = allPages.findIndex(p => p.id === selectedPage.id);
      if (idx < allPages.length - 1) {
        navigate(`/resources/${allPages[idx + 1].id}`);
      }
    }
  };

  const handleUpdatePageTitle = (pageId: string, newTitle: string) => {
    const updateTitleRecursive = (items: SidebarItem[]): SidebarItem[] => {
      return items.map(item => {
        if (item.id === pageId) return { ...item, label: newTitle };
        if (item.children) return { ...item, children: updateTitleRecursive(item.children) };
        return item;
      });
    };
    setSidebarData(prev => updateTitleRecursive(prev));
    if (selectedPage && selectedPage.id === pageId) {
      setSelectedPage(prev => prev ? { ...prev, label: newTitle } : null);
    }
  };

  return (
    <div className="resources-theme-root" style={{ display: 'flex', flexDirection: 'column', width: '100vw', height: '100vh', overflow: 'hidden' }}>
      {/* Mobile top bar */}
      <div className="resources-mobile-topbar" style={{
        display: 'none',
        alignItems: 'center',
        gap: '12px',
        padding: '10px 16px',
        background: 'var(--panel)',
        borderBottom: '1px solid var(--border)',
        flexShrink: 0,
      }}>
        <button
          onClick={() => setMobileSidebarOpen(true)}
          style={{
            border: 'none', background: 'transparent', cursor: 'pointer',
            padding: '6px', borderRadius: '8px', display: 'flex', alignItems: 'center',
          }}
          title="Open sidebar"
        >
          <span className="material-symbols-outlined" style={{ fontSize: '24px', color: 'var(--text)' }}>menu</span>
        </button>
        <span style={{ fontSize: '14px', fontWeight: 600, color: 'var(--text)', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
          {selectedPage ? selectedPage.label : 'Interview Resources'}
        </span>
      </div>

      {/* Main content row */}
      <div style={{ display: 'flex', flex: 1, overflow: 'hidden' }}>
        <Sidebar
          activeNav={activeNav}
          setActiveNav={setActiveNav}
          selectedPage={selectedPage}
          onSelectPage={handleSelectPage}
          completedIds={completedIds}
          done={done}
          total={total}
          sidebarData={sidebarData}
          mobileOpen={mobileSidebarOpen}
          onMobileClose={() => setMobileSidebarOpen(false)}
        />
        <Editor
          activeNav={activeNav}
          setActiveNav={setActiveNav}
          selectedPage={selectedPage}
          onSelectPage={handleSelectPage}
          completedIds={completedIds}
          handleComplete={handleComplete}
          name={name}
          setName={setName}
          started={started}
          setStarted={setStarted}
          done={done}
          total={total}
          progress={progress}
          allPages={allPages}
          onUpdatePageTitle={handleUpdatePageTitle}
        />
      </div>
    </div>
  );
}
