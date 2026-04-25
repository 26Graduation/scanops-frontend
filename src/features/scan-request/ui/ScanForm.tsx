import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { startScan } from '../api/startScan'

export default function ScanForm() {
  const navigate = useNavigate()
  const [targetUrl, setTargetUrl] = useState('')
  const [email, setEmail] = useState('')
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setError('')
    setLoading(true)
    try {
      const job = await startScan({ targetUrl, ownerEmail: email })
      navigate(`/scan/${job.id}/status`)
    } catch {
      setError('스캔 요청에 실패했습니다.')
    } finally {
      setLoading(false)
    }
  }

  return (
    <form onSubmit={handleSubmit} className="w-full max-w-md space-y-4">
      <div>
        <label className="block text-sm text-gray-400 mb-1">대상 URL</label>
        <input
          type="url"
          value={targetUrl}
          onChange={(e) => setTargetUrl(e.target.value)}
          required
          placeholder="https://example.com"
          className="w-full bg-gray-800 border border-gray-700 rounded-lg px-4 py-2 text-white focus:outline-none focus:border-blue-500"
        />
      </div>
      <div>
        <label className="block text-sm text-gray-400 mb-1">이메일</label>
        <input
          type="email"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          required
          placeholder="you@example.com"
          className="w-full bg-gray-800 border border-gray-700 rounded-lg px-4 py-2 text-white focus:outline-none focus:border-blue-500"
        />
      </div>
      {error && <p className="text-red-400 text-sm">{error}</p>}
      <button
        type="submit"
        disabled={loading}
        className="w-full bg-blue-600 hover:bg-blue-700 disabled:opacity-50 text-white py-3 rounded-lg font-semibold transition-colors"
      >
        {loading ? '요청 중...' : '스캔 시작'}
      </button>
    </form>
  )
}
