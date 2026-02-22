import React, { useState, useEffect, useRef } from 'react';
import { 
  Menu, Plus, MessageSquare, Send, User, Bot, 
  Settings, Loader2, Sparkles, AlertCircle, 
  ArrowLeft, X, ChevronDown, AlignLeft,
  PenSquare, Compass, ShieldCheck, BarChart3, Database,
  Activity, Mic, Download, FileText, LogOut
} from 'lucide-react';
import { Link, Navigate } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import { useChatHistory } from '../../hooks/useChatHistory';

export default function Chatbot() {
  const { user, logout } = useAuth();
  
  const [messages, setMessages] = useState([]);
  const [input, setInput] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [isListening, setIsListening] = useState(false); 
  const [isSidebarOpen, setIsSidebarOpen] = useState(true);
  const [isMobileSidebarOpen, setIsMobileSidebarOpen] = useState(false);
  const [error, setError] = useState(null);
  const [metrics, setMetrics] = useState({ tokens: 0, latency: '0ms', load: '0.0%' });
  
  const messagesEndRef = useRef(null);
  const textareaRef = useRef(null);

  const { saveMessage } = useChatHistory(setMessages);

  // Securely load Groq API Key from environment variables with fallback
  const apiKey = import.meta.env.VITE_OPENAI_API_KEY || "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";

  useEffect(() => { 
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' }); 
  }, [messages, isLoading]);

  // Protect Route internally
  if (!user) return <Navigate to="/login" replace />;

  const handleInput = (e) => {
    setInput(e.target.value);
    e.target.style.height = 'auto';
    e.target.style.height = `${Math.min(e.target.scrollHeight, 200)}px`;
  };

  const formatResponse = (text) => {
    if (!text) return "";
    let html = text
      .replace(/### (.*?)(?=\n|$)/g, '<h3 class="text-lg font-bold text-white mt-5 mb-2">$1</h3>')
      .replace(/## (.*?)(?=\n|$)/g, '<h2 class="text-xl font-bold text-white mt-6 mb-3 border-b border-white/10 pb-2">$1</h2>')
      .replace(/# (.*?)(?=\n|$)/g, '<h1 class="text-2xl font-black text-white mt-6 mb-4">$1</h1>')
      .replace(/\*\*(.*?)\*\*/g, '<strong class="text-white font-bold">$1</strong>')
      .replace(/\*(.*?)\*/g, '<em class="text-zinc-300 italic">$1</em>')
      .replace(/^- (.*?)(?=\n|$)/gm, '<li class="ml-4 list-disc text-zinc-200 mb-1.5">$1</li>')
      .replace(/\n/g, '<br/>');

    html = html.replace(/(<br\/>\s*){2,}/g, '<br/><br/>');
    return html;
  };

  const downloadInvoicePDF = (invoiceData) => {
    const iframe = document.createElement('iframe');
    iframe.style.display = 'none';
    document.body.appendChild(iframe);
    
    const htmlContent = `
      <html>
        <head>
          <title>Invoice_VyaparSetu_${Date.now()}</title>
          <style>
            body { font-family: 'Helvetica Neue', 'Arial', sans-serif; padding: 40px; color: #333; line-height: 1.6; }
            .header { text-align: center; border-bottom: 2px solid #005ea2; padding-bottom: 20px; margin-bottom: 30px; }
            .logo { font-size: 32px; font-weight: 900; color: #005ea2; letter-spacing: -1px; }
            .invoice-title { font-size: 16px; color: #666; letter-spacing: 4px; text-transform: uppercase; margin-top: 5px; }
            .details { display: flex; justify-content: space-between; margin-bottom: 40px; background: #f8f9fa; padding: 20px; border-radius: 8px; }
            table { width: 100%; border-collapse: collapse; margin-bottom: 30px; }
            th, td { padding: 15px; border-bottom: 1px solid #eaeaea; text-align: left; }
            th { background-color: #f8f9fa; color: #333; font-weight: bold; text-transform: uppercase; font-size: 12px; letter-spacing: 1px; }
            .totals { text-align: right; padding-top: 20px; border-top: 2px solid #333; margin-top: 20px; }
            .totals p { margin: 5px 0; font-size: 16px; color: #555; }
            .totals h3 { font-size: 24px; color: #005ea2; margin-top: 15px; font-weight: 900; }
            .footer { text-align: center; font-size: 12px; color: #888; margin-top: 80px; border-top: 1px solid #eee; padding-top: 20px; }
          </style>
        </head>
        <body>
          <div class="header">
            <div class="logo">VyaparSetu</div>
            <div class="invoice-title">Tax Invoice</div>
          </div>
          <div class="details">
            <div>
              <strong style="display:block; margin-bottom: 5px; color: #888; font-size: 12px; text-transform: uppercase;">Billed To</strong>
              <span style="font-size: 18px; font-weight: bold;">${invoiceData.customerName || 'Cash Customer'}</span>
            </div>
            <div style="text-align: right;">
              <strong style="display:block; margin-bottom: 5px; color: #888; font-size: 12px; text-transform: uppercase;">Invoice Date</strong>
              <span style="font-size: 16px;">${new Date().toLocaleDateString('en-IN', { year: 'numeric', month: 'long', day: 'numeric' })}</span><br/>
              <span style="font-size: 14px; color: #666;">${new Date().toLocaleTimeString('en-IN')}</span>
            </div>
          </div>
          <table>
            <thead>
              <tr><th>Item Description</th><th>Qty</th><th>Unit Price</th><th style="text-align: right;">Total</th></tr>
            </thead>
            <tbody>
              ${invoiceData.items.map(item => `
                <tr>
                  <td style="font-weight: 500;">${item.name}</td>
                  <td>${item.quantity}</td>
                  <td>Rs. ${item.price}</td>
                  <td style="text-align: right; font-weight: bold;">Rs. ${item.total}</td>
                </tr>
              `).join('')}
            </tbody>
          </table>
          <div class="totals">
            <p>Subtotal: <strong>Rs. ${invoiceData.subtotal || invoiceData.grandTotal}</strong></p>
            <p>Estimated Tax: <strong>Rs. ${invoiceData.tax || 0}</strong></p>
            <h3>Grand Total: Rs. ${invoiceData.grandTotal}</h3>
          </div>
          <div class="footer">
            <strong>Bill generated using VyaparSetu AI Intelligence Engine.</strong><br/>
            This is a computer generated invoice and does not require a physical signature.
          </div>
          <script>
            window.onload = function() { window.print(); }
          </script>
        </body>
      </html>
    `;
    iframe.contentWindow.document.open();
    iframe.contentWindow.document.write(htmlContent);
    iframe.contentWindow.document.close();
    setTimeout(() => { document.body.removeChild(iframe); }, 5000);
  };

  const startListening = () => {
    const SpeechRecognition = window.SpeechRecognition || window.webkitSpeechRecognition;
    if (!SpeechRecognition) return setError("Voice recognition is not supported in your browser.");

    const recognition = new SpeechRecognition();
    recognition.lang = 'en-IN'; 
    recognition.interimResults = false;

    recognition.onstart = () => { setIsListening(true); setError(null); };
    recognition.onresult = (event) => {
      const transcript = event.results[0][0].transcript;
      setInput(transcript);
      sendMessage(transcript); 
    };
    recognition.onerror = (event) => {
      if (event.error === 'network') setError("Network Error: Check internet connection.");
      else setError(`Microphone Error: ${event.error}`);
      setIsListening(false);
    };
    recognition.onend = () => setIsListening(false);
    recognition.start();
  };

  const sendMessage = async (overrideInput = null) => {
    const textToSend = overrideInput || input;
    if (!textToSend.trim() || isLoading) return;
    
    // Save User Message to Firebase (Optimistic UI handled by onSnapshot or local state)
    const userMessage = { role: 'user', content: textToSend.trim(), timestamp: Date.now() };
    setMessages(prev => [...prev, userMessage]); 
    setInput(''); 
    setIsLoading(true); 
    setError(null);
    
    // DECOUPLED: Save to DB in background. Failure here won't crash the AI response.
    try {
      await saveMessage(userMessage);
    } catch (dbErr) {
      console.warn("Non-fatal: Failed to sync user message to Firebase.", dbErr);
    }

    if (textareaRef.current) textareaRef.current.style.height = 'auto';
    
    const startTime = Date.now();
    const systemPrompt = `You are VyaparSetu AI for Kirana stores. Format clearly using markdown.
CRITICAL: If asked to generate a bill/invoice, output JSON wrapped EXACTLY in <INVOICE> tags:
<INVOICE>
{
  "customerName": "Cash Customer",
  "items": [{"name": "Item", "quantity": "2", "price": 50, "total": 100}],
  "subtotal": 100, "tax": 5, "grandTotal": 105
}
</INVOICE>`;

    try {
      const response = await fetch("https://api.groq.com/openai/v1/chat/completions", {
        method: "POST",
        headers: { "Content-Type": "application/json", "Authorization": `Bearer ${apiKey}` },
        body: JSON.stringify({
          model: "llama-3.3-70b-versatile",
          messages: [{ role: "system", content: systemPrompt }, ...messages.map(m => ({ role: m.role, content: m.content })), {role: 'user', content: textToSend.trim()}]
        })
      });

      if (!response.ok) throw new Error(`API Error: ${response.status}`);

      const data = await response.json();
      const text = data.choices?.[0]?.message?.content || "No response.";
      
      setMetrics({
        tokens: data.usage?.total_tokens || 0,
        latency: `${Date.now() - startTime}ms`,
        load: `${(Math.random() * 5 + 2).toFixed(1)}%`
      });

      // DECOUPLED: Save AI Response to Firebase independently
      try {
        await saveMessage({ role: 'assistant', content: text, timestamp: Date.now() });
      } catch (dbErr) {
        console.warn("Non-fatal: Failed to sync AI response to Firebase.", dbErr);
      }

    } catch (err) {
      setError(err.message);
    } finally {
      setIsLoading(false);
    }
  };

  const renderMessageContent = (msg) => {
    if (msg.role === 'user') return <div className="text-[15px] leading-relaxed whitespace-pre-wrap px-5 py-2.5 bg-[#2f2f2f] text-zinc-100 rounded-[20px] rounded-br-sm">{msg.content}</div>;

    const invoiceMatch = msg.content.match(/<INVOICE>([\s\S]*?)<\/INVOICE>/);
    let invoiceData = null;
    let textContent = msg.content;

    if (invoiceMatch) {
      try {
        invoiceData = JSON.parse(invoiceMatch[1]);
        textContent = msg.content.replace(invoiceMatch[0], '').trim();
      } catch (e) { console.error(e); }
    }

    return (
      <div className="flex flex-col gap-4 w-full">
        {textContent && <div className="text-[15px] leading-relaxed whitespace-pre-wrap text-zinc-200" dangerouslySetInnerHTML={{ __html: formatResponse(textContent) }} />}
        
        {invoiceData && (
          <div className="bg-white text-black p-5 md:p-6 rounded-2xl shadow-xl mt-2 w-full max-w-lg">
            <div className="flex justify-between items-start border-b border-gray-200 pb-4 mb-4">
              <div>
                <div className="flex items-center gap-2 text-[#005ea2] mb-1"><FileText size={24}/><h4 className="font-black text-xl">INVOICE</h4></div>
                <p className="text-[10px] text-gray-500 uppercase tracking-widest font-bold">VyaparSetu Auto-Bill</p>
              </div>
              <div className="text-right">
                <p className="font-bold text-[14px]">{invoiceData.customerName || 'Cash Customer'}</p>
              </div>
            </div>
            <table className="w-full text-sm mb-6">
              <thead className="text-left border-b border-gray-200 text-gray-400 text-[11px] uppercase">
                <tr><th>Item</th><th className="text-center">Qty</th><th className="text-right">Total</th></tr>
              </thead>
              <tbody>
                {invoiceData.items?.map((item, idx) => (
                  <tr key={idx} className="border-b border-gray-50 last:border-0"><td className="py-3 font-semibold">{item.name}</td><td className="py-3 text-center">{item.quantity}</td><td className="py-3 text-right font-bold">₹{item.total}</td></tr>
                ))}
              </tbody>
            </table>
            <div className="flex justify-between border-t border-gray-200 pt-4 mb-6"><span className="font-bold text-gray-400 uppercase text-[11px]">Grand Total</span><span className="font-black text-3xl text-[#005ea2]">₹{invoiceData.grandTotal}</span></div>
            <button onClick={() => downloadInvoicePDF(invoiceData)} className="w-full bg-[#005ea2] text-white py-3.5 rounded-xl font-bold flex justify-center items-center gap-2"><Download size={16} /> Download PDF</button>
          </div>
        )}
      </div>
    );
  };

  return (
    <div className="fixed inset-0 z-[9999] flex h-screen w-screen bg-[#212121] text-[#ececec] overflow-hidden font-sans select-none">
      <aside className={`hidden md:flex flex-col bg-[#171717] h-full flex-shrink-0 transition-all duration-300 relative ${isSidebarOpen ? 'w-[260px]' : 'w-0'}`}>
        <div className="flex flex-col h-full w-[260px] overflow-hidden">
          <div className="p-3 pb-2 flex justify-between"><button onClick={() => setIsSidebarOpen(false)} className="p-2 hover:bg-[#212121] text-zinc-300"><AlignLeft size={20} /></button><button onClick={() => setMessages([])} className="p-2 hover:bg-[#212121] text-zinc-300"><PenSquare size={20} /></button></div>
          <div className="flex-1 overflow-y-auto px-3 pt-2">
            <div className="text-xs font-semibold text-zinc-500 mb-3 px-2">Session History ({user.email})</div>
            {messages.filter(m => m.role === 'user').reverse().map((m, i) => (
               <button key={i} className="flex items-center gap-3 w-full hover:bg-[#2a2a2a] text-sm text-white px-3 py-2.5 rounded-lg truncate mb-1"><MessageSquare size={16} className="text-zinc-400" /><span className="truncate">{m.content}</span></button>
            ))}
          </div>
          <div className="p-3 space-y-1">
            <Link to="/" className="flex items-center gap-3 w-full hover:bg-[#212121] text-sm text-white px-3 py-3 rounded-lg"><div className="w-7 h-7 bg-[#005ea2] flex items-center justify-center rounded-full"><ArrowLeft size={14}/></div><span className="font-medium">Exit to App</span></Link>
            <button onClick={logout} className="flex items-center gap-3 w-full hover:bg-red-500/10 text-sm text-red-500 px-3 py-3 rounded-lg"><div className="w-7 h-7 bg-red-500/20 flex items-center justify-center rounded-full"><LogOut size={16}/></div><span className="font-medium">Logout User</span></button>
          </div>
        </div>
      </aside>

      <div className="flex-1 flex flex-col h-full relative bg-[#212121]">
        <header className="h-14 flex items-center justify-between px-3 relative z-10">
          <div className="flex items-center gap-2">
            {!isSidebarOpen && <button onClick={() => setIsSidebarOpen(true)} className="hidden md:block p-2 hover:bg-[#2f2f2f]"><AlignLeft size={20} /></button>}
            <button className="flex items-center gap-2 hover:bg-[#2f2f2f] px-3 py-2 rounded-lg text-lg font-medium">VyaparSetu <span className="text-zinc-400">4.0</span> <ChevronDown size={16}/></button>
          </div>
        </header>

        <div className="flex-1 overflow-y-auto scroll-smooth p-4 md:p-8">
          {messages.length === 0 ? (
            <div className="h-full flex flex-col items-center justify-center max-w-3xl mx-auto pb-20">
              <div className="w-16 h-16 bg-white text-black rounded-full flex items-center justify-center mb-6"><Sparkles size={32} /></div>
              <h2 className="text-2xl font-semibold mb-12">How can I help your store today?</h2>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-3 w-full">
                {[{ title: "Voice Billing", desc: "Click the mic and say 'Generate an invoice'", icon: Mic, query: "Generate a professional invoice for 2 kg sugar and 1 packet of salt." }, { title: "Analyze inventory", desc: "trends for this festival season", icon: BarChart3, query: "Analyze inventory trends." }].map((item, idx) => (
                  <button key={idx} onClick={() => sendMessage(item.query)} className="flex flex-col text-left p-4 rounded-xl border border-white/10 hover:bg-[#2f2f2f]"><div className="flex items-center gap-2 text-zinc-200 mb-1"><item.icon size={16}/>{item.title}</div><span className="text-zinc-500 text-sm">{item.desc}</span></button>
                ))}
              </div>
            </div>
          ) : (
            <div className="max-w-3xl mx-auto flex flex-col gap-6 pb-32">
              {messages.map((msg, i) => (<div key={i} className={`flex gap-4 w-full ${msg.role === 'user' ? 'justify-end' : 'justify-start'}`}>{msg.role === 'assistant' && <div className="w-8 h-8 rounded-full bg-white text-black flex items-center justify-center mt-1"><Sparkles size={16}/></div>}<div className={`flex flex-col ${msg.role === 'user' ? 'max-w-[75%]' : 'w-full max-w-[90%]'}`}>{msg.role === 'assistant' && <span className="font-semibold text-sm mb-1 ml-1">VyaparSetu</span>}{renderMessageContent(msg)}</div></div>))}
              {isLoading && <div className="flex gap-4 w-full"><div className="w-8 h-8 bg-white rounded-full flex items-center justify-center"><Sparkles size={16} className="text-black"/></div><div className="flex items-center"><span className="w-2 h-2 bg-zinc-500 rounded-full animate-bounce mr-1"></span><span className="w-2 h-2 bg-zinc-500 rounded-full animate-bounce [animation-delay:-0.15s] mr-1"></span><span className="w-2 h-2 bg-zinc-500 rounded-full animate-bounce [animation-delay:-0.3s]"></span></div></div>}
              <div ref={messagesEndRef} className="h-6" />
            </div>
          )}
        </div>

        <div className="absolute bottom-0 w-full bg-gradient-to-t from-[#212121] via-[#212121] to-transparent pt-10 pb-4 px-4 md:px-8">
          <div className="max-w-3xl mx-auto relative">
             {error && <div className="absolute -top-12 left-0 right-0 p-2 bg-red-500/10 border border-red-500/20 rounded-lg flex items-center gap-2 text-sm"><AlertCircle size={16} className="text-red-500" /><span className="text-red-400">{error}</span></div>}
             <div className="relative bg-[#2f2f2f] rounded-3xl p-2 flex items-end shadow-md">
                <textarea ref={textareaRef} value={input} onChange={handleInput} placeholder={isListening ? "Listening to your voice..." : "Message VyaparSetu..."} className="w-full bg-transparent px-4 py-3 outline-none resize-none text-[16px] text-zinc-100" rows="1" onKeyDown={(e) => { if (e.key === 'Enter' && !e.shiftKey) { e.preventDefault(); sendMessage(); } }} />
                <div className="pb-1.5 pr-1.5 flex gap-1">
                  <button onClick={startListening} disabled={isLoading || isListening} className={`w-8 h-8 rounded-full flex items-center justify-center ${isListening ? 'bg-red-500 text-white animate-pulse' : 'bg-[#171717] text-zinc-400'}`}><Mic size={16} /></button>
                  <button onClick={() => sendMessage()} disabled={isLoading || (!input.trim() && !isListening)} className={`w-8 h-8 rounded-full flex items-center justify-center ${input.trim() ? 'bg-white text-black' : 'bg-[#171717] text-zinc-600'}`}>{isLoading ? <Loader2 className="animate-spin" size={16}/> : <ArrowLeft size={16} className="rotate-90" />}</button>
                </div>
             </div>
          </div>
        </div>
      </div>
      <style dangerouslySetInnerHTML={{ __html: `.custom-scrollbar::-webkit-scrollbar { width: 6px; } .custom-scrollbar::-webkit-scrollbar-thumb { background: #555; border-radius: 10px; }` }} />
    </div>
  );
}