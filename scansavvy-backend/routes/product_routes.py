# product_routes.py
from fastapi import APIRouter, HTTPException
from models.product_model import Product
from database import products_collection
from bson import ObjectId
from typing import Dict, List, Any

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

# Get all products
@router.get("/")
async def get_products():
    products = []
    cursor = products_collection.find({})
    for product in cursor:
        products.append(serialize_mongodb_doc(product))
    return {"products": products}

# Get a product by ID
@router.get("/{product_id}")
async def get_product(product_id: str):
    try:
        product = products_collection.find_one({"_id": ObjectId(product_id)})
        if not product:
            raise HTTPException(status_code=404, detail="Product not found")
        return serialize_mongodb_doc(product)
    except Exception as e:
        raise HTTPException(status_code=400, detail=f"Invalid product ID format: {str(e)}")

# Create a new product
@router.post("/")
async def create_product(product: Product):
    product_data = product.dict()
    result = products_collection.insert_one(product_data)
    return {"message": "Product created successfully", "id": str(result.inserted_id)}

# Update a product
@router.put("/{product_id}")
async def update_product(product_id: str, product: Product):
    try:
        product_data = product.dict()
        updated_product = products_collection.find_one_and_update(
            {"_id": ObjectId(product_id)},
            {"$set": product_data},
            return_document=True
        )
        if not updated_product:
            raise HTTPException(status_code=404, detail="Product not found")
        
        return {
            "message": "Product updated successfully", 
            "product": serialize_mongodb_doc(updated_product)
        }
    except Exception as e:
        raise HTTPException(status_code=400, detail=f"Invalid product ID format: {str(e)}")

# Delete a product
@router.delete("/{product_id}")
async def delete_product(product_id: str):
    try:
        # Check if product exists first
        product = products_collection.find_one({"_id": ObjectId(product_id)})
        if not product:
            raise HTTPException(status_code=404, detail="Product not found")
        
        # Delete the product
        result = products_collection.delete_one({"_id": ObjectId(product_id)})
        
        if result.deleted_count == 0:
            raise HTTPException(status_code=500, detail="Failed to delete product")
            
        return {"message": "Product deleted successfully"}
    except Exception as e:
        raise HTTPException(status_code=400, detail=f"Invalid product ID format: {str(e)}")