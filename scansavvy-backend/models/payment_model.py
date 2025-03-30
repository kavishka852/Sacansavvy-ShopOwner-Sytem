from datetime import datetime
from typing import List
from bson import ObjectId
from pydantic import BaseModel, Field, ConfigDict
from models.product_model import Product
from bson import ObjectId
from pydantic import GetCoreSchemaHandler
from pydantic_core import core_schema

class PyObjectId(ObjectId):
    @classmethod
    def __get_pydantic_core_schema__(
        cls, source_type, handler: GetCoreSchemaHandler
    ) -> core_schema.CoreSchema:
        return core_schema.str_schema()

    @classmethod
    def __get_pydantic_json_schema__(
        cls, core_schema: core_schema.CoreSchema, handler
    ):
        return {"type": "string"}
    
    
class ShippingAddress(BaseModel):
    address: str
    city: str
    postal_code: str
    country: str

class Payment(BaseModel):
    id: PyObjectId = Field(alias="_id")
    user_id: PyObjectId
    amount: int
    subtotal: int
    shipping_cost: int
    tax: int
    payment_method: str
    status: str
    shipping_address: ShippingAddress
    products: List[Product]
    created_at: datetime
    transaction_id: str

    model_config = ConfigDict(arbitrary_types_allowed=True)
