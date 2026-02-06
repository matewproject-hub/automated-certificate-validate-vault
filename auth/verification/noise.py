import cv2

def noise_check(image):

    img = cv2.imread(image, 0)

    denoised = cv2.fastNlMeansDenoising(img)

    noise = cv2.absdiff(img, denoised)

    score = 1 - (noise.mean() / 255)

    return max(0, min(score, 1))
