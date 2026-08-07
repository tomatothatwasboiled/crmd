import enum
from datetime import datetime
from sqlalchemy import Column, Integer, String, Float, DateTime, Enum as SQLEnum, ForeignKey, JSON, Boolean
from sqlalchemy.orm import relationship
from app.database.session import Base

class UserRole(str, enum.Enum):
    ADMIN = "ADMIN"
    DISPATCHER = "DISPATCHER"
    RESPONDER = "RESPONDER"

class User(Base):
    __tablename__ = "users"
    id = Column(Integer, primary_key=True, index=True)
    email = Column(String, unique=True, index=True, nullable=False)
    hashed_password = Column(String, nullable=False)
    role = Column(SQLEnum(UserRole), default=UserRole.DISPATCHER)
    created_at = Column(DateTime, default=datetime.utcnow)

class Incident(Base):
    __tablename__ = "incidents"
    id = Column(Integer, primary_key=True, index=True)
    description = Column(String, nullable=False)
    location = Column(String, nullable=True)
    latitude = Column(Float, nullable=True)
    longitude = Column(Float, nullable=True)
    disaster_type = Column(String, nullable=True)
    severity = Column(String, nullable=True)
    verified = Column(Boolean, default=False)
    confidence_score = Column(Float, default=0.0)
    assigned_resources = Column(JSON, default=[])
    created_at = Column(DateTime, default=datetime.utcnow)

class Resource(Base):
    __tablename__ = "resources"
    id = Column(Integer, primary_key=True, index=True)
    name = Column(String, nullable=False)
    resource_type = Column(String, nullable=False) # AMBULANCE, FIRE_TRUCK, POLICE
    status = Column(String, default="AVAILABLE")
    latitude = Column(Float, nullable=False)
    longitude = Column(Float, nullable=False)

class AgentLog(Base):
    __tablename__ = "agent_logs"
    id = Column(Integer, primary_key=True, index=True)
    incident_id = Column(Integer, ForeignKey("incidents.id"))
    agent_name = Column(String, nullable=False)
    output = Column(JSON, nullable=False)
    created_at = Column(DateTime, default=datetime.utcnow)