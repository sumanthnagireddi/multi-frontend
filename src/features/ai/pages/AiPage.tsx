import { useEffect, useRef, useState } from 'react';
import { Link } from 'react-router-dom';
import { environment } from '@/shared/config/env';

type Message = { role: 'user' | 'assistant'; content: string };

export default function AiPage() {
  const [messages, setMessages] = useState<Message[]>([]);
  const [input, setInput] = useState('');
  const [loading, setLoading] = useState(false);
  const sessionRef = useRef('');
  const endRef = useRef<HTMLDivElement>(null);
  const api = environment.aiApiUrl;

  useEffect(() => {
    endRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages, loading]);

  async function submit(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();
    const text = input.trim();
    if (!text || loading) return;
    setInput('');
    setMessages(current => [...current, { role: 'user', content: text }]);
    setLoading(true);
    try {
      const response = await fetch(`${api}/agent/message`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ message: text, sessionId: sessionRef.current || undefined }),
      });
      const data = await response.json();
      if (!response.ok) throw new Error(data.message || 'Agent request failed');
      sessionRef.current = data.sessionId || sessionRef.current;
      setMessages(current => [...current, { role: 'assistant', content: data.answer || data.response || JSON.stringify(data) }]);
    } catch (error) {
      setMessages(current => [...current, { role: 'assistant', content: error instanceof Error ? error.message : 'Unable to reach the agent.' }]);
    } finally {
      setLoading(false);
    }
  }

  return (
    <main className="ai-clerk-page ai-agent-page">
      <aside className={`ai-agent-sidebar`}>
        <div className="ai-agent-sidebar-head">
          <span>Conversations</span>
          <button type="button" onClick={() => { setMessages([]); sessionRef.current = ''; }} aria-label="New chat">＋</button>
        </div>
        <button type="button" className="ai-agent-new" onClick={() => { setMessages([]); sessionRef.current = ''; }}>＋ <span>New agent chat</span></button>
        <div className="ai-agent-history">
          <Link to="/ai/jobs" className="ai-agent-history-item">AI Job Agent</Link>
        </div>
        <button type="button" className="ai-agent-clear" onClick={() => { setMessages([]); sessionRef.current = ''; }}>Clear chat</button>
      </aside>
      <section className="ai-agent-main">
        <header className="ai-agent-header">
          <div className="ai-agent-status"><span className="ai-agent-status-dot" /> Agent ready</div>
          <div className="ai-agent-mode">
            <button type="button" className="active">chat</button>
            <button type="button" onClick={() => window.location.assign('/ai/jobs')}>jobs</button>
          </div>
        </header>
        <div className="ai-agent-scroll custom-scrollbar">
          <div className="ai-agent-conversation">
          {messages.length === 0 ? (
            <div className="ai-agent-empty"><div className="ai-agent-mark">AI</div><h1>How can I help?</h1><p>Use tools, reasoning, and conversation context to move work forward.</p></div>
          ) : messages.map((message, index) => (
            <article key={index} className={`ai-agent-message ${message.role}`}><div className="ai-agent-avatar">{message.role === 'user' ? 'SN' : 'AI'}</div><div className="ai-agent-message-body"><div className="ai-agent-message-meta"><strong>{message.role === 'user' ? 'You' : 'Agent'}</strong></div><div className="ai-agent-message-content">{message.content}</div></div></article>
          ))}
          {loading && <article className="ai-agent-message assistant"><div className="ai-agent-avatar">AI</div><div className="ai-agent-message-body"><div className="ai-agent-thinking"><span /><span /><span /><em>Thinking</em></div></div></article>}
          <div ref={endRef} />
          </div>
        </div>
        <div className="ai-agent-composer-wrap">
        <form className="ai-agent-composer" onSubmit={submit}>
          <textarea value={input} onChange={event => setInput(event.target.value)} onKeyDown={event => {
            if (event.key === 'Enter' && !event.shiftKey) { event.preventDefault(); event.currentTarget.form?.requestSubmit(); }
          }} placeholder="Ask the agent…" rows={2} />
          <div className="ai-agent-composer-actions"><div /><button className="ai-agent-send" type="submit" disabled={!input.trim() || loading}>↑</button></div>
        </form>
        <div className="ai-agent-footnote">AI may make mistakes. Verify important information.</div>
        </div>
      </section>
    </main>
  );
}
