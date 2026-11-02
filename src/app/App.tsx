import { useEffect, useState } from 'react';
import { BrowserRouter, Link, Navigate, NavLink, Route, Routes, useNavigate, useParams } from 'react-router-dom';
import { AuthProvider, useAuth } from '@/app/providers/AuthProvider';
import { ToastProvider } from '@/app/providers/ToastProvider';
import Finance from '@/features/finance';
import Ai from '@/features/ai';
import Jobs from '@/features/ai/pages/JobsPage';
import GoldPrediction from '@/features/gold';
import ResourceWorkspace from '@/features/resources';

function ThemeShell() {
  const [dark, setDark] = useState(() => localStorage.getItem('app-theme') === 'dark');
  useEffect(() => {
    document.documentElement.classList.toggle('dark', dark);
    document.documentElement.dataset.theme = dark ? 'dark' : 'light';
    localStorage.setItem('app-theme', dark ? 'dark' : 'light');
  }, [dark]);
  return (
    <div className="standalone-shell">
      <GlobalNavbar dark={dark} setDark={setDark} />
      <Routes>
        <Route path="/" element={<Home />} />
        <Route path="/login" element={<Login />} />
        <Route path="/finance/*" element={<Protected><Finance /></Protected>} />
        <Route path="/ai" element={<Ai />} />
        <Route path="/ai/jobs" element={<Jobs />} />
        <Route path="/resources/*" element={<ResourceWorkspace />} />
        <Route path="/playbook" element={<Playbook />} />
        <Route path="/analytics" element={<Analytics />} />
        <Route path="/gold-prediction/:runId?" element={<GoldPrediction />} />
        <Route path="*" element={<Navigate to="/" replace />} />
      </Routes>
    </div>
  );
}

function GlobalNavbar({ dark, setDark }: { dark: boolean; setDark: React.Dispatch<React.SetStateAction<boolean>> }) {
  const [mobileOpen, setMobileOpen] = useState(false);
  const closeMobile = () => setMobileOpen(false);
  return (
    <header className="home-nav global-app-nav">
      <Link to="/" className="home-brand" aria-label="Sumanth workspace" onClick={closeMobile}>
        <span className="brand-avatar">SN</span>
        <strong>Sumanth</strong>
      </Link>
      <nav className="home-links" aria-label="Main navigation">
        <NavLink to="/ai">AI Studio</NavLink>
        <NavLink to="/finance">Finance</NavLink>
        <NavLink to="/resources">Resources</NavLink>
        <a href="/#experience">Experience</a>
        <a href="/#skills">Skills</a>
        <a href="https://github.com/" target="_blank" rel="noreferrer">GitHub</a>
        <a href="https://www.linkedin.com/" target="_blank" rel="noreferrer">LinkedIn</a>
      </nav>
      <div className="home-actions">
        <button type="button" className="icon-action" aria-label={dark ? 'Switch to light theme' : 'Switch to dark theme'} onClick={() => setDark(value => !value)}>
          {dark ? '☀' : '☾'}
        </button>
        <a className="resume-button" href="/Resume.pdf" download>Download CV</a>
        <button type="button" className="mobile-menu-button" aria-label="Toggle navigation menu" aria-expanded={mobileOpen} onClick={() => setMobileOpen(value => !value)}>
          <span /><span /><span />
        </button>
      </div>
      {mobileOpen && (
        <nav className="mobile-menu" aria-label="Mobile navigation">
          <NavLink to="/ai" onClick={closeMobile}>AI Studio</NavLink>
          <NavLink to="/finance" onClick={closeMobile}>Finance</NavLink>
          <NavLink to="/resources" onClick={closeMobile}>Resources</NavLink>
          <a href="/#experience" onClick={closeMobile}>Experience</a>
          <a href="/#skills" onClick={closeMobile}>Skills</a>
          <a href="https://github.com/" target="_blank" rel="noreferrer">GitHub</a>
          <a href="https://www.linkedin.com/" target="_blank" rel="noreferrer">LinkedIn</a>
        </nav>
      )}
    </header>
  );
}

function Protected({ children }: { children: React.ReactNode }) {
  const { isAuthenticated, isLoading } = useAuth();
  if (isLoading) return <div className="standalone-loading">Loading workspace…</div>;
  return isAuthenticated ? <>{children}</> : <Navigate to="/login" replace />;
}

