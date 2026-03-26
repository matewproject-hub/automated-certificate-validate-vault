from fastapi import FastAPI, UploadFile, File, Form
from database import supabase
import hashlib
import uuid
from datetime import datetime

app = FastAPI()

# ✅ Home route
@app.get("/")
def home():
    return {"message": "Smart Certificate Vault Backend Running"}


# ✅ ADD YOUR UPLOAD API HERE 👇
@app.post("/upload-certificate/")
async def upload_certificate(
    student_id: str = Form(...),
    file: UploadFile = File(...)
):
    file_content = await file.read()

    unique_id = str(uuid.uuid4())
    file_path = f"certificates/{unique_id}_{file.filename}"

    supabase.storage.from_("certificates").upload(
        file_path,
        file_content
    )

    file_hash = hashlib.sha256(file_content).hexdigest()

    supabase.table("certificates").insert({
        "certificate_id": unique_id,
        "student_id": student_id,
        "file_path": file_path,
        "file_hash": file_hash,
        "certificate_type": "general",
        "confidence_score": 100,
        "verification_status": "VALID",
        "uploaded_at": datetime.utcnow().isoformat()
    }).execute()

    supabase.table("audit_logs").insert({
        "log_id": str(uuid.uuid4()),
        "actor_id": student_id,
        "action": "UPLOAD",
        "certificate_id": unique_id,
        "timestamp": datetime.utcnow().isoformat(),
        "ip_address": "127.0.0.1"
    }).execute()

    return {
        "message": "Certificate uploaded successfully"
    }