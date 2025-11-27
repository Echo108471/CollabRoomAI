package chat

import (
	"log"
	"sync"
	"time"

	"github.com/Echo108471/CollabRoomAI/backend/internal/agent"
	"github.com/gofiber/contrib/websocket"
)

// Message represents a chat message
type Message struct {
	ID        string      `json:"id"`
	RoomID    string      `json:"roomId"`
	Author    Participant `json:"author"`
	Content   string      `json:"content"`
	CreatedAt int64       `json:"createdAt"`
}

// Participant represents a user or agent
type Participant struct {
	ID   string `json:"id"`
	Name string `json:"name"`
	Type string `json:"type"` // "human" or "agent"
}

// Hub maintains the set of active clients and broadcasts messages
type Hub struct {
	clients    map[*websocket.Conn]bool
	broadcast  chan Message
	register   chan *websocket.Conn
	unregister chan *websocket.Conn
	agents     []*agent.Agent
	mutex      sync.Mutex
}

func NewHub() *Hub {
	h := &Hub{
		broadcast:  make(chan Message),
		register:   make(chan *websocket.Conn),
		unregister: make(chan *websocket.Conn),
		clients:    make(map[*websocket.Conn]bool),
		agents:     []*agent.Agent{},
	}

	// Initialize Agents
	h.agents = append(h.agents, agent.NewAgent("a1", "HelperBot", "You are a helpful project assistant. Keep answers concise and actionable."))
	h.agents = append(h.agents, agent.NewAgent("a2", "SkepticBot", "You are a skeptical critic. Question assumptions and point out potential risks."))

	return h
}

func (h *Hub) Run() {
	for {
		select {
		case conn := <-h.register:
			h.mutex.Lock()
			h.clients[conn] = true
			h.mutex.Unlock()

		case conn := <-h.unregister:
			h.mutex.Lock()
			if _, ok := h.clients[conn]; ok {
				delete(h.clients, conn)
				conn.Close()
			}
			h.mutex.Unlock()

		case message := <-h.broadcast:
			// Send to all connected clients
			h.mutex.Lock()
			for conn := range h.clients {
				if err := conn.WriteJSON(message); err != nil {
					log.Println("write error:", err)
					conn.Close()
					delete(h.clients, conn)
				}
			}
			h.mutex.Unlock()

			// If it's a human message, let agents listen
			if message.Author.Type == "human" {
				go h.processAgentResponses(message)
			}
		}
	}
}

func (h *Hub) HandleConnection(c *websocket.Conn) {
	h.register <- c
	defer func() {
		h.unregister <- c
	}()

	for {
		var msg Message
		err := c.ReadJSON(&msg)
		if err != nil {
			if websocket.IsUnexpectedCloseError(err, websocket.CloseGoingAway, websocket.CloseAbnormalClosure) {
				log.Println("read error:", err)
			}
			break
		}

		// Ensure server-side timestamp and ID if missing (simplified)
		if msg.CreatedAt == 0 {
			msg.CreatedAt = time.Now().UnixMilli()
		}

		h.broadcast <- msg
	}
}

func (h *Hub) processAgentResponses(userMsg Message) {
	for _, a := range h.agents {
		// Simulate thinking delay
		time.Sleep(1 * time.Second)

		replyContent, err := a.Reply(userMsg.Content)
		if err != nil {
			log.Printf("Agent %s error: %v", a.Name, err)
			continue
		}

		replyMsg := Message{
			ID:     uid(),
			RoomID: userMsg.RoomID,
			Author: Participant{
				ID:   a.ID,
				Name: a.Name,
				Type: "agent",
			},
			Content:   replyContent,
			CreatedAt: time.Now().UnixMilli(),
		}

		h.broadcast <- replyMsg
	}
}

func uid() string {
	return "msg_" + time.Now().Format("20060102150405") // Simplified UID
}
