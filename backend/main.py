import jwt
from datetime import datetime, timedelta
from fastapi import FastAPI, status, Depends, UploadFile
from fastapi.exceptions import HTTPException
from fastapi.middleware.cors import CORSMiddleware
from sqlalchemy import create_engine, Column, String, Integer, DateTime
from sqlalchemy.ext.declarative import declarative_base
from sqlalchemy.orm import sessionmaker
from models import Register, Login, UserQuery, Perspective, Tracking
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
import sqlite3


app = FastAPI()
Base = declarative_base()
DATABASE_URL = "sqlite:///test.db"
BUSINESS_DB = "sqlite:///business.db"

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

# Define the model for the decisions table
class Decision(Base):
    __tablename__ = "decisions"

    id = Column(Integer, primary_key=True, index=True)
    user_id = Column(String, index=True)  # You might want to change this type based on your requirements
    user_query = Column(String, index=True)
    persona = Column(String, index=True)
    decision_content = Column(String, index=True)
    assigned_to = Column(String, default="Sales")
    status = Column(String, default="To Do")
    progress = Column(Integer, default=90)
    priority = Column(String, default="Low")
    created_at = Column(DateTime, default=datetime.utcnow)
    due_date = Column(DateTime, default=datetime.utcnow)

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
            "content": "You are an assistant tasked with answering questions. Use the provided retrieved context or SQL context to formulate your response based on the nature of the question. If the question relates to financial data or business output, select the SQL context to answer appropriately. If you're unsure of the answer, simply state that you don't know. Format the output in a proper markdown format. Use tables for structured data and bullet points for lists. Provide a clear and concise response. Provide action items and suggestions if necessary. Generate in 100 words"
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


@app.post("/api/perspective")
async def call_perspective(query: Perspective):
    """
    This function will call the Perspective API to analyze the user's input.
    """

    system_prompts = {
        "General Perspective": "Assume yourself as an Strategic Business Assistant , A strategic business assistant offers insights and recommendations to enhance and transform the decision-making processes within a business.Your role is to analyze the user's business scenario and provide actionable insights, suggestions, and recommendations to help them make decisions that will transform their business and boost productivity.Utilize the provided context to analyze the user's input and deliver feedback accordingly. Offer a clear and concise response with suggestions for improvement. For each actionable item, assign an assignee and specify the due date ",
        "Financial Perspective": "magine you are a financial assistant with a comprehensive understanding of the company’s financial landscape. Your task is to provide specific action items and strategic recommendations to enhance the financial health of the business. Focus on identifying opportunities for cost reduction, revenue enhancement, and effective capital allocation that can lead to improved profitability and overall financial performance.",
        "Sales Perspective": "Assume the role of a Sales Executive Assistant with in-depth knowledge of the company’s sales strategies and market dynamics. Your responsibility is to provide actionable recommendations and strategies aimed at driving sales growth. Focus on identifying new market opportunities, optimizing sales processes, enhancing customer engagement, and developing effective sales campaigns that can lead to increased revenue and market share.",
        "Operational Perspective": "Imagine you are an Operations Executive Assistant with a thorough understanding of the company’s operational processes and efficiency metrics. Your role is to provide actionable recommendations and strategies to improve operational performance. Focus on identifying areas for process optimization, resource allocation, cost reduction, and enhancing productivity. Your goal is to streamline operations, improve workflow efficiency, and support overall business growth through effective operational strategies.",
        "Technological Perspective": "Assume the role of a Technology Executive Assistant with expertise in technology trends and innovations. Your task is to provide actionable recommendations and strategies to leverage technology for business growth and transformation. Focus on identifying opportunities for digital transformation, technology adoption, cybersecurity enhancement, and IT infrastructure optimization. Your goal is to drive technological innovation, enhance operational efficiency, and support the company’s strategic objectives through effective technology strategies."
    }
    print(query.persona)

    messages = [
        {
            "role": "system",
            "content": system_prompts[query.persona]
        },
        {
            "role": "user",
            "content": query.text
        }
    ]


    async def stream_results():
        completion = ""
        llm = LLM()

        # Stream the results from the LLM inference
        async for chunk in llm.infer(messages):
            if chunk.usage:
                completion_tokens = chunk.usage.completion_tokens
                prompt_tokens = chunk.usage.prompt_tokens
                total_tokens = chunk.usage.total_tokens
     
            # Extract and yield the content of the response
            if chunk.choices:
                content = chunk.choices[0].delta.content or ""
                completion += content
                yield json.dumps({"content": content, "type": "response"}) + "\n"

    return StreamingResponse(stream_results(), media_type="application/json")


@app.post("/api/tracking")
async def track_user_activity(query: Tracking):
    """
    This function will track the user's activity and store it in the database.
    """
    # Create a new session
    db = SessionLocal()
    try:
        # Create a new Decision instance
        decision = Decision(user_id=query.user_id, decision_content=query.text, user_query=query.user_query, persona=query.persona)
        # Add the new decision to the session
        print(decision)
        db.add(decision)
        # Commit the session to save the decision
        db.commit()
        # Refresh the instance to get the assigned ID
        db.refresh(decision)
        return {"id": decision.id, "message": "Decision tracked successfully!"}
    except Exception as e:
        db.rollback()  # Rollback in case of error
        print(e)
        raise HTTPException(status_code=500, detail=str(e))
    finally:
        db.close()  # Close the session

