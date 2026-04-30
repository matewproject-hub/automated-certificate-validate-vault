from fastapi import FastAPI, UploadFile, File, Form
from fastapi.middleware.cors import CORSMiddleware
from database.database import supabase
import hashlib
import uuid
from datetime import datetime
import shutil
import os
import bcrypt
from pydantic import BaseModel
from sqlalchemy import create_engine, Column, Integer, String
from sqlalchemy.orm import declarative_base, sessionmaker

from auth.verification.noise import noise_check
from auth.verification.font import font_check
from auth.verification.layout import layout_check
from auth.verification.classify import classify_certificate
from auth.utils.pdf_utils import pdf_to_image

app = FastAPI()

app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

@app.get("/")
def home():
    return {"message": "Smart Certificate Vault Backend Running"}

# --- DATABASE SETUP FOR AUTH ---
engine = create_engine("sqlite:///users.db", connect_args={"check_same_thread": False})
SessionLocal = sessionmaker(autocommit=False, autoflush=False, bind=engine)
Base = declarative_base()

class User(Base):
    __tablename__ = "user"
    id = Column(Integer, primary_key=True, index=True)
    name = Column(String(100), nullable=True)
    email = Column(String(100), unique=True, nullable=False)
    password = Column(String(100), nullable=False)
    role = Column(String(20), nullable=False)
    reg_no = Column(String(50), nullable=True)
    branch = Column(String(50), nullable=True)

    def to_dict(self):
        return {
            'id': self.id,
            'name': self.name,
            'email': self.email,
            'role': self.role,
            'regNo': self.reg_no,
            'branch': self.branch
        }

Base.metadata.create_all(bind=engine)

# Pydantic models for auth
class RegisterModel(BaseModel):
    name: str = ""
    email: str
    password: str
    role: str = "student"
    regNo: str = ""
    branch: str = "CSE"

class LoginModel(BaseModel):
    email: str
    password: str
    role: str

from fastapi import HTTPException

@app.post("/api/register")
def register(data: RegisterModel):
    db = SessionLocal()
    try:
        # Check if user already exists
        if db.query(User).filter(User.email == data.email).first():
            raise HTTPException(status_code=400, detail="Email already registered")
            
        hashed_password = bcrypt.hashpw(data.password.encode('utf-8'), bcrypt.gensalt())
        
        new_user = User(
            name=data.name,
            email=data.email,
            password=hashed_password.decode('utf-8'),
            role=data.role,
            reg_no=data.regNo,
            branch=data.branch
        )
        
        db.add(new_user)
        db.commit()
        return {"message": "User created successfully"}
    except Exception as e:
        db.rollback()
        raise HTTPException(status_code=500, detail=f"Database error: {str(e)}")
    finally:
        db.close()

@app.post("/api/login")
def login(data: LoginModel):
    db = SessionLocal()
    try:
        user = db.query(User).filter(User.email == data.email, User.role == data.role).first()
        
        if user and bcrypt.checkpw(data.password.encode('utf-8'), user.password.encode('utf-8')):
            return user.to_dict()
        else:
            raise HTTPException(status_code=401, detail="Invalid email, password, or role")
    finally:
        db.close()

@app.post("/api/upload-certificate/")
async def upload_certificate(
    student_id: str = Form(...),
    file: UploadFile = File(...)
):
    file_content = await file.read()
    unique_id = str(uuid.uuid4())
    
    # --- 1. RUN YOUR VERIFICATION CHECKS ---
    pdf_path = f"buffer_{unique_id}.pdf"
    with open(pdf_path, "wb") as f:
        f.write(file_content)
        
    image_path = pdf_to_image(pdf_path)
    
    noise = noise_check(image_path)
    font = font_check(image_path)
    layout = layout_check(image_path)
    confidence = round((0.4 * noise + 0.3 * font + 0.3 * layout) * 100, 2)
    status = "VALID" if confidence >= 80 else "SUSPICIOUS"
    category = classify_certificate(image_path)
    
    # Cleanup local files
    os.remove(pdf_path)
    os.remove(image_path)
    
    # --- 2. UPLOAD TO SUPABASE ---
    file_path = f"certificates/{unique_id}_{file.filename}"
    supabase.storage.from_("certificates").upload(file_path, file_content)
    file_hash = hashlib.sha256(file_content).hexdigest()

    # --- 3. SAVE REAL SCORES TO DATABASE ---
    supabase.table("certificates").insert({
        "certificate_id": unique_id,
        "student_id": student_id,
        "file_path": file_path,
        "file_hash": file_hash,
        "certificate_type": category,
        "confidence_score": confidence,   # Use calculated score
        "verification_status": status,    # Use calculated status
        "uploaded_at": datetime.utcnow().isoformat()
    }).execute()

    # --- 4. RETURN RESULT TO FRONTEND ---
    return {
        "message": "Certificate uploaded successfully",
        "status": status,
        "category": category
    }
