from fastapi import FastAPI, UploadFile, File, HTTPException
import shutil
import uuid
import os

from auth.verification.noise import noise_check
from auth.verification.font import font_check
from auth.verification.layout import layout_check
from auth.verification.classify import classify_certificate
from auth.verification.points import map_points
from auth.utils.pdf_utils import pdf_to_image

app = FastAPI()

BASE_DIR = os.path.dirname(os.path.abspath(__file__))
BUFFER = os.path.join(BASE_DIR, "buffer")

os.makedirs(BUFFER, exist_ok=True)


@app.post("/verify")
async def verify_certificate(file: UploadFile = File(...)):

    if file.content_type != "application/pdf":
        raise HTTPException(status_code=400, detail="Only PDF allowed")

    file_id = str(uuid.uuid4())
    pdf_path = f"{BUFFER}/{file_id}.pdf"

    try:
        with open(pdf_path, "wb") as f:
            shutil.copyfileobj(file.file, f)

        image_path = pdf_to_image(pdf_path)

        noise = noise_check(image_path)
        font = font_check(image_path)
        layout = layout_check(image_path)

        confidence = round((0.4 * noise + 0.3 * font + 0.3 * layout) * 100, 2)
        print("LAYOUT SCORE:", layout)
        print("NOISE:", noise)
        print("FONT:", font)
        print("LAYOUT:", layout)



        status = "VALID" if confidence >= 80 else "SUSPICIOUS"

        category = classify_certificate(image_path)
        points = map_points(category)

        return {
            "status": status,
            "confidence": confidence,
            "category": category,
            "points": points
        }

    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))

    finally:
        file.file.close()

        # Always cleanup
        if os.path.exists(pdf_path):
            os.remove(pdf_path)

        if "image_path" in locals() and os.path.exists(image_path):
            os.remove(image_path)
