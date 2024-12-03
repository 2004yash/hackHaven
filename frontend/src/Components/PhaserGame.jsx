import React, { useRef, useEffect, useState } from 'react';

const Game = () => {
    const canvasRef = useRef(null);
    const [player1, setPlayer1] = useState({
        x: 512,
        y: 288,
        image: 'playerDown.png',
        frame: 0,
        frameLimit: 4,
        width: 64,  // Define width
        height: 64, // Define height
        frameCounter: 0
    });
    const [player2, setPlayer2] = useState({
        x: 256,
        y: 288,
        image: 'playerDown.png',
        frame: 0,
        frameLimit: 4,
        width: 64,  // Define width
        height: 64, // Define height
        frameCounter: 0
    });
    const [keys, setKeys] = useState({
        player1: { w: false, a: false, s: false, d: false },
        player2: { ArrowUp: false, ArrowLeft: false, ArrowDown: false, ArrowRight: false }
    });
    const [background, setBackground] = useState({ x: -1550, y: -935 });
    const [imagesLoaded, setImagesLoaded] = useState(false);
    const [images, setImages] = useState({});

    useEffect(() => {
        const canvas = canvasRef.current;
        const c = canvas.getContext('2d');

        // Set canvas width and height
        canvas.width = 1024;
        canvas.height = 576;

        // Create image objects
        const newImages = {
            background: new Image(),
            player1: {
                down: new Image(),
                up: new Image(),
                left: new Image(),
                right: new Image(),
            },
            player2: {
                down: new Image(),
                up: new Image(),
                left: new Image(),
                right: new Image(),
            }
        };

        // Set image sources
        newImages.background.src = '/Picture/newmap.png';
        newImages.player1.down.src = '/Picture/playerDown.png';
        newImages.player1.up.src = '/Picture/playerUp.png';
        newImages.player1.left.src = '/Picture/playerLeft.png';
        newImages.player1.right.src = '/Picture/playerRight.png';
        newImages.player2.down.src = '/Picture/playerDown.png';
        newImages.player2.up.src = '/Picture/playerUp.png';
        newImages.player2.left.src = '/Picture/playerLeft.png';
        newImages.player2.right.src = '/Picture/playerRight.png';

        // Check if all images are loaded
        const imagePromises = [
            new Promise(resolve => {
                newImages.background.onload = () => {
                    console.log('Background Image Loaded');
                    resolve();
                };
            }),
            new Promise(resolve => {
                newImages.player1.down.onload = resolve;
            }),
            new Promise(resolve => {
                newImages.player1.up.onload = resolve;
            }),
            new Promise(resolve => {
                newImages.player1.left.onload = resolve;
            }),
            new Promise(resolve => {
                newImages.player1.right.onload = resolve;
            }),
            new Promise(resolve => {
                newImages.player2.down.onload = resolve;
            }),
            new Promise(resolve => {
                newImages.player2.up.onload = resolve;
            }),
            new Promise(resolve => {
                newImages.player2.left.onload = resolve;
            }),
            new Promise(resolve => {
                newImages.player2.right.onload = resolve;
            }),
        ];

        Promise.all(imagePromises).then(() => {
            setImagesLoaded(true); // Set imagesLoaded to true when all images are loaded
            setImages(newImages);  // Store loaded images in state
        });

    }, []);

    useEffect(() => {
        if (!imagesLoaded) return;

        const canvas = canvasRef.current;
        const c = canvas.getContext('2d');

        // Get the background image width and height
        const backgroundImage = images.background;
        const backgroundWidth = backgroundImage.width;
        const backgroundHeight = backgroundImage.height;

        // Ensure the canvas size is set appropriately
        const canvasWidth = canvas.width;
        const canvasHeight = canvas.height;

        const animate = () => {
            c.clearRect(0, 0, canvasWidth, canvasHeight); // Clear the canvas

            // Draw the background image and ensure it fits
            c.drawImage(images.background, background.x, background.y, backgroundWidth, backgroundHeight);

            // Get direction for player1 and player2
            const player1Direction = Object.keys(keys.player1).find(key => keys.player1[key]) || 'down';
            const player2Direction = Object.keys(keys.player2).find(key => keys.player2[key]) || 'down';

            // Draw player1
            c.drawImage(
                images.player1[player1Direction],
                player1.frame * player1.width,
                0,
                player1.width,
                player1.height,
                player1.x - player1.width / 2,
                player1.y - player1.height / 2,
                player1.width,
                player1.height
            );

            // Draw player2
            c.drawImage(
                images.player2[player2Direction],
                player2.frame * player2.width,
                0,
                player2.width,
                player2.height,
                player2.x - player2.width / 2,
                player2.y - player2.height / 2,
                player2.width,
                player2.height
            );

            // Update positions based on key states
            if (keys.player1.w) setBackground(prev => ({ ...prev, y: prev.y + 5 }));
            if (keys.player1.a) setBackground(prev => ({ ...prev, x: prev.x + 5 }));
            if (keys.player1.s) setBackground(prev => ({ ...prev, y: prev.y - 5 }));
            if (keys.player1.d) setBackground(prev => ({ ...prev, x: prev.x - 5 }));

            if (keys.player2.ArrowUp) setPlayer2(prev => ({ ...prev, y: prev.y - 5 }));
            if (keys.player2.ArrowLeft) setPlayer2(prev => ({ ...prev, x: prev.x - 5 }));
            if (keys.player2.ArrowDown) setPlayer2(prev => ({ ...prev, y: prev.y + 5 }));
            if (keys.player2.ArrowRight) setPlayer2(prev => ({ ...prev, x: prev.x + 5 }));

            // Update frames
            setPlayer1(prev => ({
                ...prev,
                frameCounter: prev.frameCounter + 1,
                frame: prev.frameCounter % 10 === 0 ? (prev.frame + 1) % prev.frameLimit : prev.frame,
            }));
            setPlayer2(prev => ({
                ...prev,
                frameCounter: prev.frameCounter + 1,
                frame: prev.frameCounter % 10 === 0 ? (prev.frame + 1) % prev.frameLimit : prev.frame,
            }));

            window.requestAnimationFrame(animate);
        };

        animate(); // Start animation
    }, [keys, player1, player2, background, imagesLoaded, images]);

    return <canvas ref={canvasRef} />;
};

export default Game;
