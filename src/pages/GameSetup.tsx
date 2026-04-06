import { useState } from 'react'
import { useNavigate, useParams } from 'react-router-dom'
import { useGame } from '../context/GameContext'
import { games } from '../data/games'

export default function GameSetup() {
  const { gameId } = useParams<{ gameId: string }>()
  const navigate = useNavigate()
  const { setConfig } = useGame()

  const game = games.find(g => g.id === gameId)
  if (!game) {
    navigate('/')
    return null
  }

  if (gameId === 'generala') {
    return <GeneralaSetup game={game} setConfig={setConfig} navigate={navigate} />
  }

  if (gameId === 'truco') {
    return <TrucoSetup game={game} setConfig={setConfig} navigate={navigate} />
  }

  return null
}

function GeneralaSetup({ game, setConfig, navigate }: { game: any; setConfig: any; navigate: any }) {
  const [playerCount, setPlayerCount] = useState(2)
  const [playerNames, setPlayerNames] = useState<string[]>(['Jugador 1', 'Jugador 2'])
  const [doubleGenerala, setDoubleGenerala] = useState(false)

  const updatePlayerName = (index: number, name: string) => {
    const updated = [...playerNames]
    updated[index] = name
    setPlayerNames(updated)
  }

  const updatePlayerCount = (count: number) => {
    setPlayerCount(count)
    const updated = [...playerNames]
    while (updated.length < count) {
      updated.push(`Jugador ${updated.length + 1}`)
    }
    updated.length = count
    setPlayerNames(updated)
  }

  const handleStart = () => {
    const players = playerNames.map((name, i) => ({
      id: `player-${i}`,
      name: name.trim() || `Jugador ${i + 1}`,
    }))

    setConfig({
      gameId: game.id,
      players,
      doubleGenerala,
    })

    navigate(`/${game.id}/score`)
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-indigo-900 via-purple-900 to-slate-900 flex flex-col items-center justify-center p-6">
      <div className="w-full max-w-md">
        <div className="text-center mb-8">
          <span className="text-6xl">{game.icon}</span>
          <h1 className="text-4xl font-bold text-white mt-4">{game.name}</h1>
          <p className="text-purple-200 mt-2">Configurá tu partida</p>
        </div>

        <div className="bg-white/10 backdrop-blur-sm border border-white/20 rounded-2xl p-6 space-y-6">
          <div>
            <label className="block text-white font-semibold mb-3">
              ¿Cuántos jugadores?
            </label>
            <div className="flex gap-2">
              {[2, 3, 4, 5, 6].map(n => (
                <button
                  key={n}
                  onClick={() => updatePlayerCount(n)}
                  className={`flex-1 py-3 rounded-xl font-bold text-lg transition-all ${
                    playerCount === n
                      ? 'bg-purple-500 text-white shadow-lg shadow-purple-500/50'
                      : 'bg-white/10 text-purple-200 hover:bg-white/20'
                  }`}
                >
                  {n}
                </button>
              ))}
            </div>
          </div>

          <div>
            <label className="block text-white font-semibold mb-3">
              Nombres de los jugadores
            </label>
            <div className="space-y-3">
              {playerNames.map((name, i) => (
                <input
                  key={i}
                  type="text"
                  value={name}
                  onChange={e => updatePlayerName(i, e.target.value)}
                  placeholder={`Nombre del jugador ${i + 1}`}
                  className="w-full bg-white/10 border border-white/20 rounded-xl px-4 py-3 text-white placeholder-purple-300 focus:outline-none focus:ring-2 focus:ring-purple-500 focus:border-transparent"
                />
              ))}
            </div>
          </div>

          {game.id === 'generala' && (
            <div className="flex items-center justify-between">
              <div>
                <p className="text-white font-semibold">Doble Generala</p>
                <p className="text-purple-300 text-sm">La segunda generala vale 100 puntos</p>
              </div>
              <button
                onClick={() => setDoubleGenerala(!doubleGenerala)}
                className={`relative w-14 h-8 rounded-full transition-all ${
                  doubleGenerala ? 'bg-purple-500' : 'bg-white/20'
                }`}
              >
                <div
                  className={`absolute top-1 w-6 h-6 bg-white rounded-full shadow-md transition-transform ${
                    doubleGenerala ? 'translate-x-7' : 'translate-x-1'
                  }`}
                />
              </button>
            </div>
          )}

          <button
            onClick={handleStart}
            className="w-full bg-gradient-to-r from-purple-500 to-indigo-500 text-white font-bold py-4 rounded-xl text-lg hover:from-purple-600 hover:to-indigo-600 transition-all shadow-lg shadow-purple-500/30 hover:shadow-purple-500/50 active:scale-95"
          >
            ¡Empezar!
          </button>
        </div>
      </div>
    </div>
  )
}

function TrucoSetup({ game, setConfig, navigate }: { game: any; setConfig: any; navigate: any }) {
  const [targetScore, setTargetScore] = useState<number | null>(null)

  const handleStart = () => {
    if (!targetScore) return

    setConfig({
      gameId: game.id,
      players: [
        { id: 'nosotros', name: 'Nosotros' },
        { id: 'ellos', name: 'Ellos' },
      ],
      targetScore,
    })

    navigate(`/${game.id}/score`)
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-indigo-900 via-purple-900 to-slate-900 flex flex-col items-center justify-center p-6">
      <div className="w-full max-w-md">
        <div className="text-center mb-8">
          <span className="text-6xl">{game.icon}</span>
          <h1 className="text-4xl font-bold text-white mt-4">{game.name}</h1>
          <p className="text-purple-200 mt-2">Configurá tu partida</p>
        </div>

        <div className="bg-white/10 backdrop-blur-sm border border-white/20 rounded-2xl p-6 space-y-6">
          <div>
            <label className="block text-white font-semibold mb-3">
              ¿A cuántos puntos juegan?
            </label>
            <div className="flex gap-3">
              <button
                onClick={() => setTargetScore(30)}
                className={`flex-1 py-4 rounded-xl font-bold text-lg transition-all ${
                  targetScore === 30
                    ? 'bg-purple-500 text-white shadow-lg shadow-purple-500/50'
                    : 'bg-white/10 text-purple-200 hover:bg-white/20'
                }`}
              >
                30
                <span className="block text-sm font-normal text-purple-300">
                  15 malas / 15 buenas
                </span>
              </button>
              <button
                onClick={() => setTargetScore(40)}
                className={`flex-1 py-4 rounded-xl font-bold text-lg transition-all ${
                  targetScore === 40
                    ? 'bg-purple-500 text-white shadow-lg shadow-purple-500/50'
                    : 'bg-white/10 text-purple-200 hover:bg-white/20'
                }`}
              >
                40
                <span className="block text-sm font-normal text-purple-300">
                  20 malas / 20 buenas
                </span>
              </button>
            </div>
          </div>

          <button
            onClick={handleStart}
            disabled={!targetScore}
            className={`w-full font-bold py-4 rounded-xl text-lg transition-all active:scale-95 ${
              targetScore
                ? 'bg-gradient-to-r from-purple-500 to-indigo-500 text-white hover:from-purple-600 hover:to-indigo-600 shadow-lg shadow-purple-500/30 hover:shadow-purple-500/50'
                : 'bg-white/5 text-purple-400 cursor-not-allowed'
            }`}
          >
            ¡Empezar!
          </button>
        </div>
      </div>
    </div>
  )
}
