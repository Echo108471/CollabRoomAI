# CollabRoomAI — Backend

This folder contains the backend for a real-time chat app with AI agents.

The backend is a small Go server built with Fiber and WebSockets. It maintains a hub that manages client connections, broadcasts messages, and automatically calls AI agent responses when a human message is posted.

## Quick Overview

- `main.go` — Entrypoint: starts the Fiber server, enables CORS, initializes the chat `Hub`, and exposes `/ws` for WebSocket connections.
- `internal/chat/hub.go` — Hub implementation: manages registration, broadcast, and agent responses.
- `internal/agent/agent.go` — Agent wrapper around the OpenAI SDK. Each agent has an ID, name, and system prompt describing its role.

## Environment

You should copy `backend/.env.example` to `backend/.env` and add your OpenAI API key there for local development.

Important env variables:

- `OPENAI_API_KEY` (required) — OpenAI API key for agents
- `OPENAI_MODEL` (optional) — Model to use (defaults to `gpt-3.5-turbo` if empty). Set this to a cheaper model to reduce cost.
- `PORT` (optional) — Server port (default `8080`).
- `FRONTEND_ORIGIN` (optional) — CORS origin (default `http://localhost:5173`).

`backend/.gitignore` ignores the `.env` file to keep secrets out of the repo.

## Development

Use Go to run the server locally. From the repository root:

PowerShell example:

```powershell
Push-Location "c:\Users\Eugene Cho\Desktop\CollabRoomAI\backend"
# Copy example
Copy-Item .\.env.example .\.env
# Add your API key (or use the environment directly)
$env:OPENAI_API_KEY = "sk-..."
# Optional: choose a cheaper model
$env:OPENAI_MODEL = "gpt-3.5-turbo"
# Run server
go run .
Pop-Location
```

If you prefer, run a quick build to verify everything compiles:

```powershell
Push-Location "c:\Users\Eugene Cho\Desktop\CollabRoomAI\backend"
go vet ./...
go build ./...
Pop-Location
```

## How to test the WebSocket

You can use a WebSocket client (like `wscat`) to connect to the server and send JSON messages in the expected `Message` shape.

Example `wscat` usage:

```bash
# Install wscat if you don't have it
npm install -g wscat

# Connect
wscat -c ws://localhost:8080/ws
```

Send a message (single-line JSON) with an author of type "human":

```json
{
  "id": "msg_1",
  "roomId": "1",
  "author": { "id": "u1", "name": "Alice", "type": "human" },
  "content": "Hello!",
  "createdAt": 0
}
```

The hub will broadcast the message to all clients, and you should see the agent replies come back shortly.

## Notes & Next Steps

- Cost: If you want to reduce LLM usage cost, set `OPENAI_MODEL` to a cheaper model (for example `gpt-3.5-turbo`) or consider using a local/OSS model via Ollama.
- Per-agent models: The current implementation uses one `OPENAI_MODEL` per agent instance. If you want specific agents to use different models, we can add per-agent configuration.
- Improve security: Do not store secrets in source control; load them from environment or a secret manager for production.

---

If you’d like, I can add a small startup script (PowerShell and/or a bash `run.sh`) to copy `.env.example` and start the server automatically, or add `godotenv` to load `.env` during development. Which would you prefer?