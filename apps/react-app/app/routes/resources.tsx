import React, { useState } from 'react';

// ─── Types ────────────────────────────────────────────────────────────────────
interface SidebarItem {
  id: string;
  label: string;
  type: 'folder' | 'page';
  children?: SidebarItem[];
}

// ─── Sidebar Data ─────────────────────────────────────────────────────────────
const SIDEBAR_DATA: SidebarItem[] = [
  {
    id: '65721',
    label: 'Angular',
    type: 'folder',
    children: [
      {
        id: '1671199',
        label: 'State Management (NGRX)',
        type: 'folder',
        children: [
          { id: '131074', label: 'NGRX', type: 'page' },
        ],
      },
      {
        id: '1736732',
        label: 'Core',
        type: 'folder',
        children: [
          { id: '196647', label: 'Signals', type: 'page' },
          { id: '3244036', label: 'Angular Execution Flow', type: 'page' },
          { id: '3899425', label: 'Change Detection', type: 'page' },
          { id: '3932161', label: 'Questions', type: 'page' },
          { id: '3964960', label: 'Life Cycle Hooks', type: 'page' },
        ],
      },
      {
        id: '1638407',
        label: 'Dependency Injection',
        type: 'folder',
        children: [
          { id: '1736744', label: 'DI', type: 'page' },
        ],
      },
      { id: '69009450', label: 'Angular Topics', type: 'page' },
    ],
  },
  {
    id: '1703939',
    label: 'Javascript',
    type: 'folder',
    children: [
      { id: '1638412', label: 'Closures', type: 'page' },
      { id: '1736779', label: 'Hoisting', type: 'page' },
      { id: '3997713', label: 'Promises', type: 'page' },
      { id: '4849694', label: 'Async/Await', type: 'page' },
      { id: '4849713', label: 'Objects', type: 'page' },
      { id: '4849729', label: 'Classes and OOPS', type: 'page' },
      { id: '4849738', label: 'DOM', type: 'page' },
      { id: '4849755', label: 'Scope', type: 'page' },
      { id: '4915201', label: 'Event Loop in JS', type: 'page' },
      { id: '4915239', label: 'this Keyword', type: 'page' },
      { id: '4915248', label: 'Arrays', type: 'page' },
      { id: '4915264', label: 'Error Handling', type: 'page' },
      { id: '4915325', label: 'Polyfills', type: 'page' },
      { id: '4915334', label: 'Object properties configuration', type: 'page' },
      { id: '4947988', label: 'Call Apply Bind', type: 'page' },
      { id: '4948008', label: 'Datatypes', type: 'page' },
      { id: '4948018', label: 'Events & Event Propagation', type: 'page' },
      { id: '4948062', label: 'IIFE', type: 'page' },
      { id: '4948071', label: 'SetTimeout & SetInterval', type: 'page' },
      { id: '4980749', label: 'Prototype', type: 'page' },
      { id: '4980759', label: 'Functions', type: 'page' },
      { id: '4980783', label: 'Modules', type: 'page' },
      { id: '4980793', label: 'Storages', type: 'page' },
      { id: '37486596', label: 'How Web works', type: 'page' },
      { id: '38764545', label: 'How JavaScript code Executes and allocates Memory', type: 'page' },
      { id: '55181316', label: 'Hoisting in JS', type: 'page' },
      { id: '55869441', label: 'How Functions works in JavaScript', type: 'page' },
      { id: '56197121', label: 'Execution Context', type: 'page' },
      { id: '65404929', label: 'Iterators & Generators', type: 'page' },
      { id: '69009442', label: 'JS Topics', type: 'page' },
      { id: '94961670', label: 'Symbol & Well-known Symbols', type: 'page' },
      { id: '94961678', label: 'Map and Set', type: 'page' },
      { id: '94961693', label: 'Memory leaks & Garbage Collection', type: 'page' },
      { id: '94961701', label: 'Design patterns (Observer, Singleton, Factory)', type: 'page' },
      { id: '95059976', label: 'Microtasks vs Macrotasks', type: 'page' },
      { id: '95059984', label: 'Debounce & Throttle', type: 'page' },
      { id: '95125505', label: 'Operators', type: 'page' },
      { id: '95125513', label: 'WeakMap & WeakSet', type: 'page' },
      { id: '95125521', label: 'AbortController / AbortSignal', type: 'page' },
      { id: '95125529', label: 'IntersectionObserver / MutationObserver', type: 'page' },
      { id: '95125537', label: 'Bundlers (Webpack/Vite/Rollup concepts)', type: 'page' },
      { id: '95158287', label: 'Web Workers', type: 'page' },
      { id: '95223816', label: 'ES Modules vs CommonJS', type: 'page' },
      { id: '95289345', label: 'XSS & CSRF basics/Content Security Policy', type: 'page' },
      { id: '95289353', label: 'Javascript Problems', type: 'page' },
      { id: '95649793', label: 'JavaScript Paradigms', type: 'page' },
      { id: '96043010', label: 'Object Oriented Programming (OOPS)', type: 'page' },
      { id: '96206853', label: 'Polymorphism', type: 'page' },
      { id: '96632833', label: 'Super keyword', type: 'page' },
      { id: '96862221', label: 'Inheritance', type: 'page' },
    ],
  },
];

