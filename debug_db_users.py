from sqlalchemy import create_engine, Column, Integer, String
from sqlalchemy.ext.declarative import declarative_base
from sqlalchemy.orm import sessionmaker

# Database URL from .env
DATABASE_URL = "postgresql://postgres:cosmicbot@35.223.191.80:5432/the_loop"

Base = declarative_base()

class User(Base):
    __tablename__ = "users"
    id = Column(Integer, primary_key=True, index=True)
    username = Column(String, unique=True, index=True)
    email = Column(String, unique=True, index=True)

engine = create_engine(DATABASE_URL)
SessionLocal = sessionmaker(autocommit=False, autoflush=False, bind=engine)

def list_users():
    db = SessionLocal()
    try:
        users = db.query(User).all()
        print(f"Total users found: {len(users)}")
        print("-" * 40)
        for user in users:
            print(f"ID: {user.id} | Username: '{user.username}' | Email: {user.email}")
        print("-" * 40)
    except Exception as e:
        print(f"Error querying database: {e}")
    finally:
        db.close()

if __name__ == "__main__":
    list_users()
