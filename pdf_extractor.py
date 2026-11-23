import re
import pdfplumber

def extract_books_from_pdf(pdf_source) -> list[dict[str, str]]:
    """Extract 'Title by Author' entries from a PDF path or uploaded file stream."""
    books = []
    with pdfplumber.open(pdf_source) as pdf:
        for page in pdf.pages:
            text = page.extract_text()
            if not text:
                continue
            for raw_line in text.split("\n"):
                # Remove leading bullets or numbers (e.g., "1. " or "- ") if present
                line = re.sub(r"^\s*(?:[\-\*\•]|\d+[\.\)])\s+", "", raw_line).strip()
                if not line:
                    continue

                # Split from the right on " by " (case-insensitive)
                parts = re.split(r"\s+by\s+", line, flags=re.IGNORECASE)
                if len(parts) >= 2:
                    author = parts[-1].strip()
                    title = " by ".join(parts[:-1]).strip()
                    books.append({"title": title, "author": author})
                else:
                    books.append({"title": line, "author": "Unknown"})
    return books


if __name__ == "__main__":
    # Point this to your actual PDF path to test
    extracted = extract_books_from_pdf("samples/sample_books.pdf")
    print(f"Extracted {len(extracted)} books:")
    for item in extracted:
        print(item)