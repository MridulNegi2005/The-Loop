from main import Base, engine, UserEvent, UserInterest

print("Creating new tables...")
Base.metadata.create_all(bind=engine)
print("Tables created successfully.")