function Login() {
  const { login, isAuthenticated } = useAuth();
  const navigate = useNavigate();
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  if (isAuthenticated) return <Navigate to="/finance" replace />;
  async function submit(event: React.FormEvent) {
    event.preventDefault();
    const result = await login(username, password);
    if (result.success) navigate('/finance');
    else setError(result.error || 'Login failed');
  }
  return (
    <main className="login-page">
      <form onSubmit={submit} className="login-card">
        <span className="login-mark">SN</span>
        <p>Private workspace</p><h1>Sign in to Finance</h1>
        {error && <div className="login-error">{error}</div>}
        <label>Username<input value={username} onChange={e => setUsername(e.target.value)} autoComplete="username" /></label>
        <label>Password<input type="password" value={password} onChange={e => setPassword(e.target.value)} autoComplete="current-password" /></label>
        <button type="submit">Continue</button>
      </form>
    </main>
  );
}

function Home() {
  const joiningDate = new Date(2021, 10, 22); // November 22, 2021
  const today = new Date();

  const experience =
    ((today.getTime() - joiningDate.getTime()) /
      (1000 * 60 * 60 * 24 * 365.25)).toFixed(1);
  return (
    <main className="clerk-home">
      <div className="home-main">
        <section className="hero">
          <div className="hero-grid" aria-hidden="true" />
          <div className="hero-copy-block">
            <div className="hero-badge"><span className="status-dot" />Available for ambitious projects</div>
            <h1>Engineering ideas into<br /><span>intelligent solutions.</span></h1>
            <p className="hero-copy">Full-stack developer crafting scalable web platforms, intelligent workflows, and seamless digital experiences with Angular, React, Node.js, and NestJS.</p>
            <div className="hero-actions"><Link to="/ai" className="primary-button">Explore AI Studio</Link><Link to="/resources" className="secondary-button">Browse resources</Link></div>
          </div>
          <div className="hero-profile">
            <div className="profile-orbit orbit-one" aria-hidden="true" />
            <div className="profile-orbit orbit-two" aria-hidden="true" />
            <img src="/image.jpg" alt="Sumanth Nagireddi" />
            <div className="profile-card"><span className="profile-status" /><div><strong>Sumanth Nagireddi</strong><small>Senior Full-Stack Engineer</small></div></div>
          </div>
        </section>

        <section className="feature-shell reveal" aria-label="Featured workspace">
          <div className="feature-tabs">
            <Link to="/ai" className="feature-tab active"><span className="tab-dot" />AI Studio</Link>
            <Link to="/resources" className="feature-tab"><span className="tab-dot" />Knowledge base</Link>
            <Link to="/playbook" className="feature-tab"><span className="tab-dot" />Developer playbook</Link>
          </div>
          <div className="workspace-preview">
            <aside className="preview-sidebar">
              <div className="preview-brand"><span className="preview-logo">SN</span><span>Engineering</span></div>
              <div className="preview-nav">
                <span className="preview-label">Workspace</span>
                <span className="preview-item active"><span className="preview-icon">⌂</span> Overview</span>
                <span className="preview-item"><span className="preview-icon">✦</span> AI Studio</span>
                <span className="preview-item"><span className="preview-icon">⌘</span> Resources</span>
                <span className="preview-item"><span className="preview-icon">↗</span> Projects</span>
              </div>
            </aside>
            <div className="preview-content">
              <div className="preview-header"><div><span className="preview-kicker">Engineering overview</span><h2>Ideas in motion</h2></div><span className="preview-period">Updated today</span></div>
              <div className="preview-stats">
                <article><span>Experience</span><strong>{experience} years</strong><small>Full-stack engineering</small></article>
                <article><span>Core stack</span><strong>React + Node</strong><small>Product delivery</small></article>
                <article><span>Current focus</span><strong>AI Native</strong><small>Building smarter workflows</small></article>
              </div>
              <div className="preview-chart"><div className="chart-heading"><div><span>Weekly engineering activity</span><strong>Consistent momentum</strong></div><span className="chart-period">7 days</span></div><div className="chart-bars" aria-hidden="true">{[46, 64, 52, 78, 68, 92, 84].map((height, index) => <span key={index} style={{ height: `${height}%` }} />)}</div></div>
            </div>
          </div>
        </section>

        <section className="metrics-section"><article><strong>{experience}+</strong><span>Years of engineering experience</span></article><article><strong>+</strong><span>Core technologies across product stacks</span></article><article><strong>End-to-end</strong><span>From architecture to polished delivery</span></article><article><strong>AI-ready</strong><span>Practical workflows built into products</span></article></section>
        <section id="experience" className="experience-section"><div className="experience-heading"><div><p className="section-kicker">Experience</p><h2>Turning complex systems into clear product experiences.</h2></div><p>Product-minded engineering across web applications, APIs, cloud-ready services, and AI-assisted workflows.</p></div><div className="experience-grid">
          <article className="experience-card"><div className="experience-meta"><span>November 2021 — June 2024</span><span>01</span></div><h3>Infosys</h3><p className="role-name">Full-stack Developer</p><p>Built responsive, business-critical web applications and reusable component systems.</p><div className="experience-tags"><span>React</span><span>Angular</span><span>REST APIs</span><span>TypeScript</span></div></article>
          <article className="experience-card"><div className="experience-meta"><span>June 2024 — December 2024</span><span>02</span></div><h3>Nagarro</h3><p className="role-name">Full-stack Developer</p><p>Delivered enterprise-scale applications with API integration and modern frontend patterns.</p><div className="experience-tags"><span>React</span><span>Node.js</span><span>Azure</span><span>NestJS</span></div></article>
          <article className="experience-card"><div className="experience-meta"><span>December 2024 — Present</span><span>03</span></div><h3>EPAM Systems</h3><p className="role-name">Full-stack Developer</p><p>Engineering robust, accessible enterprise applications with a focus on architecture, performance, API integration, and production-quality delivery.</p><div className="experience-tags"><span>Enterprise apps</span><span>Architecture</span><span>Cloud</span><span>AI workflows</span></div></article>
        </div></section>
        <section id="skills" className="skills-section">
          <div className="skills-intro"><p className="section-kicker">Capabilities</p><h2>A full-stack toolkit for building complete products.</h2></div>
          <div className="skills-grid">
            <article className="skill-card skill-featured"><div className="skill-card-heading"><span className="skill-number">01</span><span className="skill-status">Primary</span></div><h3>Frontend Engineering</h3><p>Building polished, accessible interfaces with strong component architecture, responsive behavior, state management, and reusable design systems.</p><div className="skill-list"><span>Angular</span><span>React</span><span>Next.js</span><span>TypeScript</span><span>RxJS</span><span>HTML / CSS</span></div></article>
            <article className="skill-card"><div className="skill-card-heading"><span className="skill-number">02</span><span className="skill-status">Primary</span></div><h3>Backend & APIs</h3><p>Designing secure APIs and maintainable services with clear contracts, authentication, validation, data modeling, and dependable integrations.</p><div className="skill-list"><span>Node.js</span><span>NestJS</span><span>REST</span><span>PostgreSQL</span><span>Auth</span></div></article>
            <article className="skill-card"><div className="skill-card-heading"><span className="skill-number">03</span><span className="skill-status">Delivery</span></div><h3>Engineering Delivery</h3><p>Translating product goals into reliable technical solutions through design reviews, iterative delivery, testing, performance work, and ownership.</p><div className="skill-list"><span>System design</span><span>Performance</span><span>Git</span><span>Testing</span><span>CI/CD</span></div></article>
            <article className="skill-card"><div className="skill-card-heading"><span className="skill-number">04</span><span className="skill-status">Growing</span></div><h3>AI & Developer Experience</h3><p>Creating practical AI-assisted experiences, prototypes, workflow automation, documentation tools, and developer-focused interfaces.</p><div className="skill-list"><span>AI SDKs</span><span>Prompt workflows</span><span>Automation</span><span>DX tooling</span></div></article>
          </div>
        </section>

        <section className="stack-section"><p className="section-kicker">Built across the stack</p><h2>One engineer. End-to-end product ownership.</h2><div className="stack-list"><span>Angular</span><span>React</span><span>Next.js</span><span>Node.js</span><span>NestJS</span><span>TypeScript</span><span>PostgreSQL</span><span>AI SDKs</span></div></section>
        <section className="testimonials-section"><div className="testimonials-heading"><p className="section-kicker">Working together</p><h2>Engineering built on clarity, ownership, and momentum.</h2></div><div className="testimonial-grid"><article><div className="quote-mark">“</div><p>Strong engineering starts with understanding the product. Every implementation should reduce complexity, not move it somewhere else.</p><span><strong>Product thinking</strong><small>Start with the problem</small></span></article><article><div className="quote-mark">“</div><p>Reliable software is the result of clear architecture, accessible interfaces, thoughtful testing, and continuous improvement.</p><span><strong>Engineering quality</strong><small>Built for the long term</small></span></article><article><div className="quote-mark">“</div><p>The best collaboration keeps momentum visible—shared context, direct communication, small decisions, and measurable progress.</p><span><strong>Team momentum</strong><small>Clear and collaborative</small></span></article></div></section>
        <section className="workspace-grid"><Link to="/ai" className="workspace-card ai-card"><div className="card-topline"><span className="card-icon">AI</span><span>01</span></div><h2>AI Studio</h2><p>Chat with connected models and explore practical AI-assisted engineering workflows.</p><span className="card-link">Open studio →</span></Link><Link to="/resources" className="workspace-card"><div className="card-topline"><span className="card-icon">KB</span><span>02</span></div><h2>Resources</h2><p>Browse architecture notes, interview materials, and reusable engineering knowledge.</p><span className="card-link">Browse knowledge →</span></Link><a href="https://github.com/" target="_blank" rel="noreferrer" className="workspace-card"><div className="card-topline"><span className="card-icon">GH</span><span>03</span></div><h2>Open Source</h2><p>Explore recent repositories, experiments, code samples, and public engineering work.</p><span className="card-link">Visit GitHub →</span></a></section>
        <section className="contact-section"><div className="contact-grid" aria-hidden="true" /><span className="contact-kicker">Have a product in mind?</span><h2>Let’s build something<br /><span>worth using.</span></h2><div className="contact-actions"><a href="mailto:you@example.com" className="primary-button">Start a conversation</a><a href="https://www.linkedin.com/" target="_blank" rel="noreferrer" className="secondary-button">Connect on LinkedIn</a></div></section>
      </div>
      <footer className="home-footer">
        <div className="footer-inner">
          <div className="footer-brand">
            <Link to="/" className="home-brand"><span className="brand-avatar">SN</span><span>Sumanth</span></Link>
            <p>Building reliable products, thoughtful developer tools, and connected web experiences.</p>
          </div>
          <nav className="footer-links" aria-label="Explore">
            <div><strong>Workspace</strong><Link to="/ai">AI Studio</Link><Link to="/resources">Resources</Link><Link to="/playbook">Playbook</Link></div>
            <div><strong>Connect</strong><a href="https://github.com/" target="_blank" rel="noreferrer">GitHub</a><a href="https://www.linkedin.com/" target="_blank" rel="noreferrer">LinkedIn</a><a href="mailto:you@example.com">Email</a></div>
          </nav>
        </div>
        <div className="footer-bottom"><span>© 2026 Sumanth Nagireddi</span><span>Built with React, TypeScript & NestJS</span></div>
      </footer>
    </main>
  );
}

