# shop_owner_products.py
from fastapi import APIRouter, HTTPException, Depends
from models.product_model import Product
from database import products_collection
from bson import ObjectId
from typing import Dict, List, Any
import jwt
from dotenv import load_dotenv
import os
from fastapi import Header

load_dotenv()
SECRET_KEY = os.getenv("SECRET_KEY")

router = APIRouter()

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

async def get_current_shop_owner(authorization: str = Header(None)):
    if not authorization:
        raise HTTPException(status_code=401, detail="Authorization header missing")
    
    try:
        scheme, token = authorization.split()
        if scheme.lower() != "bearer":
            raise HTTPException(status_code=401, detail="Invalid authentication scheme")
        
        payload = jwt.decode(token, SECRET_KEY, algorithms=["HS256"])
        shop_id = payload.get("shop_id")
        
        if not shop_id:
            raise HTTPException(status_code=401, detail="Invalid token payload")
        
        return {"shop_id": shop_id, "owner_id": payload.get("owner_id")}
    except jwt.PyJWTError:
        raise HTTPException(status_code=401, detail="Invalid authentication token")
    except Exception as e:
        raise HTTPException(status_code=401, detail=f"Authentication error: {str(e)}")

# Get all products for a shop owner
@router.get("/")
async def get_shop_products(current_shop_owner: dict = Depends(get_current_shop_owner)):
    shop_id = current_shop_owner["shop_id"]
    
    try:
        products = []
        cursor = products_collection.find({"shop_id": ObjectId(shop_id)})
        for product in cursor:
            products.append(serialize_mongodb_doc(product))
        return {"products": products}
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Failed to fetch products: {str(e)}")

# Get a specific product by ID (verifying shop ownership)
@router.get("/{product_id}")
async def get_shop_product(product_id: str, current_shop_owner: dict = Depends(get_current_shop_owner)):
    shop_id = current_shop_owner["shop_id"]
    
    try:
        product = products_collection.find_one({
            "_id": ObjectId(product_id),
            "shop_id": ObjectId(shop_id)
        })
        
        if not product:
            raise HTTPException(status_code=404, detail="Product not found or not owned by this shop")
        
        return serialize_mongodb_doc(product)
    except Exception as e:
        raise HTTPException(status_code=400, detail=f"Invalid product ID format: {str(e)}")

# Create a new product for a shop
@router.post("/")
async def create_shop_product(product: Product, current_shop_owner: dict = Depends(get_current_shop_owner)):
    shop_id = current_shop_owner["shop_id"]
    
    try:
        product_data = product.dict()
        # Add shop_id to the product data
        product_data["shop_id"] = ObjectId(shop_id)
        
        result = products_collection.insert_one(product_data)
        return {
            "message": "Product created successfully", 
            "id": str(result.inserted_id)
        }
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Failed to create product: {str(e)}")

# Update a product for a shop
@router.put("/{product_id}")
async def update_shop_product(product_id: str, product: Product, current_shop_owner: dict = Depends(get_current_shop_owner)):
    shop_id = current_shop_owner["shop_id"]
    
    try:
        # First check if the product exists and belongs to this shop
        existing_product = products_collection.find_one({
            "_id": ObjectId(product_id),
            "shop_id": ObjectId(shop_id)
        })
        
        if not existing_product:
            raise HTTPException(status_code=404, detail="Product not found or not owned by this shop")
        
        product_data = product.dict()
        # Ensure shop_id doesn't change
        product_data["shop_id"] = ObjectId(shop_id)
        
        updated_product = products_collection.find_one_and_update(
            {"_id": ObjectId(product_id)},
            {"$set": product_data},
            return_document=True
        )
        
        return {
            "message": "Product updated successfully", 
            "product": serialize_mongodb_doc(updated_product)
        }
    except Exception as e:
        raise HTTPException(status_code=400, detail=f"Error updating product: {str(e)}")

# Delete a product for a shop
@router.delete("/{product_id}")
async def delete_shop_product(product_id: str, current_shop_owner: dict = Depends(get_current_shop_owner)):
    shop_id = current_shop_owner["shop_id"]
    
    try:
        # First check if the product exists and belongs to this shop
        existing_product = products_collection.find_one({
            "_id": ObjectId(product_id),
            "shop_id": ObjectId(shop_id)
        })
        
        if not existing_product:
            raise HTTPException(status_code=404, detail="Product not found or not owned by this shop")
        
        result = products_collection.delete_one({"_id": ObjectId(product_id)})
        
        if result.deleted_count == 0:
            raise HTTPException(status_code=500, detail="Failed to delete product")
            
        return {"message": "Product deleted successfully"}
    except Exception as e:
        raise HTTPException(status_code=400, detail=f"Error deleting product: {str(e)}")