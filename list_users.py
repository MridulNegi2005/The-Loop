from main import SessionLocal, User

db = SessionLocal()
users = db.query(User).all()

print(f"Total users: {len(users)}")
for user in users:
    print(f"ID: {user.id}, Username: '{user.username}', Email: {user.email}")

db.close()
