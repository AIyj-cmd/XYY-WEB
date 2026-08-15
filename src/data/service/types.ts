export type ServiceVariant =
  | 'journey'
  | 'showroom'
  | 'guangzhou-hub'
  | 'south-network'
  | 'east-radius'
  | 'store-rhythm'
  | 'global-tower'
  | 'live-command'
  | 'jit-radar'
  | 'evidence-lab'
  | 'repair-workshop'
  | 'delivery-desk'

export interface StatItem {
  stat: string
  label: string
  sub: string
}

export interface FeatureItem {
  title: string
  desc: string
}

export interface FaqItem {
  contentKey?: string
  q: string
  a: string
}
