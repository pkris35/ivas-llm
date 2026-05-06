SYMPTOM_TO_CAUSE = {
    "Vis-Low-AC": {"Stat-Low-AC": "likely", "Alg-Low-AC": "likely"},
    "Vis-High-PD": {"Vis-Low-AC": "likely", "Alg-High-PD": "likely", "Stat-High-PD": "possible"},
    "Vis-High-Ct": {"Vis-Low-AC": "likely", "Stat-Low-AC": "possible"},
    "Int-High-PD": {"Int-High-AC": "likely", "Vis-High-PD": "likely"},
    "Int-High-Ct": {"Vis-Low-AC": "likely", "Vis-High-PD": "possible", "Int-Low-AC": "possible"},
    "Alg-High-PD": {"Stat-High-PD": "likely", "Alg-High-AC": "likely", "Stat-Low-AC": "possible"},
    "Alg-High-Ct": {"Alg-Low-AC": "possible", "Stat-Low-AC": "possible"},
    "Stat-High-PD": {"Stat-High-AC": "likely"},
    "Int-High-AC": {"Vis-High-Ct": "possible"},
    "Alg-High-AC": {"Stat-Low-AC": "possible"},
}
CAUSE_TO_REMEDY = {
    "Stat-Low-AC": {"Stat-High-AC": "likely"}, "Alg-Low-AC": {"Alg-High-AC": "likely"},
    "Vis-Low-AC": {"Stat-High-AC": "likely", "Alg-High-AC": "likely", "Vis-High-AC": "likely"},
    "Stat-High-AC": {"Int-Low-AC": "likely"}, "Alg-High-AC": {"Int-Low-AC": "likely"},
    "Alg-High-PD": {"Alg-Low-PD": "likely", "Int-Low-AC": "possible"},
    "Stat-High-PD": {"Stat-Low-PD": "likely", "Int-Low-AC": "possible"},
    "Vis-High-PD": {"Vis-Low-PD": "likely", "Vis-High-AC": "possible"},
    "Int-High-AC": {"Int-Low-AC": "likely"}, "Int-High-Ct": {"Int-Low-Ct": "likely", "Vis-High-AC": "possible"},
}
REMEDY_TO_SIDE_EFFECT = {
    "Stat-High-AC": {"Stat-High-PD": "likely"}, "Alg-High-AC": {"Alg-High-PD": "likely"},
    "Vis-High-AC": {"Vis-High-PD": "likely"}, "Int-Low-AC": {"Int-High-Ct": "likely"},
    "Stat-Low-PD": {"Stat-Low-AC": "possible"}, "Alg-Low-PD": {"Alg-High-Ct": "possible"},
    "Vis-Low-PD": {"Vis-High-Ct": "possible"},
}

def get_causes(symptom, min_likelihood="possible"):
    order = {"likely": 3, "possible": 2, "rare": 1}
    mn = order.get(min_likelihood, 1)
    return [{"entity": c, "likelihood": l} for c, l in SYMPTOM_TO_CAUSE.get(symptom, {}).items() if order.get(l, 0) >= mn]

def get_remedies(cause, min_likelihood="possible"):
    order = {"likely": 3, "possible": 2, "rare": 1}
    mn = order.get(min_likelihood, 1)
    return [{"entity": r, "likelihood": l} for r, l in CAUSE_TO_REMEDY.get(cause, {}).items() if order.get(l, 0) >= mn]

def get_side_effects(remedy, min_likelihood="possible"):
    order = {"likely": 3, "possible": 2, "rare": 1}
    mn = order.get(min_likelihood, 1)
    return [{"entity": se, "likelihood": l} for se, l in REMEDY_TO_SIDE_EFFECT.get(remedy, {}).items() if order.get(l, 0) >= mn]

def get_full_matrix(name):
    return {"symptom_cause": SYMPTOM_TO_CAUSE, "cause_remedy": CAUSE_TO_REMEDY, "remedy_side_effect": REMEDY_TO_SIDE_EFFECT}.get(name, {})
