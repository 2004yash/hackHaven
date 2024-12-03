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

    useEffect(() => {
        const canvas = canvasRef.current;
        const c = canvas.getContext('2d');

        // Create image objects
        const images = {
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
        images.background.src = '/Picture/newmap.png';
        images.player1.down.src = '/Picture/playerDown.png';
        images.player1.up.src = '/Picture/playerUp.png';
        images.player1.left.src = '/Picture/playerLeft.png';
        images.player1.right.src = '/Picture/playerRight.png';
        images.player2.down.src = '/Picture/playerDown.png';
        images.player2.up.src = '/Picture/playerUp.png';
        images.player2.left.src = '/Picture/playerLeft.png';
        images.player2.right.src = '/Picture/playerRight.png';

        // Check if all images are loaded
        const imagePromises = [
            new Promise(resolve => {
                images.background.onload = resolve;
            }),
            new Promise(resolve => {
                images.player1.down.onload = resolve;
            }),
            new Promise(resolve => {
                images.player1.up.onload = resolve;
            }),
            new Promise(resolve => {
                images.player1.left.onload = resolve;
            }),
            new Promise(resolve => {
                images.player1.right.onload = resolve;
            }),
            new Promise(resolve => {
                images.player2.down.onload = resolve;
            }),
            new Promise(resolve => {
                images.player2.up.onload = resolve;
            }),
            new Promise(resolve => {
                images.player2.left.onload = resolve;
            }),
            new Promise(resolve => {
                images.player2.right.onload = resolve;
            }),
        ];

        Promise.all(imagePromises).then(() => {
            setImagesLoaded(true); // Set imagesLoaded to true when all images are loaded
        });

        const animate = () => {
            if (!imagesLoaded) return; // Wait until images are loaded

            c.clearRect(0, 0, canvas.width, canvas.height); // Clear the canvas

            // Draw the background
            c.drawImage(images.background, background.x, background.y);

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

        // Key listeners
        const handleKeyDown = (e) => {
            if (keys.player1.hasOwnProperty(e.key)) {
                setKeys(prev => ({
                    ...prev,
                    player1: { ...prev.player1, [e.key]: true }
                }));
            }
            if (keys.player2.hasOwnProperty(e.key)) {
                setKeys(prev => ({
                    ...prev,
                    player2: { ...prev.player2, [e.key]: true }
                }));
            }
        };

        const handleKeyUp = (e) => {
            if (keys.player1.hasOwnProperty(e.key)) {
                setKeys(prev => ({
                    ...prev,
                    player1: { ...prev.player1, [e.key]: false }
                }));
            }
            if (keys.player2.hasOwnProperty(e.key)) {
                setKeys(prev => ({
                    ...prev,
                    player2: { ...prev.player2, [e.key]: false }
                }));
            }
        };

        window.addEventListener('keydown', handleKeyDown);
        window.addEventListener('keyup', handleKeyUp);

        return () => {
            window.removeEventListener('keydown', handleKeyDown);
            window.removeEventListener('keyup', handleKeyUp);
        };
    }, [keys, player1, player2, background, imagesLoaded]);

    return <canvas ref={canvasRef} width="1024" height="576" />;
};

export default Game;
