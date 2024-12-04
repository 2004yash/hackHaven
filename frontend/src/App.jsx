// import React from "react";
import MarioChatOverlay from "./pages/ChatOverlay";
import HallPage from "./pages/HallPage";

const App = () => {
    return (
        <div style={{ position: "relative" }}>
            <HallPage />
            <MarioChatOverlay />
        </div>
    );
};

export default App;
