# # auth_service.py
# from database import users_collection
from utils.password_hashing import hash_password, verify_password
from models.user_model import User
# from datetime import datetime

# def register_user(user: User):
#     if users_collection.find_one({"email": user.email}):
#         return {"error": "Email already exists"}

#     user_data = user.dict()
#     user_data["password"] = hash_password(user.password)
#     user_data["created_at"] = datetime.now()
#     user_data["updated_at"] = datetime.now()

#     users_collection.insert_one(user_data)
#     return {"message": "User registered successfully"}

# def login_user(email: str, password: str):
#     user = users_collection.find_one({"email": email})

#     if not user:
#         return {"error": "User not found"}
    
#     if verify_password(password, user["password"]):
#         return {"message": "Login successful", "user": {"id": str(user["_id"]), "name": user["name"], "email": user["email"]}}
    
#     return {"error": "Invalid credentials"}

from fastapi import HTTPException
import jwt
from datetime import datetime, timedelta
from utils.password_hashing import verify_password
from database import users_collection
from dotenv import load_dotenv
import os

load_dotenv()

SECRET_KEY = os.getenv("SECRET_KEY")

def login_user(email: str, password: str):
    user = users_collection.find_one({"email": email})

    if not user:
        raise HTTPException(status_code=401, detail="User not found")
    
    if verify_password(password, user["password"]):
        token = jwt.encode(
            {"user_id": str(user["_id"]), "exp": datetime.utcnow() + timedelta(hours=1)},
            SECRET_KEY,
            algorithm="HS256"
        )
        return {"message": "Login successful", "token": token, "user": {"id": str(user["_id"]), "name": user["name"], "email": user["email"]}}
    
    raise HTTPException(status_code=401, detail="Invalid credentials")


def register_user(user: User):
    if users_collection.find_one({"email": user.email}):
        return {"error": "Email already exists"}

    user_data = user.dict()
    user_data["password"] = hash_password(user.password)
    user_data["created_at"] = datetime.now()
    user_data["updated_at"] = datetime.now()

    users_collection.insert_one(user_data)
    return {"message": "User registered successfully"}