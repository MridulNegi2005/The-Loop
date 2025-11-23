from main import Base, engine
from sqlalchemy import text

def reset_db():
    print("Dropping all tables...")
    # Reflect all tables to ensure we can drop them
    Base.metadata.reflect(bind=engine)
    Base.metadata.drop_all(bind=engine)
    print("Tables dropped.")
    
    print("Creating all tables...")
    Base.metadata.create_all(bind=engine)
    print("Tables created successfully.")

if __name__ == "__main__":
    reset_db()
