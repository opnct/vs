import React, { useState, useRef } from 'react';
import { 
  ScanLine, ArrowLeft, UploadCloud, FileText, 
  Settings, CheckCircle2, AlertTriangle, Calculator,
  TrendingUp, TrendingDown, Percent, PackageOpen, 
  Lightbulb, ShieldCheck, Zap, Receipt
} from 'lucide-react';
import { Link } from 'react-router-dom';

export default function FeatureFmcgSchemeScanner() {
  const [apiKey] = useState(import.meta.env.VITE_OPENAI_API_KEY || "");
  const [selectedImage, setSelectedImage] = useState(null);
  const [imagePreview, setImagePreview] = useState(null);
  
  // Processing States
  const [isProcessing, setIsProcessing] = useState(false);
  const [processLog, setProcessLog] = useState("");
  const [error, setError] = useState(null);
  
  // Decoded Data State
  const [decodedData, setDecodedData] = useState(null);
  const fileInputRef = useRef(null);

  // --- 1. BILL INGESTION ENGINE ---
  const handleImageUpload = (e) => {
    const file = e.target.files[0];
    if (!file) return;

    if (!file.type.startsWith('image/')) {
      setError("Strictly requires an image file (JPG/PNG) of the wholesale bill.");
      return;
    }

    setError(null);
    setSelectedImage(file);
    setImagePreview(URL.createObjectURL(file));
    setDecodedData(null);
    setProcessLog("Image loaded into local memory. Ready for extraction.");
  };

  const convertToBase64 = (file) => {
    return new Promise((resolve, reject) => {
      const reader = new FileReader();
      reader.readAsDataURL(file);
      reader.onload = () => {
        // Strip the data:image/jpeg;base64, prefix for the API
        const base64String = reader.result.split(',')[1];
        resolve({ base64String, mimeType: file.type });
      };
      reader.onerror = (error) => reject(error);
    });
  };

  // --- 2. MULTIMODAL AI EXTRACTION CORE ---
  const extractBillData = async () => {
    if (!selectedImage) return setError("Please upload an invoice image first.");
    if (!apiKey) return setError("API Key missing. Required for Vision Extraction.");

    setIsProcessing(true);
    setError(null);
    setProcessLog("Initializing Multimodal Vision Pipeline...");

    try {
      setProcessLog("Converting image to Base64 byte stream...");
      const { base64String, mimeType } = await convertToBase64(selectedImage);

      setProcessLog("Transmitting securely to Vision API for OCR and Tabular parsing...");
      
      const systemPrompt = `You are a strict FMCG Billing OCR parser for Indian wholesale markets. 
      Read the provided invoice image. Extract line items, specifically looking for "Billed Qty", "Free Qty", "Rate" (Base Price), "MRP", "Discount %" (Trade/Cash discount), and "GST/Tax %".
      
      CRITICAL INSTRUCTION: Return ONLY a valid, minified JSON object with this exact structure. NO MARKDOWN. NO BACKTICKS.
      {
        "distributorName": "Name or Unknown",
        "invoiceNumber": "INV123 or Unknown",
        "gstin": "GST Number or Unknown",
        "items": [
          {
            "name": "Product Name",
            "billedQty": 12,
            "freeQty": 2,
            "baseRate": 105.50,
            "mrp": 130.00,
            "discountPercent": 5,
            "taxPercent": 18
          }
        ]
      }`;

      const payload = {
        contents: [
          {
            role: "user",
            parts: [
              { text: systemPrompt },
              { inlineData: { mimeType: mimeType, data: base64String } }
            ]
          }
        ]
      };

      const response = await fetch(`https://generativelanguage.googleapis.com/v1beta/models/gemini-2.5-flash-preview-09-2025:generateContent?key=${apiKey}`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload)
      });

      if (!response.ok) throw new Error(`Vision API responded with status ${response.status}`);
      
      setProcessLog("Parsing AI JSON Output...");
      const data = await response.json();
      let rawText = data.candidates?.[0]?.content?.parts?.[0]?.text || "{}";
      
      // Clean up potential markdown wrapper from AI
      rawText = rawText.replace(/```json/g, '').replace(/```/g, '').trim();
      
      const parsedJSON = JSON.parse(rawText);
      
      if (!parsedJSON.items || parsedJSON.items.length === 0) {
        throw new Error("No FMCG items detected in the image. Please ensure the bill is legible.");
      }

      setProcessLog("Applying deterministic financial mathematics...");
      processCalculations(parsedJSON);

    } catch (err) {
      console.error(err);
      setError(`Extraction Failed: ${err.message}. Please try a clearer image.`);
    } finally {
      setIsProcessing(false);
    }
  };

  // --- 3. DETERMINISTIC MATHEMATICS ENGINE ---
  const processCalculations = (rawData) => {
    let totalInvoiceValue = 0;
    let totalHiddenValueUnlocked = 0;

    const enrichedItems = rawData.items.map(item => {
      // Safely parse values
      const bQty = parseFloat(item.billedQty) || 0;
      const fQty = parseFloat(item.freeQty) || 0;
      const rate = parseFloat(item.baseRate) || 0;
      const mrp = parseFloat(item.mrp) || 0;
      const discPct = parseFloat(item.discountPercent) || 0;
      const taxPct = parseFloat(item.taxPercent) || 0;

      // 1. Calculate Base Cost (Billed Qty * Rate)
      const baseCost = bQty * rate;
      
      // 2. Apply Trade/Cash Discount
      const discountAmount = baseCost * (discPct / 100);
      const discountedCost = baseCost - discountAmount;
      
      // 3. Apply GST/Tax
      const taxAmount = discountedCost * (taxPct / 100);
      const finalCostForLine = discountedCost + taxAmount;
      totalInvoiceValue += finalCostForLine;

      // 4. CALCULATE TRUE LANDED COST PER UNIT (The Core Innovation)
      // Total cost divided by (Billed Qty + FREE Qty)
      const totalUnitsReceived = bQty + fQty;
      const trueLandedCost = totalUnitsReceived > 0 ? (finalCostForLine / totalUnitsReceived) : 0;

      // 5. Margin Calculations
      const apparentMarginPct = mrp > 0 ? ((mrp - rate) / mrp) * 100 : 0;
      const trueMarginPct = mrp > 0 ? ((mrp - trueLandedCost) / mrp) * 100 : 0;
      
      // Calculate financial value of the free goods based on their true landed cost
      const hiddenValue = fQty * trueLandedCost;
      totalHiddenValueUnlocked += hiddenValue;

      return {
        ...item,
        finalCostForLine,
        trueLandedCost,
        apparentMarginPct,
        trueMarginPct,
        hiddenValue
      };
    });

    setDecodedData({
      ...rawData,
      items: enrichedItems,
      metrics: {
        totalInvoiceValue,
        totalHiddenValueUnlocked,
        overallMarginBoost: enrichedItems.length > 0 
          ? (enrichedItems.reduce((acc, curr) => acc + (curr.trueMarginPct - curr.apparentMarginPct), 0) / enrichedItems.length)
          : 0
      }
    });
    setProcessLog("Processing complete.");
  };

  return (
    <div className="min-h-screen bg-[#121212] text-zinc-100 font-sans pb-20">
      
      {/* HEADER */}
      <header className="bg-[#1a1a1a] border-b border-zinc-800 sticky top-0 z-50 shadow-md">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-16 flex items-center justify-between">
          <div className="flex items-center gap-4">
            <Link to="/chatbot" className="text-zinc-400 hover:text-white transition-colors">
              <ArrowLeft size={20} />
            </Link>
            <div>
              <h1 className="font-bold text-lg text-white flex items-center gap-2">
                <ScanLine size={18} className="text-[#00e676]" />
                FMCG Scheme Decoding Scanner
              </h1>
              <div className="text-[10px] text-zinc-500 font-mono tracking-wider uppercase flex items-center gap-2">
                <span className="w-1.5 h-1.5 bg-[#00e676] rounded-full animate-pulse"></span>
                OCR + Algorithmic Margin Parsing Active
              </div>
            </div>
          </div>
        </div>
      </header>

      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-8">
        
        {/* SECTION 1 & 2: INGESTION & EXTRACTION */}
        <section className="grid grid-cols-1 lg:grid-cols-2 gap-8">
          
          {/* Upload Zone */}
          <div className="bg-[#1a1a1a] rounded-xl border border-zinc-800 p-6 shadow-lg flex flex-col">
            <h2 className="text-lg font-bold text-white flex items-center gap-2 mb-4">
              <UploadCloud size={18} className="text-[#29b6f6]" />
              Bill Ingestion Engine
            </h2>
            
            <div 
              className={`flex-1 border-2 border-dashed rounded-xl flex flex-col items-center justify-center p-8 transition-colors ${imagePreview ? 'border-[#29b6f6]/50 bg-[#29b6f6]/5' : 'border-zinc-700 bg-zinc-800/30 hover:border-zinc-500 hover:bg-zinc-800/50'}`}
              onClick={() => fileInputRef.current?.click()}
            >
              <input 
                type="file" 
                ref={fileInputRef} 
                className="hidden" 
                accept="image/jpeg, image/png, image/webp" 
                onChange={handleImageUpload}
              />
              {imagePreview ? (
                <div className="flex flex-col items-center h-full w-full">
                  <img src={imagePreview} alt="Bill Preview" className="max-h-48 object-contain rounded mb-4 shadow-md" />
                  <p className="text-xs text-[#29b6f6] font-medium uppercase tracking-wider">Image Loaded • Click to change</p>
                </div>
              ) : (
                <div className="text-center">
                  <FileText size={48} className="mx-auto text-zinc-600 mb-4" />
                  <p className="text-sm font-bold text-zinc-300 mb-1">Click to Upload Wholesale Invoice</p>
                  <p className="text-xs text-zinc-500">Supports JPG, PNG formats up to 10MB</p>
                </div>
              )}
            </div>

            <button 
              onClick={extractBillData}
              disabled={!selectedImage || isProcessing}
              className={`mt-4 w-full py-3.5 rounded-lg font-bold text-sm flex items-center justify-center gap-2 transition-all ${!selectedImage || isProcessing ? 'bg-zinc-800 text-zinc-500 cursor-not-allowed' : 'bg-[#00e676] hover:bg-[#00c853] text-black shadow-[0_0_15px_rgba(0,230,118,0.3)]'}`}
            >
              {isProcessing ? <Settings className="animate-spin" size={18} /> : <ScanLine size={18} />}
              {isProcessing ? 'Processing Neural Extraction...' : 'Execute Margin Scan'}
            </button>
          </div>

          {/* System Logs & Status */}
          <div className="bg-[#1a1a1a] rounded-xl border border-zinc-800 p-6 shadow-lg flex flex-col">
            <h2 className="text-lg font-bold text-white flex items-center gap-2 mb-4">
              <Settings size={18} className="text-zinc-400" />
              Multimodal Execution Logs
            </h2>
            
            <div className="flex-1 bg-[#0a0a0a] rounded-xl border border-zinc-800 p-4 font-mono text-xs text-zinc-400 flex flex-col overflow-y-auto">
              {error ? (
                <div className="text-red-400 flex items-start gap-2">
                  <AlertTriangle size={14} className="shrink-0 mt-0.5" />
                  <span>[ERROR] {error}</span>
                </div>
              ) : !processLog && !decodedData ? (
                <div className="text-zinc-600">Awaiting visual input...</div>
              ) : (
                <div className="space-y-2">
                  <div className="text-zinc-500">[SYSTEM] Core initialized.</div>
                  {processLog && <div className={isProcessing ? "text-[#29b6f6] animate-pulse" : "text-zinc-300"}>&gt; {processLog}</div>}
                  {decodedData && (
                    <div className="text-[#00e676] mt-4">
                      &gt; SUCCESS: Extracted {decodedData.items.length} FMCG line items.<br/>
                      &gt; Distributor: {decodedData.distributorName}<br/>
                      &gt; Invoice Ref: {decodedData.invoiceNumber}
                    </div>
                  )}
                </div>
              )}
            </div>
          </div>

        </section>

        {decodedData && (
          <>
            {/* SECTION 4: FINANCIAL MARGIN ANALYZER (Summary Cards) */}
            <section className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div className="bg-[#1a1a1a] border border-zinc-800 p-5 rounded-xl flex items-center justify-between">
                <div>
                  <p className="text-xs text-zinc-500 uppercase tracking-wider font-bold mb-1">Billed Invoice Total</p>
                  <h3 className="text-2xl font-black text-white">₹{decodedData.metrics.totalInvoiceValue.toFixed(2)}</h3>
                </div>
                <div className="w-12 h-12 rounded-full bg-zinc-800/50 flex items-center justify-center">
                  <Receipt size={24} className="text-zinc-400" />
                </div>
              </div>
              <div className="bg-[#00e676]/10 border border-[#00e676]/30 p-5 rounded-xl flex items-center justify-between">
                <div>
                  <p className="text-xs text-[#00e676]/70 uppercase tracking-wider font-bold mb-1">Hidden Scheme Value</p>
                  <h3 className="text-2xl font-black text-[#00e676]">₹{decodedData.metrics.totalHiddenValueUnlocked.toFixed(2)}</h3>
                </div>
                <div className="w-12 h-12 rounded-full bg-[#00e676]/20 flex items-center justify-center">
                  <PackageOpen size={24} className="text-[#00e676]" />
                </div>
              </div>
              <div className="bg-[#29b6f6]/10 border border-[#29b6f6]/30 p-5 rounded-xl flex items-center justify-between">
                <div>
                  <p className="text-xs text-[#29b6f6]/70 uppercase tracking-wider font-bold mb-1">Avg Margin Boost</p>
                  <h3 className="text-2xl font-black text-[#29b6f6]">+{decodedData.metrics.overallMarginBoost.toFixed(1)}%</h3>
                </div>
                <div className="w-12 h-12 rounded-full bg-[#29b6f6]/20 flex items-center justify-center">
                  <TrendingUp size={24} className="text-[#29b6f6]" />
                </div>
              </div>
            </section>

            {/* SECTION 3: DECODED SCHEME MATRIX */}
            <section className="bg-[#1a1a1a] rounded-xl border border-zinc-800 shadow-lg overflow-hidden">
              <div className="p-6 border-b border-zinc-800 flex justify-between items-end">
                <div>
                  <h2 className="text-lg font-bold text-white flex items-center gap-2">
                    <Calculator size={18} className="text-[#b388ff]" />
                    True Landed Cost Matrix
                  </h2>
                  <p className="text-sm text-zinc-400 mt-1">Calculations strictly factor in Free Quantity dilutions, Tax, and Cash Discounts.</p>
                </div>
              </div>
              
              <div className="overflow-x-auto">
                <table className="w-full text-left border-collapse">
                  <thead>
                    <tr className="bg-[#242424] text-[11px] uppercase tracking-wider text-zinc-400 border-b border-zinc-700">
                      <th className="p-4 font-semibold">FMCG Item</th>
                      <th className="p-4 font-semibold text-center border-l border-zinc-700">Billed<br/>Qty</th>
                      <th className="p-4 font-semibold text-center text-[#00e676]">Free<br/>Qty</th>
                      <th className="p-4 font-semibold text-right border-l border-zinc-700">Paper Rate</th>
                      <th className="p-4 font-semibold text-right border-l border-r border-[#b388ff]/30 bg-[#b388ff]/5 text-[#b388ff]">True Landed<br/>(Per Unit)</th>
                      <th className="p-4 font-semibold text-right">Retail MRP</th>
                      <th className="p-4 font-semibold text-right">Effective<br/>Margin</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-zinc-800/50">
                    {decodedData.items.map((item, idx) => (
                      <tr key={idx} className="hover:bg-[#242424] transition-colors">
                        <td className="p-4">
                          <div className="font-bold text-white text-sm">{item.name}</div>
                          <div className="text-[10px] text-zinc-500 mt-1 flex gap-2">
                            <span>TD: {item.discountPercent}%</span>
                            <span>GST: {item.taxPercent}%</span>
                          </div>
                        </td>
                        <td className="p-4 text-center font-mono text-zinc-300 border-l border-zinc-800/50">{item.billedQty}</td>
                        <td className="p-4 text-center font-mono font-bold text-[#00e676] bg-[#00e676]/5">
                          {item.freeQty > 0 ? `+${item.freeQty}` : '-'}
                        </td>
                        <td className="p-4 text-right font-mono text-zinc-400 border-l border-zinc-800/50">
                          ₹{parseFloat(item.baseRate).toFixed(2)}
                        </td>
                        <td className="p-4 text-right font-mono font-black text-white border-l border-r border-[#b388ff]/30 bg-[#b388ff]/10">
                          ₹{item.trueLandedCost.toFixed(2)}
                        </td>
                        <td className="p-4 text-right font-mono text-white">
                          ₹{parseFloat(item.mrp).toFixed(2)}
                        </td>
                        <td className="p-4 text-right font-mono font-bold">
                          <div className="flex flex-col items-end">
                            <span className="text-[#00e676]">{item.trueMarginPct.toFixed(1)}%</span>
                            {item.freeQty > 0 && (
                              <span className="text-[10px] text-zinc-500 line-through">was {item.apparentMarginPct.toFixed(1)}%</span>
                            )}
                          </div>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </section>

            {/* SECTION 5: CAPITAL EFFICIENCY AI */}
            <section className="bg-[#1a1a1a] rounded-xl border border-zinc-800 p-6 shadow-lg">
              <div className="mb-6">
                <h2 className="text-lg font-bold text-white flex items-center gap-2">
                  <Lightbulb size={18} className="text-[#ffa726]" />
                  Capital Efficiency Intelligence
                </h2>
                <p className="text-sm text-zinc-400 mt-1">AI analysis of the decoded schemes against standard working capital metrics.</p>
              </div>

              <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
                {decodedData.items.filter(i => i.freeQty > 0).length === 0 ? (
                  <div className="col-span-full p-4 border border-zinc-700 bg-zinc-800/30 rounded-lg text-sm text-zinc-400 text-center">
                    No "Free Quantity" schemes detected on this invoice. Standard margin logic applies.
                  </div>
                ) : (
                  decodedData.items.filter(i => i.freeQty > 0).map((item, idx) => {
                    const workingCapitalTiedUp = item.finalCostForLine;
                    const ROI = ((item.hiddenValue / workingCapitalTiedUp) * 100).toFixed(1);
                    
                    let verdict = 'NEUTRAL';
                    let verdictColor = 'text-zinc-400';
                    let boxBorder = 'border-zinc-700';

                    if (ROI > 10) {
                      verdict = 'HIGH YIELD - APPROVED';
                      verdictColor = 'text-[#00e676]';
                      boxBorder = 'border-[#00e676]/30 bg-[#00e676]/5';
                    } else if (ROI < 5) {
                      verdict = 'DUMPING RISK - WARNING';
                      verdictColor = 'text-[#ff5252]';
                      boxBorder = 'border-[#ff5252]/30 bg-[#ff5252]/5';
                    }

                    return (
                      <div key={idx} className={`p-4 rounded-xl border ${boxBorder} flex flex-col gap-3`}>
                        <div className="flex justify-between items-start">
                          <h3 className="font-bold text-white text-sm">{item.name} Scheme</h3>
                          <span className={`text-[10px] font-black tracking-wider px-2 py-1 rounded bg-black/30 ${verdictColor}`}>
                            {verdict}
                          </span>
                        </div>
                        <p className="text-sm text-zinc-300 leading-relaxed">
                          This "<span className="font-mono text-[#00e676]">{item.billedQty}+{item.freeQty}</span>" scheme requires locking <strong className="text-white">₹{workingCapitalTiedUp.toFixed(0)}</strong> in capital. The free stock unlocks <strong className="text-white">₹{item.hiddenValue.toFixed(0)}</strong> in extra profit, yielding a scheme ROI of <strong className="text-[#29b6f6]">{ROI}%</strong>.
                        </p>
                        {verdict.includes('WARNING') && (
                          <div className="mt-2 text-xs text-[#ff5252] flex gap-2 bg-[#ff5252]/10 p-2 rounded border border-[#ff5252]/20">
                            <ShieldCheck size={14} className="shrink-0" />
                            Ensure this product moves fast enough to prevent expiry before capital is recovered.
                          </div>
                        )}
                      </div>
                    );
                  })
                )}
              </div>
            </section>
          </>
        )}

      </main>
    </div>
  );
}