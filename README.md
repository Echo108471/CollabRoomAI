# CollabRoomAI



Modern teams live in chat, but important insights get lost in scroll-back, files get lost, and people burn time re-explaining the same info. By placing an AI “teammate” inside the room, we can turn every message, file, and thread into searchable, actionable knowledge in real time.


Goals:


- Summarize any slice of the conversation or an uploaded file on demand.
- Answer questions about the ongoing discussion or past context (memory).
- Stay present in the same stream as everyone else, with no context-switching.


Planned Tech Stack:
- Frontend: Svelte, Tailwind, WebSocket client
- Backend: Golang (Fiber / Gorilla WS)
- LLM: OpenAI API or Ollama
- DB: PostgreSQL

Configuration:
- To change the OpenAI model used by the backend agents, set the `OPENAI_MODEL` environment variable before starting the server.
	- Example (cheaper model): `OPENAI_MODEL=gpt-3.5-turbo`
	- Example (higher-quality, more expensive): `OPENAI_MODEL=gpt-4o`  # replace with your preferred model name
	- If `OPENAI_MODEL` is not set, the backend defaults to `gpt-3.5-turbo`.

Tip: If you want to lower cost further, consider using smaller or open-source models via Ollama/local inference or route messages through a lightly-weight local model, and reserve higher-cost OpenAI models for critical requests.
