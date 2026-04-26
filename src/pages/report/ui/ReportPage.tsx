import { useEffect, useRef, useState } from 'react'
import { useNavigate, useParams } from 'react-router-dom'
import {
  RadialBarChart,
  RadialBar,
  PieChart,
  Pie,
  Cell,
  Tooltip,
  ResponsiveContainer,
} from 'recharts'
import { getScan, getVulnerabilities } from '../../../api/scanApi'
import type { Vulnerability, RiskLevel } from '../../../types/scan'
import { getVulnMeta } from './vulnMeta'

// ── constants ──────────────────────────────────────────────────────────────

const RISK_ORDER: Record<RiskLevel, number> = { HIGH: 0, MEDIUM: 1, LOW: 2, INFORMATIONAL: 3 }

const RISK_COLOR: Record<RiskLevel, string> = {
  HIGH: '#ef4444',
  MEDIUM: '#f97316',
  LOW: '#eab308',
  INFORMATIONAL: '#3b82f6',
}

const RISK_LABEL: Record<RiskLevel, string> = {
  HIGH: 'HIGH',
  MEDIUM: 'MEDIUM',
  LOW: 'LOW',
  INFORMATIONAL: 'INFO',
}

function cvssColor(score: number) {
  if (score >= 9) return '#ef4444'
  if (score >= 7) return '#f97316'
  if (score >= 4) return '#eab308'
  return '#22c55e'
}

function cvssLabel(score: number) {
  if (score >= 9) return 'Critical'
  if (score >= 7) return 'High'
  if (score >= 4) return 'Medium'
  return 'Low'
}

// ── small components ───────────────────────────────────────────────────────

function RiskBadge({ risk }: { risk: RiskLevel }) {
  const color = RISK_COLOR[risk]
  return (
    <span
      className="text-xs font-semibold px-2 py-0.5 rounded-full"
      style={{ backgroundColor: color + '20', color }}
    >
      {RISK_LABEL[risk]}
    </span>
  )
}

function SummaryCard({ label, value, color }: { label: string; value: number; color: string }) {
  return (
    <div className="bg-gray-900 border border-gray-800 rounded-xl px-5 py-4 flex flex-col gap-1">
      <span className="text-xs text-gray-500 font-medium">{label}</span>
      <span className="text-2xl font-extrabold" style={{ color }}>{value}</span>
    </div>
  )
}

function CvssGauge({ score }: { score: number }) {
  const color = cvssColor(score)
  const pct = score / 10
  const data = [
    { value: pct * 100, fill: color },
    { value: (1 - pct) * 100, fill: '#1f2937' },
  ]
  return (
    <div className="bg-gray-900 border border-gray-800 rounded-2xl p-6 flex flex-col items-center">
      <h3 className="text-sm font-medium text-gray-400 mb-4">최고 CVSS 점수</h3>
      {/* 바깥 wrapper: 반원 하단 빈 공간을 잘라내기 위해 h-[90px] overflow-hidden */}
      <div className="relative w-40" style={{ height: '100px', overflow: 'hidden' }}>
        <div className="absolute top-0 left-0 w-full" style={{ height: '160px' }}>
          <ResponsiveContainer width="100%" height="100%">
            <RadialBarChart cx="50%" cy="50%" innerRadius="70%" outerRadius="100%" startAngle={180} endAngle={0} data={data} barSize={14}>
              <RadialBar dataKey="value" cornerRadius={7} background={false} />
            </RadialBarChart>
          </ResponsiveContainer>
        </div>
        <div className="absolute inset-0 flex flex-col items-center justify-end pb-1">
          <span className="text-3xl font-extrabold" style={{ color }}>{score.toFixed(1)}</span>
          <span className="text-xs text-gray-500">/ 10.0</span>
        </div>
      </div>
      <span className="mt-8 text-xs font-semibold px-2.5 py-1 rounded-full" style={{ backgroundColor: color + '20', color }}>
        {cvssLabel(score)}
      </span>
    </div>
  )
}

