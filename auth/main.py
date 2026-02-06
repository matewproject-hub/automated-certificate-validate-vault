from fastapi import FastAPI, UploadFile, File
import shutil
import uuid
import os

from verification.noise import noise_check
from verification.font import font_check
from verification.layout import layout_check
from verification.classify import classify_certificate
from verification.points import map_points
from utils.pdf_utils import pdf_to_image

app = FastAPI()

BUFFER = "buffer"

os.makedirs(BUFFER, exist_ok=True)

@app.post("/verify")
async def verify_certificate(file: UploadFile = File(...)):

    file_id = str(uuid.uuid4())
    pdf_path = f"{BUFFER}/{file_id}.pdf"

    with open(pdf_path, "wb") as f:
        shutil.copyfileobj(file.file, f)

    image_path = pdf_to_image(pdf_path)

    noise = noise_check(image_path)
    font = font_check(image_path)
    layout = layout_check(image_path)

    confidence = round((0.4*noise + 0.3*font + 0.3*layout) * 100, 2)

    status = "VALID" if confidence >= 80 else "SUSPICIOUS"

    category = classify_certificate(image_path)
    points = map_points(category)

    if status == "SUSPICIOUS":
        os.remove(pdf_path)
        os.remove(image_path)

    return {
        "status": status,
        "confidence": confidence,
        "category": category,
        "points": points
    }
