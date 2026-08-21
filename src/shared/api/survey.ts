const WEBAPP_URL = import.meta.env.VITE_SURVEY_WEBAPP_URL as string | undefined

/**
 * 베타테스터 사용경험 설문 → Google Sheets 저장용 Apps Script 웹 앱으로 전송.
 * CORS preflight를 피하려고 Content-Type을 text/plain으로 보낸다(Apps Script 쪽에서 JSON.parse).
 */
export async function submitSurvey(payload: Record<string, unknown>): Promise<boolean> {
  if (!WEBAPP_URL) return false
  try {
    await fetch(WEBAPP_URL, {
      method: 'POST',
      headers: { 'Content-Type': 'text/plain;charset=utf-8' },
      body: JSON.stringify(payload),
    })
    return true
  } catch {
    return false
  }
}