function VulnPieChart({ vulns }: { vulns: Vulnerability[] }) {
  const counts: Partial<Record<RiskLevel, number>> = {}
  for (const v of vulns) counts[v.riskLevel] = (counts[v.riskLevel] ?? 0) + 1
  const data = (Object.keys(counts) as RiskLevel[]).map((k) => ({ name: RISK_LABEL[k], value: counts[k]!, color: RISK_COLOR[k] }))
  return (
    <div className="bg-gray-900 border border-gray-800 rounded-2xl p-6 flex flex-col items-center">
      <h3 className="text-sm font-medium text-gray-400 mb-4">위험도 분포</h3>
      <ResponsiveContainer width="100%" height={140}>
        <PieChart>
          <Pie data={data} cx="50%" cy="50%" innerRadius={40} outerRadius={60} dataKey="value" paddingAngle={4}>
            {data.map((entry) => <Cell key={entry.name} fill={entry.color} />)}
          </Pie>
          <Tooltip contentStyle={{ background: '#111827', border: '1px solid #374151', borderRadius: 8, fontSize: 12 }} itemStyle={{ color: '#e5e7eb' }} />
        </PieChart>
      </ResponsiveContainer>
      <div className="mt-5 flex items-center gap-4 flex-wrap justify-center">
        {data.map((entry) => (
          <div key={entry.name} className="flex items-center gap-1.5">
            <span className="w-2 h-2 rounded-full flex-shrink-0" style={{ backgroundColor: entry.color }} />
            <span className="text-xs text-gray-400">{entry.name}</span>
          </div>
        ))}
      </div>
    </div>
  )
}

// ── detail modal ───────────────────────────────────────────────────────────

function VulnDetailModal({ vuln, onClose }: { vuln: Vulnerability; onClose: () => void }) {
  const overlayRef = useRef<HTMLDivElement>(null)
  const meta = getVulnMeta(vuln.vulnType)
  const color = RISK_COLOR[vuln.riskLevel]
  const cvssCol = cvssColor(vuln.cvssScore)

  useEffect(() => {
    const onKey = (e: KeyboardEvent) => { if (e.key === 'Escape') onClose() }
    window.addEventListener('keydown', onKey)
    document.body.style.overflow = 'hidden'
    return () => {
      window.removeEventListener('keydown', onKey)
      document.body.style.overflow = ''
    }
  }, [onClose])

  return (
    <div
      ref={overlayRef}
      onClick={(e) => { if (e.target === overlayRef.current) onClose() }}
      className="fixed inset-0 z-50 flex items-center justify-center bg-black/70 backdrop-blur-sm p-4"
    >
      <div className="w-full max-w-2xl max-h-[90vh] overflow-y-auto bg-gray-900 border border-gray-700 rounded-2xl shadow-2xl">
        {/* Header */}
        <div className="flex items-start justify-between p-6 border-b border-gray-800">
          <div className="flex flex-col gap-2">
            <div className="flex items-center gap-2 flex-wrap">
              <RiskBadge risk={vuln.riskLevel} />
              <span
                className="text-xs font-semibold px-2 py-0.5 rounded-full font-mono"
                style={{ backgroundColor: cvssCol + '20', color: cvssCol }}
              >
                CVSS {vuln.cvssScore.toFixed(1)} · {cvssLabel(vuln.cvssScore)}
              </span>
            </div>
            <h2 className="text-lg font-bold text-white leading-snug">{vuln.vulnType}</h2>
          </div>
          <button onClick={onClose} className="ml-4 text-gray-500 hover:text-white transition-colors flex-shrink-0">
            <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>
        </div>

        <div className="p-6 space-y-6">
          {/* Summary */}
          {vuln.summary && (
            <p className="text-sm text-gray-300 bg-gray-800/60 rounded-lg px-4 py-3 leading-relaxed border-l-2 border-gray-600">
              {vuln.summary}
            </p>
          )}

          {/* URL / Param */}
          <div className="space-y-2">
            <InfoRow label="URL" value={vuln.url} mono />
            {vuln.parameter && <InfoRow label="파라미터" value={vuln.parameter} mono />}
            {vuln.cvssVector && <InfoRow label="CVSS Vector" value={vuln.cvssVector} mono />}
          </div>

          {/* Cause / Remedy */}
          {meta ? (
            <>
              <Section title="발생 원인" icon="🔎" color="#f97316">
                <p className="text-sm text-gray-300 leading-relaxed whitespace-pre-wrap">{meta.cause}</p>
              </Section>
              <Section title="해결 방법" icon="🛠️" color="#22c55e">
                <p className="text-sm text-gray-300 leading-relaxed whitespace-pre-wrap">{meta.remedy}</p>
                {meta.reference && (
                  <a
                    href={meta.reference}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="inline-block mt-3 text-xs text-cyan-400 hover:underline"
                  >
                    참고 문서 →
                  </a>
                )}
              </Section>
            </>
          ) : vuln.description || vuln.solution ? (
            <>
              {vuln.description && (
                <Section title="발생 원인" icon="🔎" color="#f97316">
                  <p className="text-sm text-gray-300 leading-relaxed whitespace-pre-wrap">{vuln.description}</p>
                </Section>
              )}
              {vuln.solution && (
                <Section title="해결 방법" icon="🛠️" color="#22c55e">
                  <p className="text-sm text-gray-300 leading-relaxed whitespace-pre-wrap">{vuln.solution}</p>
                </Section>
              )}
            </>
          ) : (
            <div className="text-xs text-gray-600 bg-gray-800/50 rounded-lg px-4 py-3">
              이 취약점 유형에 대한 상세 설명이 아직 준비되지 않았습니다.
            </div>
          )}

          {/* AI Analysis */}
          {vuln.aiAnalysis && (
            <Section title="AI 분석" icon="🤖" color="#3b82f6">
              <p className="text-sm text-gray-300 leading-relaxed whitespace-pre-wrap">{vuln.aiAnalysis}</p>
              {vuln.aiModel && <p className="text-xs text-gray-600 mt-2">모델: {vuln.aiModel}</p>}
            </Section>
          )}
        </div>

        {/* Footer */}
        <div className="px-6 pb-6">
          <div
            className="w-full h-1.5 rounded-full"
            style={{ backgroundColor: color + '30' }}
          >
            <div
              className="h-full rounded-full transition-all"
              style={{ width: `${(vuln.cvssScore / 10) * 100}%`, backgroundColor: cvssCol }}
            />
          </div>
          <div className="flex justify-between mt-1.5 text-xs text-gray-600">
            <span>0</span>
            <span>CVSS 점수 범위</span>
            <span>10</span>
          </div>
        </div>
      </div>
    </div>
  )
}

