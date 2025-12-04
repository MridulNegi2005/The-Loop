from main import Base, engine
from sqlalchemy import text

def reset_db():
    print("Killing active connections...")
    # Force kill other connections to the database to allow dropping tables
    try:
        with engine.connect() as connection:
            connection.execution_options(isolation_level="AUTOCOMMIT")
            connection.execute(text("""
                SELECT pg_terminate_backend(pg_stat_activity.pid)
                FROM pg_stat_activity
                WHERE pg_stat_activity.datname = current_database()
                  AND pid <> pg_backend_pid();
            """))
    except Exception as e:
        print(f"Warning: Could not kill connections (might be permissions or not Postgres): {e}")

    print("Dropping all tables...")
    # Reflect all tables to ensure we can drop them
    # Base.metadata.reflect(bind=engine)
    Base.metadata.drop_all(bind=engine)
    print("Tables dropped.")
    
    print("Creating all tables...")
    Base.metadata.create_all(bind=engine)
    print("Tables created successfully.")
    
    # Import seed_database only after tables are created to avoid import side-effects
    # (Though we fixed the side-effect in main.py, this is still safe)
    from main import seed_database
    print("Seeding database...")
    seed_database()

if __name__ == "__main__":
    reset_db()
