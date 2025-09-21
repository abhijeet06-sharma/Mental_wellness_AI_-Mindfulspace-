from fastapi import FastAPI, Request, HTTPException, Depends, Body
from fastapi.middleware.cors import CORSMiddleware
from fastapi.security import OAuth2PasswordBearer, OAuth2PasswordRequestForm
from pydantic import BaseModel
from passlib.context import CryptContext
from jose import JWTError, jwt
from datetime import datetime, timedelta
from typing import Optional
import google.generativeai as genai
import os
import sqlite3
import random
import smtplib
from email.mime.text import MIMEText

# --- Configuration ---
SECRET_KEY = "your-super-secret-key-that-no-one-should-know"
ALGORITHM = "HS256"
ACCESS_TOKEN_EXPIRE_MINUTES = 30

# --- FastAPI App Initialization ---
app = FastAPI()

app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],  # you can restrict this to your frontend URL
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# --- Security & Auth Setup ---
pwd_context = CryptContext(schemes=["bcrypt"], deprecated="auto")
oauth2_scheme = OAuth2PasswordBearer(tokenUrl="token")

# --- Gemini Model Initialization ---
api_key = os.getenv("GEMINI_API_KEY")
if not api_key:
    raise RuntimeError("GEMINI_API_KEY environment variable not set.")
genai.configure(api_key=api_key)
gemini_model = genai.GenerativeModel("gemini-1.5-pro-latest")

# --- SQLite Database Setup ---
conn = sqlite3.connect("chat_history.db", check_same_thread=False)
cursor = conn.cursor()

cursor.execute("""
CREATE TABLE IF NOT EXISTS users (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    full_name TEXT NOT NULL,
    email TEXT NOT NULL UNIQUE,
    hashed_password TEXT NOT NULL,
    gender TEXT
)
""")

cursor.execute("""
CREATE TABLE IF NOT EXISTS conversations (
    id TEXT PRIMARY KEY,
    user_id INTEGER,
    title TEXT,
    created_at TEXT,
    FOREIGN KEY (user_id) REFERENCES users(id)
)
""")

cursor.execute("""
CREATE TABLE IF NOT EXISTS messages (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    conversation_id TEXT,
    sender TEXT,
    text TEXT,
    timestamp TEXT,
    FOREIGN KEY (conversation_id) REFERENCES conversations(id)
)
""")
conn.commit()

# --- Pydantic Models ---
class UserCreate(BaseModel):
    full_name: str
    email: str
    password: str
    gender: str

class UserInDB(BaseModel):
    id: int
    full_name: str
    email: str

class Token(BaseModel):
    access_token: str
    token_type: str

class TokenData(BaseModel):
    email: Optional[str] = None

# --- Security & Helper Functions ---
def verify_password(plain_password, hashed_password): 
    return pwd_context.verify(plain_password, hashed_password)

def get_password_hash(password): 
    return pwd_context.hash(password)

def create_access_token(data: dict, expires_delta: Optional[timedelta] = None):
    to_encode = data.copy()
    expire = datetime.utcnow() + (expires_delta or timedelta(minutes=15))
    to_encode.update({"exp": expire})
    return jwt.encode(to_encode, SECRET_KEY, algorithm=ALGORITHM)

async def get_current_user(token: str = Depends(oauth2_scheme)):
    credentials_exception = HTTPException(
        status_code=401,
        detail="Could not validate credentials",
        headers={"WWW-Authenticate": "Bearer"},
    )
    try:
        payload = jwt.decode(token, SECRET_KEY, algorithms=[ALGORITHM])
        email: str = payload.get("sub")
        if email is None:
            raise credentials_exception
        token_data = TokenData(email=email)
    except JWTError:
        raise credentials_exception
    cursor.execute("SELECT id, full_name, email FROM users WHERE email=?", (token_data.email,))
    user = cursor.fetchone()
    if user is None:
        raise credentials_exception
    return UserInDB(id=user[0], full_name=user[1], email=user[2])

# --- OTP Helper Functions ---
def generate_otp():
    return str(random.randint(100000, 999999))

def send_otp_email(to_email, otp):
    EMAIL_USER = os.environ.get("EMAIL_USER")
    EMAIL_PASS = os.environ.get("EMAIL_PASS")
    if not EMAIL_USER or not EMAIL_PASS:
        raise RuntimeError("EMAIL_USER or EMAIL_PASS environment variable not set.")

    msg = MIMEText(f"Your OTP for login/signup is: {otp}")
    msg['Subject'] = "OTP Verification"
    msg['From'] = EMAIL_USER
    msg['To'] = to_email

    server = smtplib.SMTP("smtp.gmail.com", 587)
    try:
        server.starttls()
        server.login(EMAIL_USER, EMAIL_PASS)
        server.send_message(msg)
    finally:
        server.quit()

# --- Root Endpoint ---
@app.get("/")
async def root():
    return {"message": "Backend is running"}

