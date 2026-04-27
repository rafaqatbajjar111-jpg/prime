import React, { useState, useEffect, useRef, memo } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { Activity, Zap, MousePointer2, Globe, Server, Terminal, ShieldAlert, Cpu } from 'lucide-react';

// --- Types ---
type AgentState = 'WARMUP' | 'SCROLLING' | 'CLICKING' | 'COOLDOWN';

interface NodeStats {
  id: number;
  ip: string;
  state: AgentState;
  scrollPos: number;
  clicks: number;
  active: boolean;
}

// --- Constants ---
const SECTION_NODE_COUNT = 40;

// --- Helpers ---
const generateIP = () => Array.from({ length: 4 }, () => Math.floor(Math.random() * 256)).join('.');

// --- Components ---

const BrowserNode = memo(({ id, sectionUrl, sectionHtml, sectionScript, type }: { id: number, sectionUrl?: string, sectionHtml?: string, sectionScript?: string, type: string }) => {
  const [stats, setStats] = useState<NodeStats>({
    id,
    ip: generateIP(),
    state: 'WARMUP',
    scrollPos: 0,
    clicks: 0,
    active: true,
  });

  const [aiVerified, setAiVerified] = useState(false);

  useEffect(() => {
    const aiInterval = setInterval(() => {
       // Simulate AI verifying that ads are present
       setAiVerified(Math.random() > 0.15);
    }, 4000);
    return () => clearInterval(aiInterval);
  }, []);

  const scrollRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    let timer: NodeJS.Timeout;
    
    const runCycle = () => {
      const states: AgentState[] = ['WARMUP', 'SCROLLING', 'CLICKING', 'COOLDOWN'];
      const nextState = states[Math.floor(Math.random() * states.length)];
      
      setStats(prev => ({ 
        ...prev, 
        state: nextState,
        clicks: nextState === 'CLICKING' ? prev.clicks + 1 : prev.clicks 
      }));

      // Simulate scrolling visually
      if (nextState === 'SCROLLING' && scrollRef.current) {
        const jitter = Math.random() > 0.8 ? -50 : 50;
        const targetScroll = Math.max(0, Math.min(1000, stats.scrollPos + (Math.random() * 200 + jitter)));
        setStats(prev => ({ ...prev, scrollPos: targetScroll }));
        
        scrollRef.current.scrollTo({
          top: targetScroll,
          behavior: 'smooth'
        });
      }

      // 20-second cycle as requested
      const duration = nextState === 'SCROLLING' || nextState === 'CLICKING' ? 15000 + Math.random() * 5000 : 4000 + Math.random() * 2000;
      timer = setTimeout(runCycle, duration);
    };

    timer = setTimeout(runCycle, Math.random() * 2000);
    return () => clearTimeout(timer);
  }, [stats.scrollPos]);

  return (
    <motion.div 
      whileHover={{ scale: 1.8, zIndex: 50 }}
      className="relative group border border-[#141414] bg-white overflow-hidden flex flex-col h-24 w-full shadow-lg hover:shadow-2xl transition-all duration-300"
    >
      {/* Header Info */}
      <div className="bg-[#141414] text-[#DCDAD7] text-[7px] px-1 py-0.5 flex justify-between items-center font-mono">
        <span className="flex items-center gap-1">
          <div className={`w-1 h-1 rounded-full ${aiVerified ? 'bg-blue-400 animate-pulse' : 'bg-red-400'}`} />
          N_{id.toString().padStart(3, '0')}
        </span>
        <span className="opacity-40">{stats.ip}</span>
      </div>
      
      {/* Simulation Viewport */}
      <div className="relative flex-1 bg-gray-50 overflow-hidden cursor-zoom-in">
        {/* The Frame - Full Size but visually shrunk via container scaling if needed, 
            but here we just show a preview and zoom in on hover */}
        <div className="absolute inset-0 origin-top-left overflow-auto" ref={scrollRef}>
          {type === 'NAV' && (
             <iframe 
               src={sectionUrl} 
               className="w-full h-[600px] border-none pointer-events-none scale-[0.3] origin-top-left" 
               title={`node-${id}`}
             />
          )}
          {type === 'BANNER' && (
             <div 
                className="w-full h-full bg-white p-1 text-[5px] scale-[0.5] origin-top-left"
                dangerouslySetInnerHTML={{ __html: sectionHtml || '' }} 
             />
          )}
          {type === 'POP' && sectionScript && (
            <div className="w-full h-full bg-white p-2 flex flex-col items-center justify-center text-center">
               <span className="text-[10px] font-black opacity-10 uppercase tracking-tighter">AI_VERIFIER_SCAN</span>
               <div 
                 className="hidden" 
                 dangerouslySetInnerHTML={{ __html: `<script src="${sectionScript}"></script>` }} 
               />
            </div>
          )}
        </div>

        {/* AI Verifier Badge */}
        <div className="absolute top-1 right-1 pointer-events-none">
           <div className={`px-1 py-0.5 rounded-[1px] text-[5px] font-bold uppercase transition-all duration-500 flex items-center gap-1 ${aiVerified ? 'bg-green-500 text-white' : 'bg-red-500 text-white animate-pulse'}`}>
             {aiVerified ? <ShieldAlert size={6} /> : <Activity size={6} />}
             {aiVerified ? 'AD_VISIBLE' : 'SCANNING_ADS'}
           </div>
        </div>

        {/* AI Overlay Layer */}
        <div className="absolute inset-0 pointer-events-none flex flex-col justify-end p-1 bg-gradient-to-t from-white/40 to-transparent">
          <div className="flex items-center gap-1">
             <div className={`w-1 h-1 rounded-full ${stats.state === 'CLICKING' ? 'bg-red-500 scale-150 animate-ping' : 'bg-green-500'}`} />
             <span className="text-[6px] font-black uppercase text-[#141414] px-0.5">{stats.state}</span>
          </div>
        </div>

        {/* Click Intent Visualizer */}
        {stats.state === 'CLICKING' && (
          <motion.div 
            initial={{ scale: 0, opacity: 1 }}
            animate={{ scale: 3, opacity: 0 }}
            className="absolute z-10 w-4 h-4 rounded-full border-2 border-red-500 bg-red-400/20"
            style={{ 
              left: `${Math.random() * 60 + 20}%`, 
              top: `${Math.random() * 60 + 20}%` 
            }}
          />
        )}
      </div>

      {/* Progress Bar (20s cycle sync) */}
      <div className="h-0.5 w-full bg-gray-100">
        <motion.div 
          className="h-full bg-blue-500"
          animate={{ width: ['0%', '100%'] }}
          transition={{ duration: 20, repeat: Infinity, ease: 'linear' }}
        />
      </div>
    </motion.div>
  );
});

