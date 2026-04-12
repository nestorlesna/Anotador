import { useEffect, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { useGame } from '../context/GameContext'

const APP_VERSION = __APP_VERSION__
const APP_VERSION_CODE = __APP_VERSION_CODE__

interface VersionInfo {
  version: string
  versionCode: number
  releaseNotes: string
  apkUrl: string
}

export default function VersionChecker({ children }: { children: React.ReactNode }) {
  const navigate = useNavigate()
  const { resetGame } = useGame()
  const [updateAvailable, setUpdateAvailable] = useState<VersionInfo | null>(null)
  const [checking, setChecking] = useState(true)
  const [dismissed, setDismissed] = useState(false)

  const appVersion = APP_VERSION
  const appVersionCode = APP_VERSION_CODE

  useEffect(() => {
    const checkForUpdates = async () => {
      try {
        const response = await fetch(
          'https://api.github.com/repos/nestorlesna/Anotador/releases/latest',
          {
            headers: {
              'Accept': 'application/vnd.github+json',
            },
          }
        )

        if (response.ok) {
          const data = await response.json()
          
          // Extract version from tag (e.g., "v1.0.1" -> "1.0.1")
          const latestVersion = data.tag_name?.replace(/^v/, '') || '0.0.0'
          
          // Parse versions for comparison
          const latestParts = latestVersion.split('.').map(Number)
          const currentParts = appVersion.split('.').map(Number)
          
          // Compare versions
          let isNewer = false
          for (let i = 0; i < 3; i++) {
            const latest = latestParts[i] || 0
            const current = currentParts[i] || 0
            if (latest > current) {
              isNewer = true
              break
            } else if (latest < current) {
              isNewer = false
              break
            }
          }

          // Also check versionCode if same version
          const versionCodeMatch = data.body?.match(/versionCode[:\s]*(\d+)/i)
          const latestVersionCode = versionCodeMatch ? parseInt(versionCodeMatch[1]) : 0

          if (isNewer || (latestVersion === appVersion && latestVersionCode > appVersionCode)) {
            // Find APK asset
            const apkAsset = data.assets?.find((a: any) => a.name?.endsWith('.apk'))
            
            setUpdateAvailable({
              version: latestVersion,
              versionCode: latestVersionCode,
              releaseNotes: data.body || '',
              apkUrl: apkAsset?.browser_download_url || '',
            })
          }
        }
      } catch (error) {
        console.log('Could not check for updates:', error)
      } finally {
        setChecking(false)
      }
    }

    // Only check on production builds and after a delay
    const timer = setTimeout(checkForUpdates, 2000)
    return () => clearTimeout(timer)
  }, [appVersion])

  const handleUpdate = () => {
    if (updateAvailable?.apkUrl) {
      window.open(updateAvailable.apkUrl, '_blank')
    }
  }

  if (!updateAvailable || checking || dismissed) {
    return <>{children}</>
  }

  return (
    <>
      {children}
      
      {/* Update notification */}
      <div className="fixed inset-0 bg-black/70 flex items-center justify-center z-50 p-4">
        <div className="bg-slate-800 border border-purple-500/50 rounded-2xl p-6 max-w-sm w-full">
          <div className="text-center mb-4">
            <div className="text-4xl mb-2">🚀</div>
            <h2 className="text-xl font-bold text-white">Nueva versión disponible</h2>
          </div>
          
          <div className="bg-white/10 rounded-xl p-4 mb-4">
            <p className="text-purple-300 text-sm mb-2">Versión actual: <span className="text-white">{appVersion}</span></p>
            <p className="text-green-400 text-sm">Nueva versión: <span className="text-white font-bold">{updateAvailable.version}</span></p>
          </div>

          {updateAvailable.releaseNotes && (
            <div className="bg-white/5 rounded-xl p-3 mb-4 max-h-32 overflow-y-auto">
              <p className="text-purple-200 text-sm">{updateAvailable.releaseNotes}</p>
            </div>
          )}

          <div className="flex flex-col gap-2">
            {updateAvailable.apkUrl ? (
              <button
                onClick={handleUpdate}
                className="w-full bg-gradient-to-r from-purple-500 to-indigo-500 text-white font-bold py-3 rounded-xl active:scale-95 transition-all"
              >
                Descargar APK
              </button>
            ) : (
              <button
                onClick={() => window.open('https://github.com/nestorlesna/Anotador/releases', '_blank')}
                className="w-full bg-gradient-to-r from-purple-500 to-indigo-500 text-white font-bold py-3 rounded-xl active:scale-95 transition-all"
              >
                Ver Releases en GitHub
              </button>
            )}
            
            <button
              onClick={() => {
                setDismissed(true)
                navigate('/')
                resetGame()
              }}
              className="w-full bg-white/10 text-purple-300 font-semibold py-3 rounded-xl hover:bg-white/20 transition-all"
            >
              Más tarde
            </button>
          </div>
        </div>
      </div>
    </>
  )
}