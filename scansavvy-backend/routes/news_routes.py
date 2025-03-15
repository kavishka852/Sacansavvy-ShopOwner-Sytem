#news_routes.py
from fastapi import APIRouter, HTTPException
from models.news_model import NewsArticle, Comment, Reply
from database import news_collection
from bson import ObjectId

router = APIRouter()

# Get all news articles
@router.get("/")
async def get_news():
    news = list(news_collection.find({}))
    for article in news:
        article["_id"] = str(article["_id"])
    return {"news": news}

# Get a news article by ID
@router.get("/{news_id}")
async def get_news_article(news_id: str):
    article = news_collection.find_one({"_id": ObjectId(news_id)})
    if not article:
        raise HTTPException(status_code=404, detail="News article not found")
    article["_id"] = str(article["_id"])
    return article

# Create a new news article
@router.post("/")
async def create_news_article(article: NewsArticle):
    # Convert the model to a dict and then ensure all values are MongoDB compatible
    article_dict = article.dict()
    
    # Convert HttpUrl to string
    if "image" in article_dict and hasattr(article_dict["image"], "__str__"):
        article_dict["image"] = str(article_dict["image"])
    
    # Insert the modified dictionary
    result = news_collection.insert_one(article_dict)
    return {"message": "News article created successfully", "id": str(result.inserted_id)}

# Update a news article
@router.put("/{news_id}")
async def update_news_article(news_id: str, article: NewsArticle):
    # Convert to dict and ensure MongoDB compatibility
    article_dict = article.dict()
    
    # Convert HttpUrl to string
    if "image" in article_dict and hasattr(article_dict["image"], "__str__"):
        article_dict["image"] = str(article_dict["image"])
    
    updated_article = news_collection.find_one_and_update(
        {"_id": ObjectId(news_id)},
        {"$set": article_dict},
        return_document=True
    )
    if not updated_article:
        raise HTTPException(status_code=404, detail="News article not found")
    updated_article["_id"] = str(updated_article["_id"])
    return {"message": "News article updated successfully", "article": updated_article}

# Delete a news article
@router.delete("/{news_id}")
async def delete_news_article(news_id: str):
    article = news_collection.find_one({"_id": ObjectId(news_id)})
    if not article:
        raise HTTPException(status_code=404, detail="News article not found")
    
    result = news_collection.delete_one({"_id": ObjectId(news_id)})
    
    if result.deleted_count == 0:
        raise HTTPException(status_code=500, detail="Failed to delete news article")
        
    return {"message": "News article deleted successfully"}

# Add a comment to a news article
@router.post("/{news_id}/comments")
async def add_comment(news_id: str, comment: Comment):
    article = news_collection.find_one({"_id": ObjectId(news_id)})
    if not article:
        raise HTTPException(status_code=404, detail="News article not found")

    comment_data = comment.dict()
    news_collection.update_one(
        {"_id": ObjectId(news_id)},
        {"$push": {"comments": comment_data}}
    )
    
    return {"message": "Comment added successfully"}

# Get all comments for a news article
@router.get("/{news_id}/comments")
async def get_comments(news_id: str):
    article = news_collection.find_one({"_id": ObjectId(news_id)})
    if not article:
        raise HTTPException(status_code=404, detail="News article not found")
    
    return {"comments": article.get("comments", [])}

# Add a reply to a comment
@router.post("/{news_id}/comments/{comment_id}/replies")
async def add_reply(news_id: str, comment_id: str, reply: Reply):
    article = news_collection.find_one({"_id": ObjectId(news_id)})
    if not article:
        raise HTTPException(status_code=404, detail="News article not found")
    
    comment = next((c for c in article.get("comments", []) if str(c["_id"]) == comment_id), None)
    if not comment:
        raise HTTPException(status_code=404, detail="Comment not found")
    
    reply_data = reply.dict()
    news_collection.update_one(
        {"_id": ObjectId(news_id), "comments._id": ObjectId(comment_id)},
        {"$push": {"comments.$.replies": reply_data}}
    )
    
    return {"message": "Reply added successfully"}

# Get all replies for a comment
@router.get("/{news_id}/comments/{comment_id}/replies")
async def get_replies(news_id: str, comment_id: str):
    article = news_collection.find_one({"_id": ObjectId(news_id)})
    if not article:
        raise HTTPException(status_code=404, detail="News article not found")
    
    comment = next((c for c in article.get("comments", []) if str(c["_id"]) == comment_id), None)
    if not comment:
        raise HTTPException(status_code=404, detail="Comment not found")
    
    return {"replies": comment.get("replies", [])}
