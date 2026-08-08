from fastapi import FastAPI, Depends, HTTPException, status
from fastapi.middleware.cors import CORSMiddleware
from sqlalchemy.orm import Session
from typing import List

from app.database.session import engine, Base, get_db
<<<<<<< HEAD
from app.models.models import User, UserRole, Incident, Resource, AgentLog
=======
from app.models.models import User, Incident, Resource, AgentLog
>>>>>>> 6ad190cf1a225eb28e0e0c2cf69a08c11f579c53
from app.schemas.schemas import UserCreate, UserResponse, Token, IncidentCreate, IncidentResponse, DecisionOutput
from app.auth.security import hash_password, verify_password, create_access_token, get_current_user
from app.graph.disaster_graph import crisis_ai_app
from app.routing.optimizer import find_nearest_resource
<<<<<<< HEAD
=======

>>>>>>> 6ad190cf1a225eb28e0e0c2cf69a08c11f579c53
Base.metadata.create_all(bind=engine)

app = FastAPI(title="CrisisMind AI Engine", version="1.0.0")

app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

@app.post("/api/auth/register", response_model=UserResponse)
def register(user_in: UserCreate, db: Session = Depends(get_db)):
    if db.query(User).filter(User.email == user_in.email).first():
        raise HTTPException(status_code=400, detail="Email registered already.")
    user = User(email=user_in.email, hashed_password=hash_password(user_in.password), role=user_in.role)
    db.add(user)
    db.commit()
    db.refresh(user)
    return user

@app.post("/api/auth/login", response_model=Token)
def login(user_in: UserCreate, db: Session = Depends(get_db)):
    user = db.query(User).filter(User.email == user_in.email).first()
    if not user or not verify_password(user_in.password, user.hashed_password):
        raise HTTPException(status_code=400, detail="Invalid credentials")
    token = create_access_token({"sub": user.email})
    return {"access_token": token, "token_type": "bearer"}

@app.post("/api/incidents", response_model=IncidentResponse)
<<<<<<< HEAD
def process_incident(payload: IncidentCreate, db: Session = Depends(get_db), current_user: User = Depends(get_current_user)):
=======
def process_incident(payload: IncidentCreate, db: Session = Depends(get_db)):
>>>>>>> 6ad190cf1a225eb28e0e0c2cf69a08c11f579c53
    initial_state = {"raw_text": payload.description}
    output = crisis_ai_app.invoke(initial_state)

    default_checklist = [
        {"id": "c1", "label": "Units Dispatched", "completed": False},
        {"id": "c2", "label": "On-site Contact Established", "completed": False},
        {"id": "c3", "label": "Escalation Evaluated", "completed": False},
        {"id": "c4", "label": "Area Secured", "completed": False}
    ]
    incident_checklist = [item.dict() for item in payload.checklist] if getattr(payload, "checklist", []) else default_checklist

    incident = Incident(
<<<<<<< HEAD
        user_id=current_user.id,  # Links the request to the user who raised it
=======
>>>>>>> 6ad190cf1a225eb28e0e0c2cf69a08c11f579c53
        description=payload.description,
        location=output['location'],
        disaster_type=output['disaster_type'],
        severity=output['severity'],
        verified=output['verified'],
        confidence_score=output['confidence'],
        assigned_resources=output['resources'],
        checklist=incident_checklist,
        latitude=payload.latitude or 12.9716,
        longitude=payload.longitude or 77.5946
    )
    db.add(incident)
    db.commit()
    db.refresh(incident)

    log = AgentLog(incident_id=incident.id, agent_name="MultiAgentWorkflow", output=output)
    db.add(log)
    db.commit()

    return incident

@app.get("/api/incidents", response_model=List[IncidentResponse])
<<<<<<< HEAD
def get_incidents(db: Session = Depends(get_db), current_user: User = Depends(get_current_user)):
    # Admins see everything, regular users see only their own requests
    if current_user.role == UserRole.ADMIN:
        return db.query(Incident).all()
    return db.query(Incident).filter(Incident.user_id == current_user.id).all()

@app.put("/api/incidents/{incident_id}/checklist/{item_id}", response_model=IncidentResponse)
def update_checklist_item(incident_id: int, item_id: str, completed: bool, db: Session = Depends(get_db), current_user: User = Depends(get_current_user)):
    query = db.query(Incident).filter(Incident.id == incident_id)
    if current_user.role != UserRole.ADMIN:
        query = query.filter(Incident.user_id == current_user.id)
        
    incident = query.first()
    if not incident:
        raise HTTPException(status_code=404, detail="Incident not found or unauthorized")
=======
def get_incidents(db: Session = Depends(get_db)):
    return db.query(Incident).all()

@app.put("/api/incidents/{incident_id}/checklist/{item_id}", response_model=IncidentResponse)
def update_checklist_item(incident_id: int, item_id: str, completed: bool, db: Session = Depends(get_db)):
    incident = db.query(Incident).filter(Incident.id == incident_id).first()
    if not incident:
        raise HTTPException(status_code=404, detail="Incident not found")
>>>>>>> 6ad190cf1a225eb28e0e0c2cf69a08c11f579c53
    
    updated_checklist = []
    for item in incident.checklist:
        if item.get("id") == item_id:
            updated_checklist.append({**item, "completed": completed})
        else:
            updated_checklist.append(item)
    
    incident.checklist = updated_checklist
    db.commit()
    db.refresh(incident)
    return incident

@app.get("/api/resources")
def get_resources(db: Session = Depends(get_db)):
    return db.query(Resource).all()

@app.post("/api/optimize")
<<<<<<< HEAD
def optimize_route(incident_id: int, db: Session = Depends(get_db), current_user: User = Depends(get_current_user)):
    query = db.query(Incident).filter(Incident.id == incident_id)
    if current_user.role != UserRole.ADMIN:
        query = query.filter(Incident.user_id == current_user.id)
        
    inc = query.first()
    if not inc:
        raise HTTPException(status_code=404, detail="Incident missing or unauthorized")
=======
def optimize_route(incident_id: int, db: Session = Depends(get_db)):
    inc = db.query(Incident).filter(Incident.id == incident_id).first()
    if not inc:
        raise HTTPException(status_code=404, detail="Incident missing")
>>>>>>> 6ad190cf1a225eb28e0e0c2cf69a08c11f579c53

    resources = db.query(Resource).filter(Resource.status == "AVAILABLE").all()
    res_dicts = [{"name": r.name, "resource_type": r.resource_type, "latitude": r.latitude, "longitude": r.longitude} for r in resources]

    if not res_dicts:
        return {"message": "No available resources"}

    best_match = find_nearest_resource((inc.latitude, inc.longitude), res_dicts)
    return best_match