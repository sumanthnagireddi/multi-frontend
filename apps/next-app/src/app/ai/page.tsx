'use client';

import { useChat } from 'ai/react';
import { useEffect, useRef, useState } from 'react';

const PlusIcon = () => <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" className="h-4 w-4"><path d="M12 5v14M5 12h14" /></svg>;
const PaperclipIcon = () => <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" className="h-4 w-4"><path d="m21.44 11.05-9.19 9.19a6 6 0 0 1-8.49-8.49l9.19-9.19a4 4 0 0 1 5.66 5.66l-9.2 9.19a2 2 0 0 1-2.83-2.83l8.49-8.48" /></svg>;
const SendIcon = () => <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" className="h-4 w-4"><path d="M12 19V5m0 0L5 12m7-7 7 7" /></svg>;
const StopIcon = () => <svg viewBox="0 0 24 24" fill="currentColor" className="h-3.5 w-3.5"><rect x="7" y="7" width="10" height="10" rx="2" /></svg>;
const SearchIcon = () => <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" className="h-4 w-4"><circle cx="11" cy="11" r="7"/><path d="m20 20-4-4"/></svg>;
const MenuIcon = () => <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" className="h-5 w-5"><path d="M4 6h16M4 12h16M4 18h16"/></svg>;
const CopyIcon = () => <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" className="h-3.5 w-3.5"><rect x="8" y="8" width="11" height="11" rx="2"/><path d="M16 8V5a2 2 0 0 0-2-2H5a2 2 0 0 0-2 2v9a2 2 0 0 0 2 2h3"/></svg>;
const TrashIcon = () => <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" className="h-4 w-4"><path d="M3 6h18M8 6V4h8v2m3 0-1 14H6L5 6"/></svg>;
const BotIcon = () => <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" className="h-4 w-4"><rect x="4" y="7" width="16" height="13" rx="4"/><path d="M12 3v4M8 12h.01M16 12h.01M9 16h6"/></svg>;

const models = [
  { id: 'gemini-2.5-flash', name: 'Gemini 2.5 Flash', detail: 'Fast agentic' },
  { id: 'gemini-2.5-pro', name: 'Gemini 2.5 Pro', detail: 'Deep reasoning' },
  { id: 'gemini-2.0-flash', name: 'Gemini 2.0 Flash', detail: 'Balanced' },
];

type HistoryItem = { id: string; title: string; messages: any[] };

