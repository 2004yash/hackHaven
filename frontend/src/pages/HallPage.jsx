import React, { useEffect } from "react";
import Phaser from "phaser";

const HallPage = () => {
    useEffect(() => {
        const config = {
            type: Phaser.AUTO,
            width: window.innerWidth, // Responsive width
            height: window.innerHeight, // Responsive height
            parent: "phaser-container",
            physics: {
                default: "arcade",
                arcade: {
                    debug: false, // Enable this for debugging collisions
                },
            },
            scene: {
                preload,
                create,
                update,
            },
        };

        const game = new Phaser.Game(config);

        function preload() {
            // Load assets
            this.load.image("tiles", "/assets/maps.png"); // Updated path
            this.load.tilemapTiledJSON("map", "/assets/jsonMAP3.tmj"); // Updated path
            this.load.image("character", "/assets/leonardo.png"); // Updated path
        }

        function create() {
            // Load the map
            this.add.image("tiles")
            const map = this.make.tilemap({ key: "map" });
            const tileset = map.addTilesetImage("tile1", "tiles"); // Updated tileset name

            // Layer names based on the updated list
            const layerNames = [
                // "tile1",        // Updated layer names
                "obs",
                "statue",
                "tile4",
                "tile5",
                "tile6",
                "tile7"
            ];

            // Create layers dynamically
            const layers = {};
            layerNames.forEach(layerName => {
                layers[layerName] = map.createLayer(layerName, tileset, 0, 0);
            });

            // Create and handle collision for the "obs" layer
            const collisionLayer = layers["obs"]; // Use the updated layer name for collision
            collisionLayer.setCollisionByProperty({ collides: true });

            // Add a character sprite
            this.character = this.physics.add.sprite(400, 300, "character");
            this.character.setCollideWorldBounds(true);

            // Enable collision between character and the collision layer
            this.physics.add.collider(this.character, collisionLayer);

            // Add keyboard controls
            this.cursors = this.input.keyboard.createCursorKeys();
        }

        function update() {
            // Handle character movement
            const speed = 200; // Adjust movement speed
            this.character.setVelocity(0);

            if (this.cursors.left.isDown) {
                this.character.setVelocityX(-speed);
            } else if (this.cursors.right.isDown) {
                this.character.setVelocityX(speed);
            }

            if (this.cursors.up.isDown) {
                this.character.setVelocityY(-speed);
            } else if (this.cursors.down.isDown) {
                this.character.setVelocityY(speed);
            }
        }

        // Clean up Phaser instance on component unmount
        return () => {
            game.destroy(true);
        };
    }, []);

    return (
        <div>
            <h1 style={{ textAlign: "center" }}>Hackathon Hall</h1>
            <div
                id="phaser-container"
                style={{
                    width: "100%",
                    height: "calc(100vh - 50px)", // Dynamically adjust height
                    margin: "auto",
                }}
            ></div>
        </div>
    );
};

export default HallPage;
