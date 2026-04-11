export interface Game {
  id: string
  name: string
  description: string
  icon: string
}

export interface Player {
  id: string
  name: string
}

export interface GameConfig {
  gameId: string
  players: Player[]
  doubleGenerala?: boolean
  targetScore?: number
}

export interface ScoreEntry {
  categoryId: string
  value: number | null
  isDouble: boolean
}

export interface PlayerScores {
  playerId: string
  entries: Record<string, ScoreEntry>
  total: number
  reengancheUsed?: boolean
}

export interface GameState {
  config: GameConfig | null
  scores: Record<string, PlayerScores>
  currentPlayerIndex: number
  currentCategoryIndex: number
  isComplete: boolean
}
