import { motion, AnimatePresence } from "framer-motion";
import { STAGES, COMPONENTS, ENTITY_DESC, getComp } from "../data/ontology";

export default function DetailPanel({ chain, selectedNode }) {
  if (!chain || !selectedNode) {
    return (
      <div className="flex flex-col items-center justify-center h-48 text-muted-tan">
        <div className="text-3xl opacity-20 mb-2">&#x261D;</div>
        <p className="text-sm">Click a node to see details</p>
      </div>
    );
  }

  const node = chain.nodes.find((n) => n.id === selectedNode);
  if (!node) return null;
  const s = STAGES[node.stage], comp = COMPONENTS[getComp(node.id)];
  const incoming = chain.edges.filter((e) => e.to === selectedNode);
  const outgoing = chain.edges.filter((e) => e.from === selectedNode);

  return (
    <AnimatePresence mode="wait">
      <motion.div key={selectedNode} initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: -20 }} transition={{ type: "spring", stiffness: 300, damping: 30 }} className="p-4">
        <div className="rounded-xl p-4 mb-4 border" style={{ background: s.bg, borderColor: s.border }}>
          <span className="inline-block text-[10px] font-bold tracking-wider px-2.5 py-0.5 rounded-full bg-white mb-2" style={{ color: s.color }}>{s.icon} {s.label.toUpperCase()}</span>
          <h3 className="text-lg font-display font-bold text-charcoal">{node.id}</h3>
          <span className="inline-block text-[10px] text-white px-2 py-0.5 rounded mt-1 mb-3" style={{ background: comp.color }}>{comp.name}</span>
          <p className="text-sm text-charcoal-light leading-relaxed">{ENTITY_DESC[node.id]}</p>
          {node.explanation && <div className="text-xs text-olive italic mt-3 pt-3 border-t" style={{ borderColor: s.border }}>{node.explanation}</div>}
        </div>

        {incoming.length > 0 && (
          <div className="mb-4">
            <h4 className="text-[11px] font-bold text-muted-brown tracking-wider mb-2">INCOMING ({incoming.length})</h4>
            {incoming.map((edge, i) => {
              const fn = chain.nodes.find((n) => n.id === edge.from);
              const fs = fn ? STAGES[fn.stage] : STAGES.cause;
              return <motion.div key={i} initial={{ opacity: 0, x: -10 }} animate={{ opacity: 1, x: 0 }} transition={{ delay: i * 0.05 }} className="text-xs font-mono font-medium text-charcoal-light py-1.5 px-3 bg-stone-light rounded-md mb-1.5 border-l-[3px]" style={{ borderColor: fs.color }}>{edge.from}</motion.div>;
            })}
          </div>
        )}

        {outgoing.length > 0 && (
          <div className="mb-4">
            <h4 className="text-[11px] font-bold text-muted-brown tracking-wider mb-2">OUTGOING ({outgoing.length})</h4>
            {outgoing.map((edge, i) => {
              const tn = chain.nodes.find((n) => n.id === edge.to);
              const ts = tn ? STAGES[tn.stage] : STAGES.cause;
              return <motion.div key={i} initial={{ opacity: 0, x: 10 }} animate={{ opacity: 1, x: 0 }} transition={{ delay: i * 0.05 }} className="text-xs font-mono font-medium text-charcoal-light py-1.5 px-3 bg-stone-light rounded-md mb-1.5 border-l-[3px]" style={{ borderColor: ts.color }}>{edge.to}</motion.div>;
            })}
          </div>
        )}

        <div className="pt-4 border-t border-stone-mid">
          <h4 className="text-[10px] font-bold text-muted-tan tracking-wider mb-3">LEGEND</h4>
          <div className="space-y-1.5 mb-3">
            {Object.entries(STAGES).map(([k, stg]) => (
              <div key={k} className="flex items-center gap-2"><div className="w-2.5 h-2.5 rounded-full" style={{ background: stg.color }} /><span className="text-[11px] text-charcoal-light">{stg.label}</span></div>
            ))}
          </div>
          <div className="space-y-1.5">
            {Object.entries(COMPONENTS).map(([k, c]) => (
              <div key={k} className="flex items-center gap-2"><div className="w-2.5 h-2.5 rounded-sm" style={{ background: c.color }} /><span className="text-[11px] text-charcoal-light">{c.name}</span></div>
            ))}
          </div>
        </div>
      </motion.div>
    </AnimatePresence>
  );
}
