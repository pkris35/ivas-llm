/**
 * Analyzes VA system architecture JSON (HighBlocks → IntermediateBlocks → GranularBlocks)
 */

function classifyComponent(block, highBlockName, intermediateBlockName) {
  const h = (highBlockName || "").toLowerCase();
  const i = (intermediateBlockName || "").toLowerCase();
  const desc = (block.PaperDescription || "").toLowerCase();
  const name = (block.GranularBlockName || "").toLowerCase();
  if (h.includes("interaction") || i.includes("filter") || i.includes("selection")) return "Int";
  if (h.includes("visualization") || i.includes("geospatial") || i.includes("infovis") || name.includes("map") || name.includes("overlay") || name.includes("timeline") || name.includes("chart") || name.includes("heatmap") || name.includes("hexagon") || name.includes("tree") || desc.includes("visualiz") || desc.includes("display")) return "Vis";
  if (h.includes("data processing") || i.includes("query") || i.includes("index") || name.includes("retrieval") || name.includes("relevance") || name.includes("extraction") || desc.includes("comput") || desc.includes("extract") || desc.includes("filter") || desc.includes("cluster") || desc.includes("topic model") || desc.includes("bm25") || desc.includes("ranking")) return "Alg";
  if (h.includes("data loading") || i.includes("loader") || i.includes("document") || name.includes("loader") || name.includes("documentation") || desc.includes("load") || desc.includes("aggregat") || desc.includes("transform") || desc.includes("encod") || desc.includes("partition")) return "Stat";
  return "Alg";
}

function calcMaxDepth(blocks) {
  const map = {}; blocks.forEach(b => { map[b.ID || b.id] = b; });
  function dfs(id, v = new Set()) {
    if (v.has(id)) return 0; v.add(id);
    const b = map[id]; if (!b) return 0;
    const f = b.FeedsInto || b.feedsInto || [];
    return f.length === 0 ? 1 : 1 + Math.max(...f.map(fid => dfs(fid, new Set(v))));
  }
  return Math.max(...blocks.map(b => dfs(b.ID || b.id)), 0);
}

