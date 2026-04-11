import { useState } from 'react'
import { useNavigate, useParams } from 'react-router-dom'
import { useGame } from '../context/GameContext'
import { generalaCategories, generalaCategoriesWithDouble, BONUS_THRESHOLD, BONUS_POINTS } from '../data/games'

export default function ScorePage() {
  const { gameId } = useParams<{ gameId: string }>()
  const navigate = useNavigate()
  const { state, submitScore } = useGame()

  const [showScorePicker, setShowScorePicker] = useState(false)
  const [pendingCategory, setPendingCategory] = useState<string | null>(null)

  if (gameId === 'truco') {
    return <TrucoScorePage />
  }

  if (gameId === 'uno') {
    return <UnoScorePage />
  }

  if (gameId === 'conga') {
    return <CongaScorePage />
  }

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
            <div className="text-purple-300 text-xs">
              Faltan {remainingForCurrent}
            </div>
          </div>

          <div className="mt-2 bg-purple-500/20 border border-purple-500/30 rounded-xl p-2 text-center">
            <p className="text-purple-200 text-xs">Le toca a</p>
            <p className="text-white font-bold text-base">{currentPlayer.name}</p>
            <p className="text-purple-300 text-xs">Elegí una categoría</p>
          </div>
        </div>
      </div>

      <div className="max-w-4xl mx-auto overflow-x-auto">
        <table className="w-full border-collapse">
          <thead>
            <tr>
              <th className="bg-indigo-800/50 text-purple-200 font-semibold p-2 text-left text-xs border border-white/10 sticky left-0 bg-indigo-800/50 z-10">
                Categoría
              </th>
              {players.map(player => (
                <th
                  key={player.id}
                  className={`bg-indigo-800/50 font-semibold p-2 text-center text-xs border border-white/10 min-w-[80px] ${
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
                <td className="p-2 text-white text-xs border border-white/10 sticky left-0 bg-slate-900/90 z-10">
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
                      className={`p-2 text-center border border-white/10 min-w-[80px] ${
                        clickable
                          ? 'bg-purple-500/30 cursor-pointer hover:bg-purple-500/40'
                          : done
                          ? 'text-white'
                          : 'text-purple-400/50'
                      }`}
                    >
                      <span className={`font-bold text-sm ${clickable ? 'text-white animate-pulse' : ''}`}>
                        {score !== null ? score : clickable ? '—' : ''}
                      </span>
                    </td>
                  )
                })}
              </tr>
            ))}

            <tr className="bg-indigo-800/30">
              <td className="p-2 text-purple-300 text-xs border border-white/10 sticky left-0 bg-indigo-800/30 z-10">
                Bonus ({BONUS_THRESHOLD}+)
              </td>
              {players.map(player => (
                <td key={player.id} className="p-2 text-center border border-white/10">
                  <span className={`font-bold text-xs ${hasBonus(player.id) ? 'text-green-400' : 'text-purple-400'}`}>
                    {hasBonus(player.id) ? `+${BONUS_POINTS}` : `${getUpperBonus(player.id)}/${BONUS_THRESHOLD}`}
                  </span>
                </td>
              ))}
            </tr>

            {lowerCategories.map(cat => (
              <tr key={cat.id}>
                <td className="p-2 text-white text-xs border border-white/10 sticky left-0 bg-slate-900/90 z-10">
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
                      className={`p-2 text-center border border-white/10 min-w-[80px] ${
                        clickable
                          ? 'bg-purple-500/30 cursor-pointer hover:bg-purple-500/40'
                          : done
                          ? 'text-white'
                          : 'text-purple-400/50'
                      }`}
                    >
                      <span className={`font-bold text-sm ${clickable ? 'text-white animate-pulse' : ''}`}>
                        {score !== null ? score : clickable ? '—' : ''}
                      </span>
                    </td>
                  )
                })}
              </tr>
            ))}

            <tr className="bg-gradient-to-r from-purple-800/50 to-indigo-800/50">
              <td className="p-3 text-white font-bold text-sm border border-white/10 sticky left-0 bg-purple-800/50 z-10">
                TOTAL
              </td>
              {players.map(player => (
                <td key={player.id} className="p-3 text-center border border-white/10">
                  <span className="font-bold text-lg text-white">
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

  if (state.isComplete) {
    navigate('/truco/result')
    return null
  }

  const handleAddPoint = (teamId: string) => {
    const currentScore = state.scores[teamId]?.total ?? 0
    addPoints(teamId, currentScore + 1)
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
    <div className="flex items-center justify-between gap-2">
      <span className="text-white font-semibold text-xs w-16">{teamId === 'nosotros' ? 'Nosotros' : 'Ellos'}</span>
      <div className="flex flex-wrap justify-center gap-0.5 flex-1">
        {renderSquares(score, section)}
      </div>
      <span className="text-white font-bold text-base w-8 text-right">{score}</span>
    </div>
  )

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-900 via-indigo-950 to-purple-950 flex flex-col">
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

      <div className="flex-1 flex flex-col px-4 pb-4 max-w-2xl mx-auto w-full">
        <div className="flex-1 bg-white/10 backdrop-blur-sm border border-white/20 rounded-2xl p-4 mb-3">
          <div className="text-center mb-3">
            <span className="text-sm font-bold text-yellow-400 uppercase tracking-wider">Malas</span>
            <span className="text-purple-300 text-xs ml-2">(0 – {halfScore})</span>
          </div>
          <div className="space-y-3">
            {renderTeamRow('nosotros', nosotrosScore, 'malas')}
            {renderTeamRow('ellos', ellosScore, 'malas')}
          </div>
        </div>

        <div className="flex-1 bg-white/10 backdrop-blur-sm border border-white/20 rounded-2xl p-4 mb-3">
          <div className="text-center mb-3">
            <span className="text-sm font-bold text-green-400 uppercase tracking-wider">Buenas</span>
            <span className="text-purple-300 text-xs ml-2">({halfScore} – {targetScore})</span>
          </div>
          <div className="space-y-3">
            {renderTeamRow('nosotros', nosotrosScore, 'buenas')}
            {renderTeamRow('ellos', ellosScore, 'buenas')}
          </div>
        </div>

        <div className="flex gap-3">
          <button
            onClick={() => handleAddPoint('nosotros')}
            className="flex-1 bg-green-500/20 hover:bg-green-500/30 border border-green-500/30 rounded-xl py-3 text-green-300 font-bold text-lg transition-all active:scale-95"
          >
            +1 Nosotros
          </button>
          <button
            onClick={() => handleAddPoint('ellos')}
            className="flex-1 bg-blue-500/20 hover:bg-blue-500/30 border border-blue-500/30 rounded-xl py-3 text-blue-300 font-bold text-lg transition-all active:scale-95"
          >
            +1 Ellos
          </button>
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
  const size = 44
  const strokeWidth = 2

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
          x1={strokeWidth / 2 + 2}
          y1={strokeWidth / 2 + 2}
          x2={size - strokeWidth / 2 - 2}
          y2={size - strokeWidth / 2 - 2}
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
  const [customScore, setCustomScore] = useState(10)
  const [showCustom, setShowCustom] = useState(false)

  if (!state.config || state.config.gameId !== 'uno') {
    navigate('/')
    return null
  }

  const targetScore = state.config.targetScore || 500
  const { players } = state.config
  const currentPlayerIndex = state.currentPlayerIndex
  const currentPlayer = players[currentPlayerIndex]

  if (state.isComplete) {
    navigate('/uno/result')
    return null
  }

  const handleAddPoints = (playerId: string, points: number) => {
    addPoints(playerId, points)
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
              <p className="text-purple-300 text-xs">A {targetScore} puntos</p>
            </div>
            <div className="w-16" />
          </div>
        </div>
      </div>

      {/* Current player indicator */}
      <div className="px-4 pb-2 max-w-2xl mx-auto w-full">
        <div className="bg-purple-500/20 border border-purple-500/30 rounded-xl p-2 text-center">
          <p className="text-purple-200 text-xs">Le toca cargar puntos a</p>
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
                      {[0, 5, 10, 20, 50].map(points => (
                        <button
                          key={points}
                          onClick={() => handleAddPoints(player.id, points)}
                          className="flex-1 py-2 rounded-lg bg-green-500/20 hover:bg-green-500/30 text-green-300 font-semibold text-xs border border-green-500/30 transition-all active:scale-95"
                        >
                          {points === 0 ? '0' : `+${points}`}
                        </button>
                      ))}
                      <button
                        onClick={() => setShowCustom(true)}
                        className="flex-1 py-2 rounded-lg bg-white/10 hover:bg-white/20 text-purple-200 font-semibold text-xs border border-white/20 transition-all active:scale-95"
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

      {/* Custom score popup */}
      {showCustom && (
        <div className="fixed inset-0 bg-black/60 backdrop-blur-sm flex items-center justify-center p-4 z-50">
          <div className="bg-slate-800 border border-white/20 rounded-2xl p-6 w-full max-w-xs">
            <h3 className="text-white font-bold text-xl mb-4 text-center">Puntos personalizados</h3>
            <div className="flex items-center justify-center gap-4 mb-4">
              <button
                onClick={() => setCustomScore(Math.max(1, customScore - 1))}
                className="w-12 h-12 rounded-full bg-red-500/20 hover:bg-red-500/40 text-red-400 font-bold text-2xl transition-all active:scale-95"
              >
                −
              </button>
              <span className="text-white font-bold text-3xl w-16 text-center">{customScore}</span>
              <button
                onClick={() => setCustomScore(customScore + 1)}
                className="w-12 h-12 rounded-full bg-green-500/20 hover:bg-green-500/40 text-green-400 font-bold text-2xl transition-all active:scale-95"
              >
                +
              </button>
            </div>
            <button
              onClick={() => {
                handleAddPoints(currentPlayer.id, customScore)
                setShowCustom(false)
                setCustomScore(10)
              }}
              className="w-full bg-purple-500 hover:bg-purple-600 text-white font-bold py-3 rounded-xl text-lg transition-all active:scale-95 mb-3"
            >
              Confirmar
            </button>
            <button
              onClick={() => {
                setShowCustom(false)
                setCustomScore(10)
              }}
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

function CongaScorePage() {
  const navigate = useNavigate()
  const { state, addPoints, applyReenganche } = useGame()
  const [customScore, setCustomScore] = useState(10)
  const [showCustom, setShowCustom] = useState(false)
  const [reengancheTarget, setReengancheTarget] = useState<string | null>(null)

  if (!state.config || state.config.gameId !== 'conga') {
    navigate('/')
    return null
  }

  const { players } = state.config
  const currentPlayerIndex = state.currentPlayerIndex
  const currentPlayer = players[currentPlayerIndex]
  const congaTarget = 100

  const lowestScore = players.length > 0
    ? Math.min(...players.map(p => state.scores[p.id]?.total ?? 0))
    : 0
  const activePlayers = players.filter(p => (state.scores[p.id]?.total ?? 0) < congaTarget)

  if (state.isComplete) {
    navigate('/conga/result')
    return null
  }

  const handleAddPoints = (playerId: string, points: number) => {
    addPoints(playerId, points)
  }

  const handleReenganche = (playerId: string) => {
    const playerScore = state.scores[playerId]
    if (playerScore?.reengancheUsed) return
    setReengancheTarget(playerId)
  }

  const confirmReenganche = () => {
    if (reengancheTarget) {
      applyReenganche(reengancheTarget)
      setReengancheTarget(null)
    }
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-900 via-indigo-950 to-purple-950 flex flex-col">
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
              <h1 className="text-xl font-bold text-white">🪘 Conga</h1>
              <p className="text-purple-300 text-xs">Máx {congaTarget} puntos</p>
            </div>
            <div className="w-16" />
          </div>
        </div>
      </div>

      <div className="px-4 pb-2 max-w-2xl mx-auto w-full">
        <div className="bg-purple-500/20 border border-purple-500/30 rounded-xl p-2 text-center">
          <p className="text-purple-200 text-xs">Le toca cargar puntos a</p>
          <p className="text-white font-bold text-lg">{currentPlayer.name}</p>
        </div>
      </div>

      <div className="flex-1 px-4 pb-4 max-w-2xl mx-auto w-full">
        <div className="bg-white/10 backdrop-blur-sm border border-white/20 rounded-2xl p-4">
          <div className="space-y-4">
            {players.map((player, index) => {
              const score = state.scores[player.id]?.total ?? 0
              const history = state.scores[player.id]?.entries['history'] as unknown as number[] || []
              const isCurrent = index === currentPlayerIndex
              const isEliminated = score >= congaTarget
              const reengancheUsed = state.scores[player.id]?.reengancheUsed ?? false
              const canReenganche = isEliminated && !reengancheUsed && activePlayers.length > 1

              return (
                <div
                  key={player.id}
                  className={`p-4 rounded-xl border ${
                    isEliminated
                      ? 'bg-red-500/10 border-red-500/30 opacity-70'
                      : isCurrent
                      ? 'bg-purple-500/20 border-purple-500/40'
                      : 'bg-white/5 border-white/10'
                  }`}
                >
                  <div className="flex items-center justify-between mb-3">
                    <div className="flex items-center gap-2">
                      <span className={`text-lg font-bold ${isCurrent ? 'text-purple-300' : isEliminated ? 'text-red-400' : 'text-white'}`}>
                        {player.name}
                      </span>
                      {isEliminated && (
                        <span className="text-xs bg-red-500/30 text-red-300 px-2 py-0.5 rounded">Eliminado</span>
                      )}
                    </div>
                    <span className="text-2xl font-bold text-white">{score}/{congaTarget}</span>
                  </div>

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

                  {isCurrent && !isEliminated && (
                    <div className="flex flex-wrap gap-2">
                      {[0, 5, 10, 20, 50].map(points => (
                        <button
                          key={points}
                          onClick={() => handleAddPoints(player.id, points)}
                          className="flex-1 py-2 rounded-lg bg-green-500/20 hover:bg-green-500/30 text-green-300 font-semibold text-xs border border-green-500/30 transition-all active:scale-95"
                        >
                          {points === 0 ? '0' : `+${points}`}
                        </button>
                      ))}
                      <button
                        onClick={() => setShowCustom(true)}
                        className="flex-1 py-2 rounded-lg bg-white/10 hover:bg-white/20 text-purple-200 font-semibold text-xs border border-white/20 transition-all active:scale-95"
                      >
                        Otro
                      </button>
                    </div>
                  )}

                  {canReenganche && (
                    <button
                      onClick={() => handleReenganche(player.id)}
                      className="w-full mt-2 py-2 rounded-lg bg-yellow-500/20 hover:bg-yellow-500/30 text-yellow-300 font-semibold text-sm border border-yellow-500/30 transition-all active:scale-95"
                    >
                      🔄 Reenganchar ({lowestScore} pts)
                    </button>
                  )}

                  {reengancheUsed && (
                    <p className="text-purple-400 text-xs mt-2 text-center">Reenganche usado</p>
                  )}
                </div>
              )
            })}
          </div>
        </div>
      </div>

      {showCustom && (
        <div className="fixed inset-0 bg-black/60 backdrop-blur-sm flex items-center justify-center p-4 z-50">
          <div className="bg-slate-800 border border-white/20 rounded-2xl p-6 w-full max-w-xs">
            <h3 className="text-white font-bold text-xl mb-4 text-center">Puntos personalizados</h3>
            <div className="flex items-center justify-center gap-4 mb-4">
              <button
                onClick={() => setCustomScore(Math.max(1, customScore - 1))}
                className="w-12 h-12 rounded-full bg-red-500/20 hover:bg-red-500/40 text-red-400 font-bold text-2xl transition-all active:scale-95"
              >
                −
              </button>
              <span className="text-white font-bold text-3xl w-16 text-center">{customScore}</span>
              <button
                onClick={() => setCustomScore(customScore + 1)}
                className="w-12 h-12 rounded-full bg-green-500/20 hover:bg-green-500/40 text-green-400 font-bold text-2xl transition-all active:scale-95"
              >
                +
              </button>
            </div>
            <button
              onClick={() => {
                handleAddPoints(currentPlayer.id, customScore)
                setShowCustom(false)
                setCustomScore(10)
              }}
              className="w-full bg-purple-500 hover:bg-purple-600 text-white font-bold py-3 rounded-xl text-lg transition-all active:scale-95 mb-3"
            >
              Confirmar
            </button>
            <button
              onClick={() => {
                setShowCustom(false)
                setCustomScore(10)
              }}
              className="w-full text-purple-300 hover:text-white py-2 transition-colors"
            >
              Cancelar
            </button>
          </div>
        </div>
      )}

      {reengancheTarget && (
        <div className="fixed inset-0 bg-black/60 backdrop-blur-sm flex items-center justify-center p-4 z-50">
          <div className="bg-slate-800 border border-white/20 rounded-2xl p-6 w-full max-w-xs">
            <h3 className="text-white font-bold text-xl mb-2 text-center">🔄 Reenganche</h3>
            <p className="text-purple-200 text-center mb-4">
              ¿Reenganchar con <span className="text-yellow-400 font-bold">{lowestScore}</span> puntos?
            </p>
            <button
              onClick={confirmReenganche}
              className="w-full bg-yellow-500 hover:bg-yellow-600 text-white font-bold py-3 rounded-xl text-lg transition-all active:scale-95 mb-3"
            >
              Confirmar
            </button>
            <button
              onClick={() => setReengancheTarget(null)}
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
