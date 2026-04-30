import pytesseract
from PIL import Image
import numpy as np


def font_check(image: str):
    """
    Returns (score, ocr_data) so the OCR result can be reused by classify.
    Score is based on font-height consistency (coefficient of variation).
    """
    img = Image.open(image)
    data = pytesseract.image_to_data(img, output_type=pytesseract.Output.DICT)

    heights = [h for h in data["height"] if h > 0]

    if len(heights) < 10:
        return 0.7, data  # assume okay if OCR weak

    heights = np.array(heights)
    mean = heights.mean()
    std = heights.std()

    cv = std / mean  # coefficient of variation
    score = 1 - min(cv / 1.2, 1)
    return max(0.5, min(score, 1.0)), data
