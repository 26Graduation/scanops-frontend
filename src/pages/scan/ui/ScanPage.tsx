import ScanForm from '../../../features/scan-request/ui/ScanForm'

export default function ScanPage() {
  return (
    <main className="min-h-screen flex flex-col items-center justify-center bg-gray-950 text-white px-4">
      <h2 className="text-3xl font-bold mb-8">새 스캔 요청</h2>
      <ScanForm />
    </main>
  )
}
