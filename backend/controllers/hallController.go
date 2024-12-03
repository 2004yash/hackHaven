package controllers

import (
	"encoding/json"
	"net/http"
)

type Hall struct {
	RoomIDs      []string          `json:"room_ids"`
	Participants map[string]string `json:"participants"`
}

var hall = Hall{
	RoomIDs:      []string{"room1", "room2", "room3"},
	Participants: make(map[string]string),
}

func GetHallDetails(w http.ResponseWriter, r *http.Request) {
	w.Header().Set("Content-Type", "application/json")
	json.NewEncoder(w).Encode(hall)
}
