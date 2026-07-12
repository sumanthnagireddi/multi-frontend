import React, { useState } from 'react';
import { SidebarItem } from '../constants/sidebar.consts';

const FolderRow: React.FC<{
  item: SidebarItem;
  index: number;
  selectedId: string | null;
  completedIds: Set<string>;
  onSelect: (item: SidebarItem) => void;
  depth?: number;
}> = ({ item, index, selectedId, completedIds, onSelect, depth = 0 }) => {
  const [open, setOpen] = useState(depth === 0 && index === 0);

  if (item.type === 'page') {
    const isSelected = selectedId === item.id;
    const isDone = completedIds.has(item.id);
    return (
      <div
        onClick={() => onSelect(item)}
        style={{
          display: 'flex',
          alignItems: 'center',
          gap: '8px',
          padding: '6px 12px',
          paddingLeft: `${16 + depth * 14}px`,
          cursor: 'pointer',
          background: isSelected ? 'var(--accent-soft)' : 'transparent',
          borderRight: isSelected ? '2px solid var(--accent)' : '2px solid transparent',
          transition: 'background 0.2s, border-color 0.2s',
          userSelect: 'none',
        }}
        onMouseEnter={e => { if (!isSelected) (e.currentTarget as HTMLDivElement).style.background = 'var(--panel-2)'; }}
        onMouseLeave={e => { if (!isSelected) (e.currentTarget as HTMLDivElement).style.background = 'transparent'; }}
      >
        <span style={{
          width: '8px', height: '8px', borderRadius: '50%', flexShrink: 0,
          background: isDone ? 'var(--good)' : 'transparent',
          border: `1.5px solid var(${isDone ? '--good' : '--border-strong'})`,
          transition: 'background 0.2s, border-color 0.2s',
        }} />
        <span className="material-symbols-outlined" style={{
          fontSize: '18px', color: isSelected ? 'var(--accent)' : 'var(--text-soft)',
          flexShrink: 0, marginRight: '2px',
        }}>description</span>
        <span style={{
          fontSize: '12.5px', fontWeight: isSelected ? 600 : 500,
          color: isSelected ? 'var(--accent)' : 'var(--text)',
          overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap', flex: 1,
        }}>
          {item.label}
        </span>
      </div>
    );
  }

  return (
    <div>
      <div
        onClick={() => setOpen(o => !o)}
        style={{
          display: 'flex', alignItems: 'center', justifyContent: 'space-between',
          padding: '6px 12px', paddingLeft: `${16 + depth * 14}px`,
          cursor: 'pointer', userSelect: 'none', transition: 'background 0.2s',
        }}
        onMouseEnter={e => (e.currentTarget as HTMLDivElement).style.background = 'var(--panel-2)'}
        onMouseLeave={e => (e.currentTarget as HTMLDivElement).style.background = 'transparent'}
      >
        <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
          <span className="material-symbols-outlined" style={{
            fontSize: '18px', color: 'var(--text-soft)',
            transform: open ? 'rotate(90deg)' : 'none',
            transition: 'transform 0.15s ease-out', flexShrink: 0,
          }}>chevron_right</span>
          <span className="material-symbols-outlined" style={{
            fontSize: '18px', color: 'var(--text-soft)', flexShrink: 0,
          }}>{open ? 'folder_open' : 'folder'}</span>
          <span style={{ fontSize: '13px', fontWeight: 600, color: 'var(--text)' }}>{item.label}</span>
        </div>
      </div>
      {open && item.children && (
        <div>
          {item.children.map((child, i) => (
            <FolderRow
              key={child.id} item={child} index={i}
              selectedId={selectedId} completedIds={completedIds}
              onSelect={onSelect} depth={depth + 1}
            />
          ))}
        </div>
      )}
    </div>
  );
};

interface SidebarProps {
  activeNav: string;
  setActiveNav: (val: string) => void;
  selectedPage: SidebarItem | null;
  onSelectPage: (item: SidebarItem) => void;
  completedIds: Set<string>;
  done: number;
  total: number;
  sidebarData: SidebarItem[];
  // Mobile drawer controls
  mobileOpen?: boolean;
  onMobileClose?: () => void;
}

