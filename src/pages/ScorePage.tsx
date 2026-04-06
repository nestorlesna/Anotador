import { useState } from 'react'
import { useNavigate, useParams } from 'react-router-dom'
import { useGame } from '../context/GameContext'
import { generalaCategories, generalaCategoriesWithDouble, BONUS_THRESHOLD, BONUS_POINTS } from '../data/games'

export default function ScorePage() {
  const { gameId } = useParams<{ gameId: string }>()
  const navigate = useNavigate()
  const { state, submitScore } = useGame()

  if (gameId === 'truco') {
    return <TrucoScorePage />
  }

  if (gameId === 'uno') {
    return <UnoScorePage />
  }

  const [showScorePicker, setShowScorePicker] = useState(false)
  const [pendingCategory, setPendingCategory] = useState<string | null>(null)

  if (!state.config) {
    navigate('/')
    return null
  }

  const categories = state.config.doubleGenerala ? generalaCategoriesWithDouble : generalaCategories
  const { players } = state.config
  const currentPlayer = players[state.currentPlayerIndex]

  if (!currentPlayer || state.isComplete) {
    navigate(`/${gameId}/result`)
    return null
  }

  const upperCategories = categories.filter(c => c.type === 'upper')
  const lowerCategories = categories.filter(c => c.type === 'lower')

  const getUpperBonus = (playerId: string) => {
    let sum = 0
    for (const cat of upperCategories) {
      const entry = state.scores[playerId]?.entries[cat.id]
      if (entry?.value !== null && entry?.value !== undefined) {
        sum += entry.value ?? 0
      }
    }
    return sum
  }

  const hasBonus = (playerId: string) => getUpperBonus(playerId) >= BONUS_THRESHOLD

  const getCategoryScore = (playerId: string, catId: string) => {
    return state.scores[playerId]?.entries[catId]?.value ?? null
  }

  const isCategoryDone = (playerId: string, catId: string) => {
    return getCategoryScore(playerId, catId) !== null
  }

  const handleCellClick = (playerId: string, catId: string) => {
    if (playerId !== currentPlayer.id) return
    if (isCategoryDone(playerId, catId)) return

    setPendingCategory(catId)
    setShowScorePicker(true)
  }

  const handleScoreSelect = (value: number | null) => {
    if (pendingCategory) {
      submitScore(currentPlayer.id, pendingCategory, value)
      setShowScorePicker(false)
      setPendingCategory(null)
    }
  }

  const getCategory = (catId: string) => categories.find(c => c.id === catId)!

  const getPossibleScores = (catId: string) => {
    const cat = getCategory(catId)
    if (cat.type === 'upper') {
      const num = parseInt(catId)
      return [0, num, num * 2, num * 3, num * 4, num * 5]
    }
    if (cat.values) {
      return [0, cat.values.base, cat.values.served]
    }
    return [0]
  }

  const pendingCat = pendingCategory ? getCategory(pendingCategory) : null
  const remainingForCurrent = categories.filter(c => !isCategoryDone(currentPlayer.id, c.id)).length

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-900 via-indigo-950 to-purple-950 p-4">
      <div className="max-w-4xl mx-auto mb-4">
        <div className="bg-white/10 backdrop-blur-sm border border-white/20 rounded-2xl p-4">
          <div className="flex items-center justify-between">
            <button
              onClick={() => navigate('/')}
              className="text-purple-300 hover:text-white transition-colors"
            >
              ← Salir
            </button>
            <div className="text-center">
              <h1 className="text-xl font-bold text-white">🎲 Generala</h1>
            </div>
            <div className="text-purple-300 text-sm">
              Faltan {remainingForCurrent}
            </div>
          </div>

          <div className="mt-3 bg-purple-500/20 border border-purple-500/30 rounded-xl p-3 text-center">
            <p className="text-purple-200 text-sm">Le toca a</p>
            <p className="text-white font-bold text-lg">{currentPlayer.name}</p>
            <p className="text-purple-300 text-sm">Elegí una categoría para anotar</p>
          </div>
        </div>
      </div>

      <div className="max-w-4xl mx-auto overflow-x-auto">
        <table className="w-full border-collapse">
          <thead>
            <tr>
              <th className="bg-indigo-800/50 text-purple-200 font-semibold p-3 text-left text-sm border border-white/10 sticky left-0 bg-indigo-800/50 z-10">
                Categoría
              </th>
              {players.map(player => (
                <th
                  key={player.id}
                  className={`bg-indigo-800/50 font-semibold p-3 text-center text-sm border border-white/10 min-w-[100px] ${
                    player.id === currentPlayer.id ? 'text-purple-300 bg-purple-800/50' : 'text-purple-200'
                  }`}
                >
                  {player.name}
                </th>
              ))}
            </tr>
          </thead>
          <tbody>
            {upperCategories.map(cat => (
              <tr key={cat.id}>
                <td className="p-3 text-white text-sm border border-white/10 sticky left-0 bg-slate-900/90 z-10">
                  {cat.label}
                </td>
                {players.map(player => {
                  const score = getCategoryScore(player.id, cat.id)
                  const isCurrent = player.id === currentPlayer.id
                  const done = isCategoryDone(player.id, cat.id)
                  const clickable = isCurrent && !done
                  return (
                    <td
                      key={player.id}
                      onClick={() => clickable && handleCellClick(player.id, cat.id)}
                      className={`p-3 text-center border border-white/10 min-w-[100px] ${
                        clickable
                          ? 'bg-purple-500/30 cursor-pointer hover:bg-purple-500/40'
                          : done
                          ? 'text-white'
                          : 'text-purple-400/50'
                      }`}
                    >
                      <span className={`font-bold text-lg ${clickable ? 'text-white animate-pulse' : ''}`}>
                        {score !== null ? score : clickable ? '—' : ''}
                      </span>
                    </td>
                  )
                })}
              </tr>
            ))}

            <tr className="bg-indigo-800/30">
              <td className="p-3 text-purple-300 text-sm border border-white/10 sticky left-0 bg-indigo-800/30 z-10">
                Bonus ({BONUS_THRESHOLD}+)
              </td>
              {players.map(player => (
                <td key={player.id} className="p-3 text-center border border-white/10">
                  <span className={`font-bold text-sm ${hasBonus(player.id) ? 'text-green-400' : 'text-purple-400'}`}>
                    {hasBonus(player.id) ? `+${BONUS_POINTS}` : `${getUpperBonus(player.id)}/${BONUS_THRESHOLD}`}
                  </span>
                </td>
              ))}
            </tr>

            {lowerCategories.map(cat => (
              <tr key={cat.id}>
                <td className="p-3 text-white text-sm border border-white/10 sticky left-0 bg-slate-900/90 z-10">
                  {cat.label}
                  {cat.values && (
                    <span className="block text-purple-400 text-xs">
                      {cat.values.base}/{cat.values.served}
                    </span>
                  )}
                </td>
                {players.map(player => {
                  const score = getCategoryScore(player.id, cat.id)
                  const isCurrent = player.id === currentPlayer.id
                  const done = isCategoryDone(player.id, cat.id)
                  const clickable = isCurrent && !done
                  return (
                    <td
                      key={player.id}
                      onClick={() => clickable && handleCellClick(player.id, cat.id)}
                      className={`p-3 text-center border border-white/10 min-w-[100px] ${
                        clickable
                          ? 'bg-purple-500/30 cursor-pointer hover:bg-purple-500/40'
                          : done
                          ? 'text-white'
                          : 'text-purple-400/50'
                      }`}
                    >
                      <span className={`font-bold text-lg ${clickable ? 'text-white animate-pulse' : ''}`}>
                        {score !== null ? score : clickable ? '—' : ''}
                      </span>
                    </td>
                  )
                })}
              </tr>
            ))}

            <tr className="bg-gradient-to-r from-purple-800/50 to-indigo-800/50">
              <td className="p-4 text-white font-bold text-lg border border-white/10 sticky left-0 bg-purple-800/50 z-10">
                TOTAL
              </td>
              {players.map(player => (
                <td key={player.id} className="p-4 text-center border border-white/10">
                  <span className="font-bold text-2xl text-white">
                    {state.scores[player.id]?.total ?? 0}
                  </span>
                </td>
              ))}
            </tr>
          </tbody>
        </table>
      </div>

      {showScorePicker && pendingCat && (
        <div className="fixed inset-0 bg-black/60 backdrop-blur-sm flex items-center justify-center p-4 z-50">
          <div className="bg-slate-800 border border-white/20 rounded-2xl p-6 w-full max-w-sm">
            <h3 className="text-white font-bold text-xl mb-4 text-center">
              {pendingCat.label}
            </h3>
            <div className="grid grid-cols-4 gap-2 mb-4">
              {getPossibleScores(pendingCat.id).map(score => (
                <button
                  key={score}
                  onClick={() => handleScoreSelect(score)}
                  className="bg-white/10 hover:bg-purple-500 border border-white/20 rounded-xl py-3 text-white font-bold text-lg transition-all active:scale-95"
                >
                  {score}
                </button>
              ))}
            </div>
            <button
              onClick={() => handleScoreSelect(0)}
              className="w-full bg-red-500/20 hover:bg-red-500/40 border border-red-500/30 rounded-xl py-3 text-red-300 font-bold text-lg transition-all active:scale-95 mb-3"
            >
              0 (Tachar)
            </button>
            <button
              onClick={() => { setShowScorePicker(false); setPendingCategory(null) }}
              className="w-full text-purple-300 hover:text-white py-2 transition-colors"
            >
              Cancelar
            </button>
          </div>
        </div>
      )}
    </div>
  )
}

