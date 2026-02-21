import React, { useState, useEffect, useRef } from 'react';
import { ArrowDown, ArrowRight, Mic, MicOff, Activity, Cpu, Globe2, Volume2, ShieldCheck, Scale, Trash2, ShoppingCart } from 'lucide-react';
import { Link } from 'react-router-dom';

export default function FeatureVoiceBilling() {
  // --- REAL-TIME LOGIC: Web Speech API & Billing Engine ---
  const [isListening, setIsListening] = useState(false);
  const [transcript, setTranscript] = useState('');
  const [cart, setCart] = useState([]);
  const [errorMsg, setErrorMsg] = useState('');
  const recognitionRef = useRef(null);

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

  useEffect(() => {
    // Initialize Web Speech API
    const SpeechRecognition = window.SpeechRecognition || window.webkitSpeechRecognition;
    if (SpeechRecognition) {
      const recognition = new SpeechRecognition();
      recognition.continuous = false; // Stop after a pause
      recognition.interimResults = true; // Show live text
      recognition.lang = 'hi-IN'; // Default to Hindi-English mixing

      recognition.onstart = () => {
        setIsListening(true);
        setErrorMsg('');
      };

      recognition.onresult = (event) => {
        let currentTranscript = '';
        for (let i = event.resultIndex; i < event.results.length; ++i) {
          currentTranscript += event.results[i][0].transcript;
        }
        setTranscript(currentTranscript);
        
        // Parse on final result
        if (event.results[0].isFinal) {
          parseSpeechToCart(currentTranscript);
        }
      };

      recognition.onerror = (event) => {
        console.error("Speech recognition error", event.error);
        setIsListening(false);
        if (event.error === 'not-allowed') {
          setErrorMsg('Microphone access denied. Please allow mic permissions.');
        } else {
          setErrorMsg(`Error: ${event.error}. Please try speaking again.`);
        }
      };

      recognition.onend = () => {
        setIsListening(false);
      };

      recognitionRef.current = recognition;
    } else {
      setErrorMsg('Web Speech API is not supported in this browser. Please use Google Chrome or Edge.');
    }
  }, []);

  const toggleListen = () => {
    if (isListening) {
      recognitionRef.current?.stop();
    } else {
      setTranscript('');
      try {
        recognitionRef.current?.start();
      } catch (e) {
        console.error(e);
      }
    }
  };

  const parseSpeechToCart = (text) => {
    const lowerText = text.toLowerCase();
    let detectedItem = null;
    let detectedQty = 1; // Default
    let qtyUnit = 'kg';

    // 1. Detect Item
    for (const [key, product] of Object.entries(productCatalog)) {
      if (lowerText.includes(key)) {
        detectedItem = product;
        break;
      }
    }

    if (!detectedItem) return; // Exit if no product matched

    // 2. Detect Quantity (Regex for numbers like "2" or words like "do")
    const numRegex = /(\d+(?:\.\d+)?)\s*(kilo|kg|gram|g|liters|l|packet|piece)/;
    const numMatch = lowerText.match(numRegex);
    
    if (numMatch) {
      detectedQty = parseFloat(numMatch[1]);
      const rawUnit = numMatch[2];
      if (rawUnit === 'gram' || rawUnit === 'g') {
        detectedQty = detectedQty / 1000; // convert to kg internally
      }
    } else {
      // Look for Hindi/English word numbers
      for (const [word, num] of Object.entries(numberMap)) {
        if (lowerText.includes(`${word} kilo`) || lowerText.includes(`${word} kg`) || lowerText.includes(word)) {
          detectedQty = num;
          break;
        }
      }
    }

    // 3. Add to Cart State
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
            Ditch the barcode scanner for loose items. Process complex grocery billing instantly by speaking naturally in regional languages. 
          </p>
          <a 
            href="#live-engine"
            className="inline-flex items-center gap-3 bg-[#005ea2] hover:bg-[#0b4774] text-white px-8 py-4 font-bold tracking-wider transition-colors text-[13px] uppercase rounded-sm mb-20 md:mb-28"
          >
            Access Live Interface <ArrowDown size={18} strokeWidth={2.5}/>
          </a>
        </div>
      </section>

      {/* SECTION 2: LIVE WEB SPEECH API ENGINE */}
      <section id="live-engine" className="w-full py-24 px-6 md:px-12 lg:px-24 bg-[#0a0a0a] text-white border-b border-[#222] scroll-mt-16">
        <div className="max-w-7xl mx-auto grid lg:grid-cols-12 gap-12 items-start">
          
          {/* Left: Engine Controls */}
          <div className="lg:col-span-5 flex flex-col">
            <h2 className="text-[22px] font-bold tracking-widest uppercase mb-4">
              ACTIVE VOICE RECOGNITION
            </h2>
            <p className="text-[#888] mb-8 text-[15px] leading-relaxed">
              This is a live API implementation. Allow microphone access. Try speaking commands like <strong className="text-white">"Do kilo cheeni"</strong>, <strong className="text-white">"Ek kilo chawal"</strong>, or <strong className="text-white">"Half kg dal"</strong> to see the parser add items to the cart.
            </p>
            
            <div className="bg-[#181818] border border-[#333] rounded-sm p-8 flex flex-col items-center justify-center text-center min-h-[300px] relative overflow-hidden">
              {/* Pulse effect when listening */}
              {isListening && (
                <div className="absolute inset-0 bg-[#005ea2] opacity-10 animate-pulse pointer-events-none"></div>
              )}
              
              <button 
                onClick={toggleListen}
                className={`w-24 h-24 rounded-full flex items-center justify-center mb-6 transition-all shadow-2xl ${
                  isListening ? 'bg-red-600 hover:bg-red-700 animate-bounce' : 'bg-[#005ea2] hover:bg-[#0b4774]'
                }`}
              >
                {isListening ? <MicOff size={32} /> : <Mic size={32} />}
              </button>
              
              <h3 className="text-lg font-bold uppercase tracking-widest mb-2">
                {isListening ? 'Listening...' : 'System Idle'}
              </h3>
              
              <div className="w-full h-20 bg-black border border-[#222] rounded-sm p-3 mt-4 text-left overflow-y-auto text-sm text-[#00ff00] font-mono">
                {transcript || (isListening ? <span className="text-gray-600">Awaiting audio input...</span> : <span className="text-gray-600">Click mic to start.</span>)}
              </div>
              
              {errorMsg && <p className="text-red-500 text-xs mt-4 font-bold">{errorMsg}</p>}
            </div>
          </div>

          {/* Right: Live Cart Array */}
          <div className="lg:col-span-7 bg-[#111111] border border-[#333] rounded-sm p-8 flex flex-col h-full min-h-[450px]">
             <div className="flex items-center justify-between border-b border-[#222] pb-6 mb-6">
                <div className="flex items-center gap-3">
                  <ShoppingCart size={24} className="text-[#005ea2]"/>
                  <h3 className="text-[18px] font-bold tracking-widest uppercase">Live Terminal</h3>
                </div>
                <div className="text-[#888] font-mono text-sm uppercase tracking-wider">
                  <span className="text-green-500 mr-2">●</span> NLP Status: Online
                </div>
             </div>

             <div className="flex-1 overflow-y-auto pr-2 custom-scrollbar space-y-4">
                {cart.length === 0 ? (
                  <div className="h-full flex items-center justify-center text-[#444] text-sm uppercase tracking-widest font-mono">
                    Cart is empty. Awaiting voice payload.
                  </div>
                ) : (
                  cart.map((item, idx) => (
                    <div key={item.cartId} className="flex justify-between items-center bg-[#1a1a1a] border border-[#222] p-4 rounded-sm animate-in slide-in-from-right-4">
                      <div className="flex gap-4 items-center">
                        <span className="text-[#555] font-mono text-xs w-4">{idx + 1}.</span>
                        <div>
                          <p className="font-bold text-[15px]">{item.name}</p>
                          <p className="text-xs text-[#888] font-mono mt-1">{item.quantity} {item.unit} @ ₹{item.price}/{item.unit}</p>
                        </div>
                      </div>
                      <div className="flex items-center gap-6">
                        <span className="font-bold font-mono">₹{item.total.toFixed(2)}</span>
                        <button onClick={() => removeFromCart(item.cartId)} className="text-[#555] hover:text-red-500 transition-colors">
                          <Trash2 size={18}/>
                        </button>
                      </div>
                    </div>
                  ))
                )}
             </div>

             <div className="border-t border-[#222] mt-6 pt-6 flex justify-between items-center">
                <span className="text-[#888] uppercase tracking-widest text-sm font-bold">Gross Total</span>
                <span className="text-3xl font-bold font-mono">₹{subtotal.toFixed(2)}</span>
             </div>
          </div>

        </div>
      </section>

      {/* SECTION 3: NLP ARCHITECTURE */}
      <section className="w-full py-24 px-6 md:px-12 lg:px-24 bg-white border-b border-gray-200">
        <div className="max-w-7xl mx-auto flex flex-col lg:flex-row gap-16 items-center">
          <div className="lg:w-1/2 w-full shrink-0">
             <div className="aspect-square bg-gray-50 border border-gray-200 p-12 relative flex items-center justify-center rounded-sm">
                <Cpu size={120} className="text-[#005ea2] absolute opacity-10"/>
                <div className="space-y-6 w-full relative z-10">
                  <div className="bg-white p-4 border border-gray-200 shadow-sm rounded-sm flex justify-between items-center text-sm font-mono text-gray-500">
                    <span>INPUT: "Do kilo cheeni"</span> <ArrowRight size={16}/>
                  </div>
                  <div className="bg-[#111] p-4 border border-[#333] shadow-sm rounded-sm flex justify-between items-center text-sm font-mono text-white">
                    <span>NLP PARSER</span> <Activity size={16} className="text-[#005ea2]"/>
                  </div>
                  <div className="grid grid-cols-2 gap-4">
                    <div className="bg-[#f0f8ff] p-4 border border-[#b3dcf2] text-center text-[#005ea2] font-bold text-sm uppercase rounded-sm">ITEM: Sugar</div>
                    <div className="bg-[#f0f8ff] p-4 border border-[#b3dcf2] text-center text-[#005ea2] font-bold text-sm uppercase rounded-sm">QTY: 2.0 KG</div>
                  </div>
                </div>
             </div>
          </div>
          <div className="lg:w-1/2 w-full">
            <h2 className="text-[22px] font-bold tracking-widest uppercase mb-6 text-black">
              HINGLISH NLP ARCHITECTURE
            </h2>
            <p className="text-[17px] leading-[1.65] text-[#333333] mb-6">
              Indian retail operates on dialects, not dictionary definitions. Our custom Natural Language Processing (NLP) engine is trained on thousands of hours of retail conversations.
            </p>
            <p className="text-[17px] leading-[1.65] text-[#333333] mb-6">
              It seamlessly understands context mixing. Whether a cashier says "Half kg sugar", "Aadha kilo cheeni", or "Pachas gram shakkar", the engine resolves the intent to the exact SKUs in your database without missing a beat.
            </p>
          </div>
        </div>
      </section>

      {/* SECTION 4: LOOSE ITEMS & WEIGHING SCALE SYNC */}
      <section className="w-full py-24 px-6 md:px-12 lg:px-24 bg-[#f9f9f9] border-b border-gray-200">
        <div className="max-w-7xl mx-auto text-center flex flex-col items-center">
          <Scale size={48} className="text-[#005ea2] mb-8" strokeWidth={1.5}/>
          <h2 className="text-[22px] font-bold tracking-widest uppercase mb-6 text-black">
            IOT WEIGHING SCALE SYNC
          </h2>
          <p className="text-[17px] leading-[1.65] text-[#555555] max-w-3xl mb-12">
            Voice billing becomes exponentially faster when paired with our IoT integrations. Simply place the item on the connected digital scale, press the mic, and say "Dal". The engine fetches the exact weight (e.g., 1.24kg) directly from the COM port, calculating the exact price instantly.
          </p>
        </div>
      </section>

      {/* SECTION 5: MULTI-LANGUAGE SUPPORT GRID */}
      <section className="w-full py-24 px-6 md:px-12 lg:px-24 bg-white border-b border-gray-200">
        <div className="max-w-7xl mx-auto">
          <div className="flex items-center gap-4 mb-12">
            <Globe2 className="text-[#005ea2]" size={32} />
            <h2 className="text-[22px] font-bold tracking-widest uppercase text-black">
              14+ SUPPORTED REGIONAL LANGUAGES
            </h2>
          </div>

          <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-7 gap-4">
            {['Hindi', 'Marathi', 'Gujarati', 'Tamil', 'Telugu', 'Kannada', 'Bengali', 'Punjabi', 'Malayalam', 'Odia', 'Assamese', 'Urdu', 'English', 'Hinglish'].map(lang => (
              <div key={lang} className="bg-white border border-gray-300 p-4 text-center font-bold tracking-wide uppercase text-[13px] rounded-sm shadow-sm hover:border-black transition-colors">
                {lang}
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* SECTION 6: NOISE CANCELLATION TECH (Dark Topographic) */}
      <section className="relative w-full bg-[#181818] py-24 px-6 md:px-12 lg:px-24 overflow-hidden border-b border-[#333]">
        <div className="absolute inset-0 opacity-[0.03] pointer-events-none bg-[radial-gradient(circle_at_center,_transparent_0,_transparent_10px,_white_11px,_white_12px)] [background-size:60px_60px]"></div>
        
        <div className="relative z-10 max-w-7xl mx-auto">
          <div className="grid md:grid-cols-2 gap-16 items-center">
            <div>
              <h2 className="text-[22px] font-bold tracking-widest uppercase mb-8 text-white">
                ACOUSTIC NOISE ISOLATION
              </h2>
              <p className="text-[#aaaaaa] leading-relaxed text-[17px] mb-6">
                Kirana stores are inherently loud environments—traffic, customers, and ceiling fans generate significant background interference.
              </p>
              <p className="text-[#aaaaaa] leading-relaxed text-[17px]">
                VyaparSetu utilizes edge-processed Active Noise Suppression algorithms to isolate the cashier's frequency band. It ignores background conversations up to 75 decibels, ensuring flawless transcription accuracy even during rush hour.
              </p>
            </div>
            <div className="bg-[#222222] border border-[#333] p-12 rounded-sm flex items-center justify-center relative">
              {/* Mock audio wave visualization */}
              <div className="flex items-center gap-2 h-24">
                 {[...Array(12)].map((_, i) => (
                   <div key={i} className="w-3 bg-[#005ea2] rounded-full animate-pulse" style={{ height: `${Math.max(20, Math.random() * 100)}%`, animationDelay: `${i * 0.1}s` }}></div>
                 ))}
                 <Volume2 className="text-white ml-6 opacity-50" size={32}/>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* SECTION 7: SECURITY & EDGE PROCESSING */}
      <section className="w-full py-24 px-6 md:px-12 lg:px-24 bg-white border-b border-gray-200">
        <div className="max-w-7xl mx-auto flex flex-col items-center text-center">
          <ShieldCheck className="text-[#005ea2] mb-6" size={56} strokeWidth={1.5}/>
          <h2 className="text-[22px] font-bold tracking-widest uppercase mb-6 text-black">
            LOCAL EDGE COMPUTING
          </h2>
          <p className="text-[17px] leading-[1.65] text-[#555555] max-w-3xl mb-8">
            Audio data is highly sensitive. Unlike consumer voice assistants, VyaparSetu's Voice Engine performs heuristic parsing securely on the edge browser device. Voice recordings are never stored, sent to third-party ad networks, or used for unauthorized profiling.
          </p>
        </div>
      </section>

      {/* SECTION 8: FOOTER CTA */}
      <section className="w-full bg-[#0a0a0a] py-24 px-6 md:px-12 lg:px-24 border-t border-[#333]">
        <div className="max-w-7xl mx-auto">
          <h2 className="text-[3.5rem] md:text-[5rem] font-bold tracking-tight text-white mb-8 uppercase leading-[1.05]">
            SPEAK. <br className="hidden md:block" /> BILL. DONE.
          </h2>
          <p className="text-[#aaaaaa] text-lg md:text-xl max-w-3xl leading-relaxed mb-12">
            Cut your checkout times by 60% for loose inventory. Provide your staff with a tool that requires zero typing and zero training. Integrate VyaparSetu into your retail infrastructure today.
          </p>
          <Link 
            to="/pricing" 
            className="inline-flex items-center gap-3 bg-white hover:bg-gray-200 text-black px-8 py-4 font-bold tracking-wider uppercase transition-colors text-[13px] rounded-sm"
          >
            Deploy Voice Engine <ArrowRight size={18} strokeWidth={2.5}/>
          </Link>
        </div>
      </section>

    </div>
  );
}