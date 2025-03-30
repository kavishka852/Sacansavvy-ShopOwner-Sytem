from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from routes import user_routes, product_routes, news_routes,shopowner_route,payment_routes
app = FastAPI()

app.add_middleware(
    CORSMiddleware,
    allow_origins=["http://localhost:5173", "http://127.0.0.1:5173"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

@app.get("/")
async def root():
    return {"message": "Hello, FastAPI with CORS is working!"}

app.include_router(shopowner_route.router, prefix="/api/shopowner", tags=["shopowner"])
app.include_router(payment_routes.router, prefix="/api/payment", tags=["payement"])
app.include_router(product_routes.router, prefix="/api/products", tags=["products"]) 
app.include_router(news_routes.router, prefix="/api/news", tags=["news"])
