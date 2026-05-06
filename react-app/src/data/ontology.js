export const COMPONENTS = {
  Stat: { name: "Statistics", color: "#5C6B4F", light: "#e8ede5" },
  Alg:  { name: "Algorithm",  color: "#4A4A4A", light: "#e8e8e8" },
  Vis:  { name: "Visualization", color: "#7A6652", light: "#ede8e2" },
  Int:  { name: "Interaction",   color: "#6B6B6B", light: "#ebebeb" },
};
export const ENTITY_DESC = {
  "Stat-High-AC": "Aggressive statistical aggregation — heavy averaging, binning",
  "Stat-Low-AC":  "No statistical aggregation — raw data passes through",
  "Stat-High-PD": "Aggregation introduces errors — hides patterns/outliers",
  "Stat-Low-PD":  "Statistics are accurate and faithful",
  "Stat-High-Ct": "Statistical processing is expensive/slow",
  "Stat-Low-Ct":  "Statistical processing is fast and cheap",
  "Alg-High-AC":  "Aggressive filtering/clustering/ML — removes much detail",
  "Alg-Low-AC":   "Minimal algorithmic filtering — data passes through",
  "Alg-High-PD":  "Algorithm errors — wrong clusters, missed anomalies",
  "Alg-Low-PD":   "Algorithm is accurate and reliable",
  "Alg-High-Ct":  "Algorithm is slow or resource-intensive",
  "Alg-Low-Ct":   "Algorithm is fast and lightweight",
  "Vis-High-AC":  "Summary visualization — overview, glyphs, aggregated charts",
  "Vis-Low-AC":   "Raw data visualization — cluttered, many marks on screen",
  "Vis-High-PD":  "Visualization misleads — bad colors, occlusion, deceptive scales",
  "Vis-Low-PD":   "Visualization is accurate and readable",
  "Vis-High-Ct":  "Visualization has high cognitive load — slow to comprehend",
  "Vis-Low-Ct":   "Visualization is intuitive and quick to read",
  "Int-High-AC":  "Interaction hides detail — collapsed menus, heavy filtering",
  "Int-Low-AC":   "Interaction reveals detail — drill-down, details-on-demand",
  "Int-High-PD":  "Interaction causes errors — confusing controls, wrong selections",
  "Int-Low-PD":   "Interaction is precise and reliable",
  "Int-High-Ct":  "Too many clicks, slow response, complex multi-step workflow",
  "Int-Low-Ct":   "Interactions are quick and effortless",
};
export const STAGES = {
  symptom:     { color: "#B91C1C", bg: "#FEF2F2", border: "#FECACA", label: "Symptom",     icon: "S" },
  cause:       { color: "#1D4ED8", bg: "#EFF6FF", border: "#BFDBFE", label: "Cause",       icon: "C" },
  remedy:      { color: "#047857", bg: "#ECFDF5", border: "#A7F3D0", label: "Remedy",      icon: "R" },
  side_effect: { color: "#D97706", bg: "#FFFBEB", border: "#FDE68A", label: "Side-Effect", icon: "!" },
};
export const getComp = (id) => id.split("-")[0];
export const getCompColor = (id) => COMPONENTS[getComp(id)]?.color || "#666";
