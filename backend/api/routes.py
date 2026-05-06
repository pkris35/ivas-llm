from fastapi import APIRouter, HTTPException
from pydantic import BaseModel
from typing import List, Optional
from backend.core.llm import IVASClassifier
from backend.core.reasoning import build_reasoning_chain
from backend.core.ontology import get_all_entities, get_entity_info, ALL_ENTITY_IDS
from backend.core.matrices import get_full_matrix

router = APIRouter()

class AnalyzeRequest(BaseModel):
    problem: str
    api_key: str
    min_likelihood: str = "possible"

@router.get("/entities")
def list_entities():
    return {"entities": get_all_entities(), "total": len(ALL_ENTITY_IDS)}

@router.get("/matrices/{matrix_name}")
def get_matrix(matrix_name: str):
    valid = ["symptom_cause", "cause_remedy", "remedy_side_effect"]
    if matrix_name not in valid: raise HTTPException(400, f"Must be one of: {valid}")
    return {"matrix": get_full_matrix(matrix_name), "name": matrix_name}

@router.post("/analyze")
def analyze_problem(request: AnalyzeRequest):
    if len(request.problem.strip()) < 10: raise HTTPException(400, "Input too short")
    classifier = IVASClassifier(api_key=request.api_key)
    llm_result = classifier.classify(request.problem)
    if llm_result["error"]: raise HTTPException(500, llm_result["error"])
    if not llm_result["symptoms"]: raise HTTPException(422, "No symptoms identified")
    chain = build_reasoning_chain(llm_result["symptoms"], iteration=1, min_likelihood=request.min_likelihood)
    return {"problem": request.problem, "chain": chain.to_dict(), "llm_raw": llm_result["raw_response"]}

@router.get("/health")
def health(): return {"status": "ok", "entities": len(ALL_ENTITY_IDS)}
