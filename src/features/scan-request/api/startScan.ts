import { http } from '../../../shared/api/httpClient'
import type { ScanJob } from '../../../entities/scan/model/types'

interface StartScanParams {
  targetUrl: string
  ownerEmail: string
}

export const startScan = (params: StartScanParams) =>
  http<ScanJob>('/api/scans', {
    method: 'POST',
    body: JSON.stringify(params),
  })
