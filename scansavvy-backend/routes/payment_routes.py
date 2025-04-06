from fastapi import APIRouter, HTTPException, Depends
from models.payment_model import Payment
from database import payments_collection
from bson import ObjectId
from typing import List, Dict, Any
from fastapi.security import OAuth2PasswordBearer
from dotenv import load_dotenv
import os
from pymongo import ReturnDocument
from pydantic import BaseModel
from routes.product_routes import get_current_shop_id
from database import products_collection



load_dotenv()

router = APIRouter()
SECRET_KEY = os.getenv("SECRET_KEY")

class PaymentStatusUpdate(BaseModel):
    status: str

SECRET_KEY = os.getenv("SECRET_KEY")

def serialize_mongodb_doc(doc: Dict[str, Any]) -> Dict[str, Any]:
    """Convert MongoDB ObjectId to string in a document"""
    if doc is None:
        return None

    serialized = dict(doc)
    if "_id" in serialized:
        serialized["_id"] = str(serialized["_id"])

    for key, value in serialized.items():
        if isinstance(value, ObjectId):
            serialized[key] = str(value)
        elif isinstance(value, list):
            serialized[key] = [
                serialize_mongodb_doc(item) if isinstance(item, dict) else item
                for item in value
            ]
        elif isinstance(value, dict):
            serialized[key] = serialize_mongodb_doc(value)

    return serialized


@router.get("/shop-orders")
async def get_shop_orders(shop_id: str = Depends(get_current_shop_id)):
    try:
        print(f"Shop ID: {shop_id}")
        # Find all products for this shop
        shop_products = list(products_collection.find({"shop_id": ObjectId(shop_id)}))
        product_ids = [product["_id"] for product in shop_products]
        product_ids_set = set(product_ids)

        # Find all payments that contain at least one product from this shop
        payments = list(payments_collection.find({
            "products": {
                "$elemMatch": {
                    "product_id": {"$in": product_ids}
                }
            }
        }))

        if not payments:
            return {"message": "No orders found for this shop."}
        # Remove products from each payment that are not part of this shop
        for payment in payments:
            if "products" in payment:
                payment["products"] = [
                    prod for prod in payment["products"]
                    if prod.get("product_id") in product_ids_set
                ]

        return {"payments": [serialize_mongodb_doc(payment) for payment in payments]}
    except Exception as e:
        raise HTTPException(status_code=400, detail=f"Error get payment status: {str(e)}")

@router.put("/update-status/{payment_id}")
async def update_payment_status(payment_id: str, status_update: PaymentStatusUpdate):
    try:
        payment = payments_collection.find_one({"_id": ObjectId(payment_id)})
      
        if not payment:
            raise HTTPException(status_code=404, detail="Payment not found")

        updated_payment = payments_collection.find_one_and_update(
            {"_id": ObjectId(payment_id)},
            {"$set": {"status": status_update.status}},
            return_document=ReturnDocument.AFTER
        )

        return {"message": "Payment status updated successfully", "payment": serialize_mongodb_doc(updated_payment)}
    except Exception as e:
        raise HTTPException(status_code=400, detail=f"Error updating payment status: {str(e)}")
        
        
# ✅ Get all payments for the admin or authorized user
@router.get("/all-payments")
async def get_all_payments():
    try:
        payments = list(payments_collection.find())
        
        if not payments:
            return {"message": "No payments found."}
        
        return {"payments": [serialize_mongodb_doc(payment) for payment in payments]}
    except Exception as e:
        raise HTTPException(status_code=400, detail=f"Error retrieving all payments: {str(e)}")
