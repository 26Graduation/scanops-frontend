import { useEffect, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { listReports } from '../../../entities/scan/api/scanApi'
import type { ScanJob } from '../../../entities/scan/model/types'

export default function ReportsPage() {
  const navigate = useNavigate()
  const [jobs, setJobs] = useState<ScanJob[]>([])

  useEffect(() => {
    listReports().then(setJobs)
  }, [])

  return (
    <main className="min-h-screen bg-gray-950 text-white px-6 py-10 max-w-4xl mx-auto">
      <h2 className="text-3xl font-bold mb-8">스캔 이력</h2>
      {jobs.length === 0 ? (
        <p className="text-gray-400">스캔 이력이 없습니다.</p>
      ) : (
        <div className="space-y-3">
          {jobs.map((job) => (
            <div
              key={job.id}
              onClick={() => job.status === 'DONE' && navigate(`/report/${job.id}`)}
              className="bg-gray-800 rounded-lg px-5 py-4 flex justify-between items-center cursor-pointer hover:bg-gray-700 transition-colors"
            >
              <span className="text-sm text-gray-300 truncate max-w-xs">{job.targetUrl}</span>
              <span className="text-sm font-semibold">{job.status}</span>
            </div>
          ))}
        </div>
      )}
    </main>
  )
}
