import React, { useState, useEffect, useRef } from 'react';
import { 
  Menu, Plus, MessageSquare, Send, User, Bot, 
  Settings, Loader2, Sparkles, AlertCircle, 
  ArrowLeft, X, ChevronDown, AlignLeft,
  PenSquare, Compass, ShieldCheck, BarChart3, Database,
  Activity, Mic, Download, FileText // <-- Added Download & FileText for invoices
} from 'lucide-react';
import { Link } from 'react-router-dom';

export default function Chatbot() {
  const [messages, setMessages] = useState([]);
  const [input, setInput] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [isListening, setIsListening] = useState(false); // Voice state
  const [isSidebarOpen, setIsSidebarOpen] = useState(true);
  const [isMobileSidebarOpen, setIsMobileSidebarOpen] = useState(false);
  const [error, setError] = useState(null);
  const [metrics, setMetrics] = useState({ tokens: 0, latency: '0ms', load: '0.0%' });
  
  const messagesEndRef = useRef(null);
  const textareaRef = useRef(null);

  // Hardcoded Groq API Key as requested
  const apiKey = "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";

  const scrollToBottom = () => { 
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' }); 
  };
  
  useEffect(() => { 
    scrollToBottom(); 
  }, [messages, isLoading]);

  const handleInput = (e) => {
    setInput(e.target.value);
    e.target.style.height = 'auto';
    e.target.style.height = `${Math.min(e.target.scrollHeight, 200)}px`;
  };

  // Converts raw markdown symbols (#, **, -) into clean, perfectly styled HTML
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

    // Clean up excessive breaks
    html = html.replace(/(<br\/>\s*){2,}/g, '<br/><br/>');
    return html;
  };

  // PDF Generator Logic (Triggered by the AI producing an Invoice JSON)
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
            window.onload = function() {
              window.print();
            }
          </script>
        </body>
      </html>
    `;
    iframe.contentWindow.document.open();
    iframe.contentWindow.document.write(htmlContent);
    iframe.contentWindow.document.close();

    // Cleanup iframe after print dialog opens
    setTimeout(() => {
      document.body.removeChild(iframe);
    }, 5000);
  };

  // Improved Voice Interaction Logic
  const startListening = () => {
    const SpeechRecognition = window.SpeechRecognition || window.webkitSpeechRecognition;
    if (!SpeechRecognition) {
      setError("Voice recognition is not supported in your browser.");
      return;
    }

    const recognition = new SpeechRecognition();
    recognition.lang = 'en-IN'; // Optimized for Indian context
    recognition.interimResults = false;
    recognition.maxAlternatives = 1;

    recognition.onstart = () => {
      setIsListening(true);
      setError(null);
    };

    recognition.onresult = (event) => {
      const transcript = event.results[0][0].transcript;
      setInput(transcript);
      sendMessage(transcript); // Auto-send after speaking
    };

    recognition.onerror = (event) => {
      // Fix for the specific Network Error
      if (event.error === 'network') {
        setError("Network Error: Unable to reach speech servers. Please check your internet or use text input.");
      } else {
        setError(`Microphone Error: ${event.error}`);
      }
      setIsListening(false);
    };

    recognition.onend = () => {
      setIsListening(false);
    };

    recognition.start();
  };

  const sendMessage = async (overrideInput = null) => {
    const textToSend = overrideInput || input;
    if (!textToSend.trim() || isLoading) return;
    if (!apiKey) { 
      setError("SYSTEM_AUTH_ERROR: API Key Missing"); 
      return; 
    }
    
    const userMessage = { role: 'user', content: textToSend.trim() };
    const newMessages = [...messages, userMessage];
    setMessages(newMessages); 
    setInput(''); 
    setIsLoading(true); 
    setError(null);
    
    // Reset textarea height after sending
    if (textareaRef.current) {
      textareaRef.current.style.height = 'auto';
    }
    
    const startTime = Date.now();
    
    // Core Prompt deeply instructing the AI to output JSON for bills/invoices
    const systemPrompt = `You are VyaparSetu AI, an expert digital assistant for Indian Kirana stores. Format your text responses clearly using markdown without raw symbols if possible.
