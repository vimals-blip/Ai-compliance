import re
from typing import List, Dict, Any

class DocumentChunk:
    def __init__(self, text: str, page: int = 1, section: str = "", chunk_index: int = 0):
        self.text = text
        self.page = page
        self.section = section
        self.chunk_index = chunk_index

    def to_dict(self) -> Dict[str, Any]:
        return {
            "text": self.text,
            "page": self.page,
            "section": self.section,
            "chunk_index": self.chunk_index,
        }

class DocumentParser:
    @staticmethod
    def chunk_text(text: str, chunk_size: int = 500, overlap: int = 50) -> List[DocumentChunk]:
        """Split raw text into overlapping token/word chunks with section headers."""
        paragraphs = text.split("\n\n")
        chunks: List[DocumentChunk] = []
        current_section = "General"
        chunk_idx = 0
        current_buffer: List[str] = []
        current_len = 0
        current_page = 1

        for para in paragraphs:
            para = para.strip()
            if not para:
                continue

            # Detect page markers like [Page 2] or ---
            page_match = re.search(r'\[(?:Page|p\.)\s*(\d+)\]', para, re.IGNORECASE)
            if page_match:
                current_page = int(page_match.group(1))

            # Detect section header
            if para.startswith("#") or (len(para) < 60 and para.isupper()):
                current_section = para.lstrip("#").strip()

            words = para.split()
            if current_len + len(words) > chunk_size and current_buffer:
                chunk_text = " ".join(current_buffer)
                chunks.append(DocumentChunk(
                    text=chunk_text,
                    page=current_page,
                    section=current_section,
                    chunk_index=chunk_idx
                ))
                chunk_idx += 1
                # Retain overlap words
                current_buffer = current_buffer[-overlap:] if overlap < len(current_buffer) else []
                current_len = len(current_buffer)

            current_buffer.extend(words)
            current_len += len(words)

        if current_buffer:
            chunk_text = " ".join(current_buffer)
            chunks.append(DocumentChunk(
                text=chunk_text,
                page=current_page,
                section=current_section,
                chunk_index=chunk_idx
            ))

        return chunks