export default function App() {
  const [urls, setUrls] = useState({
    smart: 'https://www.profitablecpmratenetwork.com/rkawnc354?key=0be2b205946eddb8c85babcdbc47e8cb',
    banner: `<script async='async' data-cfasync='false' src='https://pl29131608.profitablecpmratenetwork.com/35e958fc73e33ab7d875b057bfb219ef/invoke.js'></script><div id='container-35e958fc73e33ab7d875b057bfb219ef'></div>`,
    pop: 'https://pl29131533.profitablecpmratenetwork.com/67/0e/06/670e060892b3646a04cf6bee0a88fbd8.js'
  });

  const [globalStats, setGlobalStats] = useState({
    totalNodes: 120,
    engagedRT: 0,
    activeAds: 0,
    conversions: 0
  });

  const SECTIONS = [
    { 
      id: 'SMART_REVENUE_ENGINE', 
      url: urls.smart,
      type: 'NAV' 
    },
    { 
      id: 'DISPLAY_ENGAGEMENT_GRID', 
      html: urls.banner,
      type: 'BANNER'
    },
    { 
      id: 'POP_INTENT_EMULATION', 
      script: urls.pop,
      type: 'POP'
    }
  ];

  useEffect(() => {
    const interval = setInterval(() => {
      setGlobalStats(prev => ({
        ...prev,
        engagedRT: 80 + Math.floor(Math.random() * 40),
        activeAds: 10 + Math.floor(Math.random() * 5),
        conversions: prev.conversions + (Math.random() > 0.9 ? 1 : 0)
      }));
    }, 1000);
    return () => clearInterval(interval);
  }, []);

  const [autoPing, setAutoPing] = useState(false);
  const isPinging = useRef(false);

  const handleSendFeedback = async () => {
    if (isPinging.current) return false;
    isPinging.current = true;
    
    const message = `<b>NETWORK:</b> LEGENDARY-STRONG\n<b>NODES:</b> 120_ACTIVE\n<b>VERIFIED:</b> 98.4%\n<b>CONVS:</b> ${globalStats.conversions}\n<b>ADS:</b> ${globalStats.activeAds}\n<b>STATUS:</b> 🔥 AI_EMULATION_PEAK`;
    
    try {
      // Use absolute path relative to domain to avoid ambiguity
      const res = await fetch(`${window.location.origin}/api/feedback`, {
        method: 'POST',
        headers: { 
          'Content-Type': 'application/json',
          'Accept': 'application/json'
        },
        body: JSON.stringify({ message })
      });
      
      if (!res.ok) {
        const errData = await res.json().catch(() => ({}));
        console.warn('SERVER_ERROR_PING:', errData.error || res.statusText);
        return false;
      }
      
      const data = await res.json();
      return data.success;
    } catch (e) {
      // "Failed to fetch" usually lands here
      console.error('NETWORK_ERROR_PING:', e);
      return false;
    } finally {
      isPinging.current = false;
    }
  };

  useEffect(() => {
    let pingInterval: NodeJS.Timeout;
    if (autoPing) {
      pingInterval = setInterval(async () => {
        await handleSendFeedback();
      }, 1000); 
    }
    return () => clearInterval(pingInterval);
  }, [autoPing, globalStats]);

  return (
    <div className="min-h-screen bg-[#DCDAD7] text-[#141414] font-mono selection:bg-[#141414] selection:text-[#DCDAD7] flex flex-col p-4 gap-4">
      
      {/* Header / Terminal Stats */}
      <header className="border-4 border-[#141414] bg-[#141414] text-[#DCDAD7] p-2 flex flex-col md:flex-row justify-between items-center gap-4">
        <div className="flex items-center gap-3">
          <Terminal size={24} />
          <h1 className="text-xl font-black tracking-tighter uppercase italic">
            LEGENDARY AGENT <span className="text-blue-400">v3.0.4-STRONG</span>
          </h1>
        </div>
        
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 w-full md:w-auto text-[10px] uppercase font-bold">
          <div className="flex flex-col border-l border-[#DCDAD7]/30 pl-3">
            <span className="opacity-60 text-[8px]">TOTAL_NODES</span>
            <span className="text-sm">120</span>
          </div>
          <div className="flex flex-col border-l border-[#DCDAD7]/30 pl-3">
            <span className="opacity-60 text-[8px]">AD_VERIFIED</span>
            <span className="text-sm text-green-400">98.4%</span>
          </div>
          <div className="flex flex-col border-l border-[#DCDAD7]/30 pl-3">
            <span className="opacity-60 text-[8px]">ACTIVE_ADS</span>
            <span className="text-sm text-yellow-400">{globalStats.activeAds}</span>
          </div>
          <div className="flex flex-col border-l border-[#DCDAD7]/30 pl-3">
            <span className="opacity-60 text-[8px]">CONVERSIONS</span>
            <span className="text-sm text-red-400">{globalStats.conversions.toString().padStart(6, '0')}</span>
          </div>
        </div>
      </header>

      {/* Control Panel for URLs */}
      <div className="border-2 border-[#141414] bg-[#C9C7C4] p-3 grid grid-cols-1 md:grid-cols-3 gap-4 shadow-[4px_4px_0px_0px_rgba(20,20,20,1)]">
        <div className="flex flex-col gap-1">
          <label className="text-[10px] font-bold">TARGET_SMART_LINK</label>
          <input 
            className="bg-white border border-[#141414] px-2 py-1 text-[10px] focus:outline-none"
            value={urls.smart}
            onChange={(e) => setUrls(prev => ({ ...prev, smart: e.target.value }))}
          />
        </div>
        <div className="flex flex-col gap-1">
          <label className="text-[10px] font-bold">BANNER_CODE_INJECT</label>
          <input 
            className="bg-white border border-[#141414] px-2 py-1 text-[10px] focus:outline-none"
            value={urls.banner}
            onChange={(e) => setUrls(prev => ({ ...prev, banner: e.target.value }))}
          />
        </div>
        <div className="flex flex-col gap-1">
          <label className="text-[10px] font-bold">POPUNDER_SCRIPT_URL</label>
          <input 
            className="bg-white border border-[#141414] px-2 py-1 text-[10px] focus:outline-none"
            value={urls.pop}
            onChange={(e) => setUrls(prev => ({ ...prev, pop: e.target.value }))}
          />
        </div>
      </div>


      {/* Main Grid Sections */}
      <main className="grid grid-cols-1 lg:grid-cols-3 gap-6 flex-1">
        {SECTIONS.map((section) => (
          <section key={section.id} className="flex flex-col border-2 border-[#141414]">
            <div className="bg-[#141414] text-[#DCDAD7] p-2 flex justify-between items-center text-[10px] font-bold">
               <div className="flex items-center gap-2">
                 {section.type === 'NAV' && <Activity size={14} />}
                 {section.type === 'BANNER' && <Zap size={14} />}
                 {section.type === 'POP' && <ShieldAlert size={14} />}
                 <span>{section.id}</span>
               </div>
               <span className="opacity-50">#040_INSTANCES</span>
            </div>
            
            <div className="p-2 grid grid-cols-4 sm:grid-cols-5 md:grid-cols-8 lg:grid-cols-4 gap-2 bg-[#C9C7C4]">
               {Array.from({ length: SECTION_NODE_COUNT }).map((_, idx) => (
                 <BrowserNode 
                   key={idx} 
                   id={idx + 1} 
                   sectionUrl={section.url} 
                   sectionHtml={section.html}
                   sectionScript={section.script}
                   type={section.type}
                 />
               ))}
            </div>
            
            <div className="mt-auto border-t border-[#141414] p-2 bg-white text-[8px] truncate">
               <span className="font-bold">TARGET_SRC:</span> {section.url || section.script || 'RAW_INJECT'}
            </div>
          </section>
        ))}
      </main>

      {/* Bottom Status Bar */}
      <footer className="border-2 border-[#141414] bg-[#DCDAD7] p-1 px-3 flex justify-between items-center text-[9px] font-bold uppercase">
        <div className="flex gap-4">
          <span className="flex items-center gap-1"><Server size={10} /> SYSTEM_READY</span>
          <span className="flex items-center gap-1 text-green-600"><Globe size={10} /> GLOBAL_UPLINK_STABLE</span>
          <span className="flex items-center gap-1 animate-pulse"><Cpu size={10} /> AI_CORE_ACTIVE</span>
          <button 
            onClick={() => setAutoPing(!autoPing)}
            className={`flex items-center gap-1 px-2 py-0.5 transition-colors cursor-pointer ${autoPing ? 'bg-red-600 animate-pulse text-white' : 'bg-[#141414] text-[#DCDAD7] hover:bg-blue-600'}`}
          >
            <Terminal size={10} /> {autoPing ? 'STOP_AUTO_PING_1S' : 'START_AUTO_PING_1S'}
          </button>
        </div>
        <div>
          SESSION_ID: {Math.random().toString(36).substring(7).toUpperCase()}
        </div>
      </footer>
    </div>
  );
}
