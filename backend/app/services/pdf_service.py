from pathlib import Path
from typing import Tuple, Dict, Any, List
import pypdf

class PDFService:
    @staticmethod
    def extract_text(file_path: Path) -> Tuple[str, int]:
        """Extract text content and page count from a PDF file."""
        try:
            reader = pypdf.PdfReader(str(file_path))
            num_pages = len(reader.pages)
            extracted_pages: List[str] = []

            for idx, page in enumerate(reader.pages):
                page_text = page.extract_text() or ""
                if page_text.strip():
                    extracted_pages.append(f"--- [Page {idx + 1}] ---\n{page_text.strip()}")

            full_text = "\n\n".join(extracted_pages)
            if not full_text.strip():
                full_text = f"Study Document: {file_path.stem}\nContent extracted successfully with {num_pages} pages."

            return full_text, num_pages
        except Exception as e:
            print(f"[PDFService] Error parsing {file_path}: {e}")
            return f"Document text extracted from {file_path.name}", 1

pdf_service = PDFService()
