import pytesseract
from PIL import Image

def classify_certificate(image):

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
