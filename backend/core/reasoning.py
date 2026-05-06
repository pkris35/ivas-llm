from backend.core.ontology import get_entity_info
from backend.core.matrices import get_causes, get_remedies, get_side_effects

class ReasoningChain:
    def __init__(self, iteration=1):
        self.iteration = iteration
        self.symptoms = []; self.causes = []; self.remedies = []; self.side_effects = []; self.edges = []
    def to_dict(self):
        return {"iteration": self.iteration, "symptoms": self.symptoms, "causes": self.causes,
                "remedies": self.remedies, "side_effects": self.side_effects, "edges": self.edges,
                "metrics": self._metrics()}
    def _metrics(self):
        b = sum(3 if "Low-PD" in r["entity"] or "Low-Ct" in r["entity"] else 2 if "High-AC" in r["entity"] else 1 for r in self.remedies)
        c = sum(3 if "High-PD" in se["entity"] else 2 if "High-Ct" in se["entity"] else 1 for se in self.side_effects)
        return {"benefit": b, "cost": c, "ratio": round(b/c, 2) if c > 0 else "inf"}

def build_reasoning_chain(symptom_entities, iteration=1, min_likelihood="possible"):
    chain = ReasoningChain(iteration)
    seen_c, seen_r, seen_se = set(), set(), set()
    for s in symptom_entities:
        info = get_entity_info(s["entity"])
        chain.symptoms.append({**s, "description": info["description"], "component": info["component"], "component_color": info["component_color"], "stage": "symptom"})
    for sym in chain.symptoms:
        for cause in get_causes(sym["entity"], min_likelihood):
            cid = cause["entity"]
            if cid not in seen_c:
                seen_c.add(cid); info = get_entity_info(cid)
                chain.causes.append({"entity": cid, "likelihood": cause["likelihood"], "description": info["description"], "component": info["component"], "component_color": info["component_color"], "stage": "cause"})
            chain.edges.append({"from": sym["entity"], "to": cid, "type": "symptom_to_cause", "likelihood": cause["likelihood"]})
    for c in chain.causes:
        for rem in get_remedies(c["entity"], min_likelihood):
            rid = rem["entity"]
            if rid not in seen_r:
                seen_r.add(rid); info = get_entity_info(rid)
                chain.remedies.append({"entity": rid, "likelihood": rem["likelihood"], "description": info["description"], "component": info["component"], "component_color": info["component_color"], "stage": "remedy"})
            chain.edges.append({"from": c["entity"], "to": rid, "type": "cause_to_remedy", "likelihood": rem["likelihood"]})
    for r in chain.remedies:
        for eff in get_side_effects(r["entity"], min_likelihood):
            eid = eff["entity"]
            if eid not in seen_se:
                seen_se.add(eid); info = get_entity_info(eid)
                chain.side_effects.append({"entity": eid, "likelihood": eff["likelihood"], "description": info["description"], "component": info["component"], "component_color": info["component_color"], "stage": "side_effect"})
            chain.edges.append({"from": r["entity"], "to": eid, "type": "remedy_to_side_effect", "likelihood": eff["likelihood"]})
    return chain
