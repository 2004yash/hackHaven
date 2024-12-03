package services

import (
	"sync"

	"github.com/gorilla/websocket"
)

type Participant struct {
	Active bool
	ID     int
	X      float64 // Add X for coordinates
	Y      float64 // Add Y for coordinates
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
