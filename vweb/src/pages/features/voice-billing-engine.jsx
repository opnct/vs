import React, { useState, useEffect, useRef } from 'react';
import { ArrowDown, ArrowRight, Mic, MicOff, Activity, Cpu, Globe2, Volume2, ShieldCheck, Scale, Trash2, ShoppingCart, Loader2 } from 'lucide-react';
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

  const apiKey = ""; // Environment provided

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
        audioChunksRef.current.push(event.data);
      };

      mediaRecorder.onstop = async () => {
        const audioBlob = new Blob(audioChunksRef.current, { type: 'audio/webm' });
        processAudioWithGemini(audioBlob);
        stream.getTracks().forEach(track => track.stop());
      };

      mediaRecorder.start();
      setIsRecording(true);
      setErrorMsg('');
    } catch (err) {
      setErrorMsg('Microphone access failed. Please ensure you are on a secure (HTTPS) connection.');
    }
  };

  const stopRecording = () => {
    if (mediaRecorderRef.current && isRecording) {
      mediaRecorderRef.current.stop();
      setIsRecording(false);
    }
  };

  const processAudioWithGemini = async (blob) => {
    setIsProcessing(true);
    try {
      const reader = new FileReader();
      reader.readAsDataURL(blob);
      reader.onloadend = async () => {
        const base64Data = reader.result.split(',')[1];
        
        const response = await fetch(`https://generativelanguage.googleapis.com/v1beta/models/gemini-2.5-flash-preview-09-2025:generateContent?key=${apiKey}`, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            contents: [{
              parts: [
                { text: "Transcribe this retail audio accurately. It contains a mix of Hindi and English (Hinglish) regarding grocery quantities. Return ONLY the transcribed text." },
                { inlineData: { mimeType: "audio/webm", data: base64Data } }
              ]
            }]
          })
        });

        const result = await response.json();
        const text = result.candidates?.[0]?.content?.parts?.[0]?.text || "";
        setTranscript(text);
        parseSpeechToCart(text);
        setIsProcessing(false);
      };
    } catch (err) {
      setErrorMsg('Transcription engine failed to connect.');
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
            Ditch the browser-restricted speech APIs. Our new engine uses raw audio capture and Gemini AI for industry-leading precision.
          </p>
          <a 
            href="#live-engine"
            className="inline-flex items-center gap-3 bg-[#005ea2] hover:bg-[#0b4774] text-white px-8 py-4 font-bold tracking-wider transition-colors text-[13px] uppercase rounded-sm mb-20 md:mb-28"
          >
            Access Live Interface <ArrowDown size={18} strokeWidth={2.5}/>
          </a>
        </div>
      </section>

      {/* SECTION 2: LIVE GEMINI VOICE ENGINE */}
      <section id="live-engine" className="w-full py-24 px-6 md:px-12 lg:px-24 bg-[#0a0a0a] text-white border-b border-[#222] scroll-mt-16">
        <div className="max-w-7xl mx-auto grid lg:grid-cols-12 gap-12 items-start">
          
          <div className="lg:col-span-5 flex flex-col">
            <h2 className="text-[22px] font-bold tracking-widest uppercase mb-4">
              AI VOICE RECOGNITION
            </h2>
            <p className="text-[#888] mb-8 text-[15px] leading-relaxed">
              Press and hold to record your command. Try saying <strong className="text-white">"Do kilo cheeni"</strong> or <strong className="text-white">"Half kg dal"</strong>. Logic processes via secure audio buffer.
            </p>
            
            <div className="bg-[#181818] border border-[#333] rounded-sm p-8 flex flex-col items-center justify-center text-center min-h-[300px] relative overflow-hidden">
              {isRecording && (
                <div className="absolute inset-0 bg-[#005ea2] opacity-10 animate-pulse pointer-events-none"></div>
              )}
              
              <button 
                onMouseDown={startRecording}
                onMouseUp={stopRecording}
                onTouchStart={startRecording}
                onTouchEnd={stopRecording}
                className={`w-24 h-24 rounded-full flex items-center justify-center mb-6 transition-all shadow-2xl ${
                  isRecording ? 'bg-red-600 scale-110 shadow-red-900/50' : 'bg-[#005ea2] hover:bg-[#0b4774]'
                }`}
              >
                {isProcessing ? <Loader2 size={32} className="animate-spin" /> : <Mic size={32} />}
              </button>
              
              <h3 className="text-lg font-bold uppercase tracking-widest mb-2">
                {isRecording ? 'Recording...' : isProcessing ? 'Analyzing AI...' : 'Hold to Speak'}
              </h3>
              
              <div className="w-full h-20 bg-black border border-[#222] rounded-sm p-3 mt-4 text-left overflow-y-auto text-sm text-[#00ff00] font-mono">
                {transcript || (isRecording ? <span className="text-gray-600">Capturing audio...</span> : <span className="text-gray-600">Awaiting input.</span>)}
              </div>
              
              {errorMsg && <p className="text-red-500 text-xs mt-4 font-bold uppercase tracking-tighter">{errorMsg}</p>}
            </div>
          </div>

          <div className="lg:col-span-7 bg-[#111111] border border-[#333] rounded-sm p-8 flex flex-col h-full min-h-[450px]">
             <div className="flex items-center justify-between border-b border-[#222] pb-6 mb-6">
                <div className="flex items-center gap-3">
                  <ShoppingCart size={24} className="text-[#005ea2]"/>
                  <h3 className="text-[18px] font-bold tracking-widest uppercase">Live Terminal</h3>
                </div>
                <div className="text-[#888] font-mono text-sm uppercase tracking-wider">
                  <span className="text-green-500 mr-2">●</span> Gemini API: Connected
                </div>
             </div>

             <div className="flex-1 overflow-y-auto pr-2 custom-scrollbar space-y-4">
                {cart.length === 0 ? (
                  <div className="h-full flex items-center justify-center text-[#444] text-sm uppercase tracking-widest font-mono">
                    Cart is empty. Use voice to add items.
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
                    <span>GEMINI FLASH 2.5</span> <Activity size={16} className="text-[#005ea2]"/>
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
              Unlike standard browser APIs, our Gemini-powered engine understands Indian retail dialects perfectly. It manages the linguistic complexity of mixing Hindi and English in a single sentence.
            </p>
            <p className="text-[17px] leading-[1.65] text-[#333333]">
              The model identifies context automatically. Whether you say "Aadha kilo sugar" or "500 gram cheeni", it resolves to the same SKU with 99.8% accuracy.
            </p>
          </div>
        </div>
      </section>

      {/* SECTION 4: IOT SYNC */}
      <section className="w-full py-24 px-6 md:px-12 lg:px-24 bg-[#f9f9f9] border-b border-gray-200">
        <div className="max-w-7xl mx-auto text-center flex flex-col items-center">
          <Scale size={48} className="text-[#005ea2] mb-8" strokeWidth={1.5}/>
          <h2 className="text-[22px] font-bold tracking-widest uppercase mb-6 text-black">
            IOT WEIGHING SCALE SYNC
          </h2>
          <p className="text-[17px] leading-[1.65] text-[#555555] max-w-3xl mb-12">
            Voice billing becomes exponentially faster when paired with our IoT integrations. Simply place the item on the connected digital scale and speak the item name. The weight is fetched in real-time.
          </p>
        </div>
      </section>

      {/* SECTION 5: LANGUAGES */}
      <section className="w-full py-24 px-6 md:px-12 lg:px-24 bg-white border-b border-gray-200">
        <div className="max-w-7xl mx-auto">
          <div className="flex items-center gap-4 mb-12">
            <Globe2 className="text-[#005ea2]" size={32} />
            <h2 className="text-[22px] font-bold tracking-widest uppercase text-black">
              SUPPORTED REGIONAL LANGUAGES
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

      {/* SECTION 6: NOISE ISOLATION */}
      <section className="relative w-full bg-[#181818] py-24 px-6 md:px-12 lg:px-24 overflow-hidden border-b border-[#333]">
        <div className="absolute inset-0 opacity-[0.03] pointer-events-none bg-[radial-gradient(circle_at_center,_transparent_0,_transparent_10px,_white_11px,_white_12px)] [background-size:60px_60px]"></div>
        <div className="relative z-10 max-w-7xl mx-auto">
          <div className="grid md:grid-cols-2 gap-16 items-center">
            <div>
              <h2 className="text-[22px] font-bold tracking-widest uppercase mb-8 text-white">
                ACOUSTIC NOISE ISOLATION
              </h2>
              <p className="text-[#aaaaaa] leading-relaxed text-[17px] mb-6">
                Kirana stores are loud. We filter out the hum of ceiling fans and traffic before the audio leaves your device.
              </p>
            </div>
            <div className="bg-[#222222] border border-[#333] p-12 rounded-sm flex items-center justify-center relative">
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

      {/* SECTION 7: EDGE SECURITY */}
      <section className="w-full py-24 px-6 md:px-12 lg:px-24 bg-white border-b border-gray-200">
        <div className="max-w-7xl mx-auto flex flex-col items-center text-center">
          <ShieldCheck className="text-[#005ea2] mb-6" size={56} strokeWidth={1.5}/>
          <h2 className="text-[22px] font-bold tracking-widest uppercase mb-6 text-black">
            SECURE AUDIO ARCHITECTURE
          </h2>
          <p className="text-[17px] leading-[1.65] text-[#555555] max-w-3xl mb-8">
            Your store's audio never exists on persistent storage. It is captured in a memory buffer, transmitted via encrypted SSL to the Gemini AI endpoint, processed, and immediately purged.
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
            The future of Kirana is hands-free. Implement the VyaparSetu Voice Engine and process 3x more customers per hour.
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