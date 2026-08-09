export interface CaseStat {
  label: string
  value: string
  unit?: string
}

export interface CaseDetail {
  accent?: string
  image?: string
  fullName: string
  category: string
  description: string
  stats: CaseStat[]
}
