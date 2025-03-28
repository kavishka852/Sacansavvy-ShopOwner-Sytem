from pydantic import BaseModel, Field
from typing import List, Optional

class Product(BaseModel):
    title: str
    subtitle: str
    price: float
    original_price: float
    ratings: float
    discount: str
    category: str
    qty: int
    color: str
    images: List[str]
    brand: str
    specifications: List[dict]
    shop_id: str 
    description: str  