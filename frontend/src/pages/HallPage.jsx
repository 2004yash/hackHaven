import React, { useEffect, useRef } from "react";
import Phaser from "phaser";

const HallPage = () => {
    const gameRef = useRef(null);

    useEffect(() => {
        if (!gameRef.current) return;

        const config = {
            type: Phaser.AUTO,
            width: window.innerWidth,
            height: window.innerHeight,
            parent: gameRef.current,
            physics: {
                default: "arcade",
                arcade: { debug: true },
            },
            scene: { preload, create, update },
        };

        const game = new Phaser.Game(config);

        function preload() {
            try {
                this.load.image("tiless", "/assets/maps1.png");
                this.load.tilemapTiledJSON("map", "/assets/jsonMAP3.tmj");
                this.load.image("character", "/assets/leonardo.png");
            } catch (error) {
                console.error("Error loading assets:", error);
            }
        }

        function create() {
            try {
                // Center background image with original aspect ratio
                const bg = this.add.image(0, 0, "tiless").setOrigin(0);
                bg.setScale(Math.min(window.innerWidth / bg.width, window.innerHeight / bg.height));

                // Load map and layers
                const map = this.make.tilemap({ key: "map" });
                const tileset = map.addTilesetImage("tile1", "tiless");

                const layers = {};
                ["obs", "statue", "tile4", "tile5", "tile6", "tile7"].forEach((layerName) => {
                    layers[layerName] = map.createLayer(layerName, tileset, 0, 0);
                });

                const collisionLayer = layers["obs"];
                collisionLayer?.setCollisionByProperty({ collides: true });

                // Add character sprite
                this.character = this.physics.add.sprite(
                    window.innerWidth / 2,
                    window.innerHeight / 2,
                    "character"
                );
                this.character.setScale(0.2); // Smaller character
                this.character.setCollideWorldBounds(true);

                // Enable collision with collision layer
                if (collisionLayer) {
                    this.physics.add.collider(this.character, collisionLayer);
                }

                // Add keyboard controls
                this.cursors = this.input.keyboard.createCursorKeys();

                // Camera follows the character
                this.cameras.main.startFollow(this.character, true, 0.05, 0.05);
                this.cameras.main.setZoom(1.5);
            } catch (error) {
                console.error("Error in create function:", error);
            }
        }

        function update() {
            const speed = 200;
            this.character.setVelocity(0);

            if (this.cursors.left.isDown) this.character.setVelocityX(-speed);
            if (this.cursors.right.isDown) this.character.setVelocityX(speed);
            if (this.cursors.up.isDown) this.character.setVelocityY(-speed);
            if (this.cursors.down.isDown) this.character.setVelocityY(speed);
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
        };
    }, []);

    return (
        <div>
            <h1
                style={{
                    textAlign: "center",
                    position: "absolute",
                    top: "10px",
                    left: "50%",
                    transform: "translateX(-50%)",
                    background: "rgba(0, 0, 0, 0.5)",
                    color: "white",
                    padding: "10px 20px",
                    borderRadius: "8px",
                    zIndex: 10,
                }}
            >
                Hackathon Hall
            </h1>
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
