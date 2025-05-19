from sentence_transformers import SentenceTransformer
import fitz 
import docx
import os
import pickle
import faiss
import requests
from bs4 import BeautifulSoup
from urllib.parse import urljoin

model = SentenceTransformer("all-MiniLM-L6-v2")

class Embedder:
    def __init__(self):
        self.docs = []
        self.embeddings = None
        self.index = None

    def extract_text_from_pdf(self, file_path):
        doc = fitz.open(file_path)
        for page in doc:
            text = page.get_text().strip()
            if text:
                self.docs.append(text)

    def extract_text_from_docx(self, file_path):
        doc = docx.Document(file_path)
        text = "\n".join([para.text for para in doc.paragraphs if para.text.strip()])
        if text:
            self.docs.append(text)

    def crawl_and_extract(self, base_url):
        seen = set()
        to_visit = [base_url]
        while to_visit:
            url = to_visit.pop()
            if url in seen or "angelone.in/support" not in url:
                continue
            seen.add(url)
            try:
                res = requests.get(url, timeout=10)
                soup = BeautifulSoup(res.text, "html.parser")
                for p in soup.find_all("p"):
                    text = p.get_text().strip()
                    if text:
                        self.docs.append(text)
                for a in soup.find_all("a", href=True):
                    new_url = urljoin(url, a['href'])
                    if new_url.startswith("https://www.angelone.in/support"):
                        to_visit.append(new_url)
            except Exception as e:
                print(f"Failed to fetch {url}: {e}")

    def build_index(self):
        self.embeddings = model.encode(self.docs, batch_size=32, show_progress_bar=True)
        dim = self.embeddings.shape[1]
        self.index = faiss.IndexFlatL2(dim)
        self.index.add(self.embeddings)
        with open("docs.pkl", "wb") as f:
            pickle.dump(self.docs, f)
        faiss.write_index(self.index, "index.faiss")

if __name__ == "__main__":
    embedder = Embedder()

    # Crawl all support pages
    embedder.crawl_and_extract("https://www.angelone.in/support")

    # Process insurance PDFs from a folder
    for file in os.listdir("RAG-ChatBot/backend/app/documents"):
        full_path = os.path.join("RAG-ChatBot/backend/app/documents", file)
        if file.endswith(".pdf"):
            embedder.extract_text_from_pdf(full_path)
        elif file.endswith(".docx"):
            embedder.extract_text_from_docx(full_path)

    embedder.build_index()
    print("Index built successfully!")