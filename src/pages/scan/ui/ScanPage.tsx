import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { startScan } from '../../../api/scanApi'

export default function ScanPage() {
  const navigate = useNavigate()
  const [targetUrl, setTargetUrl] = useState('')
  const [ownerEmail, setOwnerEmail] = useState('')
  const [agreed, setAgreed] = useState(false)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setError(null)
    setLoading(true)
    try {
      const { id } = await startScan({ targetUrl, ownerEmail })
      navigate(`/scan/${id}/status`)
    } catch {
      setError('스캔 요청에 실패했습니다. 입력값을 확인해 주세요.')
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="min-h-screen bg-gray-950 text-white flex flex-col">
      {/* Nav */}
      <nav className="flex items-center justify-between px-8 py-5 border-b border-gray-800">
        <button onClick={() => navigate('/')} className="flex items-center gap-2">
          <span className="text-green-400 text-xl font-mono font-bold">⬡</span>
          <span className="text-xl font-bold tracking-tight">ScanOps</span>
        </button>
      </nav>

      <main className="flex-1 flex items-center justify-center px-4 py-12">
        <div className="w-full max-w-md">
          <div className="mb-8">
            <h1 className="text-3xl font-extrabold mb-2">새 스캔 요청</h1>
            <p className="text-gray-400 text-sm">스캔할 대상 URL과 이메일을 입력하세요.</p>
          </div>

          <form
            onSubmit={handleSubmit}
            className="bg-gray-900 border border-gray-800 rounded-2xl p-8 space-y-6"
          >
            {/* URL */}
            <div className="space-y-1.5">
              <label className="block text-sm font-medium text-gray-300">대상 URL</label>
              <input
                type="url"
                required
                value={targetUrl}
                onChange={(e) => setTargetUrl(e.target.value)}
                placeholder="https://example.com"
                className="w-full bg-gray-800 border border-gray-700 rounded-lg px-4 py-3 text-sm text-white placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-green-400/50 focus:border-green-400 transition-colors"
              />
            </div>

            {/* Email */}
            <div className="space-y-1.5">
              <label className="block text-sm font-medium text-gray-300">이메일</label>
              <input
                type="email"
                required
                value={ownerEmail}
                onChange={(e) => setOwnerEmail(e.target.value)}
                placeholder="you@example.com"
                className="w-full bg-gray-800 border border-gray-700 rounded-lg px-4 py-3 text-sm text-white placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-green-400/50 focus:border-green-400 transition-colors"
              />
            </div>

            {/* Consent */}
            <label className="flex items-start gap-3 cursor-pointer group">
              <div className="relative flex-shrink-0 mt-0.5">
                <input
                  type="checkbox"
                  required
                  checked={agreed}
                  onChange={(e) => setAgreed(e.target.checked)}
                  className="sr-only"
                />
                <div
                  className={`w-5 h-5 rounded border-2 flex items-center justify-center transition-colors ${
                    agreed ? 'bg-green-400 border-green-400' : 'border-gray-600 group-hover:border-gray-400'
                  }`}
                >
                  {agreed && (
                    <svg className="w-3 h-3 text-gray-950" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={3}>
                      <path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" />
                    </svg>
                  )}
                </div>
              </div>
              <span className="text-sm text-gray-400 leading-relaxed">
                본인이 소유하거나 스캔 권한을 가진 대상임을 확인합니다.
              </span>
            </label>

            {/* Error */}
            {error && (
              <p className="text-sm text-red-400 bg-red-400/10 border border-red-400/20 rounded-lg px-4 py-3">
                {error}
              </p>
            )}

            {/* Submit */}
            <button
              type="submit"
              disabled={!agreed || loading}
              className="w-full py-3.5 rounded-lg bg-green-400 text-gray-950 font-semibold text-sm hover:bg-green-300 transition-colors disabled:opacity-40 disabled:cursor-not-allowed shadow-lg shadow-green-400/10"
            >
              {loading ? (
                <span className="flex items-center justify-center gap-2">
                  <svg className="animate-spin w-4 h-4" fill="none" viewBox="0 0 24 24">
                    <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                    <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8v8H4z" />
                  </svg>
                  처리 중...
                </span>
              ) : (
                '스캔 시작하기 →'
              )}
            </button>
          </form>
        </div>
      </main>
    </div>
  )
}
