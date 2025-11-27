package agent

import (
	"context"
	"os"

	"github.com/sashabaranov/go-openai"
)

type Agent struct {
	ID           string
	Name         string
	SystemPrompt string
	client       *openai.Client
}

func NewAgent(id, name, systemPrompt string) *Agent {
	apiKey := os.Getenv("OPENAI_API_KEY")
	client := openai.NewClient(apiKey)
	
	return &Agent{
		ID:           id,
		Name:         name,
		SystemPrompt: systemPrompt,
		client:       client,
	}
}

func (a *Agent) Reply(userContent string) (string, error) {
	resp, err := a.client.CreateChatCompletion(
		context.Background(),
		openai.ChatCompletionRequest{
			Model: openai.GPT3Dot5Turbo,
			Messages: []openai.ChatCompletionMessage{
				{
					Role:    openai.ChatMessageRoleSystem,
					Content: a.SystemPrompt,
				},
				{
					Role:    openai.ChatMessageRoleUser,
					Content: userContent,
				},
			},
		},
	)

	if err != nil {
		// Fallback if no API key or error
		return "I'm having trouble thinking right now (Check API Key).", err
	}

	return resp.Choices[0].Message.Content, nil
}
