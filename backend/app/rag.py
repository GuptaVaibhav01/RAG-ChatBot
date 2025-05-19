import together
import os
from dotenv import load_dotenv
from .utils import retrieve_docs

load_dotenv(dotenv_path=os.path.join(os.path.dirname(__file__), ".env"))
api_key = os.getenv("TOGETHER_API_KEY")

if not api_key:
    raise ValueError("TOGETHER_API_KEY not found in environment")

together.api_key = api_key
# from transformers import AutoModelForCausalLM, AutoTokenizer, pipeline

# tokenizer = AutoTokenizer.from_pretrained("tiiuae/falcon-rw-1b")
# model = AutoModelForCausalLM.from_pretrained(
#     "tiiuae/falcon-rw-1b",
#     device_map="auto",
#     offload_folder="./offload"
# )
# pipe = pipeline("text-generation", model=model, tokenizer=tokenizer)

def generate_answer(query):
    context_docs = retrieve_docs(query)
    context = "\\n".join(context_docs)
    
    if not context.strip():
        return "I don't know"

    prompt = f"""You are a helpful assistant. Use ONLY the information below to answer the question. 
If the answer is not contained in the context, respond with "I don't know".

Context:
{context}

Question: {query}
Answer:"""

    try:
        response = together.Complete.create(
            model="mistralai/Mistral-7B-Instruct-v0.1",
            prompt=prompt,
            max_tokens=512,
            temperature=0.3,
            top_p=0.9,
            stop=["\n\n"]
        )

        answer = response['choices'][0]['text'].strip()
        return answer if answer else "I don't know"

    except Exception as e:
        print(f"[Together AI Error]: {e}")
        return "Oops! Something went wrong while generating the answer."
    
    