"""
IVAS LLM Integration — JSON VA System Analysis
"""
import json
from google import genai

SYSTEM_PROMPT = """You are an expert in the IVAS (Improving Visual Analytics Systems) ontological framework by Chen & Ebert (EuroVis 2019).

You will receive a JSON description of a Visual Analytics system architecture. Your job is to analyze it and identify which IVAS abstract entities represent symptoms (problems).

The 24 entities use format "Component-Level-Measure":
- Components: Stat, Alg, Vis, Int
- Measures: AC (compression), PD (distortion/errors), Ct (cost)
- Levels: High, Low

Analyze each section:
- Many visualization blocks or overlays stacking → Vis-Low-AC
- Uncertain data without uncertainty visualization → Vis-High-PD
- No statistical aggregation stage → Stat-Low-AC
- Loader feeding directly to visualization → Stat-Low-AC
- Algorithm using approximate/heuristic methods → Alg-High-PD
- Topic modeling or embeddings → Alg-High-AC
- No interaction blocks → Int-High-AC
- No feedback loop from interaction to processing → Int-High-Ct
- NEVER use Low-PD or Low-Ct as symptoms

Respond ONLY in JSON:
{
    "symptoms": [
        {"entity": "Component-Level-Measure", "explanation": "Why this is a problem, referencing specific blocks"}
    ]
}"""


class IVASClassifier:
    def __init__(self, api_key):
        self.client = genai.Client(api_key=api_key)

    def classify(self, problem_description):
        try:
            response = self.client.models.generate_content(
                model="gemini-3-flash-preview",
                contents=f"{SYSTEM_PROMPT}\n\nVA System JSON:\n{problem_description}"
            )
            text = response.text.strip()
            if text.startswith("```"):
                lines = text.split("\n")
                text = "\n".join(lines[1:])
                if text.endswith("```"): text = text[:-3]
                text = text.strip()
            result = json.loads(text)
            validated = self._validate(result.get("symptoms", []))
            return {"symptoms": validated, "raw_response": text, "error": None}
        except json.JSONDecodeError as e:
            return {"symptoms": [], "raw_response": "", "error": f"JSON parse error: {e}"}
        except Exception as e:
            return {"symptoms": [], "raw_response": "", "error": f"LLM error: {e}"}

    def _validate(self, symptoms):
        from backend.core.ontology import ALL_ENTITY_IDS, NEVER_SYMPTOMS
        validated, seen = [], set()
        for s in symptoms:
            entity = s.get("entity", "")
            if entity not in ALL_ENTITY_IDS or entity in NEVER_SYMPTOMS or entity in seen:
                continue
            seen.add(entity)
            validated.append({"entity": entity, "explanation": s.get("explanation", "")})
        return validated