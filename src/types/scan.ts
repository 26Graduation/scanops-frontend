export type RiskLevel = 'HIGH' | 'MEDIUM' | 'LOW' | 'INFORMATIONAL'
export type ScanStatus = 'PENDING' | 'RUNNING' | 'DONE' | 'FAILED'

export interface Scan {
  id: string
  targetUrl: string
  ownerEmail: string
  status: ScanStatus
  createdAt: string
  updatedAt?: string
}

export interface Vulnerability {
  id: string
  jobId: string
  vulnType: string
  url: string
  parameter: string
  riskLevel: RiskLevel
  cvssScore: number
  cvssVector: string
  description: string | null
  solution: string | null
  aiAnalysis: string | null
  aiModel: string | null
  createdAt: string
}

export interface StartScanRequest {
  targetUrl: string
  ownerEmail: string
}

export interface StartScanResponse {
  id: string
}
