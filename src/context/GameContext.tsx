import { createContext, useContext, useState, useCallback, type ReactNode } from 'react'
import type { GameConfig, GameState, PlayerScores } from '../types'
import { generalaCategories, generalaCategoriesWithDouble, BONUS_THRESHOLD, BONUS_POINTS } from '../data/games'

interface GameContextType {
  state: GameState
  setConfig: (config: GameConfig) => void
  submitScore: (playerId: string, categoryId: string, value: number | null) => void
  addPoints: (playerId: string, points: number) => void
  resetGame: () => void
  winner: string | null
  applyReenganche: (playerId: string) => void
}

const GameContext = createContext<GameContextType | null>(null)

export function useGame() {
  const ctx = useContext(GameContext)
  if (!ctx) throw new Error('useGame must be used within GameProvider')
  return ctx
}

function getCategories(doubleGenerala: boolean) {
  return doubleGenerala ? generalaCategoriesWithDouble : generalaCategories
}

function calculateTotal(entries: Record<string, { value: number | null }>): number {
  let total = 0
  let upperSum = 0
  for (const [, entry] of Object.entries(entries)) {
    if (entry.value !== null) {
      total += entry.value
    }
  }
  for (const catId of ['1', '2', '3', '4', '5', '6']) {
    const entry = entries[catId]
    if (entry?.value !== null && entry?.value !== undefined) {
      upperSum += entry.value!
    }
  }
  if (upperSum >= BONUS_THRESHOLD) {
    total += BONUS_POINTS
  }
  return total
}

function allCategoriesFilled(config: GameConfig, scores: Record<string, PlayerScores>): boolean {
  const categories = getCategories(config.doubleGenerala ?? false)
  for (const player of config.players) {
    for (const cat of categories) {
      if (scores[player.id]?.entries[cat.id]?.value === null || scores[player.id]?.entries[cat.id] === undefined) {
        return false
      }
    }
  }
  return true
}

