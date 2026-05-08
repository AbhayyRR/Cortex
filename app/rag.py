import pdfplumber
from sentence_transformers import SentenceTransformer
import faiss
import numpy as np

model = SentenceTransformer("all-MiniLM-L6-v2")

index = None
documents = []
document_sources = []  # Track source information for each chunk

def load_pdf_to_chunks(file_path):
    global documents, document_sources
    docs = []
    sources = []
    with pdfplumber.open(file_path) as pdf:
        for page_num, page in enumerate(pdf.pages):
            text = page.extract_text() or ""
            chunks = [text[i:i+400] for i in range(0, len(text), 400)]
            for chunk in chunks:
                docs.append(chunk)
                sources.append({
                    'filename': file_path.split('\\')[-1],
                    'page': page_num + 1,
                    'chunk_index': len(document_sources) + len(sources)
                })
    documents.extend(docs)
    document_sources.extend(sources)
    return docs

def build_faiss_index():
    global index
    embeddings = model.encode(documents)
    dim = embeddings.shape[1]
    index = faiss.IndexFlatL2(dim)
    index.add(embeddings)

def retrieve(query, top_k=3):
    global index, document_sources
    if index is None:
        return []

    q_emb = model.encode([query])
    D, I = index.search(q_emb, top_k)
    
    results = []
    for idx in I[0]:
        results.append({
            'text': documents[idx],
            'source': document_sources[idx],
            'confidence': float(1 / (1 + D[0][list(I[0]).index(idx)]))  # Convert distance to confidence score
        })
    
    return results
