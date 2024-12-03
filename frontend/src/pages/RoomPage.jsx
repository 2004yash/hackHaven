import React, { useEffect, useState } from "react";
import Phaser from "phaser";

const RoomPage = () => {
  const [isVideoCallActive, setIsVideoCallActive] = useState(false);

  // Toggle video call state
  const toggleVideoCall = () => {
    setIsVideoCallActive(!isVideoCallActive);
  };

  useEffect(() => {
    // Initialize Phaser game instance
    new Phaser.Game({
      type: Phaser.AUTO,
      width: 800,
      height: 600,
      parent: "game-container", // Target div for Phaser rendering
      scene: {
        preload,
        create,
      },
    });

    function preload() {
      // Load static assets (objects like chairs and tables)
      this.load.image("chair", "/assets/chair.png");
      this.load.image("table", "/assets/table.png");
    }

    function create() {
      // Place interactive objects in the room
      this.add.image(200, 150, "chair");
      this.add.image(400, 200, "table");
      // You can add more objects for layout purposes
    }
  }, []);

  return (
    <div className="room-page">
      <h2>Room Layout</h2>
      <div id="game-container" style={{ width: "800px", height: "600px" }}></div>
      <div>
        {/* Video call button */}
        <button onClick={toggleVideoCall}>
          {isVideoCallActive ? "End Video Call" : "Start Video Call"}
        </button>
      </div>

      {/* Video call section (placeholder) */}
      {isVideoCallActive && (
        <div>
          <h3>Video Call Active</h3>
          {/* Placeholder for actual video call component */}
        </div>
      )}
    </div>
  );
};

export default RoomPage;
