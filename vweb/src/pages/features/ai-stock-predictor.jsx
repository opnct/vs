import React, { useState, useEffect } from 'react';
import { ArrowDown, ArrowRight, MapPin, CloudRain, Sun, Thermometer, Calendar, TrendingUp, AlertTriangle, ShieldCheck, Database, ServerCog, Radar } from 'lucide-react';
import { Link } from 'react-router-dom';

export default function FeatureAIStockPredictor() {
  // --- REAL-TIME LOGIC: Geolocation, Weather API, and Temporal Parsing ---
  const [geoState, setGeoState] = useState({ loading: false, lat: null, lon: null, error: null });
  const [weatherData, setWeatherData] = useState(null);
  const [festivalData, setFestivalData] = useState({ name: 'Calculating...', category: '' });
  const [recommendations, setRecommendations] = useState([]);
  const [sysTime, setSysTime] = useState(new Date());

  // Keep system clock ticking for the dashboard feel
  useEffect(() => {
    const timer = setInterval(() => setSysTime(new Date()), 1000);
    return () => clearInterval(timer);
  }, []);

  // Determine current Indian trading season based on real system clock
  useEffect(() => {
    const month = sysTime.getMonth(); // 0-11
    let fest = { name: "Standard Trading Period", category: "Daily FMCG Staples" };
    
    if (month === 1 || month === 2) fest = { name: "Holi & Summer Prep", category: "Colors, Sweets, Beverages" };
    else if (month === 3 || month === 4) fest = { name: "Peak Summer Season", category: "Hydration, Ice Creams, Coolers" };
    else if (month === 5 || month === 6) fest = { name: "Monsoon / Kharif", category: "Umbrellas, Repellents, Tea/Snacks" };
    else if (month === 7 || month === 8) fest = { name: "Ganesh Chaturthi / Onam", category: "Pooja Needs, Modak Ingredients, Oils" };
    else if (month === 9 || month === 10) fest = { name: "Diwali Festive Quarter", category: "Gifting, Dry Fruits, Lights, Premium FMCG" };
    else if (month === 11 || month === 0) fest = { name: "Winter / Makar Sankranti", category: "Winter Care, Jaggery, Sesame, Hot Beverages" };
    
    setFestivalData(fest);
  }, [sysTime]);

  const initiateLiveScan = () => {
    setGeoState({ loading: true, lat: null, lon: null, error: null });
    setWeatherData(null);
    setRecommendations([]);

    if (!navigator.geolocation) {
      setGeoState({ loading: false, error: 'Geolocation is not supported by your browser.' });
      return;
    }

    navigator.geolocation.getCurrentPosition(
      async (position) => {
        const lat = position.coords.latitude;
        const lon = position.coords.longitude;
        setGeoState({ loading: false, lat, lon, error: null });
        fetchLiveWeather(lat, lon);
      },
      (error) => {
        setGeoState({ loading: false, error: `Location access denied (${error.message}). Cannot predict hyperlocal trends.` });
      }
    );
  };

  const fetchLiveWeather = async (lat, lon) => {
    try {
      // Free, no-key weather API (Open-Meteo)
      const res = await fetch(`https://api.open-meteo.com/v1/forecast?latitude=${lat}&longitude=${lon}&current_weather=true`);
      const data = await res.json();
      const current = data.current_weather;
      setWeatherData(current);
      generateRecommendations(current.temperature, current.weathercode, festivalData);
    } catch (err) {
      setGeoState(prev => ({ ...prev, error: 'Failed to connect to meteorological satellites.' }));
    }
  };

  const generateRecommendations = (temp, weatherCode, fest) => {
    let recs = [];
    
    // Logic: Temperature based
    if (temp >= 30) {
      recs.push({ item: 'Cold Beverages & Sodas', reason: `High temperature detected (${temp}°C). Expected +45% demand spike.`, impact: 'High' });
      recs.push({ item: 'Ice Creams & Dairy', reason: 'Heatwave parameters met. Increase freezer stock.', impact: 'High' });
    } else if (temp <= 20) {
      recs.push({ item: 'Tea, Coffee & Soups', reason: `Cool temperature detected (${temp}°C). Hot beverage demand rising.`, impact: 'Medium' });
      recs.push({ item: 'Moisturizers & Lip Balms', reason: 'Dry/Winter conditions detected.', impact: 'High' });
    }

    // Logic: Weather Code based (WMO codes: 50+ is rain/drizzle)
    if (weatherCode >= 50 && weatherCode <= 99) {
      recs.push({ item: 'Mosquito Repellents', reason: 'Precipitation detected. Vector-borne disease prevention items needed.', impact: 'Critical' });
      recs.push({ item: 'Fried Snacks / Namkeen', reason: 'Rainy weather correlates with a 30% increase in snack sales.', impact: 'Medium' });
    }

    // Logic: Festival based
    recs.push({ item: fest.category, reason: `Upcoming calendar event: ${fest.name}. Historical regional data suggests stocking up now.`, impact: 'Critical' });

    setRecommendations(recs);
  };

  return (
    <div className="flex flex-col w-full bg-white text-black animate-in fade-in duration-700 min-h-screen">
      
      {/* SECTION 1: HERO SECTION (Earth.gov Full Bleed) */}
      <section className="relative w-full h-[60vh] min-h-[500px] flex items-center justify-start px-6 md:px-12 lg:px-24 overflow-hidden border-b border-[#333]">
        <div className="absolute inset-0 bg-gradient-to-r from-black/95 via-black/80 to-transparent z-10"></div>
        <img 
          src="https://images.unsplash.com/photo-1551288049-bebda4e38f71?auto=format&fit=crop&q=80" 
          alt="Data Visualization" 
          className="absolute inset-0 w-full h-full object-cover z-0 object-center opacity-40 grayscale"
        />
        
        <div className="relative z-20 max-w-4xl pt-16">
          <div className="bg-[#005ea2] text-white text-[11px] font-bold px-2 py-1 rounded-sm inline-flex items-center w-max mb-6 uppercase tracking-wider">
            Vyapar Intelligence Module
          </div>
          <h1 className="text-5xl md:text-7xl lg:text-[6rem] font-bold text-white tracking-tight leading-[1.05] mb-6 uppercase">
            AI STOCK <br /> PREDICTOR
          </h1>
          <p className="text-xl md:text-2xl text-[#cccccc] max-w-2xl font-normal tracking-wide mb-10">
            Eliminate dead stock. Our predictive engine cross-references your live geographical weather, local Indian festivals, and historical footfall to tell you exactly what to buy before demand spikes.
          </p>
          <a 
            href="#live-scan"
            className="inline-flex items-center gap-3 bg-[#005ea2] hover:bg-[#0b4774] text-white px-8 py-4 font-bold tracking-wider transition-colors text-[13px] uppercase rounded-sm mb-20 md:mb-28"
          >
            Initiate Environment Scan <ArrowDown size={18} strokeWidth={2.5}/>
          </a>
        </div>
      </section>

      {/* SECTION 2: LIVE METEOROLOGICAL & TEMPORAL SCAN */}
      <section id="live-scan" className="w-full py-24 px-6 md:px-12 lg:px-24 bg-[#0a0a0a] text-white border-b border-[#222] scroll-mt-16">
        <div className="max-w-7xl mx-auto">
          <div className="flex flex-col md:flex-row justify-between items-start md:items-end mb-12 gap-6 border-b border-[#333] pb-8">
            <div>
              <h2 className="text-[22px] font-bold tracking-widest uppercase mb-4">
                REAL-TIME ENVIRONMENTAL TELEMETRY
              </h2>
              <p className="text-[#888] max-w-2xl text-[15px] leading-relaxed">
                VyaparSetu does not rely on static algorithms. By querying global meteorological satellites and Indian temporal calendars, we map the exact purchasing conditions surrounding your physical store right now.
              </p>
            </div>
            <button 
              onClick={initiateLiveScan}
              disabled={geoState.loading}
              className="bg-white hover:bg-gray-200 text-black px-6 py-3 font-bold tracking-widest uppercase transition-colors text-[12px] rounded-sm flex items-center gap-2 shrink-0 disabled:opacity-50"
            >
              {geoState.loading ? <ServerCog className="animate-spin" size={16}/> : <Radar size={16} />}
              {geoState.loading ? 'Scanning...' : 'Run Live Scan'}
            </button>
          </div>

          {/* Telemetry Dashboard */}
          <div className="grid lg:grid-cols-3 gap-6">
            {/* System Clock / Festival */}
            <div className="bg-[#111111] border border-[#222] p-6 rounded-sm flex flex-col justify-between min-h-[160px]">
              <div className="flex items-center gap-3 text-[#005ea2] mb-4">
                <Calendar size={20} />
                <span className="text-[11px] font-bold uppercase tracking-widest">Temporal Analysis</span>
              </div>
              <div>
                <p className="font-mono text-xl text-white mb-1">{sysTime.toLocaleDateString('en-IN', { weekday: 'short', month: 'long', day: 'numeric' })}</p>
                <p className="text-[13px] text-[#888] uppercase tracking-wide">Current Epoch: <span className="text-white">{festivalData.name}</span></p>
              </div>
            </div>

            {/* Geolocation */}
            <div className="bg-[#111111] border border-[#222] p-6 rounded-sm flex flex-col justify-between min-h-[160px]">
              <div className="flex items-center gap-3 text-[#005ea2] mb-4">
                <MapPin size={20} />
                <span className="text-[11px] font-bold uppercase tracking-widest">Spatial Coordinates</span>
              </div>
              <div>
                {geoState.error ? (
                  <p className="text-red-500 text-[13px] font-mono">{geoState.error}</p>
                ) : geoState.lat ? (
                  <>
                    <p className="font-mono text-xl text-white mb-1">{geoState.lat.toFixed(4)}° N, {geoState.lon.toFixed(4)}° E</p>
                    <p className="text-[13px] text-[#888] uppercase tracking-wide">Resolution: Hyperlocal</p>
                  </>
                ) : (
                  <p className="text-[#555] font-mono text-sm uppercase">Awaiting scan command...</p>
                )}
              </div>
            </div>

            {/* Live Weather */}
            <div className="bg-[#111111] border border-[#222] p-6 rounded-sm flex flex-col justify-between min-h-[160px]">
              <div className="flex items-center gap-3 text-[#005ea2] mb-4">
                <Thermometer size={20} />
                <span className="text-[11px] font-bold uppercase tracking-widest">Meteorological Data</span>
              </div>
              <div>
                {weatherData ? (
                  <>
                    <p className="font-mono text-3xl text-white mb-1 flex items-center gap-3">
                      {weatherData.temperature}°C 
                      {weatherData.weathercode >= 50 ? <CloudRain size={24} className="text-blue-400"/> : <Sun size={24} className="text-yellow-500"/>}
                    </p>
                    <p className="text-[13px] text-[#888] uppercase tracking-wide">Wind: {weatherData.windspeed} km/h</p>
                  </>
                ) : (
                  <p className="text-[#555] font-mono text-sm uppercase">Awaiting coordinates...</p>
                )}
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* SECTION 3: DYNAMIC INVENTORY RECOMMENDATIONS */}
      <section className="w-full py-24 px-6 md:px-12 lg:px-24 bg-white border-b border-gray-200">
        <div className="max-w-7xl mx-auto">
          <h2 className="text-[22px] font-bold tracking-widest uppercase mb-10 text-black flex items-center gap-3">
            <TrendingUp size={24} className="text-[#005ea2]"/>
            LIVE INVENTORY FORECAST
          </h2>

          <div className="bg-gray-50 border border-gray-200 rounded-sm p-8 min-h-[300px]">
            {recommendations.length > 0 ? (
              <div className="space-y-4">
                <div className="grid grid-cols-12 gap-4 text-[11px] font-bold text-gray-500 uppercase tracking-widest mb-4 px-4 hidden md:grid">
                  <div className="col-span-4">Recommended SKU Category</div>
                  <div className="col-span-6">AI Rationalization</div>
                  <div className="col-span-2 text-right">Priority</div>
                </div>
                {recommendations.map((rec, idx) => (
                  <div key={idx} className="grid grid-cols-1 md:grid-cols-12 gap-4 items-center bg-white border border-gray-200 p-4 rounded-sm animate-in slide-in-from-bottom-4">
                    <div className="md:col-span-4 font-bold text-[15px]">{rec.item}</div>
                    <div className="md:col-span-6 text-[14px] text-[#555] font-mono leading-relaxed">{rec.reason}</div>
                    <div className="md:col-span-2 md:text-right">
                      <span className={`inline-block px-3 py-1 text-[10px] font-bold uppercase tracking-wider rounded-sm ${
                        rec.impact === 'Critical' ? 'bg-red-100 text-red-700' :
                        rec.impact === 'High' ? 'bg-orange-100 text-orange-700' :
                        'bg-blue-100 text-[#005ea2]'
                      }`}>
                        {rec.impact}
                      </span>
                    </div>
                  </div>
                ))}
                <div className="mt-8 pt-6 border-t border-gray-200 flex justify-end">
                  <button className="bg-black hover:bg-[#222] text-white px-6 py-3 text-[12px] font-bold uppercase tracking-widest rounded-sm transition-colors">
                    Push to Supplier Cart
                  </button>
                </div>
              </div>
            ) : (
              <div className="h-full flex flex-col items-center justify-center text-center py-16">
                <Database size={48} className="text-gray-300 mb-4"/>
                <p className="text-[15px] font-mono text-gray-500 max-w-md">
                  Awaiting telemetric input. Click "Run Live Scan" above to calculate local purchasing parameters based on your physical location and the current timestamp.
                </p>
              </div>
            )}
          </div>
        </div>
      </section>

      {/* SECTION 4: HISTORICAL FOOTFALL ARCHITECTURE */}
      <section className="w-full py-24 px-6 md:px-12 lg:px-24 bg-[#f9f9f9] border-b border-gray-200">
        <div className="max-w-7xl mx-auto flex flex-col lg:flex-row gap-16 items-center">
          <div className="lg:w-1/2 w-full">
            <h2 className="text-[22px] font-bold tracking-widest uppercase mb-6 text-black">
              HISTORICAL FOOTFALL ALGORITHMS
            </h2>
            <p className="text-[17px] leading-[1.65] text-[#333333] mb-6">
              Weather and calendars only provide the macro context. VyaparSetu's AI deeply analyzes your own POS data over the last 12 months. It identifies micro-trends specific to your neighborhood.
            </p>
            <p className="text-[17px] leading-[1.65] text-[#333333]">
              If your store experiences a 300% spike in biscuit sales every Friday evening due to a nearby tuition center letting out, the AI recognizes this anomaly and alerts you to restock by Thursday afternoon.
            </p>
          </div>
          <div className="lg:w-1/2 w-full shrink-0">
             <div className="aspect-video bg-white border border-gray-200 p-8 rounded-sm shadow-sm flex flex-col justify-end relative">
                <div className="absolute top-8 left-8 text-[11px] font-bold text-gray-400 uppercase tracking-widest">Volume (Units)</div>
                {/* Mock Bar Chart */}
                <div className="flex items-end justify-between h-48 gap-2 w-full border-b border-gray-200 pb-2">
                  {[20, 35, 25, 40, 85, 95, 45].map((h, i) => (
                    <div key={i} className="w-full flex flex-col items-center group">
                      <div className={`w-full rounded-t-sm transition-all duration-500 ${i === 4 || i === 5 ? 'bg-[#005ea2]' : 'bg-gray-200 group-hover:bg-gray-300'}`} style={{ height: `${h}%` }}></div>
                    </div>
                  ))}
                </div>
                <div className="flex items-center justify-between mt-4 text-[10px] font-mono text-gray-500 uppercase">
                  <span>Mon</span><span>Tue</span><span>Wed</span><span>Thu</span><span className="text-[#005ea2] font-bold">Fri</span><span className="text-[#005ea2] font-bold">Sat</span><span>Sun</span>
                </div>
             </div>
          </div>
        </div>
      </section>

      {/* SECTION 5: FESTIVAL ENGINE EXPLANATION */}
      <section className="relative w-full bg-[#181818] py-24 px-6 md:px-12 lg:px-24 overflow-hidden border-b border-[#333]">
        <div className="absolute inset-0 opacity-[0.03] pointer-events-none bg-[radial-gradient(circle_at_center,_transparent_0,_transparent_10px,_white_11px,_white_12px)] [background-size:60px_60px]"></div>
        
        <div className="relative z-10 max-w-7xl mx-auto text-center">
          <h2 className="text-[22px] font-bold tracking-widest uppercase mb-6 text-white">
            THE INDIA FESTIVAL CALENDAR
          </h2>
          <p className="text-[#aaaaaa] text-[17px] leading-relaxed max-w-3xl mx-auto mb-12">
            The Indian retail cycle is governed by regional festivals. Our system tracks over 400 hyperlocal events across states. Whether it's Durga Puja in Bengal or Pongal in Kerala, the system preemptively restocks region-specific FMCG goods 14 days prior to the event.
          </p>
        </div>
      </section>

      {/* SECTION 6: WASTAGE MITIGATION */}
      <section className="w-full py-24 px-6 md:px-12 lg:px-24 bg-white border-b border-gray-200">
        <div className="max-w-7xl mx-auto flex flex-col items-center text-center">
          <AlertTriangle className="text-red-600 mb-6" size={48} strokeWidth={1.5}/>
          <h2 className="text-[22px] font-bold tracking-widest uppercase mb-6 text-black">
            WASTAGE & EXPIRY MITIGATION
          </h2>
          <p className="text-[17px] leading-[1.65] text-[#555555] max-w-3xl mb-8">
            Predictive stocking isn't just about selling more; it's about buying less of what doesn't sell. By anticipating demand drops (e.g., stopping ice cream orders ahead of incoming monsoon forecasts), VyaparSetu reduces dead-stock and expired FMCG write-offs by an average of 18% per quarter.
          </p>
        </div>
      </section>

      {/* SECTION 7: EDGE PROCESSING & PRIVACY */}
      <section className="w-full py-24 px-6 md:px-12 lg:px-24 bg-gray-100 border-b border-gray-200">
        <div className="max-w-7xl mx-auto grid md:grid-cols-2 gap-16 items-center">
          <div>
            <h2 className="text-[22px] font-bold tracking-widest uppercase mb-6 text-black">
              EDGE COMPUTING PRIVACY
            </h2>
            <p className="text-[17px] leading-[1.65] text-[#555555]">
              VyaparSetu operates on a strict zero-knowledge architecture for individual customer purchasing data. Trends are aggregated and analyzed on the edge (your device) before communicating securely with the cloud. Your store's specific volume metrics are never shared with suppliers or competitors.
            </p>
          </div>
          <div className="flex justify-center">
            <ShieldCheck size={120} className="text-gray-300" strokeWidth={1} />
          </div>
        </div>
      </section>

      {/* SECTION 8: FOOTER CTA */}
      <section className="w-full bg-[#0a0a0a] py-24 px-6 md:px-12 lg:px-24 border-t border-[#333]">
        <div className="max-w-7xl mx-auto">
          <h2 className="text-[3.5rem] md:text-[5rem] font-bold tracking-tight text-white mb-8 uppercase leading-[1.05]">
            STOCK <br className="hidden md:block" /> SMARTER.
          </h2>
          <p className="text-[#aaaaaa] text-lg md:text-xl max-w-3xl leading-relaxed mb-12">
            Transform your procurement strategy from reactive guessing to proactive intelligence. Integrate the VyaparSetu AI Stock Predictor and secure your capital.
          </p>
          <Link 
            to="/contact" 
            className="inline-flex items-center gap-3 bg-white hover:bg-gray-200 text-black px-8 py-4 font-bold tracking-wider uppercase transition-colors text-[13px] rounded-sm"
          >
            Request Implementation Info <ArrowRight size={18} strokeWidth={2.5}/>
          </Link>
        </div>
      </section>

    </div>
  );
}