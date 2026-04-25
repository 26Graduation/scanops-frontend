import { useEffect, useState } from 'react'
import { useNavigate, useParams } from 'react-router-dom'
import { getScanJob } from '../../../entities/scan/api/scanApi'
import type { ScanJob } from '../../../entities/scan/model/types'

const STATUS_LABEL: Record<string, string> = {
  PENDING: '대기 중',
  RUNNING: '스캔 중',
  DONE: '완료',
  FAILED: '실패',
}

export default function StatusPage() {
  const { id } = useParams<{ id: string }>()
  const navigate = useNavigate()
  const [job, setJob] = useState<ScanJob | null>(null)

  useEffect(() => {
    if (!id) return
    const poll = async () => {
      const data = await getScanJob(id)
      setJob(data)
      if (data.status === 'DONE') navigate(`/report/${id}`)
    }
    poll()
    const timer = setInterval(poll, 5000)
    return () => clearInterval(timer)
  }, [id, navigate])

  return (
    <main className="min-h-screen flex flex-col items-center justify-center bg-gray-950 text-white px-4">
      <h2 className="text-3xl font-bold mb-6">스캔 진행 상황</h2>
      {job ? (
        <div className="text-center space-y-3">
          <p className="text-gray-400">대상: {job.targetUrl}</p>
          <p className="text-2xl font-semibold">{STATUS_LABEL[job.status] ?? job.status}</p>
          {job.status === 'FAILED' && (
            <p className="text-red-400">스캔이 실패했습니다.</p>
          )}
        </div>
      ) : (
        <p className="text-gray-400">로딩 중...</p>
      )}
    </main>
  )
}
