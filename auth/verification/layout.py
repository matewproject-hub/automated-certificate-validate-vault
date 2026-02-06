import cv2

def layout_check(image):

    img = cv2.imread(image, 0)

    edges = cv2.Canny(img, 50, 150)

    density = edges.mean()

    score = 1 - (density / 255)

    return max(0, min(score, 1))

