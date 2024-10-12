import os
import httpx
from langchain_community.document_loaders import PyPDFLoader
from langchain_huggingface import HuggingFaceEmbeddings
from langchain_experimental.text_splitter import SemanticChunker
from langchain_qdrant import QdrantVectorStore
from qdrant_client import QdrantClient
from qdrant_client.http.models import Distance, VectorParams
from langchain_groq import ChatGroq
from dotenv import load_dotenv

load_dotenv()  # Load environment variables from a .env file

def spro_protect_text(text):
    """Protect sensitive information in the text."""
    # API details
    url = 'https://spro.hridaai.com/v1/redact'
    headers = {
        'accept': 'application/json',
        'Content-Type': 'application/json'
    }
    data = {
        "api_key": "spro-sfVe4a5Ic10CiGuoIZxXj24123vtMYz2rt9S6uUWWW8",
        "prompt": text,
        "entities": ["PHONE_NUMBER", "EMAIL", "PERSON"]
    }
    
    # Call the API
    response = httpx.post(url, headers=headers, json=data)
    print(response)
    # Ensure the request was successful
    if response.status_code == 200:
        # Parse the JSON response
        response_data = response.json()
        return response_data.get("redacted_text", "")
    else:
        return f"Error: {response.status_code} - {response.text}"


@staticmethod
def load_pdf(file_path):
    """Load and return page content from a PDF file."""
    try:
        loader = PyPDFLoader(file_path)
        docs = loader.load()
        return [spro_protect_text(doc.page_content) for doc in docs]
    except FileNotFoundError:
        print(f"File not found: {file_path}")
        return []

@staticmethod
def initialize_qdrant_client(db_path="qdrant_vector_db"):
    """Initialize Qdrant client."""
    return QdrantClient(path=db_path)

@staticmethod
def create_vector_store(client, collection_name, embedding_model, semantic_docs=None):
    """Create or retrieve a Qdrant vector store."""
    if not client.collection_exists(collection_name=collection_name):
        client.create_collection(
            collection_name=collection_name,
            vectors_config=VectorParams(size=768, distance=Distance.COSINE),
        )
        
        vector_store = QdrantVectorStore(
            client=client,
            collection_name=collection_name,
            embedding=embedding_model,
        )
        if semantic_docs:
            vector_store.add_documents(documents=semantic_docs)

    return QdrantVectorStore(
        client=client,
        collection_name=collection_name,
        embedding=embedding_model,
    )

@staticmethod
def perform_similarity_search(vector_store, query, k=3):
    """Perform similarity search and return concatenated results."""
    relevant_data = []
    results = vector_store.similarity_search_with_relevance_scores(query, k=k)

    for res in results:
        relevant_data.append({
            'content': res[0].page_content,
            'score': res[1]
        })
    
    return relevant_data

def invoke_llm(relevant_results, query, api_key):
    """Invoke the ChatGroq model with the specified query and relevant results."""
    llm = ChatGroq(
        api_key=api_key,
        model="llama-3.2-11b-vision-preview",
        temperature=0,
        max_tokens=2000,
        timeout=None,
        max_retries=2,
    )

    messages = [
        {
            "role": "system",
            "content": (
                "You are a Professional Business Strategy Analyst. Based on the Company "
                "Business and Fundamental data, answer the questions only based on the following business "
                f"data: ```{relevant_results}```."
            ),
        },
        {
            "role": "user",
            "content": query,
        },
    ]

    ai_msg = llm.invoke(messages)
    return ai_msg.content

# def main():
#     file_path = "Press Release - INR.pdf"
#     collection_name = "hridaai"
#     query = "What is the revenue for June 2023"
#     api_key = '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'

#     pages = load_pdf(file_path)
#     if not pages:
#         print("No pages loaded from PDF.")
#         return

#     embeddings_model = HuggingFaceEmbeddings(model_name="sentence-transformers/all-mpnet-base-v2")
#     text_splitter = SemanticChunker(embeddings_model)
#     semantic_docs = text_splitter.create_documents(pages)
    
#     client = initialize_qdrant_client()
#     vector_store = create_vector_store(client, collection_name, embeddings_model, semantic_docs)
    
#     relevant_results = perform_similarity_search(vector_store, query, k=5)
#     print("Relevant Results:", relevant_results)

#     if relevant_results:
#         response = invoke_llm(relevant_results, query, api_key)
#         print("AI Response:", response)
#     else:
#         print("No relevant results found for the query.")

# if __name__ == "__main__":
#     main()
