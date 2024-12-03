import React, { useEffect, useState } from "react";
import InteractionService from "../utils/InteractionService";

const InteractiveObject = ({ objectId, type, initialState, onInteraction }) => {
  const [isOccupied, setIsOccupied] = useState(initialState || false);
  const interactionService = new InteractionService("ws://localhost:8080");

  useEffect(() => {
    // WebSocket setup
    const handleIncomingMessage = (message) => {
      const data = JSON.parse(message.data);

      // Handle updates for this object
      if (data.type === "interaction" && data.objectId === objectId) {
        setIsOccupied(data.action === "occupy");
        console.log(`Object ${objectId} is now ${data.action}`);
      }
    };

    interactionService.socket.addEventListener("message", handleIncomingMessage);

    return () => {
      interactionService.closeConnection();
    };
  }, [objectId, interactionService]);

  const handleInteraction = () => {
    const userId = "user123"; // Replace with dynamic user ID
    const action = isOccupied ? "vacate" : "occupy"; // Toggle interaction state
    interactionService.sendInteraction(objectId, action, userId);

    // Update local state
    setIsOccupied((prev) => !prev);

    // Optional: Trigger parent callback
    onInteraction && onInteraction({ objectId, action, userId });
  };

  return (
    <div
      className={`interactive-object ${type.toLowerCase()} ${
        isOccupied ? "occupied" : "available"
      }`}
      onClick={handleInteraction}
    >
      {type} - {isOccupied ? "Occupied" : "Available"}
    </div>
  );
};

export default InteractiveObject;
