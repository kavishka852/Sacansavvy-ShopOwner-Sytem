from fastapi import APIRouter, HTTPException
from models.product_model import Product
from database import products_collection
from bson import ObjectId

router = APIRouter()

# Get all products
@router.get("/")
async def get_products():
    products = list(products_collection.find({}))
    for product in products:
        product["_id"] = str(product["_id"])
    return {"products": products}

# Get a product by ID
@router.get("/{product_id}")
async def get_product(product_id: str):
    product = products_collection.find_one({"_id": ObjectId(product_id)})
    if not product:
        raise HTTPException(status_code=404, detail="Product not found")
    product["_id"] = str(product["_id"])
    return product

# Create a new product
@router.post("/")
async def create_product(product: Product):
    product_data = product.dict()
    result = products_collection.insert_one(product_data)
    return {"message": "Product created successfully", "id": str(result.inserted_id)}

# Update a product
@router.put("/{product_id}")
async def update_product(product_id: str, product: Product):
    updated_product = products_collection.find_one_and_update(
        {"_id": ObjectId(product_id)},
        {"$set": product.dict()},
        return_document=True
    )
    if not updated_product:
        raise HTTPException(status_code=404, detail="Product not found")
    updated_product["_id"] = str(updated_product["_id"])
    return {"message": "Product updated successfully", "product": updated_product}

# Delete a product
@router.delete("/{product_id}")
async def delete_product(product_id: str):
    # Check if product exists first
    product = products_collection.find_one({"_id": ObjectId(product_id)})
    if not product:
        raise HTTPException(status_code=404, detail="product not found")
    
    # Delete the product
    result = products_collection.delete_one({"_id": ObjectId(product_id)})
    
    if result.deleted_count == 0:
        raise HTTPException(status_code=500, detail="Failed to delete product")
        
    return {"message": "product deleted successfully"}