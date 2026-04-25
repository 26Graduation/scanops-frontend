export type ScanStatus = 'PENDING' | 'RUNNING' | 'DONE' | 'FAILED'

export interface ScanJob {
  id: string
  targetUrl: string
  status: ScanStatus
  ownerEmail: string
  verified: boolean
  createdAt: string
  finishedAt?: string
}
