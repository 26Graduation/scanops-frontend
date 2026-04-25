import { useEffect, useState } from 'react'
import { useNavigate, useParams } from 'react-router-dom'
import { getScan } from '../../../api/scanApi'
import type { Scan, ScanStatus } from '../../../types/scan'

export default function StatusPage() {
  const { id } = useParams<{ id: string }>()
  const navigate = useNavigate()
  const [scan, setScan] = useState<Scan | null>(null)
  const [dots, setDots] = useState('')

  useEffect(() => {
    const dotTimer = setInterval(() => setDots((d) => (d.length >= 3 ? '' : d + '.')), 500)
    return () => clearInterval(dotTimer)
  }, [])

  useEffect(() => {
    if (!id) return
    const poll = async () => {
      try {
        const data = await getScan(id)
        setScan(data)
        if (data.status === 'DONE') navigate(`/report/${id}`)
      } catch {
        // silent retry
      }
    }
    poll()
    const timer = setInterval(poll, 3000)
    return () => clearInterval(timer)
  }, [id, navigate])

  return (
    <div className="min-h-screen bg-gray-950 text-white flex flex-col">
      <nav className="flex items-center justify-between px-8 py-5 border-b border-gray-800">
        <button onClick={() => navigate('/')} className="flex items-center gap-2">
          <span className="text-green-400 text-xl font-mono font-bold">⬡</span>
          <span className="text-xl font-bold tracking-tight">ScanOps</span>
        </button>
      </nav>

      <main className="flex-1 flex items-center justify-center px-4">
        <div className="text-center max-w-md w-full">
          {scan ? <StatusView scan={scan} dots={dots} /> : <LoadingView />}
        </div>
      </main>
    </div>
  )
}

function LoadingView() {
  return (
    <div className="flex flex-col items-center gap-4">
      <Spinner />
      <p className="text-gray-400 text-sm">연결 중...</p>
    </div>
  )
}

function StatusView({ scan, dots }: { scan: Scan; dots: string }) {
  const config = STATUS_CONFIG[scan.status]
  return (
    <div className="flex flex-col items-center gap-6">
      {/* Icon area */}
      <div className={`w-20 h-20 rounded-full flex items-center justify-center ${config.ring}`}>
        {config.spinner ? <Spinner color={config.spinnerColor} size="lg" /> : (
          <span className="text-4xl">{config.icon}</span>
        )}
      </div>

      {/* Label */}
      <div className="space-y-2">
        <h2 className={`text-2xl font-bold ${config.textColor}`}>
          {config.label}{config.spinner ? dots : ''}
        </h2>
        <p className="text-sm text-gray-500">{scan.targetUrl}</p>
      </div>

      {/* Progress bar for RUNNING */}
      {scan.status === 'RUNNING' && (
        <div className="w-64 h-1.5 bg-gray-800 rounded-full overflow-hidden">
          <div className="h-full bg-green-400 rounded-full animate-[progress_2s_ease-in-out_infinite]" style={{ width: '60%' }} />
        </div>
      )}

      {/* FAILED detail */}
      {scan.status === 'FAILED' && (
        <div className="text-sm text-red-400 bg-red-400/10 border border-red-400/20 rounded-lg px-5 py-3">
          스캔 중 오류가 발생했습니다. 잠시 후 다시 시도해 주세요.
        </div>
      )}

      {/* Scan ID badge */}
      <p className="text-xs text-gray-600 font-mono">ID: {scan.id}</p>
    </div>
  )
}

function Spinner({ color = 'text-green-400', size = 'md' }: { color?: string; size?: 'md' | 'lg' }) {
  const sz = size === 'lg' ? 'w-10 h-10' : 'w-6 h-6'
  return (
    <svg className={`animate-spin ${sz} ${color}`} fill="none" viewBox="0 0 24 24">
      <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
      <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8v8H4z" />
    </svg>
  )
}

const STATUS_CONFIG: Record<ScanStatus, {
  label: string
  icon: string
  spinner: boolean
  spinnerColor: string
  textColor: string
  ring: string
}> = {
  PENDING: {
    label: '스캔 대기 중',
    icon: '⏳',
    spinner: true,
    spinnerColor: 'text-yellow-400',
    textColor: 'text-yellow-400',
    ring: 'bg-yellow-400/10',
  },
  RUNNING: {
    label: '스캔 진행 중',
    icon: '',
    spinner: true,
    spinnerColor: 'text-green-400',
    textColor: 'text-green-400',
    ring: 'bg-green-400/10',
  },
  DONE: {
    label: '스캔 완료!',
    icon: '✅',
    spinner: false,
    spinnerColor: '',
    textColor: 'text-green-400',
    ring: 'bg-green-400/10',
  },
  FAILED: {
    label: '스캔 실패',
    icon: '❌',
    spinner: false,
    spinnerColor: '',
    textColor: 'text-red-400',
    ring: 'bg-red-400/10',
  },
}
