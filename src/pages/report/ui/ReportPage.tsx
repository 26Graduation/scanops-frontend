import { useEffect, useState } from 'react'
import { useParams } from 'react-router-dom'
import { getReport } from '../../../entities/vulnerability/api/reportApi'
import type { Report } from '../../../entities/vulnerability/model/types'
import VulnTable from '../../../widgets/vuln-table/ui/VulnTable'
import VulnChart from '../../../widgets/vuln-chart/ui/VulnChart'
import CvssGauge from '../../../shared/ui/CvssGauge'
import AiGuideCard from '../../../entities/vulnerability/ui/AiGuideCard'

export default function ReportPage() {
  const { id } = useParams<{ id: string }>()
  const [report, setReport] = useState<Report | null>(null)

  useEffect(() => {
    if (!id) return
    getReport(id).then(setReport)
  }, [id])

  if (!report) {
    return (
      <main className="min-h-screen flex items-center justify-center bg-gray-950 text-white">
        <p className="text-gray-400">리포트 로딩 중...</p>
      </main>
    )
  }

  return (
    <main className="min-h-screen bg-gray-950 text-white px-6 py-10 max-w-5xl mx-auto">
      <h2 className="text-3xl font-bold mb-2">보안 진단 리포트</h2>
      <p className="text-gray-400 mb-8">대상: {report.targetUrl}</p>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-10">
        <CvssGauge score={report.maxCvssScore} />
        <VulnChart vulnerabilities={report.vulnerabilities} />
      </div>

      <VulnTable vulnerabilities={report.vulnerabilities} />

      <div className="mt-10 space-y-4">
        {report.vulnerabilities.map((v) => (
          <AiGuideCard key={v.id} vulnerability={v} />
        ))}
      </div>
    </main>
  )
}
