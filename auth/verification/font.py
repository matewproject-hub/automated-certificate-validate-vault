import pytesseract
from PIL import Image

def font_check(image):

    data = pytesseract.image_to_data(Image.open(image), output_type=pytesseract.Output.DICT)

    heights = [h for h in data["height"] if h > 0]

    if not heights:
        return 0.5

    variation = max(heights) - min(heights)

    score = 1 - (variation / max(heights))

    return max(0, min(score, 1))
