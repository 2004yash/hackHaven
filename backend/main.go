package main

import (
	"hackathon-platform/backend/routes"
	"log"
	"net/http"
)

func main() {
	router := routes.RegisterRoutes()
	log.Println("Starting server on port 8080...")
	if err := http.ListenAndServe(":8080", router); err != nil {
		log.Fatalf("Server Error: %v", err)
	}
}
