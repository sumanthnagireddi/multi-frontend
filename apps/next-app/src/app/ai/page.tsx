'use client';

import { useChat } from 'ai/react';
import { useEffect, useRef, useState } from 'react';

// Refined Icons based on the exact screenshot
const EditIcon = () => (
  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="w-4 h-4"><path d="M11 4H4a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2v-7"></path><path d="M18.5 2.5a2.121 2.121 0 0 1 3 3L12 15l-4 1 1-4 9.5-9.5z"></path></svg>
);
const TrashIcon = () => (
  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="w-4 h-4"><polyline points="3 6 5 6 21 6"></polyline><path d="M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6m3 0V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2"></path></svg>
);
const SidebarIcon = () => (
  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="w-5 h-5"><rect x="3" y="3" width="18" height="18" rx="2" ry="2"></rect><line x1="9" y1="3" x2="9" y2="21"></line></svg>
);
const PaperclipIcon = () => (
  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="w-5 h-5"><path d="M21.44 11.05l-9.19 9.19a6 6 0 0 1-8.49-8.49l9.19-9.19a4 4 0 0 1 5.66 5.66l-9.2 9.19a2 2 0 0 1-2.83-2.83l8.49-8.48"></path></svg>
);
const ArrowUpIcon = () => (
  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round" className="w-4 h-4"><line x1="12" y1="19" x2="12" y2="5"></line><polyline points="5 12 12 5 19 12"></polyline></svg>
);
const WrenchIcon = () => (
  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="w-3.5 h-3.5"><path d="M14.7 6.3a1 1 0 0 0 0 1.4l1.6 1.6a1 1 0 0 0 1.4 0l3.77-3.77a6 6 0 0 1-7.94 7.94l-6.91 6.91a2.12 2.12 0 0 1-3-3l6.91-6.91a6 6 0 0 1 7.94-7.94l-3.76 3.76z"></path></svg>
);
const EyeIcon = () => (
  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="w-3.5 h-3.5"><path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z"></path><circle cx="12" cy="12" r="3"></circle></svg>
);
const BoxIcon = () => (
  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="w-3.5 h-3.5"><path d="M21 16V8a2 2 0 0 0-1-1.73l-7-4a2 2 0 0 0-2 0l-7 4A2 2 0 0 0 3 8v8a2 2 0 0 0 1 1.73l7 4a2 2 0 0 0 2 0l7-4A2 2 0 0 0 21 16z"></path><polyline points="3.27 6.96 12 12.01 20.73 6.96"></polyline><line x1="12" y1="22.08" x2="12" y2="12"></line></svg>
);
const SearchIcon = () => (
  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="w-4 h-4"><circle cx="11" cy="11" r="8"></circle><line x1="21" y1="21" x2="16.65" y2="16.65"></line></svg>
);
const LockIcon = () => (
  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="w-4 h-4"><rect x="3" y="11" width="18" height="11" rx="2" ry="2"></rect><path d="M7 11V7a5 5 0 0 1 10 0v4"></path></svg>
);
const DeployIcon = () => (
  <svg viewBox="0 0 24 24" fill="currentColor" className="w-3.5 h-3.5"><path d="M12 2L22 20H2L12 2Z"></path></svg>
);

// Model Logos
const SparkleIcon = () => (
  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="w-4 h-4"><path d="M12 2v20M17 5H9.5a3.5 3.5 0 0 0 0 7h5a3.5 3.5 0 0 1 0 7H6"></path></svg>
);
const GenericBotIcon = () => (
  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="w-4 h-4"><circle cx="12" cy="12" r="10"></circle><path d="M12 16v-4"></path><path d="M12 8h.01"></path></svg>
);
const XIcon = () => (
  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="w-4 h-4"><line x1="18" y1="6" x2="6" y2="18"></line><line x1="6" y1="6" x2="18" y2="18"></line></svg>
);
const WhaleIcon = () => (
  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="w-4 h-4"><path d="M22 12C22 17.5 17.5 22 12 22C6.5 22 2 17.5 2 12C2 6.5 6.5 2 12 2"></path><path d="M2 12h20"></path></svg>
);

