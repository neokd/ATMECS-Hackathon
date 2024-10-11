# from langchain_community.document_loaders import PyPDFLoader
# from langchain_huggingface import HuggingFaceEmbeddings
# from langchain_experimental.text_splitter import SemanticChunker
# from langchain_qdrant import QdrantVectorStore
# from qdrant_client import QdrantClient
# from qdrant_client.http.models import Distance, VectorParams
# from langchain_qdrant import FastEmbedSparse, RetrievalMode
# from langchain_groq import ChatGroq


# file_path = "Press Release - INR.pdf"
# loader = PyPDFLoader(file_path)
# docs = loader.load()

# embeddings_model = HuggingFaceEmbeddings(model_name="sentence-transformers/all-mpnet-base-v2")

# pages = []
# for doc in docs:
#     pages.append(doc.page_content)

# text_splitter = SemanticChunker(embeddings_model)

# semantic_docs = text_splitter.create_documents(pages)

# client = QdrantClient(path="qdrant_vector_db")

# collection_existance = client.collection_exists(collection_name="hridaai") 

# if collection_existance:

#     print("0393819483258473854735836789753")
    
#     vector_store = QdrantVectorStore(
#     client=client,
#     collection_name="hridaai",
#     embedding=embeddings_model,
# )
    
#     query = "how many headcount for last quater ?"
#     results = vector_store.similarity_search(query, k=3)

#     relavant_results = ''
#     for res in results:
#         relavant_results += res.page_content
    
#     llm = ChatGroq(
#     api_key = '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',
#     model="llama-3.2-11b-vision-preview",
#     temperature=0,
#     max_tokens=2000,
#     timeout=None,
#     max_retries=2,
#     )

#     messages = [
#         {
#             "role": "system",
#             "content": (
#                 "You are a Professional Business Strategy Analyst. Based on the Company "
#                 "Business and Fundamental data, You should Answer the questions only based on the following business "
#                 f"data ```{relavant_results}```."
#             ),
#         },
#         {
#             "role": "user",
#             "content": query,
#         },
#     ]

#     print("(((((((())))))))",messages)

#     ai_msg = llm.invoke(messages)

#     print("*************",ai_msg.content)

# else:





#     print("737e 37ryb37ry7nx37rx73nynrenryr grfy4 xryh4 rf43ede")





#     client.create_collection(
#         collection_name="hridaai",
#         vectors_config=VectorParams(size=768, distance=Distance.COSINE),
#      )

#     vector_store = QdrantVectorStore(
#         client=client,
#         collection_name="hridaai",
#         embedding=embeddings_model,
#     )

#     vector_store.add_documents(documents= semantic_docs)

#     query = "how many headcount for last quater ?"
#     results = vector_store.similarity_search(query, k=3)

#     relavant_results = ''
#     for res in results:
#         relavant_results += res.page_content
#         print(f"* {res.page_content} [{res.metadata}]")


#     llm = ChatGroq(
#         api_key = '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',
#         model="llama-3.2-11b-vision-preview",
#         temperature=0,
#         max_tokens=2000,
#         timeout=None,
#         max_retries=2,
#     )

#     messages = [
#         {
#             "role": "system",
#             "content": (
#                 "You are a Professional Business Strategy Analyst. Based on the Company "
#                 "Business and Fundamental data, You should Answer the questions only based on the following business "
#                 f"data ```{relavant_results}```."
#             ),
#         },
#         {
#             "role": "user",
#             "content": query,
#         },
#     ]

#     print("(((((((())))))))",messages)

#     ai_msg = llm.invoke(messages)

#     print("*************",ai_msg.content)


from langchain_community.document_loaders import PyPDFLoader
from langchain_huggingface import HuggingFaceEmbeddings
from langchain_experimental.text_splitter import SemanticChunker
from langchain_qdrant import QdrantVectorStore
from qdrant_client import QdrantClient
from qdrant_client.http.models import Distance, VectorParams
from langchain_groq import ChatGroq


def load_pdf(file_path):
    """Load and return page content from a PDF file."""
    loader = PyPDFLoader(file_path)
    docs = loader.load()
    return [doc.page_content for doc in docs]


def initialize_qdrant_client(db_path="qdrant_vector_db"):
    """Initialize Qdrant client."""
    return QdrantClient(path=db_path)


def create_vector_store(client, collection_name, embedding_model):
    """Create or retrieve a Qdrant vector store."""
    if not client.collection_exists(collection_name=collection_name):
        client.create_collection(
            collection_name=collection_name,
            vectors_config=VectorParams(size=768, distance=Distance.COSINE),
        )
    return QdrantVectorStore(
        client=client,
        collection_name=collection_name,
        embedding=embedding_model,
    )


def perform_similarity_search(vector_store, query, k=3):
    """Perform similarity search and return concatenated results."""
    results = vector_store.similarity_search(query, k=k)
    return "\n".join([res.page_content for res in results])


def invoke_llm(relavant_results, query, api_key):
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
                "Business and Fundamental data, You should Answer the questions only based on the following business "
                f"data ```{relavant_results}```."
            ),
        },
        {
            "role": "user",
            "content": query,
        },
    ]

    ai_msg = llm.invoke(messages)
    return ai_msg.content


def main():
    file_path = "Press Release - INR.pdf"
    collection_name = "hridaai"
    query = "how many headcount for last quarter?"
    api_key = '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'

    pages = load_pdf(file_path)

    embeddings_model = HuggingFaceEmbeddings(model_name="sentence-transformers/all-mpnet-base-v2")
    text_splitter = SemanticChunker(embeddings_model)
    semantic_docs = text_splitter.create_documents(pages)

    client = initialize_qdrant_client()
    vector_store = create_vector_store(client, collection_name, embeddings_model)

    if not client.collection_exists(collection_name):
        vector_store.add_documents(documents=semantic_docs)
    
    relevant_results = perform_similarity_search(vector_store, query)

    response = invoke_llm(relevant_results, query, api_key)
    
    print("AI Response:", response)


if __name__ == "__main__":
    main()
