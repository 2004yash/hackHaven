import react,{ useState, useEffect, useRef } from "react";
import PropTypes from "prop-types";

const MarioChatOverlay = ({ socket }) => {
    const [messages, setMessages] = useState([]);
    const [input, setInput] = useState("");
    const messageEndRef = useRef(null);

    useEffect(() => {
        messageEndRef.current?.scrollIntoView({ behavior: "smooth" });
    }, [messages]);

    useEffect(() => {
        if (!socket) return;

        const handleMessage = (event) => {
            try {
                const data = JSON.parse(event.data);
                if (data.type === "message") {
                    setMessages((prev) => [...prev, { id: data.id, text: data.msg }]);
                }
            } catch (err) {
                console.error("Error parsing incoming message:", err);
            }
        };

        socket.addEventListener("message", handleMessage);

        return () => {
            socket.removeEventListener("message", handleMessage);
        };
    }, [socket]);

    const handleSendMessage = () => {
        if (input.trim() === "" || !socket || socket.readyState !== WebSocket.OPEN) return;

        const message = {
            type: "message",
            msg: input.trim(),
        };

        try {
            socket.send(JSON.stringify(message));
            setMessages((prev) => [...prev, { id: "You", text: input.trim() }]);
            setInput("");
        } catch (err) {
            console.error("Error sending message:", err);
        }
    };

    return (
        <div style={overlayStyle}>
            <div style={chatContainerStyle}>
                <div style={chatHeaderStyle}>Mario Chat</div>
                <div style={messageListStyle}>
                    {messages.map((msg, index) => (
                        <div key={index} style={messageStyle}>
                            <strong>{msg.id}:</strong> {msg.text}
                        </div>
                    ))}
                    <div ref={messageEndRef} />
                </div>
                <div style={inputContainerStyle}>
                    <input
                        type="text"
                        value={input}
                        onChange={(e) => setInput(e.target.value)}
                        onKeyDown={(e) => e.key === "Enter" && handleSendMessage()}
                        placeholder="Type a message..."
                        style={inputStyle}
                        aria-label="Chat input"
                    />
                    <button onClick={handleSendMessage} style={buttonStyle} aria-label="Send message">
                        Send
                    </button>
                </div>
            </div>
        </div>
    );
};

MarioChatOverlay.propTypes = {
    socket: PropTypes.shape({
        addEventListener: PropTypes.func.isRequired,
        removeEventListener: PropTypes.func.isRequired,
        readyState: PropTypes.number.isRequired,
        send: PropTypes.func.isRequired,
    }).isRequired,
};

// Mario-Themed Styles
const overlayStyle = {
    position: "absolute",
    top: 0,
    right: 0,
    width: "320px",
    height: "100vh",
    background: "url('/assets/mario-brick-bg.png') repeat",
    display: "flex",
    flexDirection: "column",
    borderLeft: "4px solid #ff4500", // Mario pipe color
    zIndex: 100,
};

const chatContainerStyle = {
    display: "flex",
    flexDirection: "column",
    height: "100%",
    fontFamily: "'Press Start 2P', cursive", // Pixelated Mario-style font
    color: "#fff",
};

const chatHeaderStyle = {
    padding: "10px",
    fontSize: "16px",
    textAlign: "center",
    background: "#3cb371",
    color: "#fff",
    borderBottom: "4px solid #ff4500",
    textShadow: "2px 2px #000",
};

const messageListStyle = {
    flex: 1,
    padding: "10px",
    overflowY: "auto",
    display: "flex",
    flexDirection: "column",
    gap: "10px",
    backgroundColor: "rgba(0, 0, 0, 0.8)",
    border: "4px solid #ff4500",
};

const messageStyle = {
    padding: "8px",
    background: "#3cb371",
    borderRadius: "8px",
    color: "#fff",
    fontSize: "14px",
    boxShadow: "2px 2px #000",
};

const inputContainerStyle = {
    display: "flex",
    padding: "10px",
    borderTop: "4px solid #ff4500",
};

const inputStyle = {
    flex: 1,
    padding: "8px",
    borderRadius: "8px",
    border: "2px solid #ff4500",
    marginRight: "8px",
    fontFamily: "'Press Start 2P', cursive",
    fontSize: "14px",
    outline: "none",
    backgroundColor: "#f0f0f0",
};

const buttonStyle = {
    padding: "8px 16px",
    border: "none",
    background: "#ff4500",
    color: "#fff",
    borderRadius: "8px",
    cursor: "pointer",
    fontFamily: "'Press Start 2P', cursive",
    fontSize: "14px",
    textShadow: "1px 1px #000",
};

export default MarioChatOverlay;
