from pydantic import BaseModel, EmailStr, Field
from typing import Optional
from datetime import datetime

class ShopOwner(BaseModel):
    id: str = Field(alias="_id")
    shop_id: str
    username: str
    name: str
    email: EmailStr
    password: str
    status: str
    verified: bool
    created_at: Optional[datetime] = None
    updated_at: Optional[datetime] = None