from fastapi import APIRouter, HTTPException
import jwt
from datetime import datetime, timedelta
from models.shopowner_model import ShopOwner
from database import shopowner_collection
from utils.password_hashing import hash_password, verify_password
from dotenv import load_dotenv
import os
from pydantic import BaseModel, EmailStr
from bson import ObjectId  # Import ObjectId for MongoDB

load_dotenv()

SECRET_KEY = os.getenv("SECRET_KEY")

router = APIRouter()

class ShopOwnerLogin(BaseModel):
    email: EmailStr
    password: str

class ShopOwnerCreate(BaseModel):
    username: str
    name: str
    email: EmailStr
    password: str
    shop_id: str

# Helper function to handle ObjectId serialization
def serialize_object_id(obj):
    if isinstance(obj, ObjectId):
        return str(obj)
    raise TypeError(f"Object of type {type(obj)} is not JSON serializable")

@router.post("/login")
async def login_shop_owner(shop_owner: ShopOwnerLogin):
    owner = shopowner_collection.find_one({"email": shop_owner.email})

    if not owner:
        raise HTTPException(status_code=401, detail="Shop owner not found")
    
    if verify_password(shop_owner.password, owner["password"]):
        # Convert ObjectId to string before encoding in JWT
        token_data = {
            "owner_id": str(owner["_id"]), 
            "shop_id": str(owner["shop_id"]),
            "exp": datetime.utcnow() + timedelta(hours=1)
        }
        
        token = jwt.encode(
            token_data,
            SECRET_KEY,
            algorithm="HS256"
        )
        
        return {
            "message": "Login successful", 
            "token": token, 
            "owner": {
                "id": str(owner["_id"]), 
                "name": owner["name"], 
                "email": owner["email"],
                "shop_id": str(owner["shop_id"])
            }
        }
    
    raise HTTPException(status_code=401, detail="Invalid credentials")


@router.post("/register")
async def register_shop_owner(shop_owner: ShopOwnerCreate):
    # Check if email already exists
    if shopowner_collection.find_one({"email": shop_owner.email}):
        raise HTTPException(status_code=400, detail="Email already exists")
    
    # Check if username already exists
    if shopowner_collection.find_one({"username": shop_owner.username}):
        raise HTTPException(status_code=400, detail="Username already exists")

    # Create shop owner data
    now = datetime.now()
    shop_owner_data = {
        "shop_id": shop_owner.shop_id,
        "username": shop_owner.username,
        "name": shop_owner.name,
        "email": shop_owner.email,
        "password": hash_password(shop_owner.password),
        "status": "1",  # Default active status
        "verified": False,  # Default verification status
        "created_at": now,
        "updated_at": now
    }

    # Insert into database
    result = shopowner_collection.insert_one(shop_owner_data)
    
    return {
        "message": "Shop owner registered successfully",
        "id": str(result.inserted_id)
    }