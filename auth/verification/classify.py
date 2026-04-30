import pytesseract
from PIL import Image


def classify_certificate(image: str, ocr_data=None) -> str:
    """
    Classify certificate type from OCR text.
    ocr_data can be passed in to avoid a second Tesseract call.
    """
    if ocr_data is not None:
        # Reuse already-computed OCR data
        words = [w.lower() for w in ocr_data.get("text", []) if w.strip()]
        text = " ".join(words)
    else:
        text = pytesseract.image_to_string(Image.open(image)).lower()

    if "internship" in text:
        return "INTERNSHIP"
    if "hackathon" in text:
        return "HACKATHON"
    if "nptel" in text or "mooc" in text:
        return "NPTEL"
    if "workshop" in text:
        return "WORKSHOP"
    if "sports" in text:
        return "SPORTS"

    return "GENERAL"