function analyzeSystemJSON(jsonStr) {
  let sys;
  try { sys = JSON.parse(jsonStr); } catch { return [{ entity: "Vis-Low-AC", explanation: "Could not parse system JSON" }]; }

  const symptoms = [];
  const blocks = [];
  const highBlocks = sys.HighBlocks || sys.highBlocks || [];

  highBlocks.forEach(hb => {
    const hName = hb.HighBlockName || hb.highBlockName || "";
    (hb.IntermediateBlocks || hb.intermediateBlocks || []).forEach(ib => {
      const iName = ib.IntermediateBlockName || ib.intermediateBlockName || "";
      (ib.GranularBlocks || ib.granularBlocks || []).forEach(gb => {
        blocks.push({ ...gb, component: classifyComponent(gb, hName, iName), highBlock: hName, intermediateBlock: iName });
      });
    });
  });

  if (blocks.length === 0) return [{ entity: "Vis-Low-AC", explanation: "No blocks found in system" }];

  const vis = blocks.filter(b => b.component === "Vis");
  const int = blocks.filter(b => b.component === "Int");
  const alg = blocks.filter(b => b.component === "Alg");
  const stat = blocks.filter(b => b.component === "Stat");

  // VIS: too many visual elements
  if (vis.length > 4) symptoms.push({ entity: "Vis-Low-AC", explanation: `${vis.length} visualization blocks (${vis.map(b => b.GranularBlockName).join(", ")}) — many simultaneous visual elements may cause clutter` });

  // VIS: overlays stacking
  const overlays = vis.filter(b => (b.GranularBlockName || "").toLowerCase().includes("overlay"));
  if (overlays.length >= 2) symptoms.push({ entity: "Vis-Low-AC", explanation: `${overlays.length} overlay layers (${overlays.map(b => b.GranularBlockName).join(", ")}) stacked on same view — visual clutter from overlapping encodings` });

  // VIS: high cognitive load from complex inputs
  vis.forEach(b => { if ((b.Inputs || []).length > 3) symptoms.push({ entity: "Vis-High-Ct", explanation: `"${b.GranularBlockName}" has ${(b.Inputs || []).length} inputs — too much information encoded in one view` }); });

  // VIS: uncertain data without uncertainty visualization
  const hasUncertain = blocks.some(b => (b.PaperDescription || "").toLowerCase().match(/uncertain|probabilistic|approximate/));
  const hasUncertainVis = vis.some(b => (b.PaperDescription || "" + b.GranularBlockName || "").toLowerCase().match(/uncertainty|confidence/));
  if (hasUncertain && !hasUncertainVis) symptoms.push({ entity: "Vis-High-PD", explanation: "System processes uncertain data but lacks explicit uncertainty visualization — users may misinterpret approximate results as precise" });

  // STAT: no aggregation
  if (stat.length === 0 && blocks.length > 5) symptoms.push({ entity: "Stat-Low-AC", explanation: `${blocks.length} blocks but no statistical aggregation stage — raw data flows to downstream components` });

  // STAT: loader feeds directly to visualization
  blocks.filter(b => b.highBlock.toLowerCase().includes("loading")).forEach(b => {
    (b.FeedsInto || b.feedsInto || []).forEach(id => {
      const target = blocks.find(bb => (bb.ID || bb.id) === id);
      if (target && target.component === "Vis") symptoms.push({ entity: "Stat-Low-AC", explanation: `"${b.GranularBlockName}" feeds directly to "${target.GranularBlockName}" without statistical processing` });
    });
  });

  // ALG: approximate/heuristic methods
  alg.forEach(b => {
    const d = (b.PaperDescription || "").toLowerCase();
    if (d.match(/approximate|heuristic|estimate/)) symptoms.push({ entity: "Alg-High-PD", explanation: `"${b.GranularBlockName}" uses approximate methods — results may contain errors` });
    if (d.match(/topic model|lda|embedding|word2vec/)) symptoms.push({ entity: "Alg-High-AC", explanation: `"${b.GranularBlockName}" uses topic modeling/embeddings — high semantic compression, nuances may be lost` });
  });

  // ALG: deep pipeline = error accumulation
  const depth = calcMaxDepth(blocks);
  if (depth > 5) symptoms.push({ entity: "Alg-High-PD", explanation: `Pipeline depth is ${depth} stages — errors can accumulate through sequential transformations` });

  // INT: no or limited interaction
  if (int.length === 0) symptoms.push({ entity: "Int-High-AC", explanation: "No interaction blocks — users cannot drill-down, filter, or explore data" });
  else if (int.length === 1) symptoms.push({ entity: "Int-High-AC", explanation: `Only 1 interaction method (${int[0].GranularBlockName}) — limited exploration capability` });

  // INT: no feedback loop to processing
  const hasLoop = int.some(b => (b.FeedsInto || b.feedsInto || []).some(id => {
    const t = blocks.find(bb => (bb.ID || bb.id) === id);
    return t && (t.component === "Alg" || t.component === "Stat");
  }));
  if (!hasLoop && int.length > 0) symptoms.push({ entity: "Int-High-Ct", explanation: "Interactions don't feed back into processing — users cannot refine analysis based on exploration" });

  // Deduplicate
  const seen = new Set();
  const unique = symptoms.filter(s => { const k = s.entity + s.explanation.slice(0, 40); if (seen.has(k)) return false; seen.add(k); return true; });
  return unique.length > 0 ? unique.slice(0, 8) : [{ entity: "Vis-Low-AC", explanation: `System has ${blocks.length} blocks — no specific issues detected` }];
}

export async function analyzeProblem(jsonInput, apiKey = null) {
  if (apiKey) {
    try {
      const res = await fetch("/api/analyze", {
        method: "POST", headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ problem: jsonInput, api_key: apiKey, min_likelihood: "possible" }),
      });
      if (res.ok) {
        const data = await res.json();
        return { symptoms: data.chain.symptoms.map(s => ({ entity: s.entity, explanation: s.explanation })), source: "backend" };
      }
    } catch (e) { console.log("Backend unavailable:", e.message); }
  }
  return new Promise(r => setTimeout(() => r({ symptoms: analyzeSystemJSON(jsonInput), source: "rules" }), 400));
}
