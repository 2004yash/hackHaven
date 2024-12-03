import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import './index.css'
import App from './App.jsx'
import RoomPage from './pages/RoomPage.jsx'
import PhaserGame from './Components/PhaserGame.jsx'
import Game from './Components/Game.jsx'

createRoot(document.getElementById('root')).render(
  <StrictMode>
    {/* <App /> */}
   
    <Game/>
  </StrictMode>,
)
