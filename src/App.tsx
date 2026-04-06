import { Routes, Route } from 'react-router-dom'
import { GameProvider } from './context/GameContext'
import GameSelect from './pages/GameSelect'
import GameSetup from './pages/GameSetup'
import ScorePage from './pages/ScorePage'
import ResultPage from './pages/ResultPage'

function App() {
  return (
    <GameProvider>
      <Routes>
        <Route path="/" element={<GameSelect />} />
        <Route path="/:gameId/setup" element={<GameSetup />} />
        <Route path="/:gameId/score" element={<ScorePage />} />
        <Route path="/:gameId/result" element={<ResultPage />} />
      </Routes>
    </GameProvider>
  )
}

export default App
