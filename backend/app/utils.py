import faiss
import pickle
from sentence_transformers import SentenceTransformer

model = SentenceTransformer("all-MiniLM-L6-v2")

def load_index():
    index = faiss.read_index("index.faiss")
    with open("docs.pkl", "rb") as f:
        docs = pickle.load(f)
    return index, docs

def retrieve_docs(query, k=5):
    index, docs = load_index()
    q_emb = model.encode([query])
    D, I = index.search(q_emb, k)
    return [docs[i] for i in I[0]]
