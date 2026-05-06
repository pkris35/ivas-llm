import { useRef, useEffect, useState } from "react";
import { motion } from "framer-motion";
import { STAGES, COMPONENTS, getComp } from "../data/ontology";

export default function ReasoningGraph({ chain, selectedNode, onSelectNode }) {
  const containerRef = useRef(null);
  const [dims, setDims] = useState({ w: 800, h: 480 });

  useEffect(() => {
    if (containerRef.current) {
      const r = containerRef.current.getBoundingClientRect();
      setDims({ w: Math.max(r.width, 600), h: 480 });
    }
  }, [chain]);

  if (!chain || chain.nodes.length === 0) {
    return (
      <div ref={containerRef} className="flex items-center justify-center h-[480px]">
        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="text-center">
          <div className="text-6xl mb-4 opacity-15">&#x26d3;</div>
          <h3 className="text-xl font-display text-muted-brown">Load a VA system and analyze it</h3>
          <p className="text-sm text-muted-tan mt-2">Select an example or paste a JSON description above</p>
        </motion.div>
      </div>
    );
  }

  const stages = ["symptom", "cause", "remedy", "side_effect"];
  const { w, h } = dims;
  const colW = w / 4;
  const grouped = {};
  stages.forEach((s) => { grouped[s] = chain.nodes.filter((n) => n.stage === s); });

  const positions = {};
  stages.forEach((stage, colIdx) => {
    const items = grouped[stage];
    const x = colIdx * colW + colW / 2;
    items.forEach((node, rowIdx) => {
      const totalH = items.length * 74;
      const startY = Math.max((h - totalH) / 2, 45);
      positions[node.id] = { x, y: startY + rowIdx * 74 };
    });
  });

  const stageDelay = { symptom: 0, cause: 0.3, remedy: 0.6, side_effect: 0.9 };
  const nW = 112, nH = 48;

  return (
    <div ref={containerRef} className="w-full overflow-hidden">
      <svg width={w} height={h} className="font-mono">
        <defs>
          <marker id="arr" markerWidth="8" markerHeight="6" refX="8" refY="3" orient="auto"><polygon points="0 0, 8 3, 0 6" fill="#A0937D" /></marker>
          <marker id="arr-on" markerWidth="8" markerHeight="6" refX="8" refY="3" orient="auto"><polygon points="0 0, 8 3, 0 6" fill="#5C6B4F" /></marker>
          <filter id="glow"><feGaussianBlur stdDeviation="4" result="b" /><feMerge><feMergeNode in="b" /><feMergeNode in="SourceGraphic" /></feMerge></filter>
        </defs>

        {stages.map((stage, i) => {
          const s = STAGES[stage];
          return (
            <g key={`h-${stage}`}>
              <rect x={i * colW + 10} y={6} width={colW - 20} height={26} rx={5} fill={s.bg} stroke={s.border} strokeWidth={1} />
              <text x={i * colW + colW / 2} y={23} textAnchor="middle" fill={s.color} fontSize={11} fontWeight="600" fontFamily="DM Sans, sans-serif">
                {s.icon} {stage === "side_effect" ? "SIDE-EFFECTS" : stage.toUpperCase() + "S"}
              </text>
            </g>
          );
        })}

        {chain.edges.map((e, i) => {
          const from = positions[e.from], to = positions[e.to];
          if (!from || !to) return null;
          const active = selectedNode && (e.from === selectedNode || e.to === selectedNode);
          const faded = selectedNode && !active;
          const mx = (from.x + to.x) / 2;
          const d = `M ${from.x + nW/2 + 2} ${from.y} C ${mx} ${from.y}, ${mx} ${to.y}, ${to.x - nW/2 - 2} ${to.y}`;
          return <motion.path key={i} d={d} fill="none" stroke={active ? "#5C6B4F" : "#D5CEC5"} strokeWidth={active ? 2.5 : 1.5} markerEnd={active ? "url(#arr-on)" : "url(#arr)"} initial={{ pathLength: 0, opacity: 0 }} animate={{ pathLength: 1, opacity: faded ? 0.12 : active ? 1 : 0.5 }} transition={{ duration: 0.6, delay: 0.3 + i * 0.04 }} />;
        })}

        {chain.nodes.map((node) => {
          const pos = positions[node.id];
          if (!pos) return null;
          const s = STAGES[node.stage], comp = COMPONENTS[getComp(node.id)];
          const isSel = selectedNode === node.id;
          const isConn = selectedNode && chain.edges.some((e) => (e.from === selectedNode && e.to === node.id) || (e.to === selectedNode && e.from === node.id));
          const faded = selectedNode && !isSel && !isConn;
          const stageIdx = grouped[node.stage].findIndex((n) => n.id === node.id);

          return (
            <motion.g key={node.id} onClick={() => onSelectNode(node.id === selectedNode ? null : node.id)} style={{ cursor: "pointer" }}
              initial={{ opacity: 0, scale: 0.6 }} animate={{ opacity: faded ? 0.2 : 1, scale: 1 }}
              transition={{ type: "spring", stiffness: 200, damping: 20, delay: stageDelay[node.stage] + stageIdx * 0.08 }}>
              <rect x={pos.x - nW/2 + 2} y={pos.y - nH/2 + 2} width={nW} height={nH} rx={8} fill="rgba(0,0,0,0.04)" />
              <rect x={pos.x - nW/2} y={pos.y - nH/2} width={nW} height={nH} rx={8} fill={isSel ? s.bg : "#FAFAF7"} stroke={isSel ? s.color : comp.color} strokeWidth={isSel ? 3 : 1.5} filter={isSel ? "url(#glow)" : undefined} />
              <rect x={pos.x - nW/2} y={pos.y - nH/2} width={5} height={nH} rx={3} fill={comp.color} />
              <circle cx={pos.x - nW/2 + 16} cy={pos.y - 4} r={4.5} fill={s.color} />
              <text x={pos.x - nW/2 + 26} y={pos.y - 2} fontSize={11} fontWeight="bold" fill="#2D2D2D">{node.id.split("-").slice(0, 2).join("-")}</text>
              <text x={pos.x - nW/2 + 26} y={pos.y + 12} fontSize={9.5} fill="#7A6652">{node.id.split("-")[2]}</text>
            </motion.g>
          );
        })}
      </svg>
    </div>
  );
}
