from fastapi import FastAPI, UploadFile, File, HTTPException, Form
from fastapi.middleware.cors import CORSMiddleware
from pydantic import BaseModel
import bcrypt
import shutil
import uuid
import os
from datetime import datetime
from supabase import create_client, Client
from dotenv import load_dotenv

from auth.verification.noise import noise_check
from auth.verification.font import font_check
from auth.verification.layout import layout_check
from auth.verification.classify import classify_certificate
from auth.verification.points import map_points
from auth.utils.pdf_utils import pdf_to_image

# ── Load Environment ──────────────────────────────────────────────────────────
load_dotenv()

SUPABASE_URL = os.getenv("SUPABASE_URL")
SUPABASE_KEY = os.getenv("SUPABASE_KEY")

if not SUPABASE_URL or not SUPABASE_KEY:
    raise RuntimeError("Supabase credentials not found in environment variables.")

supabase: Client = create_client(SUPABASE_URL, SUPABASE_KEY)

# ── App ────────────────────────────────────────────────────────────────────────
app = FastAPI()

app.add_middleware(
    CORSMiddleware,
    allow_origins=["http://localhost:5173"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# ── Constants ──────────────────────────────────────────────────────────────────
BASE_DIR = os.path.dirname(os.path.abspath(__file__))
BUFFER = os.path.join(BASE_DIR, "buffer")
os.makedirs(BUFFER, exist_ok=True)

# ── Pydantic Schemas ───────────────────────────────────────────────────────────
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


# ── Auth Routes ────────────────────────────────────────────────────────────────
@app.get("/")
def root():
    return {"message": "AUTOCRED VAULT backend running (Supabase Edition)"}


@app.post("/api/register")
def register(data: RegisterModel):
    try:
        # Check if user already exists
        existing = supabase.table("users").select("*").eq("email", data.email).execute()
        if existing.data:
            raise HTTPException(status_code=400, detail="Email already registered")

        hashed = bcrypt.hashpw(data.password.encode(), bcrypt.gensalt()).decode()
        
        user_data = {
            "name": data.name,
            "email": data.email,
            "password": hashed,
            "role": data.role,
            "reg_no": data.regNo,
            "branch": data.branch,
        }
        
        supabase.table("users").insert(user_data).execute()
        return {"message": "User created successfully"}
    except HTTPException:
        raise
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Database error: {str(e)}")


@app.post("/api/login")
def login(data: LoginModel):
    try:
        res = supabase.table("users").select("*").eq("email", data.email).eq("role", data.role).execute()
        if not res.data:
            raise HTTPException(status_code=401, detail="Invalid email, password, or role")
        
        user = res.data[0]
        if bcrypt.checkpw(data.password.encode(), user["password"].encode()):
            # Don't return password
            user.pop("password")
            # Map reg_no to regNo for frontend consistency if needed
            user["regNo"] = user.pop("reg_no")
            return user
            
        raise HTTPException(status_code=401, detail="Invalid email, password, or role")
    except HTTPException:
        raise
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Database error: {str(e)}")


# ── Student / Admin Data Routes ────────────────────────────────────────────────
@app.get("/api/students")
def get_students():
    try:
        res = supabase.table("users").select("*").eq("role", "student").execute()
        # Clean up data for frontend
        students = []
        for s in res.data:
            s.pop("password", None)
            s["regNo"] = s.pop("reg_no", None)
            students.append(s)
        return students
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Database error: {str(e)}")


@app.get("/api/certificates/{student_id}")
def get_certificates(student_id: int):
    try:
        res = supabase.table("certificates").select("*").eq("student_id", student_id).execute()
        # Map fields for frontend consistency
        certs = []
        for c in res.data:
            c["name"] = c.get("file_name")
            c["type"] = c.get("category")
            certs.append(c)
        return certs
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Database error: {str(e)}")


# ── Verification Route ─────────────────────────────────────────────────────────
@app.post("/verify")
async def verify_certificate(
    file: UploadFile = File(...),
    student_id: int = Form(...),
    file_name: str = Form("certificate"),
):
    if file.content_type != "application/pdf":
        raise HTTPException(status_code=400, detail="Only PDF files are allowed")

    file_id = str(uuid.uuid4())
    pdf_path = os.path.join(BUFFER, f"{file_id}.pdf")

    try:
        # Save file locally for processing
        content = await file.read()
        with open(pdf_path, "wb") as f:
            f.write(content)

        # Run verification pipeline
        image_path = pdf_to_image(pdf_path)
        noise = noise_check(image_path)
        font, ocr_data = font_check(image_path)
        layout = layout_check(image_path)
        category = classify_certificate(image_path, ocr_data)
        points = map_points(category)

        confidence = round((0.4 * noise + 0.3 * font + 0.3 * layout) * 100, 2)
        status = "VALID" if confidence >= 65 else "SUSPICIOUS"

        # ── Supabase Storage ──────────────────────────────────────────────────
        storage_path = f"{student_id}/{file_id}_{file.filename}"
        supabase.storage.from_("certificates").upload(storage_path, content, {"content-type": "application/pdf"})
        file_url = supabase.storage.from_("certificates").get_public_url(storage_path)

        # ── Supabase Database ─────────────────────────────────────────────────
        cert_data = {
            "student_id": student_id,
            "file_name": file_name,
            "file_url": file_url,
            "category": category,
            "status": status,
            "confidence": confidence,
            "points": points,
            "uploaded_at": datetime.utcnow().isoformat(),
        }
        supabase.table("certificates").insert(cert_data).execute()

        return {
            "status": status,
            "confidence": confidence,
            "category": category,
            "points": points,
            "file_url": file_url
        }

    except Exception as e:
        print(f"Error during verification: {e}")
        raise HTTPException(status_code=500, detail=str(e))

    finally:
        if os.path.exists(pdf_path):
            os.remove(pdf_path)
        if "image_path" in locals() and os.path.exists(image_path):
            os.remove(image_path)
