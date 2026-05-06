import { useState, useCallback } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { STAGES } from "./data/ontology";
import { buildChain } from "./data/matrices";
import { analyzeProblem } from "./services/api";
import InputBar from "./components/InputBar";
import ReasoningGraph from "./components/ReasoningGraph";
import PipelinePlayground from "./components/PipelinePlayground";
import DetailPanel from "./components/DetailPanel";

const TABS = [
  { id: "chain", label: "Reasoning Chain" },
  { id: "playground", label: "Pipeline Playground" },
];
const STAGE_ORDER = ["symptom", "cause", "remedy", "side_effect"];

export default function App() {
  const [chain, setChain] = useState(null);
  const [selectedNode, setSelectedNode] = useState(null);
  const [activeTab, setActiveTab] = useState("chain");
  const [isAnalyzing, setIsAnalyzing] = useState(false);
  const [systemName, setSystemName] = useState("");
  const [source, setSource] = useState(null);
  const [apiKey, setApiKey] = useState("");
  const [showSettings, setShowSettings] = useState(false);

  const handleAnalyze = useCallback(async (jsonInput) => {
    setIsAnalyzing(true);
    setSelectedNode(null);
    try {
      let sysName = "";
      try { sysName = JSON.parse(jsonInput).name || ""; } catch {}
      const result = await analyzeProblem(jsonInput, apiKey || null);
      setChain(buildChain(result.symptoms));
      setSystemName(sysName);
      setSource(result.source);
      setActiveTab("chain");
    } catch (err) {
      console.error("Analysis failed:", err);
    } finally {
      setIsAnalyzing(false);
    }
  }, [apiKey]);

  const count = (stage) => chain ? chain.nodes.filter((n) => n.stage === stage).length : 0;

  return (
    <div className="min-h-screen bg-stone-warm">

      {/* HEADER */}
      <header className="relative">
        <div className="h-[2px] bg-gradient-to-r from-olive via-muted-brown to-olive" />
        <div className="bg-charcoal">
          <div className="max-w-[1400px] mx-auto px-6 h-14 flex items-center justify-between">
            <div className="flex items-center gap-4">
              <div className="flex items-center gap-2.5">
                <div className="w-8 h-8 rounded-lg bg-olive/20 flex items-center justify-center"><span className="text-sm font-bold text-olive">IV</span></div>
                <div>
                  <h1 className="text-[15px] font-display font-bold text-stone-light leading-none tracking-wide">IVAS-LLM</h1>
                  <span className="text-[9px] text-muted-tan tracking-[0.2em] uppercase leading-none">Design Assistant</span>
                </div>
              </div>
              <div className="hidden sm:block w-px h-6 bg-charcoal-light/50" />
              <nav className="hidden sm:flex items-center gap-1">
                {TABS.map((tab) => (
                  <motion.button key={tab.id} onClick={() => setActiveTab(tab.id)}
                    className="relative px-4 py-1.5 rounded-md text-[12px] font-semibold tracking-wide cursor-pointer transition-colors duration-200"
                    style={{ color: activeTab === tab.id ? "#e8ede5" : "#A0937D" }}
                    whileHover={{ color: "#e8ede5" }} whileTap={{ scale: 0.97 }}>
                    {activeTab === tab.id && <motion.div layoutId="activeTab" className="absolute inset-0 bg-olive/25 rounded-md border border-olive/30" transition={{ type: "spring", stiffness: 400, damping: 30 }} />}
                    <span className="relative z-10">{tab.label}</span>
                  </motion.button>
                ))}
              </nav>
            </div>
            <div className="flex items-center gap-3">
              <div className={`hidden md:flex items-center gap-1.5 px-3 py-1 rounded-full text-[10px] font-medium tracking-wide ${apiKey ? "bg-olive/15 text-olive border border-olive/20" : "bg-charcoal-light/30 text-muted-tan border border-charcoal-light/30"}`}>
                <div className={`w-1.5 h-1.5 rounded-full ${apiKey ? "bg-olive animate-pulse" : "bg-muted-tan"}`} />
                {apiKey ? "Gemini Connected" : "Rule-Based Mode"}
              </div>
              <motion.button whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.95 }} onClick={() => setShowSettings(!showSettings)}
                className={`w-8 h-8 rounded-lg flex items-center justify-center text-sm cursor-pointer transition-all duration-300 ${showSettings ? "bg-olive text-stone-light rotate-90" : "bg-charcoal-light/30 text-muted-tan hover:bg-charcoal-light/50 hover:text-stone-light"}`}>
                &#x2699;
              </motion.button>
            </div>
          </div>
        </div>
      </header>

      {/* API KEY PANEL */}
      <AnimatePresence>
        {showSettings && (
          <motion.div initial={{ height: 0, opacity: 0 }} animate={{ height: "auto", opacity: 1 }} exit={{ height: 0, opacity: 0 }} transition={{ type: "spring", stiffness: 400, damping: 35 }} className="overflow-hidden">
            <div className="bg-charcoal-deep border-b border-olive/30">
              <div className="max-w-[1400px] mx-auto px-6 py-3.5 flex items-center gap-4">
                <div className="flex items-center gap-2">
                  <div className={`w-2 h-2 rounded-full ${apiKey ? "bg-olive" : "bg-muted-tan/50"}`} />
                  <span className="text-[11px] text-muted-tan whitespace-nowrap font-medium tracking-wide uppercase">API Key</span>
                </div>
                <input type="password" value={apiKey} onChange={(e) => setApiKey(e.target.value)} placeholder="Paste your Gemini API key from ai.google.dev"
                  className="flex-1 px-4 py-2 bg-charcoal border border-charcoal-light/50 rounded-lg text-stone-light text-sm font-mono outline-none focus:border-olive/60 focus:ring-1 focus:ring-olive/20 transition-all placeholder:text-charcoal-light/60" />
                <motion.button whileHover={{ scale: 1.02 }} whileTap={{ scale: 0.98 }} onClick={() => setShowSettings(false)}
                  className="px-3 py-1.5 rounded-md text-[11px] font-medium text-muted-tan hover:text-stone-light hover:bg-charcoal-light/30 transition-all cursor-pointer">Done</motion.button>
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* INPUT BAR */}
      <InputBar onAnalyze={handleAnalyze} isAnalyzing={isAnalyzing} />

      {/* CHAIN SUMMARY */}
      <AnimatePresence>
        {chain && activeTab === "chain" && (
          <motion.div initial={{ height: 0, opacity: 0 }} animate={{ height: "auto", opacity: 1 }} exit={{ height: 0, opacity: 0 }} className="flex border-b border-stone-mid overflow-hidden">
            {STAGE_ORDER.map((stage, i) => {
              const s = STAGES[stage], c = count(stage);
              return (
                <motion.div key={stage} initial={{ opacity: 0, y: -10 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: i * 0.08 }}
                  className="flex-1 flex items-center gap-3 px-4 py-3 border-r border-stone-mid last:border-r-0" style={{ background: s.bg }}>
                  <motion.span key={c} initial={{ scale: 1.5, opacity: 0 }} animate={{ scale: 1, opacity: 1 }} className="text-xl font-mono font-bold" style={{ color: s.color }}>{c}</motion.span>
                  <div>
                    <div className="text-xs font-bold" style={{ color: s.color }}>{s.label}s</div>
                    <div className="text-[10px] text-muted-tan">identified</div>
                  </div>
                  {i < 3 && <span className="ml-auto text-muted-tan text-lg">&#x2192;</span>}
                </motion.div>
              );
            })}
          </motion.div>
        )}
      </AnimatePresence>

      {/* SOURCE INDICATOR */}
      {source && chain && activeTab === "chain" && (
        <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }}
          className={`px-6 py-1.5 text-[11px] border-b border-stone-mid font-medium ${source === "backend" ? "bg-emerald-50 text-emerald-700" : "bg-amber-50 text-amber-700"}`}>
          {source === "backend"
            ? "Using Gemini API via FastAPI backend"
            : "Using rule-based JSON analyzer — start FastAPI backend + add API key for Gemini analysis"
          }
          {systemName && <span className="text-muted-tan ml-3">System: "{systemName}"</span>}
        </motion.div>
      )}

      {/* MAIN CONTENT */}
      <div className={`flex ${activeTab === "chain" ? "h-[calc(100vh-300px)]" : ""} overflow-hidden`}>
        <div className={`flex-1 overflow-auto ${activeTab === "playground" ? "p-6" : ""}`}>
          <AnimatePresence mode="wait">
            {activeTab === "chain" ? (
              <motion.div key="chain" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}>
                <ReasoningGraph chain={chain} selectedNode={selectedNode} onSelectNode={setSelectedNode} />
              </motion.div>
            ) : (
              <motion.div key="playground" initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0 }}>
                <PipelinePlayground />
              </motion.div>
            )}
          </AnimatePresence>
        </div>
        {activeTab === "chain" && (
          <div className="w-72 border-l border-stone-mid bg-stone-warm overflow-auto">
            <div className="px-4 py-3 border-b border-stone-mid"><h2 className="text-sm font-display font-bold text-charcoal">Node Details</h2></div>
            <DetailPanel chain={chain} selectedNode={selectedNode} />
          </div>
        )}
      </div>
    </div>
  );
}
