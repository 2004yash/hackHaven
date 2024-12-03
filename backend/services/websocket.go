package services

import (
	"fmt"
	services "hackathon-platform/backend/models"
	"log"
	"net/http"

	"github.com/gorilla/websocket"
)

var participantID = 1

// WebSocket upgrader
var upgrader = websocket.Upgrader{
	CheckOrigin: func(r *http.Request) bool {
		return true
	},
}

// Client represents a single connection
type Client struct {
	Conn *websocket.Conn
	Send chan []byte
}

// HandleWebSocket establishes a WebSocket connection
func HandleWebSocket(w http.ResponseWriter, r *http.Request) {
	// Upgrade HTTP connection to WebSocket
	conn, err := upgrader.Upgrade(w, r, nil)
	if err != nil {
		http.Error(w, "Failed to upgrade WebSocket", http.StatusInternalServerError)
		return
	}

	// Get the room ID from query parameters
	roomID := r.URL.Query().Get("roomID")
	if roomID == "" {
		http.Error(w, "Missing roomID parameter", http.StatusBadRequest)
		return
	}
	room := services.GetRoom(roomID)
	// Add participant to the room
	room.Mutex.Lock()
	// Create a new participant and add to the room's Participants map
	participant := services.Participant{
		Active: true,
		ID:     participantID, // Here, we're using the room ID as the participant ID for simplicity
	}
	room.Participants[conn] = participant
	participantID++
	sendPlayerJoinMessage(conn, participantID, room)
	room.Mutex.Unlock()

	// Handle participant communication
	defer func() {
		// Remove participant on disconnect
		room.Mutex.Lock()
		sendPlayerLeaveMessage(conn, room.Participants[conn].ID, room)
		delete(room.Participants, conn)
		room.Mutex.Unlock()
		conn.Close()
	}()

	for {
		// Read message from participant
		_, msg, err := conn.ReadMessage()
		if err != nil {
			break
		}

		// Broadcast message to the room
		room.Mutex.Lock()
		for participant := range room.Participants {
			if err := participant.WriteMessage(websocket.TextMessage, msg); err != nil {
				participant.Close()
				delete(room.Participants, participant)
			}
		}
		room.Mutex.Unlock()
	}
}

// ReadPump handles incoming messages
func (c *Client) ReadPump() {
	defer c.Conn.Close()
	for {
		_, msg, err := c.Conn.ReadMessage()
		if err != nil {
			log.Println("Read Error:", err)
			break
		}
		log.Println("Received:", string(msg))
	}
}

// WritePump sends messages to the client
func (c *Client) WritePump() {
	defer c.Conn.Close()
	for msg := range c.Send {
		err := c.Conn.WriteMessage(websocket.TextMessage, msg)
		if err != nil {
			log.Println("Write Error:", err)
			break
		}
	}
}
func sendPlayerJoinMessage(currentconn *websocket.Conn, playerCount int, room *services.Room) {
	message := fmt.Sprintf("player %d joined", playerCount)
	for conn := range room.Participants {
		if conn == currentconn {
			continue
		}
		if err := conn.WriteMessage(websocket.TextMessage, []byte(message)); err != nil {
			log.Println("Error sending message:", err)
			conn.Close()
			delete(room.Participants, conn)
		}
	}
}
func sendPlayerLeaveMessage(currentconn *websocket.Conn, playerCount int, room *services.Room) {
	message := fmt.Sprintf("player %d left", playerCount)
	for conn := range room.Participants {
		if conn == currentconn {
			continue
		}
		if err := conn.WriteMessage(websocket.TextMessage, []byte(message)); err != nil {
			log.Println("Error sending message:", err)
			conn.Close()
			delete(room.Participants, conn)
		}
	}
}