// Count total pages recursively
function countPages(items: SidebarItem[]): number {
  return items.reduce((acc, item) => {
    if (item.type === 'page') return acc + 1;
    return acc + (item.children ? countPages(item.children) : 0);
  }, 0);
}
const TOTAL = countPages(SIDEBAR_DATA);

// Flatten pages for progress tracking
function flattenPages(items: SidebarItem[]): SidebarItem[] {
  const result: SidebarItem[] = [];
  for (const item of items) {
    if (item.type === 'page') result.push(item);
    if (item.children) result.push(...flattenPages(item.children));
  }
  return result;
}
const ALL_PAGES = flattenPages(SIDEBAR_DATA);

// Nav items (top section of sidebar)
const NAV_ITEMS = [
  { id: 'home', label: 'Start here', icon: '⊟', badge: 0 },
  { id: 'dashboard', label: 'Dashboard', icon: '⊞', badge: 1 },
  { id: 'angular', label: 'Angular', icon: '⊗', badge: 2 },
  { id: 'javascript', label: 'JavaScript', icon: '◻', badge: 3 },
];

// Sidebar folder row (collapsible)
const FolderRow: React.FC<{
  item: SidebarItem;
  index: number;
  selectedId: string | null;
  completedIds: Set<string>;
  onSelect: (item: SidebarItem) => void;
  depth?: number;
}> = ({ item, index, selectedId, completedIds, onSelect, depth = 0 }) => {
  const [open, setOpen] = useState(depth === 0);

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
          padding: '5px 12px 5px',
          paddingLeft: `${12 + depth * 12}px`,
          cursor: 'pointer',
          background: isSelected ? '#fff5f0' : 'transparent',
          borderRight: isSelected ? '2px solid #d95f2e' : '2px solid transparent',
        }}
        onMouseEnter={e => { if (!isSelected) (e.currentTarget as HTMLDivElement).style.background = '#f9f9f9'; }}
        onMouseLeave={e => { if (!isSelected) (e.currentTarget as HTMLDivElement).style.background = 'transparent'; }}
      >
        <span style={{
          width: '8px', height: '8px', borderRadius: '50%', flexShrink: 0,
          background: isDone ? '#d95f2e' : 'transparent',
          border: `1.5px solid ${isDone ? '#d95f2e' : '#c0c0c0'}`,
        }} />
        <span style={{
          fontSize: '12.5px',
          color: isSelected ? '#d95f2e' : '#444',
          overflow: 'hidden',
          textOverflow: 'ellipsis',
          whiteSpace: 'nowrap',
          flex: 1,
        }}>
          {item.label}
        </span>
      </div>
    );
  }

  // Folder row
  return (
    <div>
      <div
        onClick={() => setOpen(o => !o)}
        style={{
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
          padding: '7px 12px',
          paddingLeft: `${12 + depth * 12}px`,
          cursor: 'pointer',
          userSelect: 'none' as const,
        }}
        onMouseEnter={e => (e.currentTarget as HTMLDivElement).style.background = '#f5f5f5'}
        onMouseLeave={e => (e.currentTarget as HTMLDivElement).style.background = 'transparent'}
      >
        <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
          {depth === 0 && (
            <span style={{
              width: '20px', height: '20px', borderRadius: '4px',
              background: '#f0ece8', display: 'flex', alignItems: 'center',
              justifyContent: 'center', fontSize: '11px', fontWeight: 700,
              color: '#888', flexShrink: 0,
            }}>
              {index + 1}
            </span>
          )}
          <span style={{ fontSize: '13px', fontWeight: 600, color: '#1a1a1a' }}>
            {item.label}
          </span>
        </div>
        <span style={{ fontSize: '10px', color: '#bbb' }}>{open ? '▾' : '›'}</span>
      </div>
      {open && item.children && (
        <div>
          {item.children.map((child, i) => (
            <FolderRow
              key={child.id}
              item={child}
              index={i}
              selectedId={selectedId}
              completedIds={completedIds}
              onSelect={onSelect}
              depth={depth + 1}
            />
          ))}
        </div>
      )}
    </div>
  );
};

