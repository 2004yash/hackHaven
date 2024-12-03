package services

import (
	"sync"

	"github.com/gorilla/websocket"
)

type Participant struct {
	Active bool // Indicates whether the participant is active or not
	ID     int  // Participant's ID
}
type Room struct {
	ID           string
	Participants map[*websocket.Conn]Participant
	Mutex        sync.Mutex
}

var Rooms = make(map[string]*Room)

// CreateRoom creates a new room with the given ID.
func CreateRoom(roomID string) *Room {
	room := &Room{
		ID:           roomID,
		Participants: make(map[*websocket.Conn]Participant),
	}
	Rooms[roomID] = room
	return room
}

// GetRoom retrieves a room by ID or creates it if it doesn't exist.
func GetRoom(roomID string) *Room {
	if room, exists := Rooms[roomID]; exists {
		return room
	}
	return CreateRoom(roomID)
}
