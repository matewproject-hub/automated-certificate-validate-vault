import cv2
import os
import glob
from skimage.metrics import structural_similarity as ssim

def load_templates():
    template_dir = os.path.join(os.path.dirname(__file__), "templates")
    templates = []
    for file in glob.glob(os.path.join(template_dir, "*.png")) + glob.glob(os.path.join(template_dir, "*.jpg")):
        templates.append(cv2.imread(file, 0))
    return templates

def layout_check(image):
    img = cv2.imread(image, 0)
    if img is None:
        return 0

    templates = load_templates()
    print("TEMPLATES FOUND:", len(templates))
    best_score = 0

    # ORB feature matcher (structure based)
    orb = cv2.ORB_create(1000)
    kp1, des1 = orb.detectAndCompute(img, None)

    if des1 is None:
        return 0

    for template in templates:
        kp2, des2 = orb.detectAndCompute(template, None)
        if des2 is None:
            continue

        bf = cv2.BFMatcher(cv2.NORM_HAMMING, crossCheck=True)
        matches = bf.match(des1, des2)

        if len(matches) == 0:
            continue

        score = len(matches) / max(len(kp1), len(kp2))
        best_score = max(best_score, score)

    return min(best_score * 2, 1)

