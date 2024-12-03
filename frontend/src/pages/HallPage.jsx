import React, { useEffect, useRef } from "react";
import Phaser from "phaser";
import Collision from "./Collision"; // Import the Collision array

const HallPage = () => {
    const gameRef = useRef(null);
    const tileSize = 32; // Tile size in pixels

    useEffect(() => {
        // Initialize WebSocket
        socketRef.current = new WebSocket("ws://localhost:8080/ws?roomID=room1");

        socketRef.current.onopen = () => {
            console.log("WebSocket connected");
        };

        socketRef.current.onmessage = (event) => {
            const data = JSON.parse(event.data);

            switch (data.type) {
                case "join":
                    // Add a new participant
                    if (!participantsRef.current[data.id]) {
                        participantsRef.current[data.id] = { x: 0, y: 0 }; // Default position
                    }
                    break;

                case "leave":
                    // Remove a participant
                    delete participantsRef.current[data.id];
                    break;

                case "move":
                    // Update the position of an existing participant
                    if (participantsRef.current[data.id]) {
                        participantsRef.current[data.id] = { x: data.x, y: data.y };
                    }
                    break;

                default:
                    console.warn("Unknown message type:", data.type);
            }
        };

        socketRef.current.onclose = () => {
            console.log("WebSocket disconnected");
        };

        socketRef.current.onerror = (error) => {
            console.error("WebSocket error:", error);
        };

        if (!gameRef.current) return;

        const config = {
            type: Phaser.AUTO,
            width: window.innerWidth,
            height: window.innerHeight,
            parent: gameRef.current,
            physics: {
                default: "arcade",
                arcade: {
                    debug: false,
                    gravity: { y: 0 },
                },
            },
            scene: { preload, create, update },
        };

        const game = new Phaser.Game(config);

        function preload() {
            this.load.image("tiless", "/assets/maps1.png");
            this.load.tilemapTiledJSON("map", "/assets/jsonMAP3.tmj");
            this.load.image("character", "/assets/leonardo.png");
            this.load.image("otherCharacter", "/assets/leonardo.png"); // Represent other participants
        }

        function create() {
            try {
                // Load map and layers
                const map = this.make.tilemap({ key: "map" });
                const tileset = map.addTilesetImage("tile1", "tiless");

            const layers = {};
            ["obs", "statue", "tile4", "tile5", "tile6", "tile7"].forEach((layerName) => {
                layers[layerName] = map.createLayer(layerName, tileset, 0, 0);
                layers[layerName]?.setScale(1);
            });

            this.physics.world.setBounds(0, 0, map.widthInPixels, map.heightInPixels);

                // Add character sprite
                this.character = this.physics.add.sprite(
                    window.innerWidth / 2,
                    window.innerHeight / 2,
                    "character"
                );
                this.character.setScale(0.2);
                this.character.setCollideWorldBounds(true);

            // Create a group for other participants
            this.participantsGroup = this.add.group();

            this.cursors = this.input.keyboard.createCursorKeys();

            this.cameras.main.setBounds(0, 0, map.widthInPixels, map.heightInPixels);
            this.cameras.main.startFollow(this.character, true, 0.05, 0.05);
            this.cameras.main.setZoom(1.5);
        }

        function update() {
            const speed = 200;
            const characterX = Math.floor(this.character.x / tileSize);
            const characterY = Math.floor(this.character.y / tileSize);

            this.character.setVelocity(0);

            // Collision detection with Collision array
            const isColliding = Collision[characterY]?.[characterX] !== 0;

            if (!isColliding) {
                if (this.cursors.left.isDown) this.character.setVelocityX(-speed);
                if (this.cursors.right.isDown) this.character.setVelocityX(speed);
                if (this.cursors.up.isDown) this.character.setVelocityY(-speed);
                if (this.cursors.down.isDown) this.character.setVelocityY(speed);
            } else {
                // Optionally, you can handle collisions here (e.g., stop movement, log, etc.)
                console.log("Collision detected at:", characterX, characterY);
            }
        }

        const resizeGame = () => {
            if (game) {
                game.scale.resize(window.innerWidth, window.innerHeight);
            }
        };

        window.addEventListener("resize", resizeGame);

        return () => {
            window.removeEventListener("resize", resizeGame);
            game.destroy(true);
            socketRef.current?.close();
        };
    }, []);

    return (
        <div>
            <div
                ref={gameRef}
                style={{
                    width: "100%",
                    height: "100vh",
                    margin: 0,
                    padding: 0,
                    overflow: "hidden",
                }}
            />
        </div>
    );
};

export default HallPage;