CRITICAL INSTRUCTION: If the user explicitly asks to generate a bill, invoice, or dictates items for billing (e.g., "create an invoice for 2 kg sugar"), you MUST output an invoice JSON block wrapped EXACTLY in <INVOICE> tags anywhere in your response.
Format the block exactly like this:
<INVOICE>
{
  "customerName": "Cash Customer",
  "items": [
    {"name": "Item Name", "quantity": "2", "price": 50, "total": 100}
  ],
  "subtotal": 100,
  "tax": 5,
  "grandTotal": 105
}
</INVOICE>
You can include normal conversational text outside the tags. Do not use markdown formatting inside the <INVOICE> block.`;

    try {
      // REAL LOGIC: Groq API Call
      const response = await fetch("https://api.groq.com/openai/v1/chat/completions", {
        method: "POST",
        headers: { 
          "Content-Type": "application/json", 
          "Authorization": `Bearer ${apiKey}` 
        },
        body: JSON.stringify({
          model: "llama-3.3-70b-versatile",
          messages: [
            { role: "system", content: systemPrompt },
            ...newMessages.map(m => ({ role: m.role, content: m.content }))
          ]
        })
      });

      if (!response.ok) {
        const errData = await response.json().catch(() => ({}));
        throw new Error(errData.error?.message || `API Error: ${response.status}`);
      }

      const data = await response.json();
      const endTime = Date.now();
      const text = data.choices?.[0]?.message?.content || "No response received.";
      
      setMetrics({
        tokens: data.usage?.total_tokens || 0,
        latency: `${endTime - startTime}ms`,
        load: `${(Math.random() * 5 + 2).toFixed(1)}%`
      });

      setMessages(prev => [...prev, { role: 'assistant', content: text }]);
    } catch (err) {
      setError(err.message);
    } finally {
      setIsLoading(false);
    }
  };

  // Helper to render AI messages and intercept <INVOICE> tags
  const renderMessageContent = (msg) => {
    if (msg.role === 'user') {
      return (
        <div className="text-[15px] leading-relaxed whitespace-pre-wrap px-5 py-2.5 bg-[#2f2f2f] text-zinc-100 rounded-[20px] rounded-br-sm">
          {msg.content}
        </div>
      );
    }

    // Check for <INVOICE> tags in assistant response
    const invoiceMatch = msg.content.match(/<INVOICE>([\s\S]*?)<\/INVOICE>/);
    let invoiceData = null;
    let textContent = msg.content;

    if (invoiceMatch) {
      try {
        invoiceData = JSON.parse(invoiceMatch[1]);
        textContent = msg.content.replace(invoiceMatch[0], '').trim();
      } catch (e) {
        console.error("Failed to parse invoice JSON", e);
      }
    }

    return (
      <div className="flex flex-col gap-4 w-full">
        {textContent && (
          <div 
            className="text-[15px] leading-relaxed whitespace-pre-wrap text-zinc-200"
            dangerouslySetInnerHTML={{ __html: formatResponse(textContent) }} 
          />
        )}
        
        {/* Render Beautiful Invoice Card if Data Exists */}
        {invoiceData && (
          <div className="bg-white text-black p-5 md:p-6 rounded-2xl shadow-xl border border-gray-200 mt-2 w-full max-w-lg animate-in zoom-in-95 duration-500">
            <div className="flex justify-between items-start border-b border-gray-200 pb-4 mb-4">
              <div>
                <div className="flex items-center gap-2 text-[#005ea2] mb-1">
                  <FileText size={24} strokeWidth={2.5}/>
                  <h4 className="font-black text-xl tracking-tight">INVOICE</h4>
                </div>
                <p className="text-[10px] text-gray-500 uppercase tracking-widest font-bold">VyaparSetu Auto-Bill</p>
              </div>
              <div className="text-right">
                <p className="font-bold text-[14px]">{invoiceData.customerName || 'Cash Customer'}</p>
                <p className="text-[11px] text-gray-500 font-mono mt-1">{new Date().toLocaleDateString('en-IN')}</p>
              </div>
            </div>
            
            <table className="w-full text-sm mb-6">
              <thead className="text-left border-b border-gray-200 text-gray-400 text-[11px] uppercase tracking-wider">
                <tr>
                  <th className="pb-2 font-bold">Item</th>
                  <th className="pb-2 font-bold text-center">Qty</th>
                  <th className="pb-2 font-bold text-right">Total</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-100">
                {invoiceData.items && invoiceData.items.map((item, idx) => (
                  <tr key={idx}>
                    <td className="py-3 font-semibold text-gray-800">{item.name}</td>
                    <td className="py-3 text-gray-600 text-center font-mono">{item.quantity}</td>
                    <td className="py-3 text-right font-bold font-mono">₹{item.total}</td>
                  </tr>
                ))}
              </tbody>
            </table>
            
            <div className="flex justify-between items-center border-t border-gray-200 pt-4 mb-6">
              <span className="font-bold text-gray-400 uppercase tracking-widest text-[11px]">Grand Total</span>
              <span className="font-black text-3xl text-[#005ea2] font-mono tracking-tighter">₹{invoiceData.grandTotal}</span>
            </div>
            
            <button 
              onClick={() => downloadInvoicePDF(invoiceData)}
              className="w-full bg-[#005ea2] hover:bg-[#0b4774] text-white py-3.5 rounded-xl font-bold uppercase tracking-widest text-[11px] transition-all flex justify-center items-center gap-2 shadow-lg shadow-blue-900/20 active:scale-95"
            >
              <Download size={16} strokeWidth={2.5} /> Download PDF
            </button>
          </div>
        )}
      </div>
    );
  };

  return (
    /* SECTION 1: FULLSCREEN IMMERSIVE CONTAINER */
    <div className="fixed inset-0 z-[9999] flex h-screen w-screen bg-[#212121] text-[#ececec] overflow-hidden font-sans select-none">
      
      {/* SECTION 2: DESKTOP SLIDING SIDEBAR */}
      <aside 
        className={`hidden md:flex flex-col bg-[#171717] h-full flex-shrink-0 transition-all duration-300 ease-in-out relative ${isSidebarOpen ? 'w-[260px]' : 'w-0'}`}
      >
        <div className="flex flex-col h-full w-[260px] overflow-hidden">
          {/* Sidebar Header */}
          <div className="p-3 pb-2 flex justify-between items-center">
            <button 
              onClick={() => setIsSidebarOpen(false)}
              className="p-2 rounded-md hover:bg-[#212121] transition-colors text-zinc-300"
              title="Close sidebar"
            >
              <AlignLeft size={20} />
            </button>
            <button 
              onClick={() => setMessages([])}
              className="p-2 rounded-md hover:bg-[#212121] transition-colors text-zinc-300"
              title="New chat"
            >
              <PenSquare size={20} />
            </button>
          </div>

          {/* Sidebar Chat History */}
          <div className="flex-1 overflow-y-auto custom-scrollbar px-3 pt-2">
            <div className="text-xs font-semibold text-zinc-500 mb-3 px-2">Today</div>
            {messages.length === 0 ? (
              <div className="text-xs text-zinc-500 px-2 italic">No recent chats</div>
            ) : (
              <button className="flex items-center gap-3 w-full bg-[#212121] hover:bg-[#2a2a2a] text-sm text-white px-3 py-2.5 rounded-lg transition-colors truncate">
                <MessageSquare size={16} className="shrink-0 text-zinc-300" />
                <span className="truncate">{messages[0].content.substring(0, 25)}...</span>
              </button>
            )}
          </div>

          {/* Sidebar Footer */}
          <div className="p-3 space-y-1">
            <Link to="/" className="flex items-center gap-3 w-full hover:bg-[#212121] text-sm text-white px-3 py-3 rounded-lg transition-colors">
              <div className="w-7 h-7 rounded-full bg-[#005ea2] flex items-center justify-center shrink-0">
                <ArrowLeft size={14} className="text-white"/>
              </div>
              <span className="font-medium">Exit to App</span>
            </Link>
            <button className="flex items-center gap-3 w-full hover:bg-[#212121] text-sm text-white px-3 py-3 rounded-lg transition-colors">
              <div className="w-7 h-7 rounded-full bg-zinc-600 flex items-center justify-center shrink-0">
                <User size={16} className="text-white" />
              </div>
              <span className="font-medium">Store Account</span>
            </button>
          </div>
        </div>
      </aside>

      {/* SECTION 3: MOBILE SIDEBAR OVERLAY */}
      <div className={`md:hidden fixed inset-0 z-[100000] ${isMobileSidebarOpen ? 'pointer-events-auto' : 'pointer-events-none'}`}>
        <div 
          className={`absolute inset-0 bg-black/50 transition-opacity duration-300 ${isMobileSidebarOpen ? 'opacity-100' : 'opacity-0'}`} 
          onClick={() => setIsMobileSidebarOpen(false)}
        ></div>
        <div className={`w-[280px] h-full bg-[#171717] relative flex flex-col transform transition-transform duration-300 ${isMobileSidebarOpen ? 'translate-x-0' : '-translate-x-full'}`}>
          <div className="p-3 flex justify-between items-center border-b border-white/10">
            <span className="text-white font-medium px-2">VyaparSetu AI</span>
            <button 
              onClick={() => setIsMobileSidebarOpen(false)}
              className="p-2 rounded-md hover:bg-[#212121] transition-colors"
            >
              <X size={20} />
            </button>
          </div>
          <div className="flex-1 overflow-y-auto px-3 py-4">
            <button 
              onClick={() => { setMessages([]); setIsMobileSidebarOpen(false); }}
              className="flex items-center gap-3 w-full hover:bg-[#212121] text-sm text-white px-3 py-3 rounded-lg transition-colors border border-white/10 mb-4"
            >
              <Plus size={16} /> New chat
            </button>
            <div className="text-xs font-semibold text-zinc-500 mb-3 px-2">History</div>
            {messages.length > 0 && (
              <button className="flex items-center gap-3 w-full bg-[#212121] text-sm text-white px-3 py-2.5 rounded-lg truncate">
                <MessageSquare size={16} className="shrink-0 text-zinc-300" />
                <span className="truncate">{messages[0].content.substring(0, 20)}...</span>
              </button>
            )}
          </div>
          <div className="p-3 border-t border-white/10">
            <Link to="/" className="flex items-center gap-3 w-full hover:bg-[#212121] text-sm text-white px-3 py-3 rounded-lg">
              <ArrowLeft size={18}/> Back to Home
            </Link>
          </div>
        </div>
      </div>

      {/* MAIN WORKSPACE */}
      <div className="flex-1 flex flex-col h-full relative min-w-0 bg-[#212121]">
        
        {/* SECTION 4: HEADER NAV (ChatGPT Style) */}
        <header className="h-14 flex items-center justify-between px-3 relative z-10">
          <div className="flex items-center gap-2">
            {!isSidebarOpen && (
              <button 
                onClick={() => setIsSidebarOpen(true)} 
                className="hidden md:block p-2 rounded-md hover:bg-[#2f2f2f] text-zinc-300 transition-colors"
                title="Open sidebar"
              >
                <AlignLeft size={20} />
              </button>
            )}
            <button 
              onClick={() => setIsMobileSidebarOpen(true)} 
              className="md:hidden p-2 rounded-md hover:bg-[#2f2f2f] text-zinc-300 transition-colors"
            >
              <Menu size={20} />
            </button>
            
            <button className="flex items-center gap-2 hover:bg-[#2f2f2f] px-3 py-2 rounded-lg transition-colors text-lg font-medium text-zinc-200">
              VyaparSetu <span className="text-zinc-400">4.0</span> <ChevronDown size={16} className="text-zinc-500"/>
            </button>
          </div>
          <div className="flex items-center gap-2">
            <button 
              onClick={() => setMessages([])}
              className="md:hidden p-2 rounded-md hover:bg-[#2f2f2f] text-zinc-300 transition-colors"
            >
              <PenSquare size={20} />
            </button>
          </div>
        </header>

        {/* SECTION 5: MESSAGE STREAM & EMPTY STATE */}
        <div className="flex-1 overflow-y-auto scroll-smooth w-full relative custom-scrollbar">
          {messages.length === 0 ? (
            <div className="h-full flex flex-col items-center justify-center px-4 max-w-3xl mx-auto w-full pb-20">
              <div className="w-16 h-16 bg-white text-black rounded-full flex items-center justify-center mb-6">
                <Sparkles size={32} />
              </div>
              <h2 className="text-2xl font-semibold mb-12 text-center text-zinc-100">How can I help your store today?</h2>
              
              {/* ChatGPT Style Empty State Grid */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-3 w-full">
                {[
                  { title: "Voice Billing", desc: "Click the mic and say 'Generate an invoice for 2 kg sugar'", icon: Mic, query: "Generate a professional invoice for 2 kg sugar and 1 packet of salt." },
                  { title: "Analyze inventory", desc: "trends for this festival season", icon: BarChart3, query: "Analyze inventory trends for this festival season." },
                  { title: "Draft a message", desc: "to collect Udhaar politely", icon: PenSquare, query: "Draft a message to collect Udhaar politely via WhatsApp." },
                  { title: "Compare suppliers", desc: "for wholesale sugar rates", icon: Compass, query: "Compare suppliers for wholesale sugar rates." }
                ].map((item, idx) => (
                  <button 
                    key={idx}
                    onClick={() => sendMessage(item.query)}
                    className="flex flex-col text-left p-4 rounded-xl border border-white/10 hover:bg-[#2f2f2f] transition-colors group"
                  >
                    <div className="flex items-center gap-2 mb-1 text-zinc-200 font-medium">
                       <item.icon size={16} className="text-zinc-400 group-hover:text-zinc-200 transition-colors" />
                       {item.title}
                    </div>
                    <span className="text-zinc-500 text-sm">{item.desc}</span>
                  </button>
                ))}
              </div>
            </div>
          ) : (
            <div className="max-w-3xl mx-auto flex flex-col gap-6 pt-6 pb-32 px-4">
              {messages.map((msg, i) => (
                <div key={i} className={`flex gap-4 w-full ${msg.role === 'user' ? 'justify-end' : 'justify-start'}`}>
                  
                  {msg.role === 'assistant' && (
                    <div className="w-8 h-8 rounded-full bg-white text-black flex items-center justify-center shrink-0 mt-1 shadow-lg">
                      <Sparkles size={16} />
                    </div>
                  )}

                  <div className={`flex flex-col ${msg.role === 'user' ? 'max-w-[75%]' : 'w-full max-w-[90%]'}`}>
                    {msg.role === 'assistant' && <span className="font-semibold text-zinc-200 mb-1 ml-1 text-sm">VyaparSetu</span>}
                    
                    {/* Intercept and render messages correctly */}
                    {renderMessageContent(msg)}

                  </div>
                </div>
              ))}
              
              {isLoading && (
                <div className="flex gap-4 w-full animate-in fade-in">
                  <div className="w-8 h-8 rounded-full bg-white text-black flex items-center justify-center shrink-0">
                    <Sparkles size={16} />
                  </div>
                  <div className="flex items-center">
                    <span className="w-2 h-2 bg-zinc-500 rounded-full animate-bounce [animation-delay:-0.3s] mr-1"></span>
                    <span className="w-2 h-2 bg-zinc-500 rounded-full animate-bounce [animation-delay:-0.15s] mr-1"></span>
                    <span className="w-2 h-2 bg-zinc-500 rounded-full animate-bounce"></span>
                  </div>
                </div>
              )}
              <div ref={messagesEndRef} className="h-6" />
            </div>
          )}
        </div>

        {/* SECTION 6: ADAPTIVE INPUT CONSOLE (ChatGPT Style bottom pinned) */}
        <div className="absolute bottom-0 w-full bg-gradient-to-t from-[#212121] via-[#212121] to-transparent pt-10 pb-4 px-4 md:px-8">
          <div className="max-w-3xl mx-auto relative">
             {error && (
               <div className="absolute -top-12 left-0 right-0 p-2 bg-red-500/10 border border-red-500/20 rounded-lg flex items-center gap-2 text-sm animate-in slide-in-from-bottom-2">
                 <AlertCircle size={16} className="text-red-500 shrink-0" />
                 <span className="text-red-400">{error}</span>
               </div>
             )}
             
             <div className="relative bg-[#2f2f2f] rounded-3xl p-2 flex items-end shadow-md">
                <textarea 
                  ref={textareaRef}
                  value={input} 
                  onChange={handleInput} 
                  placeholder={isListening ? "Listening to your voice..." : "Message VyaparSetu (e.g., 'Generate invoice for 5kg Atta')..."} 
                  className="w-full bg-transparent px-4 py-3 outline-none resize-none text-[16px] placeholder-zinc-500 min-h-[48px] max-h-[200px] custom-scrollbar text-zinc-100" 
                  rows="1" 
                  onKeyDown={(e) => {
                    if (e.key === 'Enter' && !e.shiftKey) {
                      e.preventDefault();
                      sendMessage();
                    }
                  }} 
                />
                
                <div className="pb-1.5 pr-1.5 flex items-center gap-1 shrink-0">
                  {/* VOICE INPUT BUTTON */}
                  <button 
                    onClick={startListening}
                    disabled={isLoading || isListening}
                    className={`w-8 h-8 rounded-full transition-all flex items-center justify-center ${
                      isListening ? 'bg-red-500 text-white animate-pulse' : 'bg-[#171717] text-zinc-400 hover:text-white hover:bg-zinc-700'
                    }`}
                    title="Voice Input / Dictate Bill"
                  >
                    <Mic size={16} />
                  </button>

                  {/* SUBMIT BUTTON */}
                  <button 
                    onClick={() => sendMessage()} 
                    disabled={isLoading || (!input.trim() && !isListening)}
                    className={`w-8 h-8 rounded-full transition-all flex items-center justify-center ${
                      input.trim() ? 'bg-white text-black hover:bg-zinc-200' : 'bg-[#171717] text-zinc-600'
                    }`}
                  >
                    {isLoading ? <Loader2 className="animate-spin" size={16}/> : <ArrowLeft size={16} className="transform rotate-90" />}
                  </button>
                </div>
             </div>
             
             <div className="flex items-center justify-between mt-3 px-2">
               <div className="text-[10px] font-mono text-zinc-600 flex gap-4">
                 <span>Latency: {metrics.latency}</span>
                 <span>Tokens: {metrics.tokens}</span>
               </div>
               <p className="text-center text-xs text-zinc-500 font-medium">
                 VyaparSetu can make mistakes. Verify important financial data.
               </p>
               <div className="w-[100px]"></div> {/* Spacer for balance */}
             </div>
          </div>
        </div>

      </div>

      {/* Global Style Rules specifically for Chatbot */}
      <style dangerouslySetInnerHTML={{ __html: `
        .custom-scrollbar::-webkit-scrollbar { width: 6px; }
        .custom-scrollbar::-webkit-scrollbar-track { background: transparent; }
        .custom-scrollbar::-webkit-scrollbar-thumb { background: #555; border-radius: 10px; }
        .custom-scrollbar::-webkit-scrollbar-thumb:hover { background: #888; }
        .no-scrollbar::-webkit-scrollbar { display: none; }
        .no-scrollbar { -ms-overflow-style: none; scrollbar-width: none; }
      ` }} />
    </div>
  );
}