# --- Signup/Login ---
@app.post("/signup", response_model=UserInDB)
async def signup(user: UserCreate):
    cursor.execute("SELECT id FROM users WHERE email=?", (user.email,))
    if cursor.fetchone():
        raise HTTPException(status_code=400, detail="Email already registered")
    hashed_password = get_password_hash(user.password)
    cursor.execute(
        "INSERT INTO users (full_name, email, hashed_password, gender) VALUES (?, ?, ?, ?)",
        (user.full_name, user.email, hashed_password, user.gender),
    )
    conn.commit()
    cursor.execute("SELECT id, full_name, email FROM users WHERE email=?", (user.email,))
    new_user = cursor.fetchone()
    return UserInDB(id=new_user[0], full_name=new_user[1], email=new_user[2])

@app.post("/token", response_model=Token)
async def login_for_access_token(form_data: OAuth2PasswordRequestForm = Depends()):
    cursor.execute("SELECT id, hashed_password FROM users WHERE email=?", (form_data.username,))
    user = cursor.fetchone()
    if not user or not verify_password(form_data.password, user[1]):
        raise HTTPException(
            status_code=401,
            detail="Incorrect username or password",
            headers={"WWW-Authenticate": "Bearer"},
        )
    access_token = create_access_token(
        data={"sub": form_data.username},
        expires_delta=timedelta(minutes=ACCESS_TOKEN_EXPIRE_MINUTES),
    )
    return {"access_token": access_token, "token_type": "bearer"}

@app.get("/users/me/", response_model=UserInDB)
async def read_users_me(current_user: UserInDB = Depends(get_current_user)):
    return current_user

# --- OTP Endpoint ---
@app.post("/send-otp")
async def send_otp(email: str = Body(...)):
    otp = generate_otp()
    send_otp_email(email, otp)
    return {"status": "OTP sent"}  # Do not return otp in production

# --- Generate Endpoint ---
@app.post("/generate")
async def generate(request: Request, current_user: UserInDB = Depends(get_current_user)):
    data = await request.json()
    prompt = data.get("prompt", "")
    section = data.get("section", "default")
    conversation_id = data.get("conversation_id")

    if not prompt:
        raise HTTPException(status_code=400, detail="Prompt is required.")

    if section == "gossip":
        response = gemini_model.generate_content(prompt)
        return {"result": response.text}

    if not conversation_id:
        raise HTTPException(status_code=400, detail="conversation_id is required for non-gossip sections")

    cursor.execute("SELECT id FROM conversations WHERE id=? AND user_id=?", (conversation_id, current_user.id))
    existing_convo = cursor.fetchone()

    if not existing_convo:
        title = " ".join(prompt.split()[:5]) + ("..." if len(prompt.split()) > 5 else "")
        cursor.execute(
            "INSERT INTO conversations (id, user_id, title, created_at) VALUES (?, ?, ?, ?)",
            (conversation_id, current_user.id, title, datetime.utcnow().isoformat()),
        )

    cursor.execute(
        "INSERT INTO messages (conversation_id, sender, text, timestamp) VALUES (?, ?, ?, ?)",
        (conversation_id, "user", prompt, data.get("timestamp", "")),
    )

    response = gemini_model.generate_content(prompt)
    result = response.text
    cursor.execute(
        "INSERT INTO messages (conversation_id, sender, text, timestamp) VALUES (?, ?, ?, ?)",
        (conversation_id, "gemini", result, data.get("timestamp", "")),
    )

    conn.commit()
    return {"result": result}

# --- Conversations & Messages ---
@app.get("/conversations")
async def list_conversations(current_user: UserInDB = Depends(get_current_user)):
    cursor.execute(
        "SELECT id, title, created_at FROM conversations WHERE user_id=? ORDER BY created_at DESC",
        (current_user.id,),
    )
    rows = cursor.fetchall()
    return [{"id": r[0], "title": r[1], "created_at": r[2]} for r in rows]

@app.get("/conversations/{conversation_id}/messages")
async def get_messages(conversation_id: str, current_user: UserInDB = Depends(get_current_user)):
    cursor.execute("SELECT id FROM conversations WHERE id=? AND user_id=?", (conversation_id, current_user.id))
    if not cursor.fetchone():
        raise HTTPException(status_code=404, detail="Conversation not found or access denied")
    cursor.execute("SELECT sender, text, timestamp FROM messages WHERE conversation_id=?", (conversation_id,))
    rows = cursor.fetchall()
    return [{"role": r[0], "content": r[1], "timestamp": r[2]} for r in rows]

@app.delete("/conversations/{conversation_id}")
async def delete_conversation(conversation_id: str, current_user: UserInDB = Depends(get_current_user)):
    cursor.execute("DELETE FROM messages WHERE conversation_id=?", (conversation_id,))
    cursor.execute("DELETE FROM conversations WHERE id=? AND user_id=?", (conversation_id, current_user.id))
    conn.commit()
    return {"status": "deleted"}
