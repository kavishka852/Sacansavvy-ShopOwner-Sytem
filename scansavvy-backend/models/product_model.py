#product_model.py
from pydantic import BaseModel
from typing import List, Optional

class Specification(BaseModel):
    key: str
    value: str
    
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
    specifications: List[Specification]
    shop_id: Optional[str] = None  # Make it optional in the request
    description: str