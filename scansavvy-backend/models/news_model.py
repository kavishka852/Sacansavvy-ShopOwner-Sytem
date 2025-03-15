# Modified news_model.py
from pydantic import BaseModel, HttpUrl
from typing import List, Optional
from datetime import datetime

class Reply(BaseModel):
    user: str
    comment: str

class Comment(BaseModel):
    user: str
    comment: str
    replies: Optional[List[Reply]] = []

class NewsArticle(BaseModel):
    title: str
    type: str
    read_time: str
    image: Optional[HttpUrl] = None  # Make image optional
    writer: str
    content: str
    created_at: Optional[datetime] = None  # Make created_at optional as well
    status: int
    comments: Optional[List[Comment]] = []