import React, { useState, useEffect, useRef } from 'react';
import { Menu, Plus, MessageSquare, Send, User, Bot, Settings, Loader2, Sparkles, AlertCircle, ShoppingBag, ArrowLeft } from 'lucide-react';
import { Link } from 'react-router-dom';

export default function Chatbot() {
  const [messages, setMessages] = useState([]);
  const [input, setInput] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [isSidebarOpen, setIsSidebarOpen] = useState(true);
  const [error, setError] = useState(null);
  const messagesEndRef = useRef(null);
  const textareaRef = useRef(null);

  const apiKey = import.meta.env.VITE_OPENAI_API_KEY;

  const scrollToBottom = () => { messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' }); };
  useEffect(() => { scrollToBottom(); }, [messages, isLoading]);

  const handleInput = (e) => {
    setInput(e.target.value);
    e.target.style.height = 'auto';
    e.target.style.height = `${Math.min(e.target.scrollHeight, 200)}px`;
  };

  const sendMessage = async () => {
    if (!input.trim() || isLoading) return;
    if (!apiKey) { setError("API Key Missing (VITE_OPENAI_API_KEY)"); return; }
    const userMessage = { role: 'user', content: input.trim() };
    const newMessages = [...messages, userMessage];
    setMessages(newMessages); setInput(''); setIsLoading(true); setError(null);
    try {
      const response = await fetch("https://api.groq.com/openai/v1/chat/completions", {
        method: "POST",
        headers: { "Content-Type": "application/json", "Authorization": `Bearer ${apiKey}` },
        body: JSON.stringify({
          model: "llama-3.3-70b-versatile",
          messages: [{ role: "system", content: "You are VyaparSetu AI assistant for Indian Kirana stores." }, ...newMessages],
        })
      });
      const data = await response.json();
      if (!response.ok) throw new Error(data.error?.message || "API Error");
      setMessages(prev => [...prev, { role: 'assistant', content: data.choices[0].message.content }]);
    } catch (err) { setError(err.message); } finally { setIsLoading(false); }
  };

  return (
    <div className="flex h-screen w-full bg-[#212121] text-[#ececec] overflow-hidden">
      <div className={`${isSidebarOpen ? 'w-[260px]' : 'w-0'} transition-all duration-300 flex flex-col bg-[#171717] h-full shrink-0 border-r border-[#333] relative`}>
        <div className="p-3"><button onClick={() => setMessages([])} className="flex items-center gap-3 w-full hover:bg-[#2f2f2f] text-sm text-white px-3 py-3 rounded-md border border-[#333]"><Plus size={16} /> New Chat</button></div>
        <div className="flex-1 overflow-y-auto px-3 py-2">
            <Link to="/" className="flex items-center gap-3 w-full hover:bg-[#2f2f2f] text-sm text-white px-3 py-3 rounded-md mb-2 bg-[#2f2f2f]/30"><ArrowLeft size={16} /> Command Center</Link>
        </div>
      </div>
      <div className="flex-1 flex flex-col h-full relative">
        <header className="h-14 flex items-center justify-between px-4 border-b border-[#333]/50 bg-[#212121]">
          <div className="flex items-center gap-3"><button onClick={() => setIsSidebarOpen(!isSidebarOpen)} className="p-2 hover:bg-[#2f2f2f] rounded-md"><Menu size={20} /></button><h1 className="text-lg font-semibold">VyaparSetu AI</h1></div>
        </header>
        <div className="flex-1 overflow-y-auto scroll-smooth w-full p-4">
          {messages.map((msg, i) => (
            <div key={i} className="max-w-3xl mx-auto py-4 flex gap-4">
              <div className={`w-8 h-8 rounded-full flex items-center justify-center ${msg.role === 'assistant' ? 'bg-blue-600' : 'bg-gray-600'}`}>{msg.role === 'assistant' ? <Bot size={18}/> : <User size={18}/>}</div>
              <div className="flex-1 text-[#d1d5db] whitespace-pre-wrap">{msg.content}</div>
            </div>
          ))}
          {isLoading && <div className="max-w-3xl mx-auto py-4 flex gap-4"><Loader2 size={18} className="animate-spin" /> VyaparSetu AI is thinking...</div>}
          <div ref={messagesEndRef} className="h-32" />
        </div>
        <div className="absolute bottom-0 w-full bg-gradient-to-t from-[#212121] via-[#212121] to-transparent pb-8 px-4">
          <div className="max-w-3xl mx-auto relative bg-[#2f2f2f] rounded-xl border border-[#444] p-2 flex items-end">
            <textarea value={input} onChange={handleInput} placeholder="Message VyaparSetu AI..." className="w-full bg-transparent p-2 outline-none resize-none" rows="1" onKeyDown={(e) => e.key === 'Enter' && !e.shiftKey && sendMessage()} />
            <button onClick={sendMessage} className="p-2 bg-white text-black rounded-lg ml-2"><Send size={18} /></button>
          </div>
        </div>
      </div>
    </div>
  );
}
