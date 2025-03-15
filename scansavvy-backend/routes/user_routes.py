from pydantic import BaseModel
from fastapi import APIRouter, HTTPException
from services.auth_service import register_user, login_user
from database import users_collection  
from models.user_model import User
from bson import ObjectId
from datetime import datetime

router = APIRouter()

class LoginRequest(BaseModel):
    email: str
    password: str

# Get all users
@router.get("/")
async def get_users():
    users = list(users_collection.find({}))
    for user in users:
        user["_id"] = str(user["_id"])
    return {"users": users}

# Get a user by ID
@router.get("/{user_id}")
async def get_user(user_id: str):
    user = users_collection.find_one({"_id": ObjectId(user_id)})
    if not user:
        raise HTTPException(status_code=404, detail="User not found")
    user["_id"] = str(user["_id"])
    return user

# Create a new user
@router.post("/")
async def create_user(user: User):
    user_data = user.dict()
    user_data["created_at"] = datetime.utcnow()  # Set created_at
    user_data["updated_at"] = None  # Ensure updated_at is None initially
    result = users_collection.insert_one(user_data)
    return {"message": "User created successfully", "id": str(result.inserted_id)}

@router.put("/{user_id}")
async def update_user(user_id: str, user: User):
    existing_user = users_collection.find_one({"_id": ObjectId(user_id)})
    
    if not existing_user:
        raise HTTPException(status_code=404, detail="User not found")

    user_data = user.dict(exclude_unset=True)  # Exclude fields not provided in the request
    user_data["updated_at"] = datetime.utcnow()  # Update timestamp

    updated_user = users_collection.find_one_and_update(
        {"_id": ObjectId(user_id)},
        {"$set": user_data},
        return_document=True
    )

    updated_user["_id"] = str(updated_user["_id"])  
    return {"message": "User updated successfully", "user": updated_user}


# Delete a user
@router.delete("/{user_id}")
async def delete_user(user_id: str):
    # Check if user exists first
    user = users_collection.find_one({"_id": ObjectId(user_id)})
    if not user:
        raise HTTPException(status_code=404, detail="User not found")
    
    # Delete the user
    result = users_collection.delete_one({"_id": ObjectId(user_id)})
    
    if result.deleted_count == 0:
        raise HTTPException(status_code=500, detail="Failed to delete user")
        
    return {"message": "User deleted successfully"}

@router.post("/register")
async def register(user: User):
    return register_user(user)

@router.post("/login")
async def login(login_data: LoginRequest):
    result = login_user(login_data.email, login_data.password)
    if "error" in result:
        raise HTTPException(status_code=400, detail=result["error"])
    return result