export function GameProvider({ children }: { children: ReactNode }) {
  const [state, setState] = useState<GameState>({
    config: null,
    scores: {},
    currentPlayerIndex: 0,
    currentCategoryIndex: 0,
    isComplete: false,
  })

  const setConfig = useCallback((config: GameConfig) => {
    const scores: Record<string, PlayerScores> = {}

    if (config.gameId === 'truco' || config.gameId === 'uno' || config.gameId === 'conga') {
      for (const player of config.players) {
        scores[player.id] = { playerId: player.id, entries: {}, total: 0 }
      }
    } else {
      const categories = getCategories(config.doubleGenerala ?? false)
      for (const player of config.players) {
        const entries: Record<string, { categoryId: string; value: null; isDouble: boolean }> = {}
        for (const cat of categories) {
          entries[cat.id] = { categoryId: cat.id, value: null, isDouble: false }
        }
        scores[player.id] = { playerId: player.id, entries, total: 0 }
      }
    }

    setState({
      config,
      scores,
      currentPlayerIndex: 0,
      currentCategoryIndex: 0,
      isComplete: false,
    })
  }, [])

  const submitScore = useCallback((playerId: string, categoryId: string, value: number | null) => {
    setState(prev => {
      const updatedScores = { ...prev.scores }
      const playerScore = { ...updatedScores[playerId] }
      playerScore.entries = {
        ...playerScore.entries,
        [categoryId]: { categoryId, value, isDouble: false },
      }
      playerScore.total = calculateTotal(playerScore.entries)
      updatedScores[playerId] = playerScore

      const isComplete = allCategoriesFilled(prev.config!, updatedScores)
      const nextPlayerIndex = isComplete ? prev.currentPlayerIndex : (prev.currentPlayerIndex + 1) % prev.config!.players.length

      return {
        ...prev,
        scores: updatedScores,
        currentPlayerIndex: nextPlayerIndex,
        isComplete,
      }
    })
  }, [])

  const addPoints = useCallback((playerId: string, points: number) => {
    setState(prev => {
      const updatedScores = { ...prev.scores }
      const playerScore = { ...updatedScores[playerId], entries: { ...updatedScores[playerId]?.entries } }
      
      // Handle UNO history
      if (prev.config?.gameId === 'uno') {
        const prevScore = playerScore.total ?? 0
        const newScore = prevScore + points
        
        // Update history - keep last 5
        const history = (playerScore.entries?.['history'] as unknown as number[]) || []
        const newHistory = [...history, points].slice(-5)
        
        playerScore.entries = {
          ...playerScore.entries,
          'history': newHistory as any,
        }
        playerScore.total = newScore
        
        // Check if someone won
        const targetScore = prev.config.targetScore ?? 500
        const isComplete = newScore >= targetScore
        
        // Advance to next player only if game not complete
        const nextPlayerIndex = (prev.currentPlayerIndex + 1) % prev.config.players.length
        
        return {
          ...prev,
          scores: { ...updatedScores, [playerId]: playerScore },
          currentPlayerIndex: nextPlayerIndex,
          isComplete,
        }
      } else if (prev.config?.gameId === 'conga') {
        const prevScore = playerScore.total ?? 0
        const newScore = prevScore + points
        
        // Update history - keep last 5
        const history = (playerScore.entries?.['history'] as unknown as number[]) || []
        const newHistory = [...history, points].slice(-5)
        
        playerScore.entries = {
          ...playerScore.entries,
          'history': newHistory as any,
        }
        playerScore.total = newScore
        
        // Advance to next player
        const nextPlayerIndex = (prev.currentPlayerIndex + 1) % prev.config.players.length
        
        // Final scores after this update
        const finalScores = { ...updatedScores, [playerId]: playerScore }
        
        // Check if complete: only one player < targetScore
        const targetScore = prev.config.targetScore ?? 100
        const activePlayersCount = prev.config.players.filter(p => {
          const s = finalScores[p.id]?.total ?? 0
          return s < targetScore
        }).length
        
        const isComplete = activePlayersCount <= 1 && prev.config.players.length > 1
        
        return {
          ...prev,
          scores: finalScores,
          currentPlayerIndex: nextPlayerIndex,
          isComplete
        }
      } else {
        // Truco behavior
        playerScore.total = Math.max(0, points)
        const targetScore = prev.config?.targetScore ?? 40
        const isComplete = Object.values(updatedScores).some(s => s.total >= targetScore)

        return {
          ...prev,
          scores: { ...updatedScores, [playerId]: playerScore },
          isComplete,
        }
      }
    })
  }, [])

  const resetGame = useCallback(() => {
    setState({
      config: null,
      scores: {},
      currentPlayerIndex: 0,
      currentCategoryIndex: 0,
      isComplete: false,
    })
  }, [])

  const winner = state.isComplete && state.config ? (() => {
    const isMinScoreGame = state.config.gameId === 'conga' || state.config.gameId === 'uno'
    
    if (isMinScoreGame) {
      let minScore = Infinity
      let winnerName = ''
      for (const player of state.config.players) {
        const score = state.scores[player.id]?.total ?? 0
        // For Conga, only consider players who are not eliminated if possible, 
        // though isComplete usually means only one is not eliminated.
        if (score < minScore) {
          minScore = score
          winnerName = player.name
        }
      }
      return winnerName
    } else {
      let maxScore = -Infinity
      let winnerName = ''
      for (const player of state.config.players) {
        const score = state.scores[player.id]?.total ?? 0
        if (score > maxScore) {
          maxScore = score
          winnerName = player.name
        }
      }
      return winnerName
    }
  })() : null

  const applyReenganche = useCallback((playerId: string) => {
    setState(prev => {
      const updatedScores = { ...prev.scores }
      const playerScore = { ...updatedScores[playerId] }
      const lowestScore = Math.min(...prev.config!.players.map(p => updatedScores[p.id]?.total ?? 0))
      playerScore.total = lowestScore
      playerScore.reengancheUsed = true
      return {
        ...prev,
        scores: { ...updatedScores, [playerId]: playerScore },
      }
    })
  }, [])

  return (
    <GameContext.Provider value={{ state, setConfig, submitScore, addPoints, resetGame, winner, applyReenganche }}>
      {children}
    </GameContext.Provider>
  )
}
