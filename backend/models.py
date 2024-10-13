from pydantic import BaseModel
from typing import List, Dict

class Register(BaseModel):
    username: str
    email: str
    password: str

class Login(BaseModel):
    email: str
    password: str

class UserQuery(BaseModel):
    messages: List[Dict]

class Perspective(BaseModel):
    text: str
    persona: str = "default"

class Tracking(BaseModel):
    user_id: str
    text: str
    persona: str = "default"
    user_query: str