// Feature card
const FeatureCard: React.FC<{ icon: string; title: string; desc: string }> = ({ icon, title, desc }) => (
  <div style={{
    background: '#fff',
    border: '1px solid #ece8e3',
    borderRadius: '10px',
    padding: '18px',
    display: 'flex',
    gap: '14px',
    alignItems: 'flex-start',
  }}>
    <div style={{
      width: '36px', height: '36px', borderRadius: '8px',
      background: '#fff5f0', border: '1px solid #f5ddd5',
      display: 'flex', alignItems: 'center', justifyContent: 'center',
      fontSize: '18px', flexShrink: 0,
    }}>
      {icon}
    </div>
    <div>
      <div style={{ fontSize: '14px', fontWeight: 700, color: '#1a1a1a', marginBottom: '4px' }}>{title}</div>
      <div style={{ fontSize: '12.5px', color: '#777', lineHeight: 1.55 }}>{desc}</div>
    </div>
  </div>
);

// ─── Main Component ───────────────────────────────────────────────────────────
export default function Resources() {
  const [activeNav, setActiveNav] = useState('home');
  const [selectedPage, setSelectedPage] = useState<SidebarItem | null>(null);
  const [completedIds, setCompletedIds] = useState<Set<string>>(new Set());
  const [name, setName] = useState('');
  const [started, setStarted] = useState(false);

  const done = completedIds.size;
  const progress = Math.round((done / TOTAL) * 100);

  const handleSelectPage = (item: SidebarItem) => {
    setSelectedPage(item);
    setActiveNav('');
  };

  const handleComplete = () => {
    if (selectedPage && !completedIds.has(selectedPage.id)) {
      setCompletedIds(prev => new Set([...prev, selectedPage.id]));
      // advance to next page
      const idx = ALL_PAGES.findIndex(p => p.id === selectedPage.id);
      if (idx < ALL_PAGES.length - 1) setSelectedPage(ALL_PAGES[idx + 1]);
    }
  };

  // Breadcrumb label
  const breadcrumb = selectedPage
    ? selectedPage.label
    : activeNav === 'home' ? 'Start here'
    : activeNav === 'dashboard' ? 'Dashboard'
    : activeNav === 'angular' ? 'Angular'
    : 'JavaScript';

  return (
    <div style={{
      display: 'flex',
      height: '100vh',
      overflow: 'hidden',
      background: '#f7f4f0',
      fontFamily: '-apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif',
      color: '#1a1a1a',
    }}>

      {/* ── SIDEBAR ── */}
      <aside style={{
        width: '220px',
        minWidth: '220px',
        background: '#fff',
        borderRight: '1px solid #ece8e3',
        display: 'flex',
        flexDirection: 'column',
        overflowY: 'auto',
      }}>
        {/* Logo area */}
        <div style={{ padding: '16px 14px 12px', borderBottom: '1px solid #ece8e3' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
            <div style={{
              width: '36px', height: '36px', borderRadius: '8px',
              background: '#d95f2e', display: 'flex', alignItems: 'center',
              justifyContent: 'center', color: '#fff', fontWeight: 800,
              fontSize: '13px', flexShrink: 0, letterSpacing: '-0.5px',
            }}>
              IR
            </div>
            <div>
              <div style={{ fontSize: '13px', fontWeight: 700, color: '#1a1a1a', lineHeight: 1.2 }}>
                Interview Resources
              </div>
              <div style={{ fontSize: '11px', color: '#999', marginTop: '1px' }}>
                Foundations · self-paced
              </div>
            </div>
          </div>
        </div>

        {/* Top nav items */}
        <div style={{ padding: '8px 0', borderBottom: '1px solid #ece8e3' }}>
          {NAV_ITEMS.map(nav => {
            const active = activeNav === nav.id && !selectedPage;
            return (
              <div
                key={nav.id}
                onClick={() => { setActiveNav(nav.id); setSelectedPage(null); }}
                style={{
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'space-between',
                  padding: '8px 14px',
                  cursor: 'pointer',
                  background: active ? '#fff5f0' : 'transparent',
                  borderRight: active ? '2px solid #d95f2e' : '2px solid transparent',
                }}
                onMouseEnter={e => { if (!active) (e.currentTarget as HTMLDivElement).style.background = '#fafafa'; }}
                onMouseLeave={e => { if (!active) (e.currentTarget as HTMLDivElement).style.background = 'transparent'; }}
              >
                <div style={{ display: 'flex', alignItems: 'center', gap: '9px' }}>
                  <span style={{ fontSize: '15px', color: active ? '#d95f2e' : '#888', width: '16px', textAlign: 'center' }}>
                    {nav.icon}
                  </span>
                  <span style={{ fontSize: '13px', fontWeight: active ? 600 : 400, color: active ? '#d95f2e' : '#333' }}>
                    {nav.label}
                  </span>
                </div>
                <span style={{
                  fontSize: '11px', fontWeight: 600,
                  color: active ? '#d95f2e' : '#bbb',
                }}>
                  {nav.badge}
                </span>
              </div>
            );
          })}
        </div>

        {/* Lessons section */}
        <div style={{ flex: 1 }}>
          <div style={{ padding: '10px 14px 6px', display: 'flex', alignItems: 'center', gap: '6px' }}>
            <span style={{ fontSize: '10px', fontWeight: 700, color: '#aaa', letterSpacing: '0.08em', textTransform: 'uppercase' as const }}>
              TOPICS · {done}/{TOTAL} DONE
            </span>
          </div>
          {SIDEBAR_DATA.map((item, idx) => (
            <FolderRow
              key={item.id}
              item={item}
              index={idx}
              selectedId={selectedPage?.id ?? null}
              completedIds={completedIds}
              onSelect={handleSelectPage}
            />
          ))}
        </div>
      </aside>

      {/* ── MAIN ── */}
      <div style={{ flex: 1, display: 'flex', flexDirection: 'column', overflow: 'hidden' }}>

        {/* Top bar */}
        <div style={{
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
          padding: '0 28px',
          height: '48px',
          background: '#fff',
          borderBottom: '1px solid #ece8e3',
          flexShrink: 0,
        }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '6px', fontSize: '13px', color: '#aaa' }}>
            <span style={{ cursor: 'pointer', color: '#bbb' }}>TOPICS</span>
            <span>/</span>
            <span style={{ color: '#333', fontWeight: 500 }}>{breadcrumb}</span>
          </div>
          <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
            <div style={{
              width: '120px', height: '4px', borderRadius: '2px', background: '#ece8e3',
            }}>
              <div style={{
                height: '100%', borderRadius: '2px',
                background: '#d95f2e',
                width: `${progress}%`,
                transition: 'width 0.3s',
              }} />
            </div>
            <span style={{ fontSize: '12px', color: '#aaa', whiteSpace: 'nowrap' as const }}>{done}/{TOTAL}</span>
          </div>
        </div>

        {/* Content area */}
        <div style={{ flex: 1, overflowY: 'auto', padding: '36px 48px' }}>

          {/* ─── START HERE ─── */}
          {activeNav === 'home' && !selectedPage && (
            <div style={{ maxWidth: '680px' }}>
              <div style={{ fontSize: '11px', fontWeight: 700, color: '#aaa', letterSpacing: '0.1em', textTransform: 'uppercase' as const, marginBottom: '10px' }}>
                WELCOME TO THE COURSE
              </div>
              <h1 style={{ fontSize: '28px', fontWeight: 800, color: '#1a1a1a', margin: '0 0 14px', lineHeight: 1.25 }}>
                Interview Resources — Foundations
              </h1>
              <p style={{ fontSize: '14px', color: '#555', lineHeight: 1.7, margin: '0 0 28px' }}>
                A self-paced study guide for frontend interviews. Work through topics across Angular and
                JavaScript — each with explanations and key concepts — track your progress, and finish fully prepared.
              </p>

              {/* Name card */}
              {!started ? (
                <div style={{
                  background: '#fff', border: '1px solid #ece8e3',
                  borderRadius: '12px', padding: '24px', marginBottom: '28px',
                }}>
                  <div style={{ fontSize: '14px', fontWeight: 600, color: '#1a1a1a', marginBottom: '12px' }}>
                    What should we call you?
                  </div>
                  <input
                    type="text"
                    value={name}
                    onChange={e => setName(e.target.value)}
                    placeholder="Your name"
                    style={{
                      width: '100%', padding: '10px 14px',
                      border: '1px solid #ddd', borderRadius: '8px',
                      fontSize: '14px', color: '#1a1a1a', outline: 'none',
                      boxSizing: 'border-box' as const, marginBottom: '8px',
                      fontFamily: 'inherit',
                    }}
                  />
                  <div style={{ fontSize: '11.5px', color: '#aaa', marginBottom: '18px' }}>
                    Used to greet you and track your progress. Stored only in this browser — never sent anywhere.
                  </div>
                  <div style={{ display: 'flex', gap: '10px', alignItems: 'center' }}>
                    <button
                      onClick={() => { setStarted(true); handleSelectPage(ALL_PAGES[0]); }}
                      style={{
                        background: '#d95f2e', color: '#fff',
                        border: 'none', borderRadius: '8px',
                        padding: '10px 20px', fontSize: '13.5px',
                        fontWeight: 600, cursor: 'pointer',
                        display: 'flex', alignItems: 'center', gap: '6px',
                        fontFamily: 'inherit',
                      }}
                    >
                      Begin studying →
                    </button>
                    <button
                      onClick={() => setActiveNav('dashboard')}
                      style={{
                        background: 'transparent', color: '#555',
                        border: '1px solid #ddd', borderRadius: '8px',
                        padding: '10px 20px', fontSize: '13.5px',
                        fontWeight: 500, cursor: 'pointer',
                        fontFamily: 'inherit',
                      }}
                    >
                      See topics
                    </button>
                  </div>
                </div>
              ) : (
                <div style={{
                  background: '#fff5f0', border: '1px solid #f5ddd5',
                  borderRadius: '12px', padding: '16px 20px', marginBottom: '28px',
                }}>
                  <span style={{ fontSize: '14px', color: '#d95f2e', fontWeight: 600 }}>
                    Welcome back{name ? `, ${name}` : ''}! 👋
                  </span>
                  <span style={{ fontSize: '13.5px', color: '#888', marginLeft: '8px' }}>
                    {done}/{TOTAL} topics completed
                  </span>
                </div>
              )}

              {/* What's inside */}
              <div style={{ fontSize: '13px', fontWeight: 700, color: '#1a1a1a', marginBottom: '14px', display: 'flex', alignItems: 'center', gap: '6px' }}>
                <span style={{ width: '8px', height: '8px', borderRadius: '50%', background: '#d95f2e', display: 'inline-block' }} />
                What's inside
              </div>
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '12px' }}>
                <FeatureCard icon="⊞" title="Angular Topics" desc="State management, change detection, signals, lifecycle hooks, DI and more." />
                <FeatureCard icon="◻" title={`JS Topics (${countPages(SIDEBAR_DATA.find(s => s.id === '1703939')?.children ?? [])})`} desc="Closures, event loop, prototypes, async patterns, OOP, design patterns and more." />
                <FeatureCard icon="⊗" title="Core Concepts" desc="Fundamental building blocks explained with examples and real interview angles." />
                <FeatureCard icon="⊟" title="Progress Tracking" desc="Mark topics as done — your progress is saved locally and shown in the sidebar." />
              </div>
            </div>
          )}

          {/* ─── DASHBOARD ─── */}
          {activeNav === 'dashboard' && !selectedPage && (
            <div style={{ maxWidth: '720px' }}>
              <div style={{ fontSize: '11px', fontWeight: 700, color: '#aaa', letterSpacing: '0.1em', textTransform: 'uppercase' as const, marginBottom: '10px' }}>
                OVERVIEW
              </div>
              <h1 style={{ fontSize: '24px', fontWeight: 800, color: '#1a1a1a', margin: '0 0 6px' }}>Dashboard</h1>
              <p style={{ fontSize: '14px', color: '#777', margin: '0 0 28px', lineHeight: 1.6 }}>
                Your overall progress across all topics.
              </p>

              {/* Progress card */}
              <div style={{ background: '#fff', border: '1px solid #ece8e3', borderRadius: '12px', padding: '24px', marginBottom: '20px' }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '14px' }}>
                  <span style={{ fontSize: '14px', fontWeight: 600, color: '#1a1a1a' }}>Overall Progress</span>
                  <span style={{ fontSize: '13px', color: '#d95f2e', fontWeight: 700 }}>{done}/{TOTAL} done</span>
                </div>
                <div style={{ height: '8px', background: '#f0ece8', borderRadius: '4px', overflow: 'hidden' }}>
                  <div style={{ height: '100%', background: '#d95f2e', width: `${progress}%`, borderRadius: '4px', transition: 'width 0.4s' }} />
                </div>
                <div style={{ fontSize: '12px', color: '#aaa', marginTop: '8px' }}>{progress}% complete</div>
              </div>

              {/* Domain cards */}
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '12px' }}>
                {SIDEBAR_DATA.map((folder, i) => {
                  const pages = flattenPages(folder.children ?? []);
                  const folderDone = pages.filter(p => completedIds.has(p.id)).length;
                  const pct = pages.length > 0 ? Math.round((folderDone / pages.length) * 100) : 0;
                  return (
                    <div key={folder.id} style={{
                      background: '#fff', border: '1px solid #ece8e3',
                      borderRadius: '10px', padding: '18px',
                    }}>
                      <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '12px' }}>
                        <span style={{
                          width: '24px', height: '24px', borderRadius: '6px',
                          background: '#f0ece8', display: 'flex', alignItems: 'center', justifyContent: 'center',
                          fontSize: '11px', fontWeight: 800, color: '#888',
                        }}>{i + 1}</span>
                        <span style={{ fontSize: '13px', fontWeight: 700, color: '#1a1a1a' }}>{folder.label}</span>
                      </div>
                      <div style={{ height: '5px', background: '#f0ece8', borderRadius: '3px', overflow: 'hidden', marginBottom: '6px' }}>
                        <div style={{ height: '100%', background: '#d95f2e', width: `${pct}%`, borderRadius: '3px' }} />
                      </div>
                      <div style={{ fontSize: '12px', color: '#aaa' }}>{folderDone}/{pages.length} topics</div>
                    </div>
                  );
                })}
              </div>
            </div>
          )}

          {/* ─── TOPIC PAGE ─── */}
          {selectedPage && (
            <div style={{ maxWidth: '680px' }}>
              <div style={{ fontSize: '11px', fontWeight: 700, color: '#aaa', letterSpacing: '0.1em', textTransform: 'uppercase' as const, marginBottom: '10px' }}>
                TOPIC
              </div>
              <h1 style={{ fontSize: '24px', fontWeight: 800, color: '#1a1a1a', margin: '0 0 14px', lineHeight: 1.3 }}>
                {selectedPage.label}
              </h1>

              {/* Completion badge */}
              {completedIds.has(selectedPage.id) && (
                <div style={{
                  display: 'inline-flex', alignItems: 'center', gap: '6px',
                  background: '#f0fdf4', border: '1px solid #bbf7d0',
                  borderRadius: '999px', padding: '4px 12px', marginBottom: '20px',
                }}>
                  <span style={{ color: '#15803d', fontSize: '12px' }}>✓</span>
                  <span style={{ fontSize: '12px', fontWeight: 600, color: '#15803d' }}>Completed</span>
                </div>
              )}

              {/* Content card */}
              <div style={{
                background: '#fff', border: '1px solid #ece8e3',
                borderRadius: '12px', padding: '24px', marginBottom: '20px',
              }}>
                <div style={{ fontSize: '14px', fontWeight: 600, color: '#1a1a1a', marginBottom: '12px' }}>
                  Overview
                </div>
                <p style={{ fontSize: '14px', color: '#555', lineHeight: 1.75, margin: 0 }}>
                  Study notes and explanations for <strong>{selectedPage.label}</strong> will appear here.
                  This topic covers key interview concepts, common patterns, and best practices you
                  should be able to discuss confidently.
                </p>
              </div>

              {/* Tip block */}
              <div style={{
                borderLeft: '3px solid #f59e0b', background: '#fffbeb',
                padding: '12px 16px', borderRadius: '0 8px 8px 0', marginBottom: '20px',
              }}>
                <div style={{ fontSize: '12px', fontWeight: 700, color: '#b45309', marginBottom: '4px' }}>★ Interview Tip</div>
                <div style={{ fontSize: '13.5px', color: '#374151', lineHeight: 1.6 }}>
                  When asked about <strong>{selectedPage.label}</strong>, always start with the "why" before the "how" — interviewers want to know you understand the problem it solves.
                </div>
              </div>

              {/* Mark complete button */}
              {!completedIds.has(selectedPage.id) ? (
                <button
                  onClick={handleComplete}
                  style={{
                    background: '#d95f2e', color: '#fff',
                    border: 'none', borderRadius: '8px',
                    padding: '11px 24px', fontSize: '13.5px',
                    fontWeight: 600, cursor: 'pointer',
                    fontFamily: 'inherit',
                    display: 'flex', alignItems: 'center', gap: '6px',
                  }}
                >
                  Mark complete →
                </button>
              ) : (
                <button
                  onClick={() => {
                    const idx = ALL_PAGES.findIndex(p => p.id === selectedPage.id);
                    if (idx < ALL_PAGES.length - 1) setSelectedPage(ALL_PAGES[idx + 1]);
                  }}
                  style={{
                    background: '#1a1a1a', color: '#fff',
                    border: 'none', borderRadius: '8px',
                    padding: '11px 24px', fontSize: '13.5px',
                    fontWeight: 600, cursor: 'pointer',
                    fontFamily: 'inherit',
                    display: 'flex', alignItems: 'center', gap: '6px',
                  }}
                >
                  Next topic →
                </button>
              )}
            </div>
          )}

          {/* ─── ANGULAR / JS FILTER VIEWS ─── */}
          {(activeNav === 'angular' || activeNav === 'javascript') && !selectedPage && (() => {
            const folder = SIDEBAR_DATA.find(s => s.id === (activeNav === 'angular' ? '65721' : '1703939'));
            if (!folder) return null;
            const pages = flattenPages(folder.children ?? []);
            return (
              <div style={{ maxWidth: '680px' }}>
                <div style={{ fontSize: '11px', fontWeight: 700, color: '#aaa', letterSpacing: '0.1em', textTransform: 'uppercase' as const, marginBottom: '10px' }}>
                  {activeNav.toUpperCase()} TOPICS
                </div>
                <h1 style={{ fontSize: '24px', fontWeight: 800, color: '#1a1a1a', margin: '0 0 20px' }}>{folder.label}</h1>
                <div style={{ display: 'flex', flexWrap: 'wrap' as const, gap: '8px' }}>
                  {pages.map(page => (
                    <div
                      key={page.id}
                      onClick={() => handleSelectPage(page)}
                      style={{
                        padding: '7px 14px', borderRadius: '999px',
                        border: `1px solid ${completedIds.has(page.id) ? '#bbf7d0' : '#ece8e3'}`,
                        background: completedIds.has(page.id) ? '#f0fdf4' : '#fff',
                        fontSize: '12.5px', fontWeight: 500,
                        color: completedIds.has(page.id) ? '#15803d' : '#444',
                        cursor: 'pointer',
                        display: 'flex', alignItems: 'center', gap: '6px',
                      }}
                    >
                      {completedIds.has(page.id) && <span style={{ color: '#15803d', fontSize: '10px' }}>✓</span>}
                      {page.label}
                    </div>
                  ))}
                </div>
              </div>
            );
          })()}

        </div>
      </div>
    </div>
  );
}
