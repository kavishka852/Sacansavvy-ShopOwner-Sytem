# product_routes.py
from fastapi import APIRouter, HTTPException, Depends
from models.product_model import Product
from database import products_collection
from bson import ObjectId
from typing import Dict, Any
import jwt
from fastapi.security import OAuth2PasswordBearer
from dotenv import load_dotenv
import os

load_dotenv()

router = APIRouter()
oauth2_scheme = OAuth2PasswordBearer(tokenUrl="token")

SECRET_KEY = os.getenv("SECRET_KEY")

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

# Dependency to get the current shop_id from the token
async def get_current_shop_id(token: str = Depends(oauth2_scheme)):
    try:
        # Decode the token to get the shop_id
        decoded_token = jwt.decode(token, SECRET_KEY, algorithms=["HS256"])
        return decoded_token['shop_id']
    except jwt.ExpiredSignatureError:
        raise HTTPException(status_code=401, detail="Token has expired")
    except jwt.InvalidTokenError:
        raise HTTPException(status_code=401, detail="Invalid token")

# Get all products for the logged-in shop owner
@router.get("/")
async def get_products(shop_id: str = Depends(get_current_shop_id)):
    print(f"Shop ID from token: {shop_id}")  # Debugging line
    products = []

    # Try converting shop_id to ObjectId if required
    try:
        cursor = products_collection.find({"shop_id": ObjectId(shop_id)})
    except Exception as e:
        print(f"Error in finding products: {e}")
        return {"error": "Invalid shop ID"}

    for product in cursor:
        products.append(serialize_mongodb_doc(product))

    print(f"Products found: {len(products)}")  # Debugging line
    return {"products": products}

# Get a product by ID for the logged-in shop owner
@router.get("/{product_id}", response_model=Dict[str, str])
async def get_product(product_id: str, shop_id: str = Depends(get_current_shop_id)) -> dict:
    try:
        product = products_collection.find_one({"_id": ObjectId(product_id), "shop_id": shop_id})
        print(f"Fetching product {product_id} for shop {shop_id}")
        if not product:
            raise HTTPException(status_code=404, detail="Product not found")
        return serialize_mongodb_doc(product)
    except Exception as e:
        raise HTTPException(status_code=400, detail=f"Invalid product ID format: {str(e)}")

# Create a new product for the logged-in shop owner
@router.post("/")
async def create_product(product: Product, shop_id: str = Depends(get_current_shop_id)):
    product_data = product.dict()
    product_data["shop_id"] = shop_id  # Set the shop_id for the product
    result = products_collection.insert_one(product_data)
    return {"message": "Product created successfully", "id": str(result.inserted_id)}

# Update a product for the logged-in shop owner
@router.put("/{product_id}")
async def update_product(product_id: str, product: Product, shop_id: str = Depends(get_current_shop_id)):
    try:
        product_data = product.dict()
        updated_product = products_collection.find_one_and_update(
            {"_id": ObjectId(product_id), "shop_id": shop_id},
            {"$set": product_data},
            return_document=True
        )
        if not updated_product:
            raise HTTPException(status_code=404, detail="Product not found or does not belong to this shop")
        
        return {
            "message": "Product updated successfully", 
            "product": serialize_mongodb_doc(updated_product)
        }
    except Exception as e:
        raise HTTPException(status_code=400, detail=f"Invalid product ID format: {str(e)}")

# Delete a product for the logged-in shop owner
@router.delete("/{product_id}")
async def delete_product(product_id: str, shop_id: str = Depends(get_current_shop_id)):
    try:
        # Check if product exists and belongs to the shop
        product = products_collection.find_one({"_id": ObjectId(product_id), "shop_id": shop_id})
        if not product:
            raise HTTPException(status_code=404, detail="Product not found or does not belong to this shop")
        
        # Delete the product
        result = products_collection.delete_one({"_id": ObjectId(product_id)})
        
        if result.deleted_count == 0:
            raise HTTPException(status_code=500, detail="Failed to delete product")
            
        return {"message": "Product deleted successfully"}
    except Exception as e:
        raise HTTPException(status_code=400, detail=f"Invalid product ID format: {str(e)}")
    

