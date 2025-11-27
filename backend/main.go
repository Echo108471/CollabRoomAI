package main

import (
	"log"

	"github.com/Echo108471/CollabRoomAI/backend/internal/chat"
	"github.com/gofiber/contrib/websocket"
	"github.com/gofiber/fiber/v2"
	"github.com/gofiber/fiber/v2/middleware/cors"
)

func main() {
	app := fiber.New()

	// Enable CORS for frontend
	app.Use(cors.New(cors.Config{
		AllowOrigins: "http://localhost:5173",
		AllowHeaders: "Origin, Content-Type, Accept",
	}))

	// Initialize Chat Hub
	hub := chat.NewHub()
	go hub.Run()

	// WebSocket Upgrade Middleware
	app.Use("/ws", func(c *fiber.Ctx) error {
		if websocket.IsWebSocketUpgrade(c) {
			c.Locals("allowed", true)
			return c.Next()
		}
		return fiber.ErrUpgradeRequired
	})

	// WebSocket Route
	app.Get("/ws", websocket.New(func(c *websocket.Conn) {
		hub.HandleConnection(c)
	}))

	log.Fatal(app.Listen(":8080"))
}