function SidebarContent({
  sidebarData, selectedPage, onSelectPage, completedIds,
}: {
  sidebarData: SidebarItem[];
  selectedPage: SidebarItem | null;
  onSelectPage: (item: SidebarItem) => void;
  completedIds: Set<string>;
}) {
  return (
    <div style={{ flex: 1, display: 'flex', flexDirection: 'column', paddingTop: '16px' }}>
      <div style={{
        display: 'flex', alignItems: 'center', gap: '8px',
        padding: '4px 14px 12px 14px', userSelect: 'none',
      }}>
        <span className="material-symbols-outlined" style={{ fontSize: '18px', color: 'var(--text-soft)', flexShrink: 0 }}>article</span>
        <span style={{ fontSize: '11px', fontWeight: 700, color: 'var(--text-soft)', letterSpacing: '0.06em', textTransform: 'uppercase' }}>
          Interview Resources
        </span>
      </div>
      <div style={{ padding: '4px 0', flex: 1 }}>
        {sidebarData.map((item, idx) => (
          <FolderRow
            key={item.id} item={item} index={idx}
            selectedId={selectedPage?.id ?? null}
            completedIds={completedIds}
            onSelect={onSelectPage}
          />
        ))}
      </div>
    </div>
  );
}

export function Sidebar({
  activeNav, setActiveNav, selectedPage, onSelectPage,
  completedIds, done, total, sidebarData,
  mobileOpen = false, onMobileClose,
}: SidebarProps) {
  return (
    <>
      {/* Desktop Sidebar */}
      <aside style={{
        width: '20vw', minWidth: '200px', height: '100vh',
        background: 'var(--panel)', borderRight: '1px solid var(--border)',
        display: 'flex', flexDirection: 'column', overflowY: 'auto',
      }} className="sidebar-desktop">
        <SidebarContent
          sidebarData={sidebarData} selectedPage={selectedPage}
          onSelectPage={onSelectPage} completedIds={completedIds}
        />
      </aside>

      {/* Mobile Drawer Backdrop */}
      {mobileOpen && (
        <div
          onClick={onMobileClose}
          style={{
            position: 'fixed', inset: 0, zIndex: 40,
            background: 'rgba(0,0,0,0.4)',
            backdropFilter: 'blur(2px)',
            animation: 'fadeIn 0.2s ease-out',
          }}
          className="sidebar-mobile-backdrop"
        />
      )}

      {/* Mobile Drawer */}
      <aside
        style={{
          position: 'fixed', top: 0, left: 0, bottom: 0,
          width: '82vw', maxWidth: '320px', zIndex: 50,
          background: 'var(--panel)', borderRight: '1px solid var(--border)',
          display: 'flex', flexDirection: 'column', overflowY: 'auto',
          transform: mobileOpen ? 'translateX(0)' : 'translateX(-100%)',
          transition: 'transform 0.28s cubic-bezier(0.4,0,0.2,1)',
          boxShadow: mobileOpen ? '8px 0 32px rgba(0,0,0,0.18)' : 'none',
        }}
        className="sidebar-mobile"
      >
        {/* Mobile header */}
        <div style={{
          display: 'flex', alignItems: 'center', justifyContent: 'space-between',
          padding: '14px 16px', borderBottom: '1px solid var(--border)',
          background: 'var(--panel)', position: 'sticky', top: 0, zIndex: 1,
        }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
            <span className="material-symbols-outlined" style={{ fontSize: '20px', color: 'var(--accent)' }}>description</span>
            <span style={{ fontSize: '15px', fontWeight: 700, color: 'var(--text)' }}>Resources</span>
          </div>
          <button
            onClick={onMobileClose}
            style={{
              border: 'none', background: 'transparent', cursor: 'pointer',
              padding: '4px', borderRadius: '6px', display: 'flex', alignItems: 'center',
            }}
          >
            <span className="material-symbols-outlined" style={{ fontSize: '22px', color: 'var(--text-soft)' }}>close</span>
          </button>
        </div>
        <SidebarContent
          sidebarData={sidebarData} selectedPage={selectedPage}
          onSelectPage={item => { onSelectPage(item); onMobileClose?.(); }}
          completedIds={completedIds}
        />
      </aside>
    </>
  );
}
