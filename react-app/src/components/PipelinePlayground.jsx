import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { COMPONENTS } from "../data/ontology";

const DEFAULTS = [
  { id: "Stat", name: "Statistics", ac: 50, pd: 20, ct: 30 },
  { id: "Alg",  name: "Algorithm",  ac: 40, pd: 30, ct: 40 },
  { id: "Vis",  name: "Visualization", ac: 60, pd: 25, ct: 35 },
  { id: "Int",  name: "Interaction",   ac: 30, pd: 15, ct: 50 },
];
const SLIDERS = [
  { key: "ac", label: "AC", full: "Compression", color: "#5C6B4F", css: "slider-ac" },
  { key: "pd", label: "PD", full: "Distortion",  color: "#B91C1C", css: "slider-pd" },
  { key: "ct", label: "Ct", full: "Cost",         color: "#D97706", css: "slider-ct" },
];

export default function PipelinePlayground() {
  const [pipeline, setPipeline] = useState(DEFAULTS);
  const [dragIdx, setDragIdx] = useState(null);
  const [overId, setOverId] = useState(null);

  const update = (idx, key, val) => { const items = [...pipeline]; items[idx] = { ...items[idx], [key]: parseInt(val) }; setPipeline(items); };
  const handleDragStart = (idx) => setDragIdx(idx);
  const handleDragOver = (e, idx) => { e.preventDefault(); setOverId(idx); };
  const handleDrop = (idx) => { if (dragIdx === null || dragIdx === idx) return; const items = [...pipeline]; const d = items.splice(dragIdx, 1)[0]; items.splice(idx, 0, d); setPipeline(items); setDragIdx(null); setOverId(null); };
  const handleDragEnd = () => { setDragIdx(null); setOverId(null); };

  const cascaded = pipeline.map((b, i) => {
    let eAC = b.ac, ePD = b.pd, eCt = b.ct;
    if (i > 0) {
      const prev = pipeline[i - 1];
      ePD = Math.min(100, Math.round(b.pd + (prev.ac > 60 ? (prev.ac - 60) * 0.3 : 0)));
      eCt = Math.max(0, Math.round(b.ct - (prev.ac > 50 ? (prev.ac - 50) * 0.2 : 0) + (prev.pd > 50 ? (prev.pd - 50) * 0.15 : 0)));
    }
    return { ...b, eAC, ePD, eCt, benefit: eAC - ePD, cost: Math.max(eCt, 1), ratio: (eAC - ePD) / Math.max(eCt, 1) };
  });

  const totB = cascaded.reduce((s, b) => s + b.benefit, 0);
  const totC = cascaded.reduce((s, b) => s + b.cost, 0);
  const totR = totC > 0 ? (totB / totC).toFixed(2) : "inf";

  return (
    <div>
      <div className="grid grid-cols-4 gap-3 mb-6">
        {[
          { label: "Total Benefit", sub: "AC - PD", value: totB, color: totB > 0 ? "#047857" : "#B91C1C" },
          { label: "Total Cost", sub: "Sum Ct", value: totC, color: "#D97706" },
          { label: "Ratio", sub: "Benefit / Cost", value: totR, color: "#2D2D2D" },
        ].map((m) => (
          <motion.div key={m.label} layout className="bg-stone-light border border-stone-mid rounded-xl p-4 text-center">
            <motion.span key={m.value} initial={{ opacity: 0, y: -8 }} animate={{ opacity: 1, y: 0 }} className="font-mono font-bold text-2xl block" style={{ color: m.color }}>{m.value}</motion.span>
            <div className="text-xs text-muted-brown mt-1 font-medium">{m.label}</div>
            <div className="text-[10px] text-muted-tan">{m.sub}</div>
          </motion.div>
        ))}
        <motion.button whileHover={{ scale: 1.03 }} whileTap={{ scale: 0.97 }} onClick={() => setPipeline(DEFAULTS)}
          className="bg-stone-warm border border-stone-mid rounded-xl flex items-center justify-center text-sm text-muted-brown hover:bg-stone-mid transition-colors cursor-pointer font-medium">
          Reset
        </motion.button>
      </div>

      <div className="flex gap-2 items-stretch">
        {cascaded.map((block, idx) => {
          const comp = COMPONENTS[block.id];
          return (
            <div key={block.id + idx} className="flex items-center flex-1">
              <motion.div draggable onDragStart={() => handleDragStart(idx)} onDragOver={(e) => handleDragOver(e, idx)} onDrop={() => handleDrop(idx)} onDragEnd={handleDragEnd}
                layout initial={{ opacity: 0, y: 20 }} animate={{ opacity: dragIdx === idx ? 0.4 : 1, y: 0 }} transition={{ type: "spring", stiffness: 200, damping: 25, delay: idx * 0.08 }}
                className={`flex-1 rounded-xl p-4 cursor-grab active:cursor-grabbing transition-all duration-200 ${overId === idx ? "bg-stone-mid border-2 border-olive shadow-lg" : "bg-stone-warm border-2 border-stone-mid hover:border-stone-dark"}`}>
                <div className="pb-3 mb-4" style={{ borderBottom: `3px solid ${comp.color}` }}>
                  <div className="flex justify-between items-center">
                    <span className="text-[10px] text-muted-tan font-mono tracking-widest">STEP {idx + 1}</span>
                    <div className="w-2.5 h-2.5 rounded-full" style={{ background: comp.color }} />
                  </div>
                  <div className="text-base font-display font-bold text-charcoal mt-1">{block.name}</div>
                </div>
                {SLIDERS.map((s) => {
                  const eff = s.key === "ac" ? block.eAC : s.key === "pd" ? block.ePD : block.eCt;
                  const changed = block[s.key] !== eff;
                  return (
                    <div key={s.key} className="mb-3">
                      <div className="flex justify-between items-center mb-1">
                        <span className="text-[11px] text-muted-brown font-medium">{s.label} <span className="text-muted-tan font-normal">({s.full})</span></span>
                        <span className="text-xs font-mono font-bold" style={{ color: s.color }}>{block[s.key]}</span>
                      </div>
                      <input type="range" min="0" max="100" value={block[s.key]} onChange={(e) => update(idx, s.key, e.target.value)} className={`w-full ${s.css}`} />
                      <AnimatePresence>{changed && (
                        <motion.div initial={{ opacity: 0, height: 0 }} animate={{ opacity: 1, height: "auto" }} exit={{ opacity: 0, height: 0 }} className="text-[10px] mt-0.5 font-medium" style={{ color: s.color }}>
                          Effective: {eff} <span className="text-muted-tan">(cascaded)</span>
                        </motion.div>
                      )}</AnimatePresence>
                    </div>
                  );
                })}
                <motion.div layout className={`mt-3 p-2.5 rounded-lg text-center border ${block.ratio > 0 ? "bg-emerald-50 border-emerald-200" : block.ratio === 0 ? "bg-stone-light border-stone-mid" : "bg-red-50 border-red-200"}`}>
                  <div className="text-[10px] text-muted-tan font-mono">({block.eAC} - {block.ePD}) / {block.eCt}</div>
                  <div className={`text-lg font-mono font-bold ${block.ratio > 0 ? "text-emerald-700" : block.ratio === 0 ? "text-muted-brown" : "text-red-700"}`}>{block.ratio.toFixed(2)}</div>
                </motion.div>
              </motion.div>
              {idx < cascaded.length - 1 && (
                <div className="px-1 flex flex-col items-center text-muted-tan">
                  <motion.span animate={{ x: [0, 3, 0] }} transition={{ repeat: Infinity, duration: 2, delay: idx * 0.3 }} className="text-xl">&#x2192;</motion.span>
                  <span className="text-[8px]">data</span>
                </div>
              )}
            </div>
          );
        })}
      </div>

      <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: 0.5 }} className="mt-5 p-4 bg-stone-light rounded-xl border-l-4 border-olive">
        <p className="text-sm text-charcoal leading-relaxed">
          <strong className="text-olive">How to use:</strong>{" "}
          <strong>Drag</strong> blocks to reorder. <strong>Adjust sliders</strong> to change measures.
          Watch how changes <strong>cascade</strong> downstream.
          Formula: <code className="font-mono bg-stone-mid px-1.5 py-0.5 rounded text-xs">Ratio = (AC - PD) / Ct</code>
        </p>
      </motion.div>
    </div>
  );
}
