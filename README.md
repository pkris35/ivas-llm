# IVAS-LLM: Visual Analytics Design Assistant

A tool that analyzes Visual Analytics system architectures using the IVAS ontological framework (Chen & Ebert, EuroVis 2019). Users provide a structured JSON description of their VA system — the tool identifies design problems automatically.

## What It Does

1. **Upload a VA system** as structured JSON (HighBlocks → IntermediateBlocks → GranularBlocks)
2. **Tool analyzes the architecture** — classifies each block, checks for structural and semantic problems
3. **Reasoning chain** — maps problems to the 24 IVAS abstract entities and builds Symptom → Cause → Remedy → Side-Effect chains shown as an interactive graph
4. **Pipeline playground** — drag-and-drop four VA components, adjust compression/distortion/cost sliders, watch cascading effects in real-time

## Prerequisites

- **Node.js** (v18 or higher) — [Download here](https://nodejs.org)
- **Python 3.9+** (only needed for Gemini API mode)

## Quick Start (Frontend Only — No API Key Needed)

```bash
git clone https://github.com/pkris35/ivas-llm.git
cd ivas-llm/react-app
npm install
npm run dev
```

Open **http://localhost:3000** in your browser. Click any example VA system, click "Analyze System." Works immediately with rule-based analysis.

## Full Stack (With Gemini API)

**Terminal 1 — Backend:**
```bash
cd ivas-llm
pip install google-genai fastapi uvicorn pydantic
python -m uvicorn backend.main:app --reload --port 8000
```

**Terminal 2 — Frontend:**
```bash
cd ivas-llm/react-app
npm install
npm run dev
```

Open **http://localhost:3000**. Click the gear icon in the header. Paste your Gemini API key (get one free at [ai.google.dev](https://ai.google.dev)). Click "Done." Now click "Analyze System" — you'll see a green bar confirming Gemini is connected.

## How To Use

1. Click an example system button (e.g., "Trajectory Query System") or paste your own JSON
2. Click **"Analyze System"**
3. **Reasoning Chain tab** — see the symptom → cause → remedy → side-effect graph. Click any node to trace its connections.
4. **Pipeline Playground tab** — drag blocks to reorder, move sliders to adjust AC/PD/Cost, watch downstream blocks update in real-time

## JSON Input Format

The tool expects VA system architectures in this schema:

```json
{
  "PaperTitle": "System Name",
  "HighBlocks": [
    {
      "HighBlockName": "Data Loading",
      "IntermediateBlocks": [
        {
          "IntermediateBlockName": "Loader",
          "GranularBlocks": [
            {
              "GranularBlockName": "Data Source",
              "ID": 1,
              "PaperDescription": "What this block does",
              "Inputs": ["What it takes in"],
              "Outputs": ["What it produces"],
              "FeedsInto": [2, 3]
            }
          ]
        }
      ]
    }
  ]
}
```

## Project Structure

```
ivas-llm/
├── backend/
│   ├── core/
│   │   ├── ontology.py      # 24 IVAS abstract entities
│   │   ├── matrices.py      # 24×24 lookup tables
│   │   ├── reasoning.py     # Builds symptom→cause→remedy→side-effect chains
│   │   └── llm.py           # Gemini API integration
│   ├── api/
│   │   └── routes.py        # FastAPI REST endpoints
│   └── main.py              # FastAPI server entry point
├── react-app/
│   ├── src/
│   │   ├── App.jsx           # Main application
│   │   ├── components/
│   │   │   ├── InputBar.jsx         # JSON input + example systems
│   │   │   ├── ReasoningGraph.jsx   # SVG node-link diagram
│   │   │   ├── PipelinePlayground.jsx # Drag-and-drop simulator
│   │   │   └── DetailPanel.jsx      # Node detail view
│   │   ├── data/
│   │   │   ├── ontology.js   # 24 entities (JS version)
│   │   │   └── matrices.js   # Lookup tables + buildChain function
│   │   └── services/
│   │       └── api.js        # JSON analyzer + API client
│   ├── package.json
│   └── index.html
└── requirements.txt
```

## Tech Stack

- **Frontend:** React, Tailwind CSS, Framer Motion
- **Backend:** FastAPI, Python
- **LLM:** Google Gemini API
- **Framework:** IVAS Ontological Framework (Chen & Ebert, EuroVis 2019)

## Based On

Chen, M. & Ebert, D.S. (2019). "An Ontological Framework for Supporting the Design and Evaluation of Visual Analytics Systems." *Computer Graphics Forum*, 38(3), 131-144.