function InfoRow({ label, value, mono }: { label: string; value: string; mono?: boolean }) {
  return (
    <div className="flex gap-3 items-start">
      <span className="text-xs text-gray-500 w-24 flex-shrink-0 pt-0.5">{label}</span>
      <span className={`text-xs text-gray-300 break-all ${mono ? 'font-mono' : ''}`}>{value}</span>
    </div>
  )
}

function Section({ title, icon, color, children }: { title: string; icon: string; color: string; children: React.ReactNode }) {
  return (
    <div>
      <div className="flex items-center gap-2 mb-2">
        <span>{icon}</span>
        <h3 className="text-sm font-semibold" style={{ color }}>{title}</h3>
      </div>
      <div className="pl-6 border-l-2 border-gray-700">
        {children}
      </div>
    </div>
  )
}

// ── table row ──────────────────────────────────────────────────────────────

function VulnRow({ vuln, onClick }: { vuln: Vulnerability; onClick: () => void }) {
  const color = RISK_COLOR[vuln.riskLevel]
  return (
    <tr
      onClick={onClick}
      className="border-b border-gray-800 cursor-pointer hover:bg-gray-800/60 transition-colors"
    >
      <td className="px-4 py-3">
        <RiskBadge risk={vuln.riskLevel} />
      </td>
      <td className="px-4 py-3 text-sm font-medium text-gray-200">{vuln.vulnType}</td>
      <td className="px-4 py-3 text-xs text-gray-400 max-w-xs truncate font-mono">{vuln.url}</td>
      <td className="px-4 py-3 text-xs text-gray-400">{vuln.parameter || '—'}</td>
      <td className="px-4 py-3 text-sm font-mono font-semibold" style={{ color }}>
        {vuln.cvssScore.toFixed(1)}
      </td>
      <td className="px-4 py-3 text-gray-600 text-xs">→</td>
    </tr>
  )
}

// ── page ───────────────────────────────────────────────────────────────────

