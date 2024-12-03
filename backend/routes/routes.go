package routes

import (
	"hackathon-platform/backend/controllers"
	"hackathon-platform/backend/services"
	"net/http"

	"github.com/gorilla/mux"
)

func RegisterRoutes() *mux.Router {
	router := mux.NewRouter()
	router.HandleFunc("/hall", controllers.GetHallDetails).Methods("GET")
	router.HandleFunc("/ws", func(w http.ResponseWriter, r *http.Request) {
		services.HandleWebSocket(w, r)
	})
	return router
}
