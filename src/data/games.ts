import type { Game } from '../types'

export const games: Game[] = [
  {
    id: 'generala',
    name: 'Generala',
    description: 'El clásico juego de dados. ¡Apunta y gana!',
    icon: '🎲',
  },
  {
    id: 'truco',
    name: 'Truco',
    description: 'Truco uruguayo. ¡Nosotros vs Ellos!',
    icon: '🃏',
  },
  {
    id: 'uno',
    name: 'UNO',
    description: 'El clásico juego de cartas. ¡A 250 o 500 puntos!',
    icon: '🟥',
  },
  {
    id: 'conga',
    name: 'Conga',
    description: 'Juego de eliminación. ¡Último en pie gana!',
    icon: '🪘',
  },
]

export const generalaCategories = [
  { id: '1', name: '1', label: 'Ases', type: 'upper' as const },
  { id: '2', name: '2', label: 'Doses', type: 'upper' as const },
  { id: '3', name: '3', label: 'Treses', type: 'upper' as const },
  { id: '4', name: '4', label: 'Cuatros', type: 'upper' as const },
  { id: '5', name: '5', label: 'Cincos', type: 'upper' as const },
  { id: '6', name: '6', label: 'Seises', type: 'upper' as const },
  { id: 'escalera', name: 'Escalera', label: 'Escalera', type: 'lower' as const, values: { base: 20, served: 25 } },
  { id: 'full', name: 'Full', label: 'Full', type: 'lower' as const, values: { base: 30, served: 35 } },
  { id: 'poker', name: 'Póker', label: 'Póker', type: 'lower' as const, values: { base: 40, served: 45 } },
  { id: 'generala', name: 'Generala', label: 'Generala', type: 'lower' as const, values: { base: 50, served: 100 } },
]

export const generalaCategoriesWithDouble = [
  ...generalaCategories,
  { id: 'doble-generala', name: 'Doble Gen.', label: 'Doble Generala', type: 'lower' as const, values: { base: 100, served: 100 } },
]

export const BONUS_THRESHOLD = 63
export const BONUS_POINTS = 35