export default function ReportPage() {
  const { id } = useParams<{ id: string }>()
  const navigate = useNavigate()
  const [vulns, setVulns] = useState<Vulnerability[] | null>(null)
  const [targetUrl, setTargetUrl] = useState('')
  const [selected, setSelected] = useState<Vulnerability | null>(null)
  const [error, setError] = useState(false)

  useEffect(() => {
    if (!id) return
    Promise.all([getScan(id), getVulnerabilities(id)])
      .then(([scan, data]) => {
        setTargetUrl(scan.targetUrl)
        // sort HIGH → MEDIUM → LOW → INFORMATIONAL, then by cvssScore desc
        setVulns(
          [...data].sort(
            (a, b) =>
              RISK_ORDER[a.riskLevel] - RISK_ORDER[b.riskLevel] ||
              b.cvssScore - a.cvssScore,
          ),
        )
      })
      .catch(() => setError(true))
  }, [id])

  if (error) {
    return (
      <div className="min-h-screen bg-gray-950 text-white flex items-center justify-center">
        <div className="text-center">
          <p className="text-red-400 mb-4">리포트를 불러오지 못했습니다.</p>
          <button onClick={() => navigate('/reports')} className="text-sm text-gray-400 hover:text-white">
            ← 이력으로 돌아가기
          </button>
        </div>
      </div>
    )
  }

  if (!vulns) {
    return (
      <div className="min-h-screen bg-gray-950 text-white flex items-center justify-center">
        <div className="flex flex-col items-center gap-3">
          <svg className="animate-spin w-8 h-8 text-green-400" fill="none" viewBox="0 0 24 24">
            <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
            <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8v8H4z" />
          </svg>
          <p className="text-gray-400 text-sm">리포트 로딩 중...</p>
        </div>
      </div>
    )
  }

  const maxCvss = vulns.length > 0 ? Math.max(...vulns.map((v) => v.cvssScore)) : 0
  const countByRisk = (r: RiskLevel) => vulns.filter((v) => v.riskLevel === r).length

  return (
    <div className="min-h-screen bg-gray-950 text-white">
      {selected && <VulnDetailModal vuln={selected} onClose={() => setSelected(null)} />}

      <nav className="flex items-center justify-between px-8 py-5 border-b border-gray-800">
        <button onClick={() => navigate('/')} className="flex items-center gap-2">
          <span className="text-green-400 text-xl font-mono font-bold">⬡</span>
          <span className="text-xl font-bold tracking-tight">ScanOps</span>
        </button>
        <button onClick={() => navigate('/reports')} className="text-sm text-gray-400 hover:text-white transition-colors">
          ← 이력으로 돌아가기
        </button>
      </nav>

      <main className="max-w-5xl mx-auto px-6 py-10">
        <div className="mb-8">
          <h1 className="text-3xl font-extrabold mb-1">보안 진단 리포트</h1>
          <p className="text-gray-400 text-sm font-mono truncate">{targetUrl}</p>
        </div>

        {/* Summary */}
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 mb-8">
          <SummaryCard label="총 취약점" value={vulns.length} color="#e5e7eb" />
          <SummaryCard label="HIGH" value={countByRisk('HIGH')} color={RISK_COLOR.HIGH} />
          <SummaryCard label="MEDIUM" value={countByRisk('MEDIUM')} color={RISK_COLOR.MEDIUM} />
          <SummaryCard label="LOW" value={countByRisk('LOW')} color={RISK_COLOR.LOW} />
        </div>

        {/* Charts */}
        {vulns.length > 0 && (
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-5 mb-10">
            <CvssGauge score={maxCvss} />
            <VulnPieChart vulns={vulns} />
          </div>
        )}

        {/* Table */}
        <div className="bg-gray-900 border border-gray-800 rounded-2xl overflow-hidden">
          <div className="px-6 py-4 border-b border-gray-800">
            <h2 className="font-semibold text-sm">취약점 목록</h2>
            <p className="text-xs text-gray-500 mt-0.5">항목을 클릭하면 발생 원인과 해결 방법을 확인할 수 있습니다.</p>
          </div>
          {vulns.length === 0 ? (
            <div className="px-6 py-12 text-center text-gray-500 text-sm">발견된 취약점이 없습니다.</div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full text-left">
                <thead>
                  <tr className="border-b border-gray-800 text-xs text-gray-500">
                    <th className="px-4 py-3 font-medium">위험도</th>
                    <th className="px-4 py-3 font-medium">유형</th>
                    <th className="px-4 py-3 font-medium">URL</th>
                    <th className="px-4 py-3 font-medium">파라미터</th>
                    <th className="px-4 py-3 font-medium">CVSS</th>
                    <th className="px-4 py-3" />
                  </tr>
                </thead>
                <tbody>
                  {vulns.map((v) => (
                    <VulnRow key={v.id} vuln={v} onClick={() => setSelected(v)} />
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>
      </main>
    </div>
  )
}
