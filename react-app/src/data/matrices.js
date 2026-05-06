export const SYMPTOM_CAUSE = {
  "Vis-Low-AC":   ["Stat-Low-AC", "Alg-Low-AC"],
  "Vis-High-PD":  ["Vis-Low-AC", "Alg-High-PD", "Stat-High-PD"],
  "Vis-High-Ct":  ["Vis-Low-AC", "Stat-Low-AC"],
  "Int-High-PD":  ["Int-High-AC", "Vis-High-PD"],
  "Int-High-Ct":  ["Vis-Low-AC", "Vis-High-PD", "Int-Low-AC"],
  "Alg-High-PD":  ["Stat-High-PD", "Alg-High-AC", "Stat-Low-AC"],
  "Alg-High-Ct":  ["Alg-Low-AC", "Stat-Low-AC"],
  "Stat-High-PD": ["Stat-High-AC"],
  "Stat-Low-AC":  ["Int-High-AC"],
  "Alg-Low-AC":   ["Int-High-AC"],
  "Int-High-AC":  ["Vis-High-Ct"],
  "Alg-High-AC":  ["Stat-Low-AC"],
};
export const CAUSE_REMEDY = {
  "Stat-Low-AC":  ["Stat-High-AC"],
  "Alg-Low-AC":   ["Alg-High-AC"],
  "Vis-Low-AC":   ["Stat-High-AC", "Alg-High-AC", "Vis-High-AC"],
  "Stat-High-AC": ["Int-Low-AC"],
  "Alg-High-AC":  ["Int-Low-AC"],
  "Alg-High-PD":  ["Alg-Low-PD", "Int-Low-AC"],
  "Stat-High-PD": ["Stat-Low-PD", "Int-Low-AC"],
  "Vis-High-PD":  ["Vis-Low-PD", "Vis-High-AC"],
  "Int-High-AC":  ["Int-Low-AC"],
  "Int-Low-AC":   ["Int-High-AC"],
  "Int-High-Ct":  ["Int-Low-Ct", "Vis-High-AC"],
  "Vis-High-Ct":  ["Vis-High-AC"],
};
export const REMEDY_SIDE = {
  "Stat-High-AC": ["Stat-High-PD"],
  "Alg-High-AC":  ["Alg-High-PD"],
  "Vis-High-AC":  ["Vis-High-PD"],
  "Int-Low-AC":   ["Int-High-Ct"],
  "Stat-Low-PD":  ["Stat-Low-AC"],
  "Alg-Low-PD":   ["Alg-High-Ct"],
  "Vis-Low-PD":   ["Vis-High-Ct"],
  "Int-High-AC":  ["Int-High-PD"],
};
export function buildChain(symptoms) {
  const nodes = [], edges = [], seen = new Set();
  symptoms.forEach((s) => { if (!seen.has(s.entity)) { seen.add(s.entity); nodes.push({ id: s.entity, stage: "symptom", explanation: s.explanation }); } });
  const causes = [];
  symptoms.forEach((s) => { (SYMPTOM_CAUSE[s.entity] || []).forEach((c) => { if (!seen.has(c)) { seen.add(c); nodes.push({ id: c, stage: "cause" }); } causes.push(c); edges.push({ from: s.entity, to: c }); }); });
  const remedies = [];
  [...new Set(causes)].forEach((c) => { (CAUSE_REMEDY[c] || []).forEach((r) => { if (!seen.has(r)) { seen.add(r); nodes.push({ id: r, stage: "remedy" }); } remedies.push(r); edges.push({ from: c, to: r }); }); });
  [...new Set(remedies)].forEach((r) => { (REMEDY_SIDE[r] || []).forEach((se) => { if (!seen.has(se)) { seen.add(se); nodes.push({ id: se, stage: "side_effect" }); } edges.push({ from: r, to: se }); }); });
  return { nodes, edges };
}
