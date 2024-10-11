from openai import AsyncOpenAI
from typing import AsyncGenerator
from typing import Dict
from typing import List

class LLM:
    def __init__(self):
        self.client = AsyncOpenAI(
                base_url="https://api.groq.com/openai/v1",
                api_key="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"
        )

    async def infer(self, messages: List[Dict[str, str]]) -> AsyncGenerator:

        chat_completion = await self.client.chat.completions.create(
            model="llama3-8b-8192",
            messages=messages,
            stream=True,
        )

        async for chunk in chat_completion:
            yield chunk