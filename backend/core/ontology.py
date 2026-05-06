COMPONENTS = ["Stat", "Alg", "Vis", "Int"]
MEASURES = ["AC", "PD", "Ct"]
LEVELS = ["High", "Low"]

ALL_ENTITY_IDS = [f"{c}-{l}-{m}" for c in COMPONENTS for m in MEASURES for l in LEVELS]

ENTITY_DESCRIPTIONS = {
    "Stat-High-AC": "Aggressive statistical aggregation", "Stat-Low-AC": "No statistical aggregation",
    "Stat-High-PD": "Statistics introduce errors", "Stat-Low-PD": "Statistics are accurate",
    "Stat-High-Ct": "Statistics are expensive", "Stat-Low-Ct": "Statistics are cheap",
    "Alg-High-AC": "Aggressive algorithmic filtering", "Alg-Low-AC": "No algorithmic filtering",
    "Alg-High-PD": "Algorithm produces errors", "Alg-Low-PD": "Algorithm is accurate",
    "Alg-High-Ct": "Algorithm is expensive", "Alg-Low-Ct": "Algorithm is cheap",
    "Vis-High-AC": "Summary visualization", "Vis-Low-AC": "Raw data visualization — cluttered",
    "Vis-High-PD": "Visualization misleads", "Vis-Low-PD": "Visualization is accurate",
    "Vis-High-Ct": "High cognitive load", "Vis-Low-Ct": "Easy to read",
    "Int-High-AC": "Interaction hides detail", "Int-Low-AC": "Interaction reveals detail",
    "Int-High-PD": "Interaction causes errors", "Int-Low-PD": "Interaction is precise",
    "Int-High-Ct": "Too many clicks, complex", "Int-Low-Ct": "Quick and effortless",
}

NEVER_SYMPTOMS = [f"{c}-Low-{m}" for c in COMPONENTS for m in ["PD", "Ct"]]

def get_entity_info(entity_id):
    parts = entity_id.split("-")
    return {"id": entity_id, "component": parts[0], "level": parts[1], "measure": parts[2],
            "description": ENTITY_DESCRIPTIONS.get(entity_id, ""), "component_color": "#5C6B4F"}

def get_all_entities():
    return [get_entity_info(e) for e in ALL_ENTITY_IDS]
