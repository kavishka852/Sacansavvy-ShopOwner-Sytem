from pydantic import BaseModel, EmailStr
from typing import Optional
from datetime import datetime

class User(BaseModel):
    username: str
    name: str
    email: EmailStr
    password: str
    status: str
    verified: bool
    created_at: Optional[datetime] = None
    updated_at: Optional[datetime] = None
