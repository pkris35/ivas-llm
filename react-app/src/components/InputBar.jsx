import { useState, useRef } from "react";
import { motion } from "framer-motion";

// Simplified examples in the professor's schema format
const EXAMPLES = {
  "Trajectory Query System": {
    PaperTitle: "Natural-language-based Visual Query of Uncertain Human Trajectories",
    HighBlocks: [
      { HighBlockName: "Data Loading", IntermediateBlocks: [
        { IntermediateBlockName: "Loader", GranularBlocks: [
          { GranularBlockName: "Mobile Trajectories", ID: 1, PaperDescription: "Loads mobile phone trajectory data with anonymized user IDs, timestamps, and base station IDs for spatially uncertain human movement.", Inputs: ["Raw mobile trajectory records"], Outputs: ["Uncertain trajectory dataset partitioned into PSR regions"], FeedsInto: [2] },
          { GranularBlockName: "POI", ID: 2, PaperDescription: "Loads POI datasets including names, types, descriptions to enrich PSRs for indexing.", Inputs: ["Raw POI datasets"], Outputs: ["Semantic context of PSRs"], FeedsInto: [3, 4] },
        ]}
      ]},
      { HighBlockName: "Data Processing", IntermediateBlocks: [
        { IntermediateBlockName: "Documentation and Indexing", GranularBlocks: [
          { GranularBlockName: "Uncertain Trajectory Documentation", ID: 3, PaperDescription: "Transforms uncertain trajectory points into text documents by encoding PSR info and related POIs.", Inputs: ["Uncertain trajectories", "PSR semantics"], Outputs: ["Trajectory documents in text database"], FeedsInto: [4] },
          { GranularBlockName: "Temporal-Textual-Trajectory Index", ID: 4, PaperDescription: "Builds temporal and textual inverted index for trajectory documents enabling keyword and time-based querying.", Inputs: ["Trajectory documents"], Outputs: ["Index for fast querying"], FeedsInto: [5, 6] },
        ]},
        { IntermediateBlockName: "Natural Language Query", GranularBlocks: [
          { GranularBlockName: "Constraint Extraction", ID: 5, PaperDescription: "Processes natural language input using lexical analysis and word embeddings to extract temporal and spatial constraints.", Inputs: ["Natural language query"], Outputs: ["Temporal and spatial constraints"], FeedsInto: [6, 13] },
          { GranularBlockName: "Relevance Quantification", ID: 6, PaperDescription: "Computes relevance using BM25 and enhances with LDA topic modeling for regional functions.", Inputs: ["Constraints", "Index"], Outputs: ["Ranked top-K POIs"], FeedsInto: [7, 13] },
          { GranularBlockName: "Trajectory Retrieval", ID: 7, PaperDescription: "Retrieves trajectory documents matching top-K POIs and temporal constraints.", Inputs: ["Ranked POIs"], Outputs: ["Ranked matching trajectories"], FeedsInto: [8, 9, 10, 11, 12, 14] },
        ]}
      ]},
      { HighBlockName: "Visualization", IntermediateBlocks: [
        { IntermediateBlockName: "Geospatial", GranularBlocks: [
          { GranularBlockName: "Map 2D", ID: 8, PaperDescription: "Displays queried trajectories and POIs as polylines and markers on a 2D map.", Inputs: ["Trajectories", "POI locations"], Outputs: ["Interactive 2D map"], FeedsInto: [15, 16] },
          { GranularBlockName: "Overlay (Heatmap)", ID: 9, PaperDescription: "Displays heatmap overlay of trajectory density distribution.", Inputs: ["Trajectory density"], Outputs: ["Heatmap overlay"], FeedsInto: [8] },
          { GranularBlockName: "Overlay (Trajectories)", ID: 10, PaperDescription: "Overlays individual trajectories as polylines on map.", Inputs: ["Trajectories"], Outputs: ["Trajectory polylines"], FeedsInto: [8] },
          { GranularBlockName: "Overlay (POIs)", ID: 11, PaperDescription: "Displays POIs as markers on map view.", Inputs: ["POI locations"], Outputs: ["POI markers"], FeedsInto: [8] },
        ]},
        { IntermediateBlockName: "Infovis", GranularBlocks: [
          { GranularBlockName: "Timeline", ID: 12, PaperDescription: "Visualizes temporal aspects of trajectories on a timeline with zoom.", Inputs: ["Timestamps", "Temporal metadata"], Outputs: ["Interactive timeline"], FeedsInto: [15] },
          { GranularBlockName: "Relevance Tree", ID: 13, PaperDescription: "Displays spatial constraint keywords and POI relevance in hierarchical tree.", Inputs: ["Keywords", "Relevance scores"], Outputs: ["Relevance tree"], FeedsInto: [] },
          { GranularBlockName: "Topic Hexagon", ID: 14, PaperDescription: "Displays trajectories projected into region functional topic space using LDA.", Inputs: ["Trajectory topic data"], Outputs: ["Topic space projection"], FeedsInto: [] },
        ]}
      ]},
      { HighBlockName: "Interaction", IntermediateBlocks: [
        { IntermediateBlockName: "Filter", GranularBlocks: [
          { GranularBlockName: "Temporal Selection", ID: 15, PaperDescription: "Filter trajectories by specific time periods.", Inputs: ["User time period"], Outputs: ["Filtered trajectories"], FeedsInto: [7] },
          { GranularBlockName: "Area Selection", ID: 16, PaperDescription: "Draw regions on map to filter trajectories passing through selected areas.", Inputs: ["User region"], Outputs: ["Filtered trajectories"], FeedsInto: [7] },
        ]}
      ]}
    ]
  },

  "Simple Dashboard": {
    PaperTitle: "ICU Patient Monitoring Dashboard",
    HighBlocks: [
      { HighBlockName: "Data Loading", IntermediateBlocks: [
        { IntermediateBlockName: "Loader", GranularBlocks: [
          { GranularBlockName: "Patient Vitals Stream", ID: 1, PaperDescription: "Loads real-time vital signs from 50 ICU patients, each with 20 sensor readings updated every second.", Inputs: ["Real-time sensor data (50 patients x 20 vitals)"], Outputs: ["Raw vital sign stream (1000 data points/sec)"], FeedsInto: [2, 3] },
        ]}
      ]},
      { HighBlockName: "Visualization", IntermediateBlocks: [
        { IntermediateBlockName: "Geospatial", GranularBlocks: [
          { GranularBlockName: "Patient Grid", ID: 2, PaperDescription: "Displays all 50 patients as individual line charts in a grid layout showing all 20 vital signs simultaneously.", Inputs: ["Raw vital sign stream"], Outputs: ["50 x 20 line chart grid"], FeedsInto: [] },
          { GranularBlockName: "Alert Overlay", ID: 3, PaperDescription: "Displays critical alerts as red flashing indicators overlaid on patient charts when vitals exceed thresholds.", Inputs: ["Raw vital sign stream", "Threshold values"], Outputs: ["Alert indicators on charts"], FeedsInto: [2] },
        ]}
      ]}
    ]
  },
};

