from pdf2image import convert_from_path
import os


def pdf_to_image(pdf_path: str) -> str:
    """Convert first page of a PDF to PNG at 150 DPI (fast, sufficient for OCR + CV checks)."""
    images = convert_from_path(pdf_path, dpi=150)

    if not images:
        raise ValueError("No pages found in PDF")

    output_path = pdf_path.replace(".pdf", ".png")
    images[0].save(output_path, "PNG")
    return output_path
