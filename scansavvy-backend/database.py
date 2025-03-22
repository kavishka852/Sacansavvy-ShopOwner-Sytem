from pymongo import MongoClient
import os
from dotenv import load_dotenv

load_dotenv()

MONGO_URI = os.getenv("MONGO_URI")
MONGO_DB = os.getenv("MONGO_DB")

client = MongoClient(MONGO_URI)
database = client[MONGO_DB]

# Collections
shopowner_collection = database.get_collection("shop_owner")
users_collection = database.get_collection("users")
products_collection = database.get_collection("products")
payments_collection = database.get_collection("payments")
news_collection = database.get_collection("news")


print(f"✅ Connected to MongoDB: {MONGO_DB}")