function TrucoScorePage() {
  const navigate = useNavigate()
  const { state, addPoints } = useGame()

  if (!state.config || state.config.gameId !== 'truco') {
    navigate('/')
    return null
  }

  const targetScore = state.config.targetScore || 40
  const halfScore = targetScore / 2

  const nosotrosScore = state.scores['nosotros']?.total ?? 0
  const ellosScore = state.scores['ellos']?.total ?? 0

  const isComplete = nosotrosScore >= targetScore || ellosScore >= targetScore

  if (isComplete) {
    navigate('/truco/result')
    return null
  }

  const handleAddPoint = (teamId: string) => {
    const currentScore = state.scores[teamId]?.total ?? 0
    addPoints(teamId, currentScore + 1)
  }

  const handleRemovePoint = (teamId: string) => {
    const currentScore = state.scores[teamId]?.total ?? 0
    if (currentScore > 0) {
      addPoints(teamId, currentScore - 1)
    }
  }

  const renderSquares = (score: number, section: 'malas' | 'buenas') => {
    const totalSquares = section === 'malas' ? Math.ceil(halfScore / 5) : Math.ceil((targetScore - halfScore) / 5)
    const startOffset = section === 'malas' ? 0 : halfScore
    const squares = []

    for (let i = 0; i < totalSquares; i++) {
      const squareStart = startOffset + i * 5
      const squareEnd = squareStart + 5
      const pointsInSquare = Math.max(0, Math.min(5, score - squareStart))
      const isCurrentSquare = score >= squareStart && score < squareEnd
      const isPastSquare = score >= squareEnd

      squares.push(
        <ScoreSquare
          key={i}
          points={isPastSquare ? 5 : pointsInSquare}
          isActive={isCurrentSquare}
          isPast={isPastSquare}
          isMalas={section === 'malas'}
        />
      )
    }

    return squares
  }

  const renderTeamRow = (teamId: string, score: number, section: 'malas' | 'buenas') => (
    <div className="flex items-center justify-between gap-3">
      <span className="text-white font-semibold text-sm w-20">{teamId === 'nosotros' ? 'Nosotros' : 'Ellos'}</span>
      <div className="flex flex-wrap justify-center gap-1 flex-1">
        {renderSquares(score, section)}
      </div>
      <span className="text-white font-bold text-lg w-10 text-right">{score}</span>
    </div>
  )

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-900 via-indigo-950 to-purple-950 flex flex-col">
      {/* Header */}
      <div className="p-4">
        <div className="max-w-2xl mx-auto bg-white/10 backdrop-blur-sm border border-white/20 rounded-2xl p-4">
          <div className="flex items-center justify-between">
            <button
              onClick={() => navigate('/')}
              className="text-purple-300 hover:text-white transition-colors"
            >
              ← Salir
            </button>
            <div className="text-center">
              <h1 className="text-xl font-bold text-white">🃏 Truco</h1>
              <p className="text-purple-300 text-sm">A {targetScore} puntos</p>
            </div>
            <div className="w-16" />
          </div>
        </div>
      </div>

      {/* Main content - split into Malas / Buenas */}
      <div className="flex-1 flex flex-col px-4 pb-4 max-w-2xl mx-auto w-full">
        {/* Malas section */}
        <div className="flex-1 bg-white/10 backdrop-blur-sm border border-white/20 rounded-2xl p-4 mb-3">
          <div className="text-center mb-3">
            <span className="text-sm font-bold text-yellow-400 uppercase tracking-wider">Malas</span>
            <span className="text-purple-300 text-xs ml-2">(0 – {halfScore})</span>
          </div>
          <div className="space-y-4">
            {renderTeamRow('nosotros', nosotrosScore, 'malas')}
            {renderTeamRow('ellos', ellosScore, 'malas')}
          </div>
        </div>

        {/* Divider franja */}
        <div className="h-1 bg-gradient-to-r from-yellow-500/60 via-purple-500 to-green-500/60 rounded-full mb-3" />

        {/* Buenas section */}
        <div className="flex-1 bg-white/10 backdrop-blur-sm border border-white/20 rounded-2xl p-4 mb-3">
          <div className="text-center mb-3">
            <span className="text-sm font-bold text-green-400 uppercase tracking-wider">Buenas</span>
            <span className="text-purple-300 text-xs ml-2">({halfScore} – {targetScore})</span>
          </div>
          <div className="space-y-4">
            {renderTeamRow('nosotros', nosotrosScore, 'buenas')}
            {renderTeamRow('ellos', ellosScore, 'buenas')}
          </div>
        </div>

        {/* Controls */}
        <div className="grid grid-cols-2 gap-3">
          {/* Nosotros controls */}
          <div className="bg-white/10 backdrop-blur-sm border border-white/20 rounded-2xl p-3">
            <p className="text-white font-bold text-center text-sm mb-2">Nosotros</p>
            <div className="flex gap-2">
              <button
                onClick={() => handleRemovePoint('nosotros')}
                disabled={nosotrosScore === 0}
                className={`flex-1 py-3 rounded-xl font-bold text-lg transition-all active:scale-95 ${
                  nosotrosScore === 0
                    ? 'bg-white/5 text-purple-400 cursor-not-allowed'
                    : 'bg-red-500/20 hover:bg-red-500/30 text-red-300 border border-red-500/30'
                }`}
              >
                −
              </button>
              <button
                onClick={() => handleAddPoint('nosotros')}
                disabled={nosotrosScore >= targetScore}
                className={`flex-1 py-3 rounded-xl font-bold text-lg transition-all active:scale-95 ${
                  nosotrosScore >= targetScore
                    ? 'bg-white/5 text-purple-400 cursor-not-allowed'
                    : 'bg-green-500/20 hover:bg-green-500/30 text-green-300 border border-green-500/30'
                }`}
              >
                +
              </button>
            </div>
          </div>

          {/* Ellos controls */}
          <div className="bg-white/10 backdrop-blur-sm border border-white/20 rounded-2xl p-3">
            <p className="text-white font-bold text-center text-sm mb-2">Ellos</p>
            <div className="flex gap-2">
              <button
                onClick={() => handleRemovePoint('ellos')}
                disabled={ellosScore === 0}
                className={`flex-1 py-3 rounded-xl font-bold text-lg transition-all active:scale-95 ${
                  ellosScore === 0
                    ? 'bg-white/5 text-purple-400 cursor-not-allowed'
                    : 'bg-red-500/20 hover:bg-red-500/30 text-red-300 border border-red-500/30'
                }`}
              >
                −
              </button>
              <button
                onClick={() => handleAddPoint('ellos')}
                disabled={ellosScore >= targetScore}
                className={`flex-1 py-3 rounded-xl font-bold text-lg transition-all active:scale-95 ${
                  ellosScore >= targetScore
                    ? 'bg-white/5 text-purple-400 cursor-not-allowed'
                    : 'bg-green-500/20 hover:bg-green-500/30 text-green-300 border border-green-500/30'
                }`}
              >
                +
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}

