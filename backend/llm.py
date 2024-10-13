from openai import AsyncOpenAI
from typing import AsyncGenerator
from typing import Dict
from typing import List
from dotenv import load_dotenv
import os
load_dotenv()
class LLM:
    def __init__(self):
        self.client = AsyncOpenAI(
                base_url="https://api.together.xyz/v1",
                api_key=os.getenv("TOGETHER_API_KEY"),
        )

    async def infer(self, messages: List[Dict[str, str]]) -> AsyncGenerator:

        chat_completion = await self.client.chat.completions.create(
            model="meta-llama/Llama-Vision-Free",
            messages=messages,
            stream=True,
        )

        async for chunk in chat_completion:
            yield chunk