export default function Chat() {
  const { messages, setMessages, input, setInput, handleInputChange, handleSubmit, append } = useChat();
  const bottomRef = useRef<HTMLDivElement>(null);
  
  const [isSidebarOpen, setIsSidebarOpen] = useState(true);
  const [isModelDropdownOpen, setIsModelDropdownOpen] = useState(false);
  const [selectedModel, setSelectedModel] = useState({ id: 'Kimi K2.5', icon: GenericBotIcon });
  
  const [chatHistory, setChatHistory] = useState<{id: string, title: string}[]>([]);

  // Load state from localStorage on mount
  useEffect(() => {
    const savedHistory = localStorage.getItem('chatHistory');
    if (savedHistory) setChatHistory(JSON.parse(savedHistory));
    
    const savedMessages = localStorage.getItem('activeChatMessages');
    if (savedMessages) setMessages(JSON.parse(savedMessages));
  }, [setMessages]);

  // Save state to localStorage on changes
  useEffect(() => {
    localStorage.setItem('chatHistory', JSON.stringify(chatHistory));
  }, [chatHistory]);

  useEffect(() => {
    localStorage.setItem('activeChatMessages', JSON.stringify(messages));
  }, [messages]);

  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);

  const handleNewChat = () => {
    if (messages.length > 0) {
      setChatHistory(prev => [
        { id: Date.now().toString(), title: messages[0].content.slice(0, 25) + '...' },
        ...prev
      ]);
      setMessages([]);
    }
  };

  const suggestions = [
    "Write code to demonstrate Dijkstra's algorithm",
    "What is the weather in San Francisco?"
  ];

  return (
    <div className="flex h-screen w-full bg-[#171717] text-zinc-300 font-sans overflow-hidden">
      
      {/* Sidebar */}
      <div className={`${isSidebarOpen ? 'w-[260px] translate-x-0 opacity-100' : 'w-0 -translate-x-full opacity-0'} flex-shrink-0 bg-[#0a0a0a] border-r border-[#262626] flex flex-col transition-all duration-300 ease-in-out z-20`}>
        <div className="flex items-center justify-between p-4">
          <button onClick={() => setIsSidebarOpen(false)} className="p-2 hover:bg-[#262626] rounded-md text-zinc-400 transition-colors">
            <SidebarIcon />
          </button>
          <button onClick={handleNewChat} className="p-2 hover:bg-[#262626] rounded-md text-zinc-400 transition-colors">
            <EditIcon />
          </button>
        </div>
        <div className="px-3 py-2 space-y-1 w-[260px]">
          <button onClick={handleNewChat} className="w-full flex items-center gap-3 px-3 py-2.5 text-sm text-zinc-300 hover:bg-[#262626] rounded-lg transition-colors text-left border border-[#262626]">
            <EditIcon /> New chat
          </button>
          <button onClick={() => setMessages([])} className="w-full flex items-center gap-3 px-3 py-2.5 text-sm text-zinc-300 hover:bg-[#262626] rounded-lg transition-colors text-left">
            <TrashIcon /> Delete current
          </button>
        </div>
        <div className="mt-8 px-6 text-[10px] font-bold tracking-widest text-zinc-500 w-[260px]">HISTORY</div>
        
        <div className="flex-1 overflow-y-auto w-[260px] custom-scrollbar px-3 mt-2">
          {chatHistory.length === 0 && messages.length === 0 ? (
            <div className="px-3 py-2 text-[13px] text-zinc-500">
              Your conversations will appear here once you start chatting!
            </div>
          ) : (
            <div className="space-y-1">
              {messages.length > 0 && (
                <button className="w-full text-left px-3 py-2 text-[13px] text-zinc-300 bg-[#262626] rounded-lg truncate">
                  {messages[0].content.slice(0, 25) + '...'}
                </button>
              )}
              {chatHistory.map(chat => (
                <button key={chat.id} className="w-full text-left px-3 py-2 text-[13px] text-zinc-400 hover:bg-[#262626]/50 hover:text-zinc-300 rounded-lg transition-colors truncate">
                  {chat.title}
                </button>
              ))}
            </div>
          )}
        </div>
        
        <div className="mt-auto p-4 flex items-center justify-between w-[260px] border-t border-[#262626]">
          <div className="flex items-center gap-3">
            <div className="w-7 h-7 rounded-full bg-emerald-800 flex items-center justify-center text-xs text-white">G</div>
            <span className="text-[13px] font-medium text-zinc-300">Guest</span>
          </div>
          <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="w-4 h-4 text-zinc-500"><polyline points="18 15 12 9 6 15"></polyline></svg>
        </div>
      </div>

      {/* Main Content Area */}
      <div className="flex-1 flex flex-col relative h-full bg-[#171717] transition-all duration-300">
        
        {/* Top Navbar */}
        <div className="absolute top-0 left-0 right-0 h-14 flex items-center justify-between px-4 z-10 bg-[#171717]/80 backdrop-blur-md">
          <div className="flex items-center gap-2">
            {!isSidebarOpen && (
              <button onClick={() => setIsSidebarOpen(true)} className="p-2 hover:bg-[#262626] rounded-md text-zinc-400 transition-colors animate-in fade-in duration-300">
                <SidebarIcon />
              </button>
            )}
          </div>
          {/* Removed Lock and Deploy buttons as requested */}
        </div>

        {/* Chat Scroll Area */}
        <div className="flex-1 overflow-y-auto px-4 w-full">
          <div className="max-w-3xl mx-auto w-full pb-48 pt-24">
            
            {/* Empty State */}
            {messages.length === 0 && (
              <div className="flex flex-col items-center justify-center mt-12 md:mt-32 w-full animate-in slide-in-from-bottom-6 fade-in duration-700 ease-out">
                <h1 className="text-[32px] md:text-[40px] font-semibold text-white tracking-tight text-center mb-2">What can I help with?</h1>
                <p className="text-[#a1a1aa] mb-10 text-center text-[15px]">Ask a question, write code, or explore ideas.</p>
                
                <div className="grid grid-cols-1 md:grid-cols-2 gap-3 w-full max-w-2xl mt-4">
                  {suggestions.map((text, i) => (
                    <button 
                      key={i}
                      onClick={() => append({ role: 'user', content: text })}
                      className="px-5 py-4 rounded-[14px] border border-[#262626] bg-transparent hover:bg-[#262626]/50 transition-all text-left text-[13.5px] text-[#a1a1aa] hover:text-zinc-300 flex items-center h-[60px] shadow-sm transform hover:scale-[1.02] duration-200"
                    >
                      {text}
                    </button>
                  ))}
                </div>
              </div>
            )}

            {/* Chat Messages */}
            <div className="space-y-6 mt-8 flex flex-col">
              {messages.map((m) => {
                const isUser = m.role === 'user';
                return (
                  <div key={m.id} className={`flex w-full ${isUser ? 'justify-end' : 'justify-start'} group animate-in slide-in-from-bottom-3 fade-in duration-300`}>
                    
                    {!isUser && (
                      <div className="w-8 h-8 rounded-full border border-zinc-700 bg-[#1a1a1a] flex items-center justify-center flex-shrink-0 mr-3 mt-1 text-zinc-300 shadow-sm">
                        <selectedModel.icon />
                      </div>
                    )}
                    
                    <div className={`relative flex flex-col max-w-[85%] md:max-w-[75%] ${isUser ? 'items-end' : 'items-start'}`}>
                      <div 
                        className={`px-5 py-3.5 rounded-[22px] text-[15px] shadow-sm leading-relaxed ${
                          isUser 
                            ? 'bg-[#ededed] text-zinc-900 rounded-tr-[4px]' 
                            : 'bg-[#262626] text-zinc-200 rounded-tl-[4px] border border-[#3f3f46]/50'
                        }`}
                      >
                        <div className={`prose max-w-none whitespace-pre-wrap break-words ${isUser ? 'prose-zinc font-medium' : 'prose-invert'}`}>
                          {m.content}
                        </div>
                      </div>
                    </div>

                  </div>
                );
              })}
              <div ref={bottomRef} />
            </div>
          </div>
        </div>

        {/* Input Area */}
        <div className="absolute bottom-0 left-0 right-0 p-4 bg-gradient-to-t from-[#171717] via-[#171717] to-transparent pt-12 pb-6">
          <div className="max-w-3xl mx-auto w-full relative">
            
            {/* Model Selector Dropdown Menu */}
            {isModelDropdownOpen && (
              <div className="absolute bottom-16 left-2 w-[340px] bg-[#1a1a1a] border border-[#262626] rounded-xl shadow-2xl z-20 flex flex-col animate-in fade-in slide-in-from-bottom-2 duration-200">
                <div className="p-3 pb-2 border-b border-[#262626]/50">
                  <div className="relative flex items-center w-full bg-[#0a0a0a] rounded-lg border border-[#262626]">
                    <div className="absolute left-3 text-zinc-500"><SearchIcon /></div>
                    <input type="text" placeholder="Search models..." className="bg-transparent text-[13px] text-white outline-none w-full placeholder-[#52525b] py-2 pl-9 pr-3" />
                  </div>
                </div>
                
                <div className="overflow-y-auto max-h-[300px] p-2 custom-scrollbar">
                  <div className="px-3 py-1 text-[11px] font-semibold text-[#52525b] mt-1 mb-1 tracking-wider uppercase">Available</div>
                  {[
                    { id: 'DeepSeek V3.2', icon: WhaleIcon, icons: [WrenchIcon] },
                    { id: 'Kimi K2.5', icon: GenericBotIcon, icons: [WrenchIcon, EyeIcon, BoxIcon] },
                    { id: 'GPT OSS 20B', icon: SparkleIcon, icons: [WrenchIcon, BoxIcon] },
                    { id: 'GPT OSS 120B', icon: SparkleIcon, icons: [WrenchIcon, BoxIcon] },
                    { id: 'Grok 4.1 Fast', icon: XIcon, icons: [WrenchIcon, EyeIcon] },
                  ].map((model) => {
                    const isActive = selectedModel.id === model.id;
                    return (
                      <button 
                        key={model.id}
                        onClick={() => { setSelectedModel(model); setIsModelDropdownOpen(false); }}
                        className={`w-full flex items-center justify-between px-3 py-2.5 text-[13px] rounded-lg text-left transition-colors ${isActive ? 'bg-[#262626] text-white' : 'text-[#a1a1aa] hover:bg-[#262626]/50 hover:text-zinc-200'}`}
                      >
                        <div className="flex items-center gap-3">
                          <model.icon /> {model.id}
                        </div>
                        <div className="flex items-center gap-1.5 text-[#52525b]">
                          {model.icons.map((Icon, idx) => <Icon key={idx} />)}
                        </div>
                      </button>
                    );
                  })}
                  
                  <div className="px-3 py-1 text-[11px] font-semibold text-[#52525b] mt-3 mb-1 tracking-wider uppercase">Alibaba</div>
                  {[
                    { id: 'Qwen3-14B', icon: GenericBotIcon, icons: [WrenchIcon, LockIcon] },
                  ].map((model) => (
                    <button 
                      key={model.id}
                      onClick={() => { setSelectedModel(model); setIsModelDropdownOpen(false); }}
                      className="w-full flex items-center justify-between px-3 py-2.5 text-[13px] text-[#a1a1aa] hover:bg-[#262626]/50 hover:text-zinc-200 rounded-lg text-left transition-colors"
                    >
                      <div className="flex items-center gap-3">
                        <model.icon /> {model.id}
                      </div>
                      <div className="flex items-center gap-1.5 text-[#52525b]">
                        {model.icons.map((Icon, idx) => <Icon key={idx} />)}
                      </div>
                    </button>
                  ))}
                </div>
              </div>
            )}

            {/* Input Form */}
            <form onSubmit={handleSubmit} className="relative flex flex-col bg-[#262626] border border-transparent rounded-[20px] focus-within:ring-2 focus-within:ring-zinc-600 transition-all shadow-md">
              
              <textarea
                value={input}
                onChange={handleInputChange}
                onKeyDown={(e) => {
                  if (e.key === 'Enter' && !e.shiftKey) {
                    e.preventDefault();
                    if(input.trim()) handleSubmit(e as any);
                  }
                }}
                placeholder="Ask a question..."
                className="w-full bg-transparent min-h-[52px] max-h-[200px] py-4 px-4 outline-none text-zinc-100 placeholder-[#a1a1aa] resize-none text-[15px]"
                rows={1}
              />
              
              <div className="flex items-center justify-between px-2 pb-2">
                <div className="flex items-center gap-1">
                  <button type="button" className="p-2 text-[#a1a1aa] hover:text-white hover:bg-[#3f3f46] rounded-xl transition-all">
                    <PaperclipIcon />
                  </button>
                  <button 
                    type="button" 
                    onClick={() => setIsModelDropdownOpen(!isModelDropdownOpen)}
                    className="flex items-center gap-2 px-3 py-1.5 text-[13px] font-medium text-[#a1a1aa] hover:text-white hover:bg-[#3f3f46] rounded-xl transition-all"
                  >
                    <selectedModel.icon /> {selectedModel.id}
                  </button>
                </div>
                
                <button
                  type="submit"
                  disabled={!input.trim()}
                  className="w-[34px] h-[34px] rounded-full bg-white text-black disabled:bg-[#3f3f46] disabled:text-[#71717a] transition-all flex items-center justify-center mr-1 shadow-sm hover:scale-105 disabled:hover:scale-100 active:scale-95"
                >
                  <ArrowUpIcon />
                </button>
              </div>
            </form>
            
            <style jsx global>{`
              .custom-scrollbar::-webkit-scrollbar {
                width: 6px;
              }
              .custom-scrollbar::-webkit-scrollbar-track {
                background: transparent;
              }
              .custom-scrollbar::-webkit-scrollbar-thumb {
                background: #3f3f46;
                border-radius: 10px;
              }
              .custom-scrollbar::-webkit-scrollbar-thumb:hover {
                background: #52525b;
              }
            `}</style>
          </div>
        </div>

      </div>
    </div>
  );
}
