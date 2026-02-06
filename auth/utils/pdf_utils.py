from pdf2image import convert_from_path

def pdf_to_image(pdf_path):
    images = convert_from_path(pdf_path)
    image_path = pdf_path.replace(".pdf", ".png")
    images[0].save(image_path, "PNG")
    return image_path
