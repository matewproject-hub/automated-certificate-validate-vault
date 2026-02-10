import pytesseract
from PIL import Image
import numpy as np

def font_check(image):

    data = pytesseract.image_to_data(Image.open(image), output_type=pytesseract.Output.DICT)

    heights = [h for h in data["height"] if h > 0]

    if len(heights) < 10:
        return 0.7   # assume okay if OCR weak

    heights = np.array(heights)

    mean = heights.mean()
    std = heights.std()

    # coefficient of variation
    cv = std / mean

    # certificates usually between 0.3–0.7
    score = 1 - min(cv / 1.2, 1)

    return max(0.5, min(score, 1))
