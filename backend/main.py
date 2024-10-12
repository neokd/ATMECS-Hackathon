import jwt
from datetime import datetime, timedelta
from fastapi import FastAPI, status, Depends, UploadFile
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
from langchain.text_splitter import RecursiveCharacterTextSplitter  # Alternative splitter
from langchain_huggingface import HuggingFaceEmbeddings
from vector_rag import load_pdf, initialize_qdrant_client, create_vector_store, perform_similarity_search
from t2sql import Text2SQL

app = FastAPI()
Base = declarative_base()
DATABASE_URL = "sqlite:///test.db"
SECRET_KEY = "your-secret-key"  

collection_name = "hridaai"
embeddings_model = HuggingFaceEmbeddings(model_name="sentence-transformers/all-mpnet-base-v2")

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

@app.post("/api/ingest")
async def vector_ingest(file: UploadFile):
    pages = load_pdf(file.filename)

    # Use alternative text splitter
    text_splitter = RecursiveCharacterTextSplitter(chunk_size=1000, chunk_overlap=200)
    semantic_docs = text_splitter.create_documents(pages)

    client = initialize_qdrant_client()
    vector_store = create_vector_store(client, collection_name, embeddings_model, semantic_docs)

    return {'status':'success', 'message':'Vectors created and stored'}


from fastapi import FastAPI
from fastapi.responses import StreamingResponse
import json
from typing import Dict

app = FastAPI()

@app.post("/api/chat")
async def call_llm(query: UserQuery):
    """
    This function will call the LLM model to generate responses based on the user's input.
    """
    t2sql = Text2SQL()
    client = initialize_qdrant_client()
    vector_store = create_vector_store(client, collection_name, embeddings_model)
    
    # Perform the similarity search
    relevant_results = perform_similarity_search(vector_store, query.messages[-1]["content"], k=5)
    print("Relevant results:", relevant_results)
    
    # Generate the SQL query asynchronously
    response = await t2sql.generate_sql(query.messages[-1]["content"])

    # Execute the SQL query (if you want to visualize, adjust this method to work with async if necessary)
    response = t2sql.execute_sql(response, visualize=False)
    # Context: {" ".join([res['content'] for res in relevant_results])}
    llm_query = [
        {
            "role": "system",
            "content": "You are an assistant tasked with answering questions. Use the provided retrieved context or SQL context to formulate your response based on the nature of the question. If the question relates to financial data or business output, select the SQL context to answer appropriately. If you're unsure of the answer, simply state that you don't know. Format the output in a proper markdown format. Use tables for structured data and bullet points for lists. Provide a clear and concise response. Provide action items and suggestions if necessary."
        },
        {
            "role": "user",
            "content": f"""
                SQL Context: {response}
                Question: {query.messages[-1]["content"]}
            """
        }
    ]

    query.messages[-1]["content"] = llm_query


    async def stream_results():
        completion = ""
        llm = LLM()


        
        # Yield the similarity search results first
        yield json.dumps({"data": relevant_results, "type": "source_documents"}) + "\n"
        
        # Stream the results from the LLM inference
        async for chunk in llm.infer(llm_query):
            if chunk.usage:
                completion_tokens = chunk.usage.completion_tokens
                prompt_tokens = chunk.usage.prompt_tokens
                total_tokens = chunk.usage.total_tokens
            
            # Extract and yield the content of the response
            content = chunk.choices[0].delta.content or ""
            completion += content
            yield json.dumps({"content": content, "type": "response"}) + "\n"
    
    # Stream the response using StreamingResponse
    return StreamingResponse(stream_results(), media_type="application/json")


if __name__ == "__main__":
    import uvicorn
    uvicorn.run(app, host="0.0.0.0", port=8000)