function Resources() {
  const { '*': pagePath } = useParams();
  const navigate = useNavigate();
  const [mobileOpen, setMobileOpen] = useState(false);
  const [completed, setCompleted] = useState<Set<string>>(() => {
    try {
      const saved = JSON.parse(localStorage.getItem('resource-completed-pages') || '[]');
      return new Set(Array.isArray(saved) ? saved.filter((id): id is string => typeof id === 'string') : []);
    } catch {
      return new Set();
    }
  });

  const sections = [
    {
      id: 'getting-started', title: 'Engineering Guides', type: 'space', pages: [
        { id: 'quick-start', title: 'Quick start' },
        { id: 'project-layout', title: 'Project layout' },
      ]
    },
    {
      id: 'interview-preparation', title: 'Interview preparation', type: 'folder', pages: [
        { id: 'javascript', title: 'JavaScript fundamentals' },
        { id: 'react-patterns', title: 'React patterns' },
        { id: 'system-design', title: 'System design' },
      ]
    },
  ];
  const allPages = sections.flatMap(section => section.pages);
  const selected = allPages.find(page => page.id === pagePath) ?? allPages[0];
  const progress = Math.round((completed.size / allPages.length) * 100);

  useEffect(() => {
    localStorage.setItem('resource-completed-pages', JSON.stringify([...completed]));
  }, [completed]);

  useEffect(() => {
    if (!pagePath) navigate('/resources/quick-start', { replace: true });
  }, [navigate, pagePath]);

  function completePage() {
    setCompleted(current => {
      const next = new Set(current);
      next.add(selected.id);
      return next;
    });
    const index = allPages.findIndex(page => page.id === selected.id);
    if (index >= 0 && index < allPages.length - 1) navigate(`/resources/${allPages[index + 1].id}`);
  }

  const descriptions: Record<string, string> = {
    'quick-start': 'A practical starting point for building clean, maintainable applications.',
    'project-layout': 'Structure an application so modules remain clear as the codebase grows.',
    javascript: 'Core language concepts, execution behavior, and interview patterns.',
    'react-patterns': 'Reusable component patterns for predictable React applications.',
    'system-design': 'Architecture fundamentals for scalable, reliable web systems.',
  };

  return (
    <div className="resources-theme-root docs-root">
      <header className="resources-docs-header">
        <button type="button" className="resources-mobile-menu" onClick={() => setMobileOpen(true)} aria-label="Open sidebar">☰</button>
        <Link to="/resources" className="resources-docs-brand" aria-label="Interview Resources">
          <span className="resources-brand-mark" aria-hidden="true"><span /><span /></span>
          <span className="resources-brand-name">Resources</span>
        </Link>
        <div className="resources-docs-header-spacer" />
        <button className="resources-docs-search" type="button" title="Search resources" aria-label="Search resources">
          <span>⌕</span><span>Navigation</span>
        </button>
      </header>
      <div className="resources-main-row">
        <aside className={`resources-sidebar sidebar-desktop ${mobileOpen ? 'mobile-open' : ''}`}>
          {mobileOpen && <button type="button" className="resources-mobile-close" onClick={() => setMobileOpen(false)} aria-label="Close sidebar">×</button>}
          <div className="resources-progress">
            <div className="resources-progress-top"><span>Learning progress</span><strong>{progress}%</strong></div>
            <div className="resources-progress-track"><span style={{ width: `${progress}%` }} /></div>
          </div>
          <nav aria-label="Resource pages">
            {sections.map(section => (
              <div className="resources-sidebar-section" key={section.id}>
                <div className="resources-sidebar-title"><span>{section.type === 'space' ? '⌘' : '▾'}</span><strong>{section.title}</strong></div>
                {section.pages.map(page => (
                  <Link
                    key={page.id}
                    to={`/resources/${page.id}`}
                    onClick={() => setMobileOpen(false)}
                    className={`resources-sidebar-page ${selected.id === page.id ? 'active' : ''}`}
                  >
                    <span className="resources-page-status">{completed.has(page.id) ? '✓' : '○'}</span>
                    <span>{page.title}</span>
                  </Link>
                ))}
              </div>
            ))}
          </nav>
        </aside>
        <section className="docs-editor-shell">
          <div className="docs-actionbar">
            <div className="docs-breadcrumb">Resources <span>/</span> <strong>{selected.title}</strong></div>
            <div className="docs-actions">
              <button type="button" className="docs-save-button" onClick={() => localStorage.setItem(`resource-page-${selected.id}`, 'saved')}>Save</button>
              <button type="button" className="docs-complete-button" onClick={completePage}>{completed.has(selected.id) ? 'Completed' : 'Mark complete'}</button>
            </div>
          </div>
          <div className="docs-editor-scroll">
            <div className="docs-article-layout">
              <article className="docs-article">
                <header className="docs-article-header">
                  <h1>{selected.title}</h1>
                  <p>{descriptions[selected.id] ?? 'Practical engineering guidance and interview preparation material.'}</p>
                  <button type="button" className="docs-markdown-button"><span>MD</span><span>Markdown</span></button>
                </header>
                <div className="resources-editor-content">
                  <h2>Overview</h2>
                  <p>Use this documentation area to capture implementation notes, examples, commands, and interview preparation material.</p>
                  <h2>Quick example</h2>
                  <pre><code>{selected.id === 'javascript' ? 'const skills = ["arrays", "closures", "async"];' : 'npm install\nnpm run dev'}</code></pre>
                  <h2>Next steps</h2>
                  <ul><li>Review the core concepts</li><li>Build a small example</li><li>Add tests and edge cases</li></ul>
                </div>
              </article>
              <aside className="docs-toc">
                <div className="docs-toc-inner">
                  <div className="docs-toc-title">On this page</div>
                  <button type="button" className="toc-current">Overview</button>
                  <button type="button">Quick example</button>
                  <button type="button">Next steps</button>
                </div>
              </aside>
            </div>
          </div>
        </section>
      </div>
      {mobileOpen && <button type="button" className="resources-mobile-backdrop" onClick={() => setMobileOpen(false)} aria-label="Close sidebar overlay" />}
    </div>
  );
}

function Playbook() {
  return <main className="content-page playbook-page"><p className="section-kicker">Developer playbook</p><h1>Build with confidence</h1><div className="resource-grid"><article><h2>Design</h2><p>Clarify the product goal and technical constraints.</p></article><article><h2>Implement</h2><p>Keep changes small, typed, accessible, and testable.</p></article><article><h2>Verify</h2><p>Build, test, review edge cases, and measure behavior.</p></article></div></main>;
}

function Analytics() {
  return <main className="content-page"><p className="section-kicker">Analytics</p><h1>Workspace analytics</h1><p>Route activity and application usage are available through the connected backend.</p></main>;
}

export default function App() {
  return (
    <BrowserRouter>
      <AuthProvider>
        <ToastProvider>
          <ThemeShell />
        </ToastProvider>
      </AuthProvider>
    </BrowserRouter>
  );
}
