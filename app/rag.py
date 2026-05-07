import pdfplumber
from sentence_transformers import SentenceTransformer
import faiss
import numpy as np

model = SentenceTransformer("all-MiniLM-L6-v2")

index = None
documents = []

def load_pdf_to_chunks(file_path):
    global documents
    docs = []
    with pdfplumber.open(file_path) as pdf:
        for page in pdf.pages:
            text = page.extract_text() or ""
            chunks = [text[i:i+400] for i in range(0, len(text), 400)]
            docs.extend(chunks)
    documents = docs
    return docs

def build_faiss_index():
    global index
    embeddings = model.encode(documents)
    dim = embeddings.shape[1]
    index = faiss.IndexFlatL2(dim)
    index.add(embeddings)

def retrieve(query, top_k=3):
    global index
    if index is None:
        return []

    q_emb = model.encode([query])
    D, I = index.search(q_emb, top_k)
    return [documents[i] for i in I[0]]
