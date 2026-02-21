import React, { useState, useEffect, useRef } from 'react';
import { 
  Menu, Plus, MessageSquare, Send, User, Bot, 
  Settings, Loader2, Sparkles, AlertCircle, ShoppingBag 
} from 'lucide-react';

export default function App() {
  const [messages, setMessages] = useState([]);
  const [input, setInput] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [isSidebarOpen, setIsSidebarOpen] = useState(true);
  const [error, setError] = useState(null);
  
  const messagesEndRef = useRef(null);
  const textareaRef = useRef(null);

  // Uses Vite's environment variable syntax
  const apiKey = import.meta.env.VITE_OPENAI_API_KEY;

  // Auto-scroll to bottom when messages update
  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages, isLoading]);

  // Auto-resize textarea
  const handleInput = (e) => {
    setInput(e.target.value);
    e.target.style.height = 'auto';
    e.target.style.height = `${Math.min(e.target.scrollHeight, 200)}px`;
  };

  const handleKeyDown = (e) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      sendMessage();
    }
  };

  const sendMessage = async () => {
    if (!input.trim() || isLoading) return;

    if (!apiKey) {
      setError("API Key is missing. Please add VITE_OPENAI_API_KEY to your .env file.");
      return;
    }

    const userMessage = { role: 'user', content: input.trim() };
    const newMessages = [...messages, userMessage];
    
    setMessages(newMessages);
    setInput('');
    setIsLoading(true);
    setError(null);
    
    // Reset textarea height
    if (textareaRef.current) {
      textareaRef.current.style.height = 'auto';
    }

    try {
      // REAL LOGIC: Standard OpenAI API Call
      // To use a free API like Groq, change this URL to: "https://api.groq.com/openai/v1/chat/completions"
      const response = await fetch("https://api.groq.com/openai/v1/chat/completions", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          "Authorization": `Bearer ${apiKey}`
        },
        body: JSON.stringify({
          model: "llama-3.3-70b-versatile", // Updated to currently supported Groq model
          messages: [
            { 
              role: "system", 
              content: "You are VyaparSetu AI, an expert digital assistant for retail and Kirana store owners in India. You help with billing software, inventory management, taxation, and business growth strategies. Always be concise, professional, and helpful." 
            },
            // Map our state to the API format
            ...newMessages.map(m => ({ role: m.role, content: m.content }))
          ],
          temperature: 0.7,
        })
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error?.message || `API Error: ${response.status}`);
      }

      const assistantMessage = {
        role: 'assistant',
        content: data.choices[0].message.content
      };

      setMessages(prev => [...prev, assistantMessage]);

    } catch (err) {
      console.error(err);
      setError(err.message);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="flex h-screen w-full bg-[#212121] text-[#ececec] font-sans overflow-hidden">
      
      {/* SIDEBAR */}
      <div className={`
        ${isSidebarOpen ? 'w-[260px] translate-x-0' : 'w-0 -translate-x-full'} 
        transition-all duration-300 ease-in-out flex flex-col bg-[#171717] h-full shrink-0 border-r border-[#333] z-20 absolute md:relative
      `}>
        <div className="p-3">
          <button 
            onClick={() => setMessages([])}
            className="flex items-center gap-3 w-full hover:bg-[#2f2f2f] text-sm text-white px-3 py-3 rounded-md transition-colors border border-[#333]"
          >
            <Plus size={16} />
            New Chat
          </button>
        </div>

        <div className="flex-1 overflow-y-auto px-3 py-2 custom-scrollbar">
          <div className="text-xs font-semibold text-[#888] mb-3 mt-2 px-2">Today</div>
          {messages.length > 0 ? (
            <button className="flex items-center gap-3 w-full bg-[#2f2f2f] text-sm text-white px-3 py-3 rounded-md transition-colors truncate">
              <MessageSquare size={16} className="shrink-0" />
              <span className="truncate">{messages[0].content.substring(0, 25)}...</span>
            </button>
          ) : (
            <div className="text-xs text-[#555] px-2 italic">No recent chats</div>
          )}
        </div>

        <div className="p-3 border-t border-[#333]">
          <button className="flex items-center gap-3 w-full hover:bg-[#2f2f2f] text-sm text-white px-3 py-3 rounded-md transition-colors">
            <ShoppingBag size={16} />
            VyaparSetu Dashboard
          </button>
          <button className="flex items-center gap-3 w-full hover:bg-[#2f2f2f] text-sm text-white px-3 py-3 rounded-md transition-colors mt-1">
            <Settings size={16} />
            Settings
          </button>
        </div>
      </div>

      {/* MAIN CHAT AREA */}
      <div className="flex-1 flex flex-col h-full relative w-full">
        
        {/* HEADER */}
        <header className="h-14 flex items-center justify-between px-4 border-b border-[#333]/50 bg-[#212121] z-10 sticky top-0">
          <div className="flex items-center gap-3">
            <button 
              onClick={() => setIsSidebarOpen(!isSidebarOpen)}
              className="p-2 hover:bg-[#2f2f2f] rounded-md transition-colors text-[#ececec]"
            >
              <Menu size={20} />
            </button>
            <h1 className="text-lg font-semibold tracking-wide flex items-center gap-2 text-white">
              VyaparSetu <span className="text-[#005ea2] font-bold">AI</span>
            </h1>
          </div>
        </header>

        {/* CHAT MESSAGES */}
        <div className="flex-1 overflow-y-auto scroll-smooth w-full">
          {messages.length === 0 ? (
            <div className="h-full flex flex-col items-center justify-center p-8">
              <div className="w-16 h-16 bg-[#005ea2]/10 rounded-2xl flex items-center justify-center mb-6 border border-[#005ea2]/20">
                <Sparkles size={32} className="text-[#005ea2]" />
              </div>
              <h2 className="text-3xl font-bold mb-2 text-white">How can I help you today?</h2>
              <p className="text-[#888] mb-8 text-center max-w-md">
                I am your VyaparSetu retail assistant. Ask me about your inventory, daily billing, or business growth.
              </p>
              
              <div className="grid grid-cols-1 md:grid-cols-2 gap-3 w-full max-w-2xl">
                {[
                  "How do I generate a GST invoice?",
                  "Analyze my daily sugar inventory.",
                  "What is the current stock for refined oil?",
                  "How can I set up the Voice Billing Engine?"
                ].map((suggestion, idx) => (
                  <button 
                    key={idx}
                    onClick={() => setInput(suggestion)}
                    className="p-4 border border-[#333] hover:bg-[#2f2f2f] rounded-xl text-left text-sm transition-colors text-[#ececec]"
                  >
                    {suggestion}
                  </button>
                ))}
              </div>
            </div>
          ) : (
            <div className="flex flex-col w-full">
              {messages.map((msg, index) => (
                <div 
                  key={index} 
                  className={`w-full py-6 ${msg.role === 'assistant' ? 'bg-[#212121]' : 'bg-[#212121]'}`}
                >
                  <div className="max-w-3xl mx-auto flex gap-6 px-4 md:px-6">
                    {/* AVATAR */}
                    <div className="w-8 h-8 rounded-sm shrink-0 flex items-center justify-center mt-1">
                      {msg.role === 'assistant' ? (
                        <div className="w-8 h-8 bg-[#005ea2] rounded-full flex items-center justify-center text-white">
                          <Bot size={18} />
                        </div>
                      ) : (
                        <div className="w-8 h-8 bg-[#444] rounded-full flex items-center justify-center text-white">
                          <User size={18} />
                        </div>
                      )}
                    </div>
                    
                    {/* MESSAGE CONTENT */}
                    <div className="flex-1 min-w-0 flex flex-col justify-start pt-1">
                      <div className="font-semibold text-white mb-1">
                        {msg.role === 'assistant' ? 'VyaparSetu AI' : 'You'}
                      </div>
                      <div className="text-[15px] leading-relaxed text-[#d1d5db] whitespace-pre-wrap">
                        {msg.content}
                      </div>
                    </div>
                  </div>
                </div>
              ))}

              {isLoading && (
                <div className="w-full py-6 bg-[#212121]">
                  <div className="max-w-3xl mx-auto flex gap-6 px-4 md:px-6">
                    <div className="w-8 h-8 bg-[#005ea2] rounded-full flex items-center justify-center shrink-0 mt-1">
                      <Bot size={18} className="text-white" />
                    </div>
                    <div className="flex-1 min-w-0 flex items-center pt-2">
                      <div className="flex gap-1">
                        <span className="w-2 h-2 bg-[#888] rounded-full animate-bounce [animation-delay:-0.3s]"></span>
                        <span className="w-2 h-2 bg-[#888] rounded-full animate-bounce [animation-delay:-0.15s]"></span>
                        <span className="w-2 h-2 bg-[#888] rounded-full animate-bounce"></span>
                      </div>
                    </div>
                  </div>
                </div>
              )}
              
              {error && (
                <div className="w-full py-6 bg-[#212121]">
                  <div className="max-w-3xl mx-auto flex gap-6 px-4 md:px-6">
                    <div className="w-8 h-8 bg-red-500/20 rounded-full flex items-center justify-center shrink-0 mt-1">
                      <AlertCircle size={18} className="text-red-500" />
                    </div>
                    <div className="flex-1 min-w-0 pt-1">
                      <p className="text-red-400 text-[15px]">{error}</p>
                    </div>
                  </div>
                </div>
              )}
              
              {/* Invisible div to scroll to */}
              <div ref={messagesEndRef} className="h-24 w-full" />
            </div>
          )}
        </div>

        {/* INPUT AREA */}
        <div className="absolute bottom-0 w-full bg-gradient-to-t from-[#212121] via-[#212121] to-transparent pt-6 pb-6 px-4 md:px-6">
          <div className="max-w-3xl mx-auto relative">
            <div className="bg-[#2f2f2f] rounded-2xl border border-[#444] shadow-[0_0_15px_rgba(0,0,0,0.1)] flex items-end p-2 focus-within:border-[#666] transition-colors">
              <textarea
                ref={textareaRef}
                value={input}
                onChange={handleInput}
                onKeyDown={handleKeyDown}
                placeholder="Message VyaparSetu AI..."
                className="w-full max-h-[200px] bg-transparent text-[#ececec] placeholder-[#888] px-3 py-2 border-none focus:ring-0 resize-none outline-none text-[15px] leading-relaxed custom-scrollbar"
                rows="1"
              />
              <button 
                onClick={sendMessage}
                disabled={!input.trim() || isLoading}
                className={`p-2 mb-1 mr-1 rounded-lg shrink-0 transition-all ${
                  input.trim() && !isLoading 
                    ? 'bg-white text-black hover:bg-[#ddd]' 
                    : 'bg-[#444] text-[#888] cursor-not-allowed'
                }`}
              >
                {isLoading ? <Loader2 size={18} className="animate-spin" /> : <Send size={18} />}
              </button>
            </div>
            <div className="text-center text-xs text-[#666] mt-3">
              VyaparSetu AI can make mistakes. Check important billing data.
            </div>
          </div>
        </div>

      </div>
      
      {/* Mobile overlay */}
      {isSidebarOpen && (
        <div 
          className="fixed inset-0 bg-black/50 z-10 md:hidden"
          onClick={() => setIsSidebarOpen(false)}
        />
      )}

      <style dangerouslySetContent={{__html: `
        .custom-scrollbar::-webkit-scrollbar {
          width: 6px;
        }
        .custom-scrollbar::-webkit-scrollbar-track {
          background: transparent;
        }
        .custom-scrollbar::-webkit-scrollbar-thumb {
          background-color: #444;
          border-radius: 10px;
        }
        .custom-scrollbar::-webkit-scrollbar-thumb:hover {
          background-color: #555;
        }
      `}} />
    </div>
  );
}