@app.get("/api/decisions")
async def get_decisions(user_id: str):
    """
    This function will fetch decisions for a specific user from the database.
    """
    db = SessionLocal()
    try:
        # Query the database for decisions where user_id matches the given user_id
        decisions = db.query(Decision).filter(Decision.user_id == user_id).all()
        if not decisions:
            raise HTTPException(status_code=404, detail="No decisions found for this user")
        return decisions
    except Exception as e:
        print(e)
        raise HTTPException(status_code=500, detail=str(e))
    finally:
        db.close()


@app.get("/api/dashboard")
async def get_dashboard():
    db = SessionLocal()  # Replace with the correct method to get your SQLAlchemy session
    sqlite_db_path = '/Users/kuldeep/Projects/ATMECS-Hackathon/backend/qdrant_vector_db/collection/hridaai/storage.sqlite'
    business_db_path = '/Users/kuldeep/Projects/ATMECS-Hackathon/backend/business.db'  # Update with the correct path

    try:
        # Query for total documents from the SQL database
        total_documents = db.query(Decision).count()  # Adjust according to your database structure

        # Connect to the SQLite database for Qdrant
        with sqlite3.connect(sqlite_db_path) as sqlite_conn:
            sqlite_cursor = sqlite_conn.cursor()

            # Query to get the total number of collections
            sqlite_cursor.execute("SELECT COUNT(DISTINCT id) FROM points")  # Adjust table/column names as necessary
            total_collections = sqlite_cursor.fetchone()[0] or 0  # Get the count or 0 if no collections found

        # Query for decisions from the SQL database
        decisions = db.query(Decision).all()
        
        if not decisions:
            raise HTTPException(status_code=404, detail="No decisions found")

        # Calculate the number of decisions in progress and completed
        in_progress = sum(1 for d in decisions if d.status == 'In Progress')
        completed = sum(1 for d in decisions if d.status == 'Completed')
        pending = sum(1 for d in decisions if d.status == 'To Do')

        # Get recent decisions (e.g., last 5)
        recent_decisions = decisions[-5:]  # Assumes decisions are sorted by date

        # Business DB
        financial_data = []
        with sqlite3.connect(business_db_path) as business_conn:
            business_cursor = business_conn.cursor()
            business_cursor.execute("SELECT sales, expenses, net_profit, operating_profit FROM quarter")  # Adjust table/column names as necessary

            profit_cursor = business_conn.cursor()
            profit_cursor.execute("SELECT employee_cost, net_profit FROM profit")  # Adjust table/column names as necessary

            balance_cursor = business_conn.cursor()
 
            balance_cursor.execute("SELECT net_block,capital_work_in_progress, other_assets, total  FROM balancesheet")  # Adjust table/column names as necessary

            profit_data = [
                {
                    "employee_cost": row[0],
                    "net_profit": row[1]
                }
                for row in profit_cursor.fetchall()
            ]
            
            # Fetch financial data once
            financial_data = [
                {
                    "sales": row[0],
                    "expenses": row[1],
                    "net_profit": row[2],
                    "operating_profit": row[3],
                }
                for row in business_cursor.fetchall()
            ]

            balance_data = [
                {
                    "net_block": row[0],
                    "capital_work_in_progress": row[1],
                    "other_assets": row[2],
                    "total": row[3]
                }
                for row in balance_cursor.fetchall()
            ]

            cashflow_cursor = business_conn.cursor()
            cashflow_cursor.execute("SELECT net_cash_flow, cash_from_operating_activity, cash_from_investing_activity, cash_from_financing_activity FROM cashflow")  # Adjust table/column names as necessary

            cashflow_data = [
                {
                    "net_cash_flow": row[0],
                    "cash_from_operating_activity": row[1],
                    "cash_from_investing_activity": row[2],
                    "cash_from_financing_activity": row[3]
                }
                for row in cashflow_cursor.fetchall()
            ]

        # Prepare dashboard response
        dashboard_data = {
            "total_documents": total_documents,
            "total_collections": total_collections,
            "decisions_in_progress": in_progress,
            "total_completed_decisions": completed,
            "total_pending_decisions": pending,
            "financial_data": financial_data,
            "profit_data": profit_data,
            "balance_data": balance_data,
            "cashflow_data": cashflow_data,
            # "recent_decisions": [
            #     {
            #         "id": decision.id,
            #         "user_query": decision.user_query,
            #         "status": decision.status,
            #         "created_at": decision.created_at.strftime("%Y-%m-%d %H:%M:%S") if decision.created_at else "N/A"
            #     }
            #     for decision in recent_decisions
            # ]
        }
        print(dashboard_data)
        return dashboard_data
        
    except Exception as e:
        print(e)
        raise HTTPException(status_code=500, detail=str(e))
    finally:
        db.close()  # Close the SQLAlchemy session

if __name__ == "__main__":
    import uvicorn
    uvicorn.run(app, host="0.0.0.0", port=8000)
