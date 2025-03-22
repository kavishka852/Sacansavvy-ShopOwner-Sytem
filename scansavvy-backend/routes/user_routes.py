# user_routes.py
from pydantic import BaseModel
from fastapi import APIRouter, HTTPException
from services.auth_service import register_user, login_user
from database import users_collection  
from models.user_model import User
from bson import ObjectId
from datetime import datetime
from typing import Dict, List, Any

router = APIRouter()

class LoginRequest(BaseModel):
    email: str
    password: str

def serialize_mongodb_doc(doc: Dict[str, Any]) -> Dict[str, Any]:
    """Convert MongoDB ObjectId to string in a document"""
    if doc is None:
        return None
    
    # Make a copy to avoid modifying the original
    serialized = dict(doc)
    
    # Convert _id to string
    if "_id" in serialized:
        serialized["_id"] = str(serialized["_id"])
    
    # Convert other potential ObjectId fields
    for key, value in serialized.items():
        if isinstance(value, ObjectId):
            serialized[key] = str(value)
        # Handle dates
        elif isinstance(value, datetime):
            serialized[key] = value.isoformat()
        # Handle lists of documents
        elif isinstance(value, list):
            serialized[key] = [
                serialize_mongodb_doc(item) if isinstance(item, dict) else item
                for item in value
            ]
        # Handle nested documents
        elif isinstance(value, dict):
            serialized[key] = serialize_mongodb_doc(value)
    
    return serialized

# Get all users
@router.get("/")
async def get_users():
    users = []
    cursor = users_collection.find({})
    for user in cursor:
        users.append(serialize_mongodb_doc(user))
    return {"users": users}

# Get a user by ID
@router.get("/{user_id}")
async def get_user(user_id: str):
    try:
        user = users_collection.find_one({"_id": ObjectId(user_id)})
        if not user:
            raise HTTPException(status_code=404, detail="User not found")
        return serialize_mongodb_doc(user)
    except Exception as e:
        raise HTTPException(status_code=400, detail=f"Invalid user ID format: {str(e)}")

# Create a new user
@router.post("/")
async def create_user(user: User):
    user_data = user.dict()
    user_data["created_at"] = datetime.utcnow()
    user_data["updated_at"] = None
    result = users_collection.insert_one(user_data)
    return {"message": "User created successfully", "id": str(result.inserted_id)}

@router.put("/{user_id}")
async def update_user(user_id: str, user: User):
    try:
        existing_user = users_collection.find_one({"_id": ObjectId(user_id)})
        
        if not existing_user:
            raise HTTPException(status_code=404, detail="User not found")

        user_data = user.dict(exclude_unset=True)
        user_data["updated_at"] = datetime.utcnow()

        updated_user = users_collection.find_one_and_update(
            {"_id": ObjectId(user_id)},
            {"$set": user_data},
            return_document=True
        )

        return {
            "message": "User updated successfully", 
            "user": serialize_mongodb_doc(updated_user)
        }
    except Exception as e:
        raise HTTPException(status_code=400, detail=f"Invalid user ID format: {str(e)}")

# Delete a user
@router.delete("/{user_id}")
async def delete_user(user_id: str):
    try:
        # Check if user exists first
        user = users_collection.find_one({"_id": ObjectId(user_id)})
        if not user:
            raise HTTPException(status_code=404, detail="User not found")
        
        # Delete the user
        result = users_collection.delete_one({"_id": ObjectId(user_id)})
        
        if result.deleted_count == 0:
            raise HTTPException(status_code=500, detail="Failed to delete user")
            
        return {"message": "User deleted successfully"}
    except Exception as e:
        raise HTTPException(status_code=400, detail=f"Invalid user ID format: {str(e)}")

@router.post("/register")
async def register(user: User):
    return register_user(user)

@router.post("/login")
async def login(login_data: LoginRequest):
    result = login_user(login_data.email, login_data.password)
    if "error" in result:
        raise HTTPException(status_code=400, detail=result["error"])
    return result