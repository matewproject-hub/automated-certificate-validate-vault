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

def layout_check(image, category="GENERAL"):
    img = cv2.imread(image, 0)
    if img is None:
        return 0

    template_dir = os.path.join(os.path.dirname(__file__), "templates")
    # Map category to template keywords
    category_map = {
        "COURSERA": ["Coursera"],
        "NPTEL": ["Introduction", "Internet of Things", "NPTEL", "MOOC"]
    }
    
    target_keywords = category_map.get(category, [])
    
    templates = []
    for file in glob.glob(os.path.join(template_dir, "*.png")) + glob.glob(os.path.join(template_dir, "*.jpg")):
        base = os.path.basename(file)
        # If we have targets, only match against relevant templates
        if target_keywords:
            if any(k.lower() in base.lower() for k in target_keywords):
                templates.append(cv2.imread(file, 0))
        else:
            templates.append(cv2.imread(file, 0))

    if not templates:
        # If it's a known category but we have no templates, be neutral
        # If it's GENERAL, be neutral
        return 0.6 if category == "GENERAL" else 0.5

    best_score = 0
    orb = cv2.ORB_create(1000)
    kp1, des1 = orb.detectAndCompute(img, None)

    if des1 is None:
        return 0.3

    for template in templates:
        kp2, des2 = orb.detectAndCompute(template, None)
        if des2 is None: continue
        bf = cv2.BFMatcher(cv2.NORM_HAMMING, crossCheck=True)
        matches = bf.match(des1, des2)
        if len(matches) == 0: continue
        score = len(matches) / max(len(kp1), len(kp2))
        best_score = max(best_score, score)

    # If category matched OCR but layout is totally different -> Penalty
    if best_score < 0.05:
        return 0.2 if category != "GENERAL" else 0.6
    
    return min(best_score * 3.0, 1.0)

