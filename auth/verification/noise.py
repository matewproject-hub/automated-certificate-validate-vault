import cv2
import numpy as np


def noise_check(image: str) -> float:
    """
    Uses Laplacian variance to estimate noise/blur.
    High variance = sharp, clean image (good certificate).
    Low variance = blurry or heavily manipulated.
    Returns a score between 0 and 1.
    """
    img = cv2.imread(image, 0)
    if img is None:
        return 0.5

    lap_var = cv2.Laplacian(img, cv2.CV_64F).var()

    # At 150 DPI, clean certificate PDFs typically have lap_var of 200–1000+
    # Threshold of 300 gives score ~0.7–1.0 for clean certs
    score = min(lap_var / 300.0, 1.0)
    return max(0.0, score)
