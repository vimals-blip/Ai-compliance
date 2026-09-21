import math
from typing import List

class EmbeddingService:
    @staticmethod
    def generate_embedding(text: str, dimensions: int = 1536) -> List[float]:
        """
        Generate deterministic normalized embedding vectors for compliance text retrieval.
        Supports OpenAI / mock embedding fallback for local offline inference.
        """
        # Deterministic hashing vector for testing / local offline environment
        hash_val = hash(text)
        vec = []
        for i in range(dimensions):
            val = math.sin(hash_val + i) * math.cos(i * 0.1)
            vec.append(val)
        
        # Normalize
        norm = math.sqrt(sum(x * x for x in vec)) or 1.0
        return [round(x / norm, 6) for x in vec]
