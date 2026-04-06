import { Link } from 'react-router-dom'
import { games } from '../data/games'

const APP_VERSION = '1.0.0'

export default function GameSelect() {
  return (
    <div className="min-h-screen bg-gradient-to-br from-indigo-900 via-purple-900 to-slate-900 flex flex-col items-center justify-center p-6">
      <div className="text-center mb-12">
        <h1 className="text-5xl font-bold text-white mb-3">🎯 Apuntador</h1>
        <p className="text-purple-200 text-lg">Elegí el juego que querés anotar</p>
        <p className="text-purple-400/50 text-sm mt-2">v{APP_VERSION}</p>
      </div>

      <div className="grid gap-4 w-full max-w-md">
        {games.map(game => (
          <Link
            key={game.id}
            to={`/${game.id}/setup`}
            className="bg-white/10 backdrop-blur-sm border border-white/20 rounded-2xl p-6 hover:bg-white/20 hover:scale-105 transition-all duration-200 group"
          >
            <div className="flex items-center gap-4">
              <span className="text-5xl">{game.icon}</span>
              <div className="text-left">
                <h2 className="text-2xl font-bold text-white group-hover:text-purple-200 transition-colors">
                  {game.name}
                </h2>
                <p className="text-purple-200 text-sm">{game.description}</p>
              </div>
            </div>
          </Link>
        ))}
      </div>
    </div>
  )
}
