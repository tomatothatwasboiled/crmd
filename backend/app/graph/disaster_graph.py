import os
import json
from typing import TypedDict, List
import google.generativeai as genai
from langgraph.graph import StateGraph, END

# Initialize Gemini (if valid key provided)
api_key = os.getenv("GEMINI_API_KEY", "MOCK_KEY")
if api_key != "MOCK_KEY":
    genai.configure(api_key=api_key)
    model = genai.GenerativeModel('gemini-1.5-flash')
else:
    model = None

class CrisisState(TypedDict):
    raw_text: str
    location: str
    disaster_type: str
    people_affected: int
    verified: bool
    confidence: float
    severity: str
    resources: List[str]

def intake_agent(state: CrisisState) -> CrisisState:
    text = state['raw_text'].lower()
    
    # Try calling Gemini if API key is provided
    if model:
        try:
            prompt = f"Extract location, disaster type, and estimated people affected from: '{state['raw_text']}'. Respond strictly in JSON: {{'location': str, 'disaster_type': str, 'people_affected': int}}"
            res = model.generate_content(prompt)
            data = json.loads(res.text.strip('```json').strip('```'))
            state['location'] = data.get('location', 'Downtown')
            state['disaster_type'] = data.get('disaster_type', 'Emergency')
            state['people_affected'] = data.get('people_affected', 2)
            return state
        except Exception:
            pass # Fall back to local parsing below

    # Mock Intelligent Rule-Based Intake (No API Key Required!)
    if "flood" in text or "water" in text:
        state['disaster_type'] = "Flood"
    elif "fire" in text or "smoke" in text:
        state['disaster_type'] = "Fire Hazard"
    elif "landslide" in text or "mud" in text:
        state['disaster_type'] = "Landslide"
    else:
        state['disaster_type'] = "General Emergency"

    state['location'] = "Sector 4, Central District"
    state['people_affected'] = 5 if ("trapped" in text or "injured" in text) else 2
    return state

def verification_agent(state: CrisisState) -> CrisisState:
    # Rule-based verification heuristic
    if len(state['raw_text']) > 15:
        state['verified'] = True
        state['confidence'] = 94.5
    else:
        state['verified'] = False
        state['confidence'] = 45.0
    return state

def severity_agent(state: CrisisState) -> CrisisState:
    if state['people_affected'] >= 5 or "fire" in state['disaster_type'].lower():
        state['severity'] = "Critical"
    elif state['people_affected'] >= 2:
        state['severity'] = "High"
    else:
        state['severity'] = "Medium"
    return state

def resource_agent(state: CrisisState) -> CrisisState:
    res = []
    if state['severity'] in ["Critical", "High"]:
        res.append("2 Ambulances")
        res.append("1 NDRF Unit")
    if "fire" in state['disaster_type'].lower():
        res.append("2 Fire Trucks")
    if not res:
        res.append("1 Police Unit")
    state['resources'] = res
    return state

# LangGraph Execution Pipeline
workflow = StateGraph(CrisisState)
workflow.add_node("intake", intake_agent)
workflow.add_node("verify", verification_agent)
workflow.add_node("severity", severity_agent)
workflow.add_node("resources", resource_agent)

workflow.set_entry_point("intake")
workflow.add_edge("intake", "verify")
workflow.add_edge("verify", "severity")
workflow.add_edge("severity", "resources")
workflow.add_edge("resources", END)

crisis_ai_app = workflow.compile()