function ScoreSquare({
  points,
  isActive,
  isPast,
  isMalas,
}: {
  points: number
  isActive: boolean
  isPast: boolean
  isMalas: boolean
}) {
  const size = 60
  const strokeWidth = 3

  const baseColor = isPast || isActive
    ? (isMalas ? '#fbbf24' : '#4ade80')
    : 'rgba(255, 255, 255, 0.15)'

  const activeGlow = isActive ? 'drop-shadow(0 0 6px rgba(168, 85, 247, 0.6))' : ''

  return (
    <div className="flex justify-center" style={{ filter: activeGlow }}>
      <svg
        width={size}
        height={size}
        viewBox={`0 0 ${size} ${size}`}
        className={`${isActive ? 'animate-pulse' : ''}`}
      >
        {/* Top */}
        <line
          x1={strokeWidth / 2}
          y1={strokeWidth / 2}
          x2={size - strokeWidth / 2}
          y2={strokeWidth / 2}
          stroke={points >= 1 ? baseColor : 'rgba(255,255,255,0.1)'}
          strokeWidth={strokeWidth}
          strokeLinecap="round"
        />
        {/* Right */}
        <line
          x1={size - strokeWidth / 2}
          y1={strokeWidth / 2}
          x2={size - strokeWidth / 2}
          y2={size - strokeWidth / 2}
          stroke={points >= 2 ? baseColor : 'rgba(255,255,255,0.1)'}
          strokeWidth={strokeWidth}
          strokeLinecap="round"
        />
        {/* Bottom */}
        <line
          x1={size - strokeWidth / 2}
          y1={size - strokeWidth / 2}
          x2={strokeWidth / 2}
          y2={size - strokeWidth / 2}
          stroke={points >= 3 ? baseColor : 'rgba(255,255,255,0.1)'}
          strokeWidth={strokeWidth}
          strokeLinecap="round"
        />
        {/* Left */}
        <line
          x1={strokeWidth / 2}
          y1={size - strokeWidth / 2}
          x2={strokeWidth / 2}
          y2={strokeWidth / 2}
          stroke={points >= 4 ? baseColor : 'rgba(255,255,255,0.1)'}
          strokeWidth={strokeWidth}
          strokeLinecap="round"
        />
        {/* Diagonal */}
        <line
          x1={strokeWidth / 2}
          y1={strokeWidth / 2}
          x2={size - strokeWidth / 2}
          y2={size - strokeWidth / 2}
          stroke={points >= 5 ? baseColor : 'rgba(255,255,255,0.1)'}
          strokeWidth={strokeWidth}
          strokeLinecap="round"
        />
      </svg>
    </div>
  )
}

