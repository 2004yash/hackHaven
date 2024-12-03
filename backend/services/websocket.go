package services

import (
	"encoding/json"
	"log"
	"net/http"

	services "hackathon-platform/backend/models"

	"github.com/gorilla/websocket"
)

var participantID = 1

// WebSocket upgrader
var upgrader = websocket.Upgrader{
	CheckOrigin: func(r *http.Request) bool {
		return true
	},
}

// ParticipantMessage represents a message for participant actions
type ParticipantMessage struct {
	Type    string  `json:"type"` // "move", "join", or "leave"
	ID      int     `json:"id"`
	X       float64 `json:"x,omitempty"` // X coordinate (optional for non-move messages)
	Y       float64 `json:"y,omitempty"` // Y coordinate (optional for non-move messages)
	Message string  `json:"msg,omitempty"`
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
	participant := services.Participant{
		Active: true,
		ID:     participantID,
		X:      0, // Default initial position
		Y:      0, // Default initial position
	}
	room.Participants[conn] = participant
	participantID++
	sendPlayerJoinMessage(conn, participant.ID, room)
	sendCurrentOtherPlayerDetails(conn, room)
	room.Mutex.Unlock()

	// Handle participant communication
	defer func() {
		// Remove participant on disconnect
		room.Mutex.Lock()
		sendPlayerLeaveMessage(participant.ID, room)
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

		// Parse the message
		var message ParticipantMessage
		err = json.Unmarshal(msg, &message)
		if err != nil {
			log.Println("Error unmarshalling message:", err)
			continue
		}

		// Handle the message type
		if message.Type == "move" {
			room.Mutex.Lock()
			participant := room.Participants[conn]
			participant.X = message.X
			participant.Y = message.Y
			room.Participants[conn] = participant
			broadcastMovementMessage(participant.ID, message.X, message.Y, room)
			room.Mutex.Unlock()
		}
		if message.Type == "message" {
			room.Mutex.Lock()
			broadcastMessage(message, room)
			room.Mutex.Unlock()
		}
	}
}
func sendCurrentOtherPlayerDetails(currentConn *websocket.Conn, room *services.Room) {
	for conn := range room.Participants {
		if conn == currentConn {
			continue
		}
		message := ParticipantMessage{
			Type: "join",
			ID:   room.Participants[conn].ID,
			X:    room.Participants[conn].X,
			Y:    room.Participants[conn].Y,
		}
		data, err := json.Marshal(message)
		if err != nil {
			log.Println("Error marshalling message:", err)
			return
		}
		if err := currentConn.WriteMessage(websocket.TextMessage, data); err != nil {
			log.Println("Error sending message:", err)
			currentConn.Close()
			delete(room.Participants, currentConn)
		}
	}
}

// Send join message to all participants except the sender
func sendPlayerJoinMessage(currentConn *websocket.Conn, playerID int, room *services.Room) {
	message := ParticipantMessage{
		Type: "join",
		ID:   playerID,
	}
	broadcastMessageExcept(message, currentConn, room)
}

// Send leave message to all participants
func sendPlayerLeaveMessage(playerID int, room *services.Room) {
	message := ParticipantMessage{
		Type: "leave",
		ID:   playerID,
	}
	broadcastMessage(message, room)
}

// Broadcast movement message to all participants
func broadcastMovementMessage(playerID int, x, y float64, room *services.Room) {
	message := ParticipantMessage{
		Type: "move",
		ID:   playerID,
		X:    x,
		Y:    y,
	}
	broadcastMessage(message, room)
}

// Broadcast a message to all participants
func broadcastMessage(message ParticipantMessage, room *services.Room) {
	data, err := json.Marshal(message)
	if err != nil {
		log.Println("Error marshalling message:", err)
		return
	}
	for conn := range room.Participants {
		if err := conn.WriteMessage(websocket.TextMessage, data); err != nil {
			log.Println("Error sending message:", err)
			conn.Close()
			delete(room.Participants, conn)
		}
	}
}

// Broadcast a message to all participants except the sender
func broadcastMessageExcept(message ParticipantMessage, excludeConn *websocket.Conn, room *services.Room) {
	data, err := json.Marshal(message)
	if err != nil {
		log.Println("Error marshalling message:", err)
		return
	}
	for conn := range room.Participants {
		if conn == excludeConn {
			continue
		}
		if err := conn.WriteMessage(websocket.TextMessage, data); err != nil {
			log.Println("Error sending message:", err)
			conn.Close()
			delete(room.Participants, conn)
		}
	}
}
