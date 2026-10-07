import type { RedesignPresentation } from '@/components/service/redesign/presentation'
import type { FeatureItem, FaqItem, ServiceVariant, StatItem } from '@/data/service'

export type ServicePageStaticConfigRaw = {
  slug: string
  title: string
  description: string
  breadcrumbLabel: string
  eyebrow: string
  h1: string
  h1sub: string
  heroDesc: string
  imgSrc: string
  imgAlt: string
  contentDesc: string
  featuresLabel: string
  stats: StatItem[]
  features: FeatureItem[]
  faqs: FaqItem[]
  variant: ServiceVariant
  presentation?: 'classic' | 'footwear' | RedesignPresentation
}

export type ServicePageStaticConfig = ServicePageStaticConfigRaw
