// src/utils/InteractionService.js
class InteractionService {
    constructor(webSocketUrl) {
      this.socket = new WebSocket(webSocketUrl);
      this.socket.onopen = () => {
        console.log("WebSocket connection established for interactions.");
      };
  
      this.socket.onmessage = (message) => {
        const data = JSON.parse(message.data);
        console.log("Received WebSocket message:", data);
      };
  
      this.socket.onerror = (error) => {
        console.error("WebSocket error:", error);
      };
  
      this.socket.onclose = () => {
        console.log("WebSocket connection closed.");
      };
    }
  
    /**
     * Sends an interaction event to the server.
     * @param {string} objectId - The ID of the object being interacted with.
     * @param {string} action - The type of interaction (e.g., "sit", "use").
     * @param {string} userId - The ID of the user performing the interaction.
     */
    sendInteraction(objectId, action, userId) {
      if (this.socket.readyState === WebSocket.OPEN) {
        const interactionEvent = {
          type: "interaction",
          objectId,
          action,
          userId,
          timestamp: new Date().toISOString(),
        };
        this.socket.send(JSON.stringify(interactionEvent));
      } else {
        console.error("WebSocket connection is not open.");
      }
    }
  
    /**
     * Closes the WebSocket connection.
     */
    closeConnection() {
      if (this.socket) {
        this.socket.close();
      }
    }
  }
  
  export default InteractionService;
  