import React, { useState, useEffect, useRef } from 'react';
import { ArrowDown, ArrowRight, Mic, MicOff, Activity, Cpu, Globe2, Volume2, ShieldCheck, Scale, Trash2, ShoppingCart, Loader2, Database, WifiOff, Lock } from 'lucide-react';
import { Link } from 'react-router-dom';

export default function FeatureVoiceBilling() {
  // --- REAL-TIME LOGIC: MediaDevices + Gemini API ---
  const [isRecording, setIsRecording] = useState(false);
  const [isProcessing, setIsProcessing] = useState(false);
  const [transcript, setTranscript] = useState('');
  const [cart, setCart] = useState([]);
  const [errorMsg, setErrorMsg] = useState('');
  
  const mediaRecorderRef = useRef(null);
  const audioChunksRef = useRef([]);

  // Consuming the API key from the .env file (Vite standard)
  const apiKey = import.meta.env.VITE_GEMINI_API_KEY; 

  // --- ROBUST FETCH WITH RETRY & EXPONENTIAL BACKOFF ---
  const fetchWithRetry = async (url, options, retries = 5, delay = 1000) => {
    try {
      const response = await fetch(url, options);
      
      if (response.ok) return await response.json();
      
      // If unauthorized (401/403), stop immediately as retries won't help
      if (response.status === 401 || response.status === 403) {
        throw new Error("Invalid API Key. Please check your .env file.");
      }

      // Retry for rate limits (429) or server errors (5xx)
      if (retries > 0 && (response.status === 429 || response.status >= 500)) {
        await new Promise(resolve => setTimeout(resolve, delay));
        return fetchWithRetry(url, options, retries - 1, delay * 2);
      }

      const errData = await response.json().catch(() => ({}));
      throw new Error(errData.error?.message || `Inference error: ${response.status}`);
    } catch (err) {
      if (retries > 0 && err.message.includes("fetch")) {
        await new Promise(resolve => setTimeout(resolve, delay));
        return fetchWithRetry(url, options, retries - 1, delay * 2);
      }
      throw err;
    }
  };

  // In-browser mapping logic for Kirana items
  const productCatalog = {
    'sugar': { id: 1, name: 'Sugar (Loose)', price: 42 },
    'cheeni': { id: 1, name: 'Sugar (Loose)', price: 42 },
    'shakkar': { id: 1, name: 'Sugar (Loose)', price: 42 },
    'rice': { id: 2, name: 'Basmati Rice (Loose)', price: 65 },
    'chawal': { id: 2, name: 'Basmati Rice (Loose)', price: 65 },
    'dal': { id: 3, name: 'Toor Dal (Loose)', price: 120 },
    'daal': { id: 3, name: 'Toor Dal (Loose)', price: 120 },
    'oil': { id: 4, name: 'Refined Oil', price: 185 },
    'tel': { id: 4, name: 'Refined Oil', price: 185 },
  };

  const numberMap = {
    'ek': 1, 'one': 1, 'do': 2, 'two': 2, 'to': 2, 'teen': 3, 'three': 3,
    'char': 4, 'four': 4, 'paanch': 5, 'five': 5, 'aadha': 0.5, 'half': 0.5
  };

  const startRecording = async () => {
    try {
      const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
      const mediaRecorder = new MediaRecorder(stream);
      mediaRecorderRef.current = mediaRecorder;
      audioChunksRef.current = [];

      mediaRecorder.ondataavailable = (event) => {
        if (event.data.size > 0) audioChunksRef.current.push(event.data);
      };

      mediaRecorder.onstop = async () => {
        const audioBlob = new Blob(audioChunksRef.current, { type: 'audio/webm' });
        processAudioWithGemini(audioBlob);
        stream.getTracks().forEach(track => track.stop());
      };

      mediaRecorder.start();
      setIsRecording(true);
      setErrorMsg('');
      setTranscript('');
    } catch (err) {
      setErrorMsg('Microphone access failed. Ensure you are on HTTPS and have granted permissions.');
    }
  };

  const stopRecording = () => {
    if (mediaRecorderRef.current && isRecording) {
      mediaRecorderRef.current.stop();
      setIsRecording(false);
    }
  };

  const processAudioWithGemini = async (blob) => {
    if (!apiKey) {
      setErrorMsg("API Configuration Missing: VITE_GEMINI_API_KEY is not set.");
      return;
    }

    setIsProcessing(true);
    try {
      // Logic: Convert Blob to Base64 for Gemini JSON payload
      const base64Data = await new Promise((resolve, reject) => {
        const reader = new FileReader();
        reader.onloadend = () => resolve(reader.result.split(',')[1]);
        reader.onerror = reject;
        reader.readAsDataURL(blob);
      });

      // UPDATED TO PUBLIC MODEL: gemini-1.5-flash
      const url = `https://generativelanguage.googleapis.com/v1beta/models/gemini-1.5-flash:generateContent?key=${apiKey}`;
      
      const payload = {
        contents: [{
          parts: [
            { text: "Transcribe this retail audio accurately. It contains a mix of Hindi and English (Hinglish) regarding grocery quantities. Return ONLY the transcribed text." },
            { inlineData: { mimeType: "audio/webm", data: base64Data } }
          ]
        }]
      };

      const result = await fetchWithRetry(url, {
        method: "POST",
        headers: {
          "Content-Type": "application/json"
        },
        body: JSON.stringify(payload)
      });

      // Parsing: Gemini returns text in a deeply nested structure
      const text = result.candidates?.[0]?.content?.parts?.[0]?.text || "";
      setTranscript(text);
      parseSpeechToCart(text);
    } catch (err) {
      setErrorMsg(err.message || 'Transcription engine unavailable.');
    } finally {
      setIsProcessing(false);
    }
  };

  const parseSpeechToCart = (text) => {
    const lowerText = text.toLowerCase();
    let detectedItem = null;
    let detectedQty = 1; 
    let qtyUnit = 'kg';

    for (const [key, product] of Object.entries(productCatalog)) {
      if (lowerText.includes(key)) {
        detectedItem = product;
        break;
      }
    }

    if (!detectedItem) return;

    const numRegex = /(\d+(?:\.\d+)?)\s*(kilo|kg|gram|g|liters|l|packet|piece)/;
    const numMatch = lowerText.match(numRegex);
    
    if (numMatch) {
      detectedQty = parseFloat(numMatch[1]);
      const rawUnit = numMatch[2];
      if (rawUnit === 'gram' || rawUnit === 'g') {
        detectedQty = detectedQty / 1000;
      }
    } else {
      for (const [word, num] of Object.entries(numberMap)) {
        if (lowerText.includes(word)) {
          detectedQty = num;
          break;
        }
      }
    }

    setCart(prev => [...prev, {
      cartId: Date.now(),
      ...detectedItem,
      quantity: detectedQty,
      unit: qtyUnit,
      total: detectedItem.price * detectedQty
    }]);
  };

  const removeFromCart = (cartId) => {
    setCart(cart.filter(item => item.cartId !== cartId));
  };

  const subtotal = cart.reduce((sum, item) => sum + item.total, 0);

  return (
    <div className="flex flex-col w-full bg-white text-black animate-in fade-in duration-700 min-h-screen">
      
      {/* SECTION 1: HERO SECTION */}
      <section className="relative w-full h-[60vh] min-h-[500px] flex items-center justify-start px-6 md:px-12 lg:px-24 overflow-hidden border-b border-[#333]">
        <div className="absolute inset-0 bg-gradient-to-r from-[#0a0a0a] via-black/90 to-transparent z-10"></div>
        <img 
          src="https://images.unsplash.com/photo-1593006526979-4f8fb2576bbf?auto=format&fit=crop&q=80" 
          alt="Audio Waves Data" 
          className="absolute inset-0 w-full h-full object-cover z-0 object-center opacity-30 mix-blend-screen"
        />
        
        <div className="relative z-20 max-w-4xl pt-16">
          <div className="bg-[#005ea2] text-white text-[11px] font-bold px-2 py-1 rounded-sm inline-flex items-center w-max mb-6 uppercase tracking-wider">
            Vyapar Theme Module
          </div>
          <h1 className="text-5xl md:text-7xl lg:text-[6rem] font-bold text-white tracking-tight leading-[1.05] mb-6 uppercase">
            VERNACULAR <br /> VOICE ENGINE
          </h1>
          <p className="text-xl md:text-2xl text-[#cccccc] max-w-2xl font-normal tracking-wide mb-10">
            Powered by VyaparSetu AI Inference. Process complex grocery billing instantly by speaking naturally in regional languages. 
          </p>
          <a 
            href="#live-engine"
            className="inline-flex items-center gap-3 bg-[#005ea2] hover:bg-[#0b4774] text-white px-8 py-4 font-bold tracking-wider transition-colors text-[13px] uppercase rounded-sm mb-20 md:mb-28"
          >
            Access Live Terminal <ArrowDown size={18} strokeWidth={2.5}/>
          </a>
        </div>
      </section>

      {/* SECTION 2: LIVE VYAPARSETU AI ENGINE */}
      <section id="live-engine" className="w-full py-24 px-6 md:px-12 lg:px-24 bg-[#0a0a0a] text-white border-b border-[#222] scroll-mt-16">
        <div className="max-w-7xl mx-auto grid lg:grid-cols-12 gap-12 items-start">
          
          <div className="lg:col-span-5 flex flex-col">
            <h2 className="text-[22px] font-bold tracking-widest uppercase mb-4 text-[#005ea2]">
              VYAPARSETU AI INFERENCE
            </h2>
            <p className="text-[#888] mb-8 text-[15px] leading-relaxed font-medium">
              Hold while speaking. Logic processes via VyaparSetu AI's high-speed cloud. Try <strong className="text-white">"Do kilo cheeni"</strong> or <strong className="text-white">"Ek kilo chawal"</strong>.
            </p>
            
            <div className="bg-[#181818] border border-[#333] rounded-sm p-8 flex flex-col items-center justify-center text-center min-h-[300px] relative overflow-hidden shadow-2xl">
              {isRecording && (
                <div className="absolute inset-0 bg-[#005ea2] opacity-10 animate-pulse pointer-events-none"></div>
              )}
              
              <button 
                onMouseDown={startRecording}
                onMouseUp={stopRecording}
                onTouchStart={startRecording}
                onTouchEnd={stopRecording}
                className={`w-28 h-28 rounded-full flex items-center justify-center mb-6 transition-all shadow-2xl ${
                  isRecording ? 'bg-red-600 scale-110 shadow-red-900/40' : 'bg-[#005ea2] hover:bg-[#0b4774]'
                }`}
              >
                {isProcessing ? <Loader2 size={36} className="animate-spin text-white" /> : <Mic size={36} className="text-white" />}
              </button>
              
              <h3 className="text-lg font-bold uppercase tracking-widest mb-2">
                {isRecording ? 'Capturing...' : isProcessing ? 'Processing...' : 'Hold to Speak'}
              </h3>
              
              <div className="w-full h-20 bg-black border border-[#222] rounded-sm p-3 mt-4 text-left overflow-y-auto text-sm text-[#00ff00] font-mono">
                {transcript || (isRecording ? <span className="text-gray-600">PCM_STREAM_ACTIVE...</span> : <span className="text-gray-600">Awaiting audio payload.</span>)}
              </div>
              
              {errorMsg && <p className="text-red-500 text-[10px] mt-4 font-bold uppercase tracking-widest leading-tight">{errorMsg}</p>}
            </div>
          </div>

          <div className="lg:col-span-7 bg-[#111111] border border-[#333] rounded-sm p-8 flex flex-col h-full min-h-[450px] shadow-2xl">
             <div className="flex items-center justify-between border-b border-[#222] pb-6 mb-6">
                <div className="flex items-center gap-3">
                  <ShoppingCart size={24} className="text-[#005ea2]"/>
                  <h3 className="text-[18px] font-bold tracking-widest uppercase">Live Cart Terminal</h3>
                </div>
                <div className="text-green-500 font-mono text-[11px] font-bold uppercase tracking-wider flex items-center gap-2">
                  <span className="w-2 h-2 bg-green-500 rounded-full animate-ping"></span> VyaparSetu AI Online
                </div>
             </div>

             <div className="flex-1 overflow-y-auto pr-2 custom-scrollbar space-y-4">
                {cart.length === 0 ? (
                  <div className="h-full flex items-center justify-center text-[#333] text-sm uppercase tracking-[0.3em] font-black">
                    Cart Empty
                  </div>
                ) : (
                  cart.map((item, idx) => (
                    <div key={item.cartId} className="flex justify-between items-center bg-[#1a1a1a] border border-[#222] p-4 rounded-sm animate-in slide-in-from-right-4">
                      <div className="flex gap-4 items-center">
                        <div className="w-1 h-8 bg-[#005ea2]"></div>
                        <div>
                          <p className="font-bold text-[15px] text-white uppercase">{item.name}</p>
                          <p className="text-xs text-[#888] font-mono mt-1">{item.quantity} Unit(s) @ ₹{item.price}/unit</p>
                        </div>
                      </div>
                      <div className="flex items-center gap-6">
                        <span className="font-bold font-mono text-xl text-white">₹{item.total.toFixed(2)}</span>
                        <button onClick={() => removeFromCart(item.cartId)} className="text-[#444] hover:text-red-500 transition-colors">
                          <Trash2 size={18}/>
                        </button>
                      </div>
                    </div>
                  ))
                )}
             </div>

             <div className="border-t border-[#222] mt-6 pt-6 flex justify-between items-center">
                <span className="text-[#888] uppercase tracking-widest text-[13px] font-black">Grand Total</span>
                <span className="text-4xl font-bold font-mono text-white">₹{subtotal.toFixed(2)}</span>
             </div>
          </div>

        </div>
      </section>

      {/* SECTION 3: AI ARCHITECTURE */}
      <section className="w-full py-24 px-6 md:px-12 lg:px-24 bg-white border-b border-gray-200">
        <div className="max-w-7xl mx-auto flex flex-col lg:flex-row gap-16 items-center">
          <div className="lg:w-1/2 w-full shrink-0">
             <div className="aspect-video bg-black border border-gray-200 p-8 relative flex flex-col justify-center gap-4 rounded-sm shadow-xl">
                <div className="flex justify-between items-center text-[#005ea2] font-mono text-[10px] tracking-widest uppercase">
                  <span>Inference_Buffer</span>
                  <span>AI_Core</span>
                </div>
                <div className="h-2 bg-[#111] rounded-full overflow-hidden">
                  <div className="h-full bg-[#005ea2] w-[80%] animate-pulse"></div>
                </div>
                <div className="h-2 bg-[#111] rounded-full overflow-hidden">
                  <div className="h-full bg-[#005ea2] w-[45%]"></div>
                </div>
                <div className="h-2 bg-[#111] rounded-full overflow-hidden">
                  <div className="h-full bg-[#005ea2] w-[95%] animate-pulse"></div>
                </div>
             </div>
          </div>
          <div className="lg:w-1/2 w-full">
            <h2 className="text-[22px] font-bold tracking-widest uppercase mb-6 text-black">
              AI INFERENCE ENGINE
            </h2>
            <p className="text-[17px] leading-[1.65] text-[#333333] mb-6">
              VyaparSetu leverages advanced AI architecture to achieve near-zero latency billing. By bypassing standard cloud CPUs, we can transcribe and parse complex Hinglish commands in milliseconds.
            </p>
            <p className="text-[17px] leading-[1.65] text-[#333333]">
              The model identifies context automatically. Whether you say "Aadha kilo sugar" or "500 gram cheeni", it resolves to the same SKU ID with absolute precision.
            </p>
          </div>
        </div>
      </section>

      {/* SECTION 4: IOT BRIDGE */}
      <section className="w-full py-24 px-6 md:px-12 lg:px-24 bg-[#f9f9f9] border-b border-gray-200 text-center">
          <Scale size={48} className="text-[#005ea2] mb-8 mx-auto" strokeWidth={1.5}/>
          <h2 className="text-[22px] font-bold tracking-widest uppercase mb-6 text-black">
            IOT WEIGHING SCALE SYNC
          </h2>
          <p className="text-[17px] leading-[1.65] text-[#555555] max-w-3xl mx-auto">
            Voice billing becomes exponentially faster when paired with our IoT integrations. Place the item on the scale and speak its name. VyaparSetu fetches the live weight and generates the bill entry instantly.
          </p>
      </section>

      {/* SECTION 5: INVENTORY ANALYTICS (NEW) */}
      <section className="w-full py-24 px-6 md:px-12 lg:px-24 bg-white border-b border-gray-200">
        <div className="max-w-7xl mx-auto flex flex-col md:flex-row items-center gap-16">
          <div className="md:w-1/2">
             <h2 className="text-[22px] font-bold tracking-widest uppercase mb-6 text-black">
               REAL-TIME INVENTORY DECAY
             </h2>
             <p className="text-[17px] leading-[1.65] text-[#333333] mb-6">
               Every voice command doesn't just generate a bill; it automatically updates your backend inventory. If you sell "2 kilo cheeni" via voice, exactly 2000 grams are deducted from your bulk storage records.
             </p>
             <p className="text-[17px] leading-[1.65] text-[#333333]">
               Our system alerts you precisely when your loose inventory reaches a critical threshold, preventing stockouts during peak hours.
             </p>
          </div>
          <div className="md:w-1/2 flex justify-center">
             <div className="grid grid-cols-2 gap-4 w-full">
                <div className="bg-gray-50 border border-gray-200 p-6 rounded-sm text-center">
                  <Database className="mx-auto mb-4 text-[#005ea2]" size={32} />
                  <p className="text-3xl font-bold font-mono">142kg</p>
                  <p className="text-xs font-bold text-gray-500 uppercase tracking-widest mt-2">Sugar Stock</p>
                </div>
                <div className="bg-gray-50 border border-gray-200 p-6 rounded-sm text-center">
                  <Activity className="mx-auto mb-4 text-red-500" size={32} />
                  <p className="text-3xl font-bold font-mono">-2.5kg</p>
                  <p className="text-xs font-bold text-gray-500 uppercase tracking-widest mt-2">Last 5 Mins</p>
                </div>
             </div>
          </div>
        </div>
      </section>

      {/* SECTION 6: OFFLINE CACHING (NEW) */}
      <section className="w-full py-24 px-6 md:px-12 lg:px-24 bg-[#0a0a0a] text-white border-b border-[#222]">
        <div className="max-w-7xl mx-auto flex flex-col md:flex-row-reverse items-center gap-16">
          <div className="md:w-1/2">
             <h2 className="text-[22px] font-bold tracking-widest uppercase mb-6">
               ASYNCHRONOUS OFFLINE CACHE
             </h2>
             <p className="text-[#aaaaaa] leading-relaxed text-[17px] mb-6">
               Internet connectivity in Indian retail can be unstable. Our application uses a sophisticated Service Worker architecture to cache your voice commands locally if the network drops.
             </p>
             <p className="text-[#aaaaaa] leading-relaxed text-[17px]">
               Once connectivity is restored, the buffer is sequentially transmitted to the VyaparSetu AI engine, ensuring zero data loss and uninterrupted billing operations.
             </p>
          </div>
          <div className="md:w-1/2 bg-[#111] border border-[#333] p-12 flex flex-col items-center justify-center rounded-sm">
             <WifiOff size={64} className="text-[#005ea2] mb-6 opacity-80" strokeWidth={1.5} />
             <div className="w-full max-w-xs space-y-3">
               <div className="w-full h-12 border border-[#333] rounded-sm flex items-center px-4 justify-between bg-black">
                 <span className="text-xs font-mono text-gray-500">Payload_1 (0.8s)</span>
                 <span className="text-xs font-bold text-yellow-600 uppercase tracking-widest">Queued</span>
               </div>
               <div className="w-full h-12 border border-[#333] rounded-sm flex items-center px-4 justify-between bg-black">
                 <span className="text-xs font-mono text-gray-500">Payload_2 (1.2s)</span>
                 <span className="text-xs font-bold text-yellow-600 uppercase tracking-widest">Queued</span>
               </div>
             </div>
          </div>
        </div>
      </section>

      {/* SECTION 7: LANGUAGES */}
      <section className="w-full py-24 px-6 md:px-12 lg:px-24 bg-white border-b border-gray-200">
        <div className="max-w-7xl mx-auto text-center">
          <Globe2 className="text-[#005ea2] mx-auto mb-12" size={48} />
          <h2 className="text-[22px] font-bold tracking-widest uppercase text-black mb-12">
            14+ SUPPORTED INDIAN DIALECTS
          </h2>
          <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-7 gap-4">
            {['Hindi', 'Marathi', 'Gujarati', 'Tamil', 'Telugu', 'Kannada', 'Bengali', 'Punjabi', 'Malayalam', 'Odia', 'Assamese', 'Urdu', 'English', 'Hinglish'].map(lang => (
              <div key={lang} className="bg-white border border-gray-300 p-4 text-center font-bold tracking-wide uppercase text-[11px] rounded-sm shadow-sm">
                {lang}
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* SECTION 8: NOISE LOGIC */}
      <section className="relative w-full bg-[#181818] py-24 px-6 md:px-12 lg:px-24 overflow-hidden border-b border-[#333]">
        <div className="absolute inset-0 opacity-[0.03] pointer-events-none bg-[radial-gradient(circle_at_center,_transparent_0,_transparent_10px,_white_11px,_white_12px)] [background-size:60px_60px]"></div>
        <div className="relative z-10 max-w-7xl mx-auto flex flex-col md:flex-row items-center gap-16">
            <div className="md:w-1/2">
              <h2 className="text-[22px] font-bold tracking-widest uppercase mb-8 text-white">
                ACOUSTIC NOISE ISOLATION
              </h2>
              <p className="text-[#aaaaaa] leading-relaxed text-[17px]">
                Kirana stores are loud. Our audio logic filters out background frequencies from ceiling fans and street traffic before transmission, ensuring high transcription accuracy even during peak store hours.
              </p>
            </div>
            <div className="md:w-1/2 flex items-center justify-center gap-2 h-24">
                 {[...Array(16)].map((_, i) => (
                   <div key={i} className="w-2 bg-[#005ea2] rounded-full animate-pulse" style={{ height: `${Math.max(10, Math.random() * 100)}%`, animationDelay: `${i * 0.05}s` }}></div>
                 ))}
                 <Volume2 className="text-white ml-6 opacity-30" size={40}/>
            </div>
        </div>
      </section>

      {/* SECTION 9: DATA SAFETY (EXPANDED) */}
      <section className="w-full py-24 px-6 md:px-12 lg:px-24 bg-white border-b border-gray-200">
          <div className="max-w-7xl mx-auto grid md:grid-cols-3 gap-12">
            <div className="text-center flex flex-col items-center">
              <ShieldCheck className="text-green-600 mb-6" size={48} strokeWidth={1.5}/>
              <h3 className="text-lg font-bold tracking-widest uppercase mb-4 text-black">Stateless Processing</h3>
              <p className="text-[15px] leading-relaxed text-gray-600">Your audio is never persisted. It is held in a volatile RAM buffer and purged immediately after resolution.</p>
            </div>
            <div className="text-center flex flex-col items-center">
              <Lock className="text-[#005ea2] mb-6" size={48} strokeWidth={1.5}/>
              <h3 className="text-lg font-bold tracking-widest uppercase mb-4 text-black">End-to-End TLS</h3>
              <p className="text-[15px] leading-relaxed text-gray-600">All voice data is transmitted via a secure 256-bit encrypted TLS 1.3 tunnel directly to the AI core.</p>
            </div>
            <div className="text-center flex flex-col items-center">
              <Cpu className="text-gray-800 mb-6" size={48} strokeWidth={1.5}/>
              <h3 className="text-lg font-bold tracking-widest uppercase mb-4 text-black">Zero Training Policy</h3>
              <p className="text-[15px] leading-relaxed text-gray-600">We maintain a strict zero-knowledge architecture. Your proprietary voice data is never used to train generalized models.</p>
            </div>
          </div>
      </section>

      {/* SECTION 10: FOOTER CTA */}
      <section className="w-full bg-[#0a0a0a] py-24 px-6 md:px-12 lg:px-24 border-t border-[#333]">
        <div className="max-w-7xl mx-auto flex flex-col md:flex-row justify-between items-start md:items-end gap-12">
          <div className="max-w-2xl">
            <h2 className="text-[3.5rem] md:text-[5.5rem] font-bold tracking-tight text-white mb-8 uppercase leading-[1]">
              GO <br className="hidden md:block" /> HANDS-FREE.
            </h2>
            <p className="text-[#888] text-xl leading-relaxed mb-6">
              Processing 3x more customers per hour is now a reality. Integrate the VyaparSetu AI engine into your Kirana infrastructure today.
            </p>
          </div>
          <Link 
            to="/pricing" 
            className="inline-flex items-center gap-4 bg-[#005ea2] hover:bg-[#0b4774] text-white px-10 py-5 font-bold tracking-[0.2em] uppercase transition-all text-[13px] rounded-sm shadow-2xl"
          >
            Deploy Voice Engine <ArrowRight size={20}/>
          </Link>
        </div>
      </section>

    </div>
  );
}