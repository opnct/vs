import React, { useState, useEffect } from 'react';
import { 
  CloudRain, Sun, Cloud, CloudLightning, 
  ArrowLeft, RefreshCw, AlertCircle, 
  ThermometerSun, Droplets, ShoppingCart, 
  TrendingDown, MapPin, Zap, Database,
  CalendarDays, Calculator
} from 'lucide-react';
import { Link } from 'react-router-dom';

// Real World FMCG Correlation Rules for Indian Kiranas
const WEATHER_CORRELATION_RULES = [
  {
    condition: "HEAVY_RAIN",
    trigger: (forecast) => forecast.precipitation_sum > 5 || [61, 63, 65, 80, 81, 82, 95, 96, 99].includes(forecast.weathercode),
    products: [
      { name: "Maggi 2-Min Noodles (140g)", category: "Impulse Food", wholesale: 24, mrp: 28, urgency: "HIGH" },
      { name: "Wagh Bakri Premium Tea (250g)", category: "Beverage", wholesale: 120, mrp: 145, urgency: "HIGH" },
      { name: "Tata Salt / Besan (Pakoda Mix)", category: "Staples", wholesale: 45, mrp: 55, urgency: "MEDIUM" },
      { name: "GoodKnight Gold Flash Refill", category: "Repellent", wholesale: 68, mrp: 85, urgency: "CRITICAL" },
      { name: "Parle-G / Britannia Marie Gold", category: "Biscuits", wholesale: 8.5, mrp: 10, urgency: "MEDIUM" }
    ]
  },
  {
    condition: "EXTREME_HEAT",
    trigger: (forecast) => forecast.temperature_2m_max > 38,
    products: [
      { name: "Sprite / Thums Up (2L PET)", category: "Cold Beverage", wholesale: 82, mrp: 95, urgency: "CRITICAL" },
      { name: "Glucon-D Tangy Orange (100g)", category: "Energy", wholesale: 30, mrp: 35, urgency: "HIGH" },
      { name: "DermiCool / Nycil Prickly Heat", category: "Personal Care", wholesale: 110, mrp: 140, urgency: "HIGH" },
      { name: "Amul / Mother Dairy Buttermilk", category: "Dairy", wholesale: 12, mrp: 15, urgency: "MEDIUM" }
    ]
  },
  {
    condition: "COLD_WAVE",
    trigger: (forecast) => forecast.temperature_2m_min < 15,
    products: [
      { name: "Vaseline Body Lotion (100ml)", category: "Skincare", wholesale: 85, mrp: 115, urgency: "HIGH" },
      { name: "Bru / Nescafe Instant Coffee", category: "Beverage", wholesale: 140, mrp: 165, urgency: "HIGH" },
      { name: "Dabur Chyawanprash (500g)", category: "Health", wholesale: 175, mrp: 210, urgency: "MEDIUM" }
    ]
  }
];

// WMO Weather Code Decoder
const decodeWMO = (code) => {
  if (code === 0) return { label: "Clear Sky", icon: Sun, color: "text-yellow-400" };
  if ([1, 2, 3].includes(code)) return { label: "Partly Cloudy", icon: Cloud, color: "text-zinc-400" };
  if ([45, 48].includes(code)) return { label: "Foggy", icon: Cloud, color: "text-zinc-500" };
  if ([51, 53, 55, 56, 57].includes(code)) return { label: "Drizzle", icon: CloudRain, color: "text-blue-300" };
  if ([61, 63, 65, 66, 67].includes(code)) return { label: "Rain", icon: Droplets, color: "text-blue-500" };
  if ([80, 81, 82].includes(code)) return { label: "Showers", icon: CloudRain, color: "text-blue-400" };
  if ([95, 96, 99].includes(code)) return { label: "Thunderstorm", icon: CloudLightning, color: "text-purple-400" };
  return { label: "Unknown", icon: Cloud, color: "text-zinc-400" };
};

export default function FeatureMicroWeatherStock() {
  const [locations] = useState([
    { name: 'Nagpur, MH', lat: 21.1458, lon: 79.0882 },
    { name: 'Mumbai, MH', lat: 19.0760, lon: 72.8777 },
    { name: 'Delhi, NCR', lat: 28.7041, lon: 77.1025 },
    { name: 'Bangalore, KA', lat: 12.9716, lon: 77.5946 }
  ]);
  
  const [selectedLocation, setSelectedLocation] = useState(locations[0]);
  const [forecastData, setForecastData] = useState([]);
  const [alerts, setAlerts] = useState([]);
  const [financialImpact, setFinancialImpact] = useState({ lostRevenue: 0, lostMargin: 0 });
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState(null);

  // --- 1. LIVE METEOROLOGICAL SYNC ---
  const fetchLiveWeather = async () => {
    setIsLoading(true);
    setError(null);
    try {
      // Real Open-Meteo API Call (Requires no API Key, production ready)
      const url = `https://api.open-meteo.com/v1/forecast?latitude=${selectedLocation.lat}&longitude=${selectedLocation.lon}&daily=weathercode,temperature_2m_max,temperature_2m_min,precipitation_sum&timezone=Asia%2FKolkata`;
      
      const response = await fetch(url);
      if (!response.ok) throw new Error("Meteorological API cluster rejected the request.");
      
      const data = await response.json();
      
      // Parse the arrays into a structured daily object
      const parsedForecast = data.daily.time.map((dateStr, index) => ({
        date: new Date(dateStr).toLocaleDateString('en-IN', { weekday: 'short', month: 'short', day: 'numeric' }),
        rawDate: dateStr,
        weathercode: data.daily.weathercode[index],
        tempMax: data.daily.temperature_2m_max[index],
        tempMin: data.daily.temperature_2m_min[index],
        precip: data.daily.precipitation_sum[index]
      }));

      setForecastData(parsedForecast);
      generateProcurementAlerts(parsedForecast);
      
    } catch (err) {
      console.error(err);
      setError("Failed to sync with meteorological satellites. Check network connection.");
    } finally {
      setIsLoading(false);
    }
  };

  // --- 4. PREDICTIVE PROCUREMENT ALERTS ---
  const generateProcurementAlerts = (forecast) => {
    const generatedAlerts = [];
    let estimatedLostMargin = 0;
    let estimatedLostRevenue = 0;

    // Scan the 7-day forecast against our rules engine
    forecast.forEach(day => {
      WEATHER_CORRELATION_RULES.forEach(rule => {
        if (rule.trigger(day)) {
          rule.products.forEach(prod => {
            // Avoid duplicate products, just update the earliest required date
            const existingAlert = generatedAlerts.find(a => a.product.name === prod.name);
            if (!existingAlert) {
              generatedAlerts.push({
                product: prod,
                triggerDate: day.date,
                conditionTriggered: rule.condition
              });

              // --- 5. OPPORTUNITY COST CALCULATIONS ---
              // Assume 15 lost units per day of event
              const lostUnits = 15; 
              const unitMargin = prod.mrp - prod.wholesale;
              estimatedLostMargin += (unitMargin * lostUnits);
              estimatedLostRevenue += (prod.mrp * lostUnits);
            }
          });
        }
      });
    });

    setAlerts(generatedAlerts);
    setFinancialImpact({ lostRevenue: estimatedLostRevenue, lostMargin: estimatedLostMargin });
  };

  useEffect(() => {
    fetchLiveWeather();
  }, [selectedLocation]);

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
                <CloudLightning size={18} className="text-[#29b6f6]" />
                Micro-Weather Stock Predictor
              </h1>
              <div className="text-[10px] text-zinc-500 font-mono tracking-wider uppercase flex items-center gap-2">
                <span className="w-1.5 h-1.5 bg-[#29b6f6] rounded-full animate-pulse"></span>
                Live API Radar Sync Active
              </div>
            </div>
          </div>
        </div>
      </header>

      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-8">
        
        {/* SECTION 1: HYPERLOCAL METEOROLOGICAL SYNC */}
        <section className="bg-[#1a1a1a] rounded-xl border border-zinc-800 p-6 shadow-lg flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div>
            <h2 className="text-lg font-bold text-white flex items-center gap-2">
              <MapPin size={18} className="text-[#ff5252]" />
              Radar Targeting Configuration
            </h2>
            <p className="text-sm text-zinc-400 mt-1">Select your store's primary logistics hub to fetch live WMO satellite data.</p>
          </div>
          
          <div className="flex items-center gap-3">
            <select 
              value={locations.findIndex(l => l.name === selectedLocation.name)}
              onChange={(e) => setSelectedLocation(locations[e.target.value])}
              className="bg-[#242424] border border-zinc-700 rounded-lg px-4 py-2.5 text-white focus:outline-none focus:border-[#29b6f6] focus:ring-1 focus:ring-[#29b6f6] min-w-[200px]"
            >
              {locations.map((loc, idx) => (
                <option key={idx} value={idx}>{loc.name} (Lat: {loc.lat})</option>
              ))}
            </select>
            <button 
              onClick={fetchLiveWeather}
              disabled={isLoading}
              className="bg-[#29b6f6]/10 text-[#29b6f6] border border-[#29b6f6]/20 hover:bg-[#29b6f6]/20 px-4 py-2.5 rounded-lg text-sm font-bold flex items-center justify-center gap-2 transition-colors"
            >
              <RefreshCw size={16} className={isLoading ? "animate-spin" : ""} />
            </button>
          </div>
        </section>

        {error && (
          <div className="bg-red-900/20 border border-red-900/50 p-4 rounded-lg flex items-start gap-3">
            <AlertCircle size={20} className="text-red-400 shrink-0" />
            <span className="text-sm text-red-200">{error}</span>
          </div>
        )}

        {/* SECTION 2: 7-DAY ATMOSPHERIC OUTLOOK */}
        <section className="bg-[#1a1a1a] rounded-xl border border-zinc-800 p-6 shadow-lg">
          <div className="mb-6">
            <h2 className="text-lg font-bold text-white flex items-center gap-2">
              <CalendarDays size={18} className="text-[#00e676]" />
              7-Day Live Atmospheric Outlook
            </h2>
            <p className="text-sm text-zinc-400 mt-1">Real-time telemetry sourced directly from the Open-Meteo Global Forecasting Cluster.</p>
          </div>

          {isLoading ? (
            <div className="h-32 flex items-center justify-center">
              <RefreshCw size={24} className="text-zinc-600 animate-spin" />
            </div>
          ) : (
            <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-7 gap-3">
              {forecastData.map((day, idx) => {
                const wmo = decodeWMO(day.weathercode);
                const isToday = idx === 0;
                
                return (
                  <div key={idx} className={`p-4 rounded-xl border flex flex-col items-center text-center transition-colors ${isToday ? 'border-[#29b6f6]/50 bg-[#29b6f6]/5' : 'border-zinc-800 bg-[#242424]'}`}>
                    <div className={`text-xs font-bold uppercase tracking-wider mb-3 ${isToday ? 'text-[#29b6f6]' : 'text-zinc-400'}`}>
                      {isToday ? 'Today' : day.date.split(',')[0]}
                    </div>
                    <wmo.icon size={32} className={`mb-3 ${wmo.color}`} />
                    <div className="font-black text-xl text-white mb-1">{day.tempMax}°C</div>
                    <div className="text-xs text-zinc-500 mb-3">Min {day.tempMin}°C</div>
                    
                    <div className="mt-auto w-full pt-3 border-t border-zinc-800/50 flex justify-between items-center text-xs">
                      <span className="text-zinc-500 font-medium">{wmo.label}</span>
                      {day.precip > 0 && (
                        <span className="text-blue-400 font-bold flex items-center gap-0.5">
                          <Droplets size={10} /> {day.precip}mm
                        </span>
                      )}
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </section>

        {/* SECTION 4 & 5: PROCUREMENT ALERTS & FINANCIAL IMPACT */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          
          <section className="lg:col-span-2 bg-[#1a1a1a] rounded-xl border border-zinc-800 shadow-lg overflow-hidden flex flex-col">
            <div className="p-6 border-b border-zinc-800">
              <h2 className="text-lg font-bold text-white flex items-center gap-2">
                <ShoppingCart size={18} className="text-[#ffa726]" />
                Predictive Procurement Alerts
              </h2>
              <p className="text-sm text-zinc-400 mt-1">AI-generated distributor PO list based on upcoming weather anomalies.</p>
            </div>
            
            <div className="flex-1 bg-[#242424]">
              {alerts.length === 0 && !isLoading ? (
                <div className="p-8 text-center text-zinc-500">
                  <Sun size={32} className="mx-auto mb-3 opacity-50" />
                  <p>Weather is stable. No anomalous stock-ups required.</p>
                </div>
              ) : (
                <ul className="divide-y divide-zinc-800/50">
                  {alerts.map((alert, idx) => (
                    <li key={idx} className="p-4 hover:bg-[#2a2a2a] transition-colors flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                      <div>
                        <div className="flex items-center gap-2 mb-1">
                          <span className={`text-[10px] font-black uppercase tracking-widest px-2 py-0.5 rounded ${
                            alert.product.urgency === 'CRITICAL' ? 'bg-red-500/20 text-red-500' : 'bg-yellow-500/20 text-yellow-500'
                          }`}>
                            {alert.product.urgency}
                          </span>
                          <span className="text-xs text-zinc-500 font-mono">Event: {alert.conditionTriggered}</span>
                        </div>
                        <h3 className="font-bold text-white text-sm">{alert.product.name}</h3>
                        <p className="text-xs text-zinc-400 mt-1">Needed before: <strong className="text-white">{alert.triggerDate}</strong></p>
                      </div>
                      <div className="text-right flex sm:flex-col gap-4 sm:gap-1 items-center sm:items-end">
                        <div className="text-sm text-zinc-300">W/S: ₹{alert.product.wholesale}</div>
                        <div className="font-bold text-[#00e676]">Margin: ₹{(alert.product.mrp - alert.product.wholesale).toFixed(2)}</div>
                      </div>
                    </li>
                  ))}
                </ul>
              )}
            </div>
          </section>

          <section className="bg-[#1a1a1a] rounded-xl border border-zinc-800 p-6 shadow-lg flex flex-col">
            <div className="mb-6">
              <h2 className="text-lg font-bold text-white flex items-center gap-2">
                <Calculator size={18} className="text-[#b388ff]" />
                Opportunity Cost
              </h2>
              <p className="text-sm text-zinc-400 mt-1">Projected financial loss if weather alerts are ignored.</p>
            </div>

            <div className="flex-1 flex flex-col justify-center space-y-6">
              <div className="bg-[#242424] p-5 rounded-lg border border-zinc-800/50 relative overflow-hidden">
                <div className="absolute top-0 right-0 w-16 h-16 bg-red-500/5 rounded-bl-full"></div>
                <p className="text-xs font-bold text-zinc-500 uppercase tracking-wider mb-2">Est. Lost Revenue</p>
                <div className="text-3xl font-black text-white">₹{financialImpact.lostRevenue.toFixed(0)}</div>
                <p className="text-[11px] text-zinc-500 mt-2">Based on avg. 15 lost units per flagged item.</p>
              </div>

              <div className="bg-[#b388ff]/10 p-5 rounded-lg border border-[#b388ff]/30 relative overflow-hidden">
                <div className="absolute top-0 right-0 w-16 h-16 bg-[#b388ff]/20 rounded-bl-full"></div>
                <p className="text-xs font-bold text-[#b388ff]/70 uppercase tracking-wider mb-2 flex items-center gap-2">
                  <TrendingDown size={14} /> Est. Net Margin Loss
                </p>
                <div className="text-3xl font-black text-[#b388ff]">₹{financialImpact.lostMargin.toFixed(0)}</div>
                <p className="text-[11px] text-[#b388ff]/60 mt-2">Direct hit to working capital profitability.</p>
              </div>
            </div>
          </section>

        </div>

        {/* SECTION 3: KIRANA CORRELATION RULES ENGINE */}
        <section className="bg-[#1a1a1a] rounded-xl border border-zinc-800 p-6 shadow-lg">
          <div className="mb-6">
            <h2 className="text-lg font-bold text-white flex items-center gap-2">
              <Database size={18} className="text-zinc-400" />
              Kirana Correlation Rules Matrix
            </h2>
            <p className="text-sm text-zinc-500 mt-1">The active logic layer driving the predictions.</p>
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            {WEATHER_CORRELATION_RULES.map((rule, idx) => (
              <div key={idx} className="p-4 bg-[#242424] border border-zinc-800/50 rounded-lg">
                <div className="text-xs font-black uppercase tracking-widest text-[#29b6f6] mb-3 pb-2 border-b border-zinc-800">
                  RULE: {rule.condition}
                </div>
                <ul className="space-y-2">
                  {rule.products.slice(0, 3).map((p, i) => (
                    <li key={i} className="text-sm text-zinc-300 flex items-center gap-2 before:content-[''] before:w-1 before:h-1 before:bg-zinc-600 before:rounded-full">
                      {p.name}
                    </li>
                  ))}
                  {rule.products.length > 3 && (
                    <li className="text-xs text-zinc-500 italic ml-3">+{rule.products.length - 3} more SKUs</li>
                  )}
                </ul>
              </div>
            ))}
          </div>
        </section>

      </main>
    </div>
  );
}