export default function InputBar({ onAnalyze, isAnalyzing }) {
  const [jsonInput, setJsonInput] = useState("");
  const [error, setError] = useState(null);
  const fileRef = useRef(null);

  const handleSubmit = () => {
    if (!jsonInput.trim() || isAnalyzing) return;
    try { JSON.parse(jsonInput); setError(null); onAnalyze(jsonInput.trim()); }
    catch { setError("Invalid JSON — check your syntax"); }
  };

  const loadExample = (name) => {
    setJsonInput(JSON.stringify(EXAMPLES[name], null, 2));
    setError(null);
  };

  const handleFileUpload = (e) => {
    const file = e.target.files[0];
    if (!file) return;
    const reader = new FileReader();
    reader.onload = (ev) => {
      try {
        const parsed = JSON.parse(ev.target.result);
        setJsonInput(JSON.stringify(parsed, null, 2));
        setError(null);
      } catch { setError("File does not contain valid JSON"); }
    };
    reader.readAsText(file);
  };

  const lineCount = jsonInput ? jsonInput.split("\n").length : 0;

  return (
    <div className="bg-stone-light border-b border-stone-mid px-6 py-4">
      {/* Top row: examples + upload */}
      <div className="flex gap-2 mb-3 flex-wrap items-center">
        <span className="text-xs text-muted-tan font-medium mr-1">Load example:</span>
        {Object.keys(EXAMPLES).map((name, i) => (
          <motion.button key={name} onClick={() => loadExample(name)}
            initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: i * 0.05 }}
            whileHover={{ scale: 1.03, backgroundColor: "#E8E0D5" }}
            className="px-3 py-1.5 bg-stone-warm border border-stone-mid rounded-full text-xs text-muted-brown font-body cursor-pointer transition-colors">
            {name}
          </motion.button>
        ))}
        <div className="w-px h-5 bg-stone-mid mx-1" />
        <motion.button whileHover={{ scale: 1.03 }} onClick={() => fileRef.current?.click()}
          className="px-3 py-1.5 bg-stone-warm border border-olive/30 rounded-full text-xs text-olive font-body cursor-pointer hover:bg-olive/10 transition-colors font-medium">
          Upload JSON file
        </motion.button>
        <input ref={fileRef} type="file" accept=".json" className="hidden" onChange={handleFileUpload} />
      </div>

      {/* JSON input + analyze button */}
      <div className="flex gap-3">
        <div className="flex-1 relative">
          <textarea
            value={jsonInput}
            onChange={(e) => { setJsonInput(e.target.value); setError(null); }}
            placeholder='Paste your VA system JSON here (HighBlocks → IntermediateBlocks → GranularBlocks schema)...'
            rows={10}
            spellCheck={false}
            className={`w-full px-4 py-3 rounded-lg text-[11px] font-mono leading-relaxed bg-stone-warm border-2 outline-none transition-all duration-200 text-charcoal placeholder:text-muted-tan/40 resize-y ${
              error ? "border-red-400" : "border-stone-dark focus:border-olive focus:shadow-md focus:shadow-olive/10"
            }`}
          />
          {error && (
            <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }}
              className="absolute bottom-3 left-3 text-xs text-red-600 bg-red-50 px-2 py-1 rounded">
              {error}
            </motion.div>
          )}
          {jsonInput && (
            <div className="absolute top-2 right-3 text-[10px] text-muted-tan">
              {lineCount} lines
            </div>
          )}
        </div>

        <div className="flex flex-col gap-2 w-40">
          <motion.button onClick={handleSubmit} disabled={isAnalyzing || !jsonInput.trim()}
            whileHover={{ scale: 1.02 }} whileTap={{ scale: 0.98 }}
            className={`flex-1 rounded-lg text-sm font-bold font-body tracking-wide transition-all duration-200 ${
              isAnalyzing || !jsonInput.trim()
                ? "bg-muted-tan/50 text-stone-light cursor-not-allowed"
                : "bg-olive text-stone-light hover:bg-olive-light cursor-pointer shadow-md shadow-olive/20"
            }`}>
            {isAnalyzing ? (
              <motion.span animate={{ opacity: [1, 0.5, 1] }} transition={{ repeat: Infinity, duration: 1.2 }}>Analyzing...</motion.span>
            ) : "Analyze System"}
          </motion.button>

          <div className="text-[10px] text-muted-tan leading-relaxed px-1">
            Upload or paste a VA system architecture JSON. The analyzer identifies symptoms using the IVAS framework's 24 abstract entities.
          </div>

          {jsonInput && (
            <button onClick={() => { setJsonInput(""); setError(null); }}
              className="text-[10px] text-muted-tan hover:text-charcoal transition-colors cursor-pointer underline">
              Clear
            </button>
          )}
        </div>
      </div>
    </div>
  );
}
