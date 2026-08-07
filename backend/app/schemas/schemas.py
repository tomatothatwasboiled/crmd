from pydantic import BaseModel, EmailStr
from typing import List, Optional
from datetime import datetime

class UserCreate(BaseModel):
    email: EmailStr
    password: str
    role: Optional[str] = "DISPATCHER"

class UserResponse(BaseModel):
    id: int
    email: EmailStr
    role: str
    class Config:
        from_attributes = True

class Token(BaseModel):
    access_token: str
    token_type: str

class IncidentCreate(BaseModel):
    description: str
    latitude: Optional[float] = None
    longitude: Optional[float] = None

class IncidentResponse(BaseModel):
    id: int
    description: str
    location: Optional[str]
    disaster_type: Optional[str]
    severity: Optional[str]
    verified: bool
    confidence_score: float
    assigned_resources: List[str]
    created_at: datetime
    class Config:
        from_attributes = True

class DecisionOutput(BaseModel):
    verified: bool
    confidence: float
    disaster_type: str
    severity: str
    location: str
    resources: List[str]