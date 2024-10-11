import jwt
from datetime import datetime, timedelta
from fastapi import FastAPI, status, Depends
from fastapi.middleware.cors import CORSMiddleware
from sqlalchemy import create_engine, Column, String
from sqlalchemy.ext.declarative import declarative_base
from sqlalchemy.orm import sessionmaker
from models import Register, Login, UserQuery
from sqlalchemy.orm.exc import NoResultFound
from fastapi.security import OAuth2PasswordBearer
import os
import uuid
from llm import LLM
from fastapi.responses import StreamingResponse
import json

app = FastAPI()
Base = declarative_base()
DATABASE_URL = "sqlite:///test.db"
SECRET_KEY = "your-secret-key"  


# JWT Configuration
ALGORITHM = "HS256"
ACCESS_TOKEN_EXPIRE_MINUTES = 30

engine = create_engine(DATABASE_URL)
SessionLocal = sessionmaker(autocommit=False, autoflush=False, bind=engine)

# CORS middleware
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],  
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# OAuth2 Password Bearer setup for protected routes (if needed later)
oauth2_scheme = OAuth2PasswordBearer(tokenUrl="token")

# Define the UserDB model
class UserDB(Base):
    __tablename__ = 'users'

    id = Column(String, primary_key=True, index=True, default=lambda: str(uuid.uuid4()))  # Fix: Generate new UUID
    username = Column(String, unique=True, index=True)
    email = Column(String, unique=True, index=True)
    password = Column(String)

Base.metadata.create_all(bind=engine)

# Helper function to create JWT token
def create_access_token(data: dict, expires_delta: timedelta = None):
    to_encode = data.copy()
    if expires_delta:
        expire = datetime.utcnow() + expires_delta
    else:
        expire = datetime.utcnow() + timedelta(minutes=ACCESS_TOKEN_EXPIRE_MINUTES)
    to_encode.update({"exp": expire})
    encoded_jwt = jwt.encode(to_encode, SECRET_KEY, algorithm=ALGORITHM)
    return encoded_jwt

@app.post('/api/register')
async def register(user: Register):
    db = SessionLocal()
    try:
        # Check if the user with the provided email already exists
        existing_user = db.query(UserDB).filter(UserDB.email == user.email).first()
        if existing_user:
            return {"message": "Email already registered", "status": status.HTTP_400_BAD_REQUEST}
        
        # Create new user in the database
        new_user = UserDB(username=user.username, email=user.email, password=user.password)
        db.add(new_user)
        db.commit()
        db.refresh(new_user)

        # Generate a JWT token for the new user
        access_token = create_access_token(data={"user_id": new_user.id, "username": new_user.username})

    finally:
        db.close()

    return {
        "message": "Registration successful",
        "status": status.HTTP_201_CREATED,
        "user_id": new_user.id,
        "username": new_user.username,
        "access_token": access_token,
        "token_type": "bearer"
    }


@app.post('/api/login')
async def login(user: Login):
    db = SessionLocal()
    try:
        # Query the database for the user with the provided email and password
        db_user = (
            db.query(UserDB)
            .filter(UserDB.email == user.email, UserDB.password == user.password)
            .one()
        )

        # Generate JWT token if credentials are valid
        access_token = create_access_token(data={"user_id": db_user.id, "username": db_user.username})

        return {
            "message": "Login successful",
            "status": status.HTTP_200_OK,
            "user_id": db_user.id,
            "username": db_user.username,
            "access_token": access_token,
            "token_type": "bearer"
        }

    except NoResultFound:
        return {
            "message": "Invalid credentials",
            "status": status.HTTP_401_UNAUTHORIZED
        }
    finally:
        db.close()

@app.post("/api/chat")
async def call_llm(query: UserQuery):
    # Retriver Logic will come here
    """
    This function will call the LLM model to generate responses based on the user's input.
    """
    data = [
    {
        "content": "Hello, how can I help you today?",
        "score": 0.9,
        "source": {
            "title": "Customer Service Handbook",
            "url": "https://example.com/customer-service-handbook",
            "author": "John Doe",
            "date": "2023-10-01"
        }
    },
    {
        "content": "Our company was founded in 1995 and has been providing quality services ever since.",
        "score": 0.8,
        "source": {
            "title": "Company History Overview",
            "url": "https://example.com/company-history",
            "author": "Company Archives",
            "date": "2022-08-15"
        }
    },
    {
        "content": "The latest trends in AI involve using transformer models for natural language processing tasks.",
        "score": 0.95,
        "source": {
            "title": "AI Trends 2024",
            "url": "https://ai-news.com/ai-trends-2024",
            "author": "AI Research Institute",
            "date": "2024-02-11"
        }
    },
    {
        "content": "Implementing secure cloud storage is critical to ensuring data privacy and compliance with GDPR.",
        "score": 0.85,
        "source": {
            "title": "Data Privacy in the Cloud",
            "url": "https://tech-security.com/data-privacy-cloud",
            "author": "Jane Smith",
            "date": "2023-07-21"
        }
    }
]

    async def stream_results():
        completion = ""
        llm = LLM()
        yield json.dumps({"data": data, "type": "source_documents"}) + "\n"
        async for chunk in llm.infer(query.messages):
            if chunk.usage:
                completion_tokens = chunk.usage.completion_tokens
                prompt_tokens = chunk.usage.prompt_tokens
                total_tokens = chunk.usage.total_tokens
            content = chunk.choices[0].delta.content or ""
            completion += content
            yield json.dumps({"content": content , "type": "response"}) + "\n"
    return StreamingResponse(stream_results(), media_type="application/json")
    