function UnoScorePage() {
  const navigate = useNavigate()
  const { state, addPoints } = useGame()

  if (!state.config || state.config.gameId !== 'uno') {
    navigate('/')
    return null
  }

  const targetScore = state.config.targetScore || 500
  const { players } = state.config
  const currentPlayerIndex = state.currentPlayerIndex
  const currentPlayer = players[currentPlayerIndex]

  const isComplete = players.some(p => (state.scores[p.id]?.total ?? 0) >= targetScore)

  if (isComplete) {
    navigate('/uno/result')
    return null
  }

  const handleAddPoints = (playerId: string, points: number) => {
    const currentScore = state.scores[playerId]?.total ?? 0
    addPoints(playerId, currentScore + points)
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-900 via-indigo-950 to-purple-950 flex flex-col">
      {/* Header */}
      <div className="p-4">
        <div className="max-w-2xl mx-auto bg-white/10 backdrop-blur-sm border border-white/20 rounded-2xl p-4">
          <div className="flex items-center justify-between">
            <button
              onClick={() => navigate('/')}
              className="text-purple-300 hover:text-white transition-colors"
            >
              ← Salir
            </button>
            <div className="text-center">
              <h1 className="text-xl font-bold text-white">🟥 UNO</h1>
              <p className="text-purple-300 text-sm">A {targetScore} puntos</p>
            </div>
            <div className="w-16" />
          </div>
        </div>
      </div>

      {/* Current player indicator */}
      <div className="px-4 pb-2 max-w-2xl mx-auto w-full">
        <div className="bg-purple-500/20 border border-purple-500/30 rounded-xl p-3 text-center">
          <p className="text-purple-200 text-sm">Le toca cargar puntos a</p>
          <p className="text-white font-bold text-lg">{currentPlayer.name}</p>
        </div>
      </div>

      {/* Main content */}
      <div className="flex-1 px-4 pb-4 max-w-2xl mx-auto w-full">
        <div className="bg-white/10 backdrop-blur-sm border border-white/20 rounded-2xl p-4">
          <div className="space-y-4">
            {players.map((player, index) => {
              const score = state.scores[player.id]?.total ?? 0
              const history = state.scores[player.id]?.entries['history'] as unknown as number[] || []
              const isCurrent = index === currentPlayerIndex

              return (
                <div
                  key={player.id}
                  className={`p-4 rounded-xl border ${
                    isCurrent
                      ? 'bg-purple-500/20 border-purple-500/40'
                      : 'bg-white/5 border-white/10'
                  }`}
                >
                  <div className="flex items-center justify-between mb-3">
                    <span className={`text-lg font-bold ${isCurrent ? 'text-purple-300' : 'text-white'}`}>
                      {player.name}
                    </span>
                    <span className="text-2xl font-bold text-white">{score}</span>
                  </div>

                  {/* Historical - last 5 rounds */}
                  {history.length > 0 && (
                    <div className="mb-3">
                      <p className="text-purple-300 text-xs mb-1">Últimas rondas:</p>
                      <div className="flex flex-wrap gap-1">
                        {history.map((points, i) => (
                          <span
                            key={i}
                            className="bg-white/10 text-purple-200 text-xs px-2 py-1 rounded"
                          >
                            +{points}
                          </span>
                        ))}
                      </div>
                    </div>
                  )}

                  {/* Score input for current player */}
                  {isCurrent && (
                    <div className="flex flex-wrap gap-2">
                      {[5, 10, 20, 50, 100].map(points => (
                        <button
                          key={points}
                          onClick={() => handleAddPoints(player.id, points)}
                          className="flex-1 py-2 rounded-lg bg-green-500/20 hover:bg-green-500/30 text-green-300 font-semibold text-sm border border-green-500/30 transition-all active:scale-95"
                        >
                          +{points}
                        </button>
                      ))}
                      <button
                        onClick={() => {
                          const customPoints = prompt('¿Cuántos puntos?')
                          if (customPoints && !isNaN(parseInt(customPoints))) {
                            handleAddPoints(player.id, parseInt(customPoints))
                          }
                        }}
                        className="flex-1 py-2 rounded-lg bg-white/10 hover:bg-white/20 text-purple-200 font-semibold text-sm border border-white/20 transition-all active:scale-95"
                      >
                        Otro
                      </button>
                    </div>
                  )}
                </div>
              )
            })}
          </div>
        </div>
      </div>
    </div>
  )
}
