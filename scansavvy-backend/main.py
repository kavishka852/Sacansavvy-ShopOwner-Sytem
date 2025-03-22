from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from routes import user_routes, product_routes, news_routes,shopowner_route
app = FastAPI()

app.add_middleware(
    CORSMiddleware,
    allow_origins=["http://localhost:5174", "http://127.0.0.1:5174"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

@app.get("/")
async def root():
    return {"message": "Hello, FastAPI with CORS is working!"}

app.include_router(shopowner_route.router, prefix="/api/shopowner", tags=["shopowner"])
app.include_router(user_routes.router, prefix="/api/user", tags=["user"])
app.include_router(product_routes.router, prefix="/api/products", tags=["products"]) 
app.include_router(news_routes.router, prefix="/api/news", tags=["news"])
