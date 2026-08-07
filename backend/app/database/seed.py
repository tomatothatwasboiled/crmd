from app.database.session import SessionLocal, Base, engine
from app.models.models import Resource, User
from app.auth.security import hash_password

Base.metadata.create_all(bind=engine)

def seed_db():
    db = SessionLocal()
    if not db.query(User).filter(User.email == "admin@crisismind.io").first():
        admin = User(email="admin@crisismind.io", hashed_password=hash_password("admin123"), role="ADMIN")
        db.add(admin)

    if db.query(Resource).count() == 0:
        units = [
            Resource(name="Ambulance Alpha", resource_type="AMBULANCE", latitude=12.9724, longitude=77.5801),
            Resource(name="Fire Engine 09", resource_type="FIRE_TRUCK", latitude=12.9800, longitude=77.6000),
            Resource(name="NDRF Rescue 1", resource_type="RESCUE", latitude=12.9600, longitude=77.5700),
            Resource(name="Police Patrol 4", resource_type="POLICE", latitude=12.9650, longitude=77.5900),
        ]
        db.add_all(units)
    db.commit()
    db.close()

if __name__ == "__main__":
    seed_db()
    print("Database Seeded Successfully!")