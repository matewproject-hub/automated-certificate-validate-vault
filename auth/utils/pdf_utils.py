from pdf2image import convert_from_path
import os
import uuid


def pdf_to_image(pdf_path):

    images = convert_from_path(pdf_path, dpi=300)

    if not images:
        raise ValueError("No pages found in PDF")

    output_path = pdf_path.replace(".pdf", ".png")

    images[0].save(output_path, "PNG")

    return output_path
