import { useNavigate } from 'react-router-dom'

export default function LandingPage() {
  const navigate = useNavigate()

  return (
    <main className="min-h-screen flex flex-col items-center justify-center bg-gray-950 text-white px-4">
      <h1 className="text-5xl font-bold mb-4">ScanOps</h1>
      <p className="text-gray-400 text-lg mb-8 text-center max-w-xl">
        ZAP 기반 자동 웹 보안 진단 &amp; AI 분석 리포트 서비스
      </p>
      <button
        onClick={() => navigate('/scan')}
        className="bg-blue-600 hover:bg-blue-700 text-white px-8 py-3 rounded-lg font-semibold transition-colors"
      >
        스캔 시작
      </button>
    </main>
  )
}