export default function Chat() {
  const { messages, setMessages, input, handleInputChange, handleSubmit, append, stop, isLoading, error } = useChat();
  const bottomRef = useRef<HTMLDivElement>(null);
  const fileRef = useRef<HTMLInputElement>(null);
  const [sidebarOpen, setSidebarOpen] = useState(true);
  const [modelOpen, setModelOpen] = useState(false);
  const [optionsOpen, setOptionsOpen] = useState(false);
  const [selectedModel, setSelectedModel] = useState(models[0]);
  const [agentMode, setAgentMode] = useState<'chat' | 'plan' | 'build'>('chat');
  const [webSearch, setWebSearch] = useState(false);
  const [deepReasoning, setDeepReasoning] = useState(false);
  const [attachments, setAttachments] = useState<string[]>([]);
  const [history, setHistory] = useState<HistoryItem[]>([]);
  const [modelSearch, setModelSearch] = useState('');

  useEffect(() => {
    try {
      setHistory(JSON.parse(localStorage.getItem('agentChatHistory') || '[]'));
      const saved = JSON.parse(localStorage.getItem('activeAgentChat') || '[]');
      if (Array.isArray(saved) && saved.length) setMessages(saved);
    } catch {}
  }, [setMessages]);

  useEffect(() => {
    localStorage.setItem('activeAgentChat', JSON.stringify(messages));
  }, [messages]);

  useEffect(() => {
    localStorage.setItem('agentChatHistory', JSON.stringify(history));
  }, [history]);

  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages, isLoading]);

  useEffect(() => {
    document.title = 'AI Agent Workspace';
  }, []);

  const submit = (e: React.FormEvent) => {
    if (!input.trim() && !attachments.length) return;
    handleSubmit(e, {
      body: { model: selectedModel.id, mode: agentMode, webSearch, deepReasoning, attachments },
    });
  };

  const newChat = () => {
    if (messages.length) {
      const first = messages.find(m => m.role === 'user')?.content || 'Untitled conversation';
      setHistory(prev => [{ id: crypto.randomUUID(), title: first.slice(0, 44), messages }, ...prev].slice(0, 30));
    }
    setMessages([]);
    setAttachments([]);
  };

  const loadHistory = (item: HistoryItem) => {
    setMessages(item.messages as any);
    setSidebarOpen(false);
  };

  const copyMessage = async (content: string) => {
    try {
      if (!navigator.clipboard?.writeText) throw new Error('Clipboard API unavailable');
      await navigator.clipboard.writeText(content);
    } catch {
      const textarea = document.createElement('textarea');
      textarea.value = content;
      textarea.setAttribute('readonly', '');
      textarea.style.position = 'fixed';
      textarea.style.opacity = '0';
      document.body.appendChild(textarea);
      textarea.select();
      const copied = document.execCommand('copy');
      textarea.remove();
      if (!copied) console.warn('Unable to copy response: clipboard access is blocked.');
    }
  };

  const suggestions = agentMode === 'build'
    ? ['Create a production-ready Next.js feature', 'Review this architecture and improve it', 'Write tests for my implementation']
    : agentMode === 'plan'
      ? ['Plan a scalable full-stack application', 'Break down a migration into safe steps', 'Compare three implementation approaches']
      : ['Explain an engineering concept', 'Draft a technical architecture', 'Debug a complex production issue'];

  return (
    <div className="ai-clerk-page ai-agent-page">
      <aside className={`ai-agent-sidebar ${sidebarOpen ? 'is-open' : ''}`}>
        <div className="ai-agent-sidebar-head">
          <span>Conversations</span>
          <button type="button" onClick={newChat} aria-label="New chat"><PlusIcon /></button>
        </div>
        <button type="button" className="ai-agent-new" onClick={newChat}><PlusIcon /><span>New agent chat</span></button>
        <div className="ai-agent-history">
          {history.map(item => (
            <button type="button" key={item.id} onClick={() => loadHistory(item)} className="ai-agent-history-item">
              <span>{item.title}</span>
            </button>
          ))}
        </div>
        <button type="button" className="ai-agent-clear" onClick={() => { setHistory([]); localStorage.removeItem('agentChatHistory'); }}>
          <TrashIcon /> Clear history
        </button>
      </aside>

      <main className="ai-agent-main">
        <header className="ai-agent-header">
          <button type="button" className="ai-agent-icon-button" onClick={() => setSidebarOpen(v => !v)} aria-label="Toggle sidebar"><MenuIcon /></button>
          <div className="ai-agent-status"><span className="ai-agent-status-dot" /> Agent ready</div>
          <div className="ai-agent-mode">
            {(['chat', 'plan', 'build'] as const).map(mode => (
              <button type="button" key={mode} className={agentMode === mode ? 'active' : ''} onClick={() => setAgentMode(mode)}>{mode}</button>
            ))}
          </div>
        </header>

        <section className="ai-agent-scroll custom-scrollbar">
          <div className="ai-agent-conversation">
            {messages.length === 0 ? (
              <div className="ai-agent-empty">
                <div className="ai-agent-mark"><BotIcon /></div>
                <h1>{agentMode === 'build' ? 'What should we build?' : agentMode === 'plan' ? 'What should we plan?' : 'How can I help?'}</h1>
                <p>Use tools, reasoning, and conversation context to move work forward.</p>
                <div className="ai-agent-suggestions">
                  {suggestions.map(text => (
                    <button type="button" key={text} onClick={() => append({ role: 'user', content: text })}>{text}<span>→</span></button>
                  ))}
                </div>
              </div>
            ) : (
              <div className="ai-agent-messages">
                {messages.map(message => (
                  <article key={message.id} className={`ai-agent-message ${message.role}`}>
                    <div className="ai-agent-avatar">{message.role === 'user' ? 'SN' : <BotIcon />}</div>
                    <div className="ai-agent-message-body">
                      <div className="ai-agent-message-meta">
                        <strong>{message.role === 'user' ? 'You' : selectedModel.name}</strong>
                        {message.role === 'assistant' && <button type="button" onClick={() => copyMessage(message.content)} aria-label="Copy response"><CopyIcon /></button>}
                      </div>
                      <div className="ai-agent-message-content">{message.content}</div>
                    </div>
                  </article>
                ))}
                {isLoading && (
                  <article className="ai-agent-message assistant">
                    <div className="ai-agent-avatar"><BotIcon /></div>
                    <div className="ai-agent-thinking"><span/><span/><span/><em>Working through the problem</em></div>
                  </article>
                )}
                {error && <div className="ai-agent-error">{error.message}</div>}
                <div ref={bottomRef} />
              </div>
            )}
          </div>
        </section>

        <div className="ai-agent-composer-wrap">
          {optionsOpen && (
            <div className="ai-agent-options">
              <button type="button" className={webSearch ? 'active' : ''} onClick={() => setWebSearch(v => !v)}><SearchIcon /><span><strong>Web research</strong><small>Use current external information</small></span></button>
              <button type="button" className={deepReasoning ? 'active' : ''} onClick={() => setDeepReasoning(v => !v)}><BotIcon /><span><strong>Deep reasoning</strong><small>Spend more time on complex tasks</small></span></button>
            </div>
          )}
          {modelOpen && (
            <div className="ai-agent-model-menu">
              <label><SearchIcon /><input value={modelSearch} onChange={e => setModelSearch(e.target.value)} placeholder="Search models" /></label>
              {models.filter(model => `${model.name} ${model.detail}`.toLowerCase().includes(modelSearch.toLowerCase())).map(model => (
                <button type="button" key={model.id} className={selectedModel.id === model.id ? 'active' : ''} onClick={() => { setSelectedModel(model); setModelOpen(false); }}>
                  <span className="ai-agent-model-icon"><BotIcon /></span><span><strong>{model.name}</strong><small>{model.detail}</small></span>
                </button>
              ))}
            </div>
          )}

          <form onSubmit={submit} className="ai-agent-composer">
            {attachments.length > 0 && <div className="ai-agent-attachments">{attachments.map(file => <span key={file}>{file}<button type="button" onClick={() => setAttachments(v => v.filter(name => name !== file))}>×</button></span>)}</div>}
            <textarea value={input} onChange={handleInputChange} rows={1} placeholder={`Ask the ${agentMode} agent…`} onKeyDown={e => {
              if (e.key === 'Enter' && !e.shiftKey) { e.preventDefault(); if (input.trim() || attachments.length) { const form = e.currentTarget.form; if (form) handleSubmit(e as unknown as React.FormEvent<HTMLFormElement>, { body: { model: selectedModel.id, mode: agentMode, webSearch, deepReasoning, attachments } }); } }
            }} />
            <div className="ai-agent-composer-actions">
              <div>
                <input ref={fileRef} type="file" multiple hidden onChange={e => setAttachments(prev => [...prev, ...Array.from(e.target.files || []).map(file => file.name)].slice(0, 8))} />
                <button type="button" onClick={() => fileRef.current?.click()} aria-label="Attach files"><PaperclipIcon /></button>
                <button type="button" className={optionsOpen ? 'active' : ''} onClick={() => { setOptionsOpen(v => !v); setModelOpen(false); }}><BotIcon /><span>Tools</span></button>
                <button type="button" className={modelOpen ? 'active' : ''} onClick={() => { setModelOpen(v => !v); setOptionsOpen(false); }}><span>{selectedModel.name}</span><small>⌄</small></button>
              </div>
              {isLoading ? <button type="button" className="ai-agent-send stop" onClick={() => stop()} aria-label="Stop generation"><StopIcon /></button> : <button type="submit" className="ai-agent-send" disabled={!input.trim() && !attachments.length} aria-label="Send message"><SendIcon /></button>}
            </div>
          </form>
          <div className="ai-agent-footnote">Agent responses can make mistakes. Verify important work.</div>
        </div>
      </main>
    </div>
  );
}
