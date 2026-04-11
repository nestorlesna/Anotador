import { useNavigate } from 'react-router-dom'
import { useGame } from '../context/GameContext'

export default function ResultPage() {
  const navigate = useNavigate()
  const { state, winner, resetGame } = useGame()

  if (!state.config || !winner) {
    navigate('/')
    return null
  }

  const isTruco = state.config.gameId === 'truco'
  const isConga = state.config.gameId === 'conga'
  const isUno = state.config.gameId === 'uno'
  const targetScore = state.config.targetScore

  const isMinScoreGame = isConga || isUno
  const sortedPlayers = [...state.config.players].sort((a, b) => {
    const scoreA = state.scores[a.id]?.total ?? 0
    const scoreB = state.scores[b.id]?.total ?? 0
    return isMinScoreGame ? scoreA - scoreB : scoreB - scoreA
  })

  return (
    <div className="min-h-screen bg-gradient-to-br from-indigo-900 via-purple-900 to-slate-900 flex flex-col items-center justify-center p-6">
      <div className="text-center mb-10">
        <div className="text-7xl mb-4">🏆</div>
        <h1 className="text-5xl font-bold text-white mb-2">¡{winner} gana!</h1>
        <p className="text-purple-200 text-lg">
          {isTruco ? 'Finalizó la partida de Truco' : isConga ? 'Finalizó la partida de Conga' : isUno ? 'Finalizó la partida de UNO' : 'Finalizó la partida de Generala'}
        </p>
      </div>

      <div className="w-full max-w-md bg-white/10 backdrop-blur-sm border border-white/20 rounded-2xl p-6 mb-8">
        <h2 className="text-white font-bold text-xl mb-4 text-center">Tabla Final</h2>
        <div className="space-y-3">
          {sortedPlayers.map((player, index) => {
            const score = state.scores[player.id]?.total ?? 0
            const isWinner = index === 0
            return (
              <div
                key={player.id}
                className={`flex items-center justify-between p-4 rounded-xl ${
                  isWinner
                    ? 'bg-gradient-to-r from-yellow-500/20 to-amber-500/20 border border-yellow-500/30'
                    : 'bg-white/5 border border-white/10'
                }`}
              >
                <div className="flex items-center gap-3">
                  <span className={`text-2xl font-bold ${isWinner ? 'text-yellow-400' : 'text-purple-300'}`}>
                    #{index + 1}
                  </span>
                  <span className={`text-lg ${isWinner ? 'text-yellow-300 font-bold' : 'text-white'}`}>
                    {player.name}
                  </span>
                </div>
                <span className={`text-2xl font-bold ${isWinner ? 'text-yellow-400' : 'text-white'}`}>
                  {score}{isTruco && targetScore ? `/${targetScore}` : ''}
                </span>
              </div>
            )
          })}
        </div>
      </div>

      <div className="flex flex-col gap-3 w-full max-w-md">
        <button
          onClick={() => {
            resetGame()
            navigate(`/${state.config!.gameId}/setup`)
          }}
          className="w-full bg-gradient-to-r from-purple-500 to-indigo-500 text-white font-bold py-4 rounded-xl text-lg hover:from-purple-600 hover:to-indigo-600 transition-all shadow-lg shadow-purple-500/30 active:scale-95"
        >
          Jugar de nuevo
        </button>
        <button
          onClick={() => {
            resetGame()
            navigate('/')
          }}
          className="w-full bg-white/10 border border-white/20 text-purple-200 font-bold py-4 rounded-xl text-lg hover:bg-white/20 transition-all active:scale-95"
        >
          Elegir otro juego
        </button>
      </div>
    </div>
  )
}
