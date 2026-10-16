import type { Browser, BrowserContext, Page, TestInfo } from '@playwright/test'

import { contextOptions } from './language-suggestion'

export const targetLayoutCases = [
  { name: 'home-desktop', path: '/', hero: '#s-hero', width: 1440, height: 900, isMobile: false },
  { name: 'home-mobile', path: '/', hero: '#s-hero', width: 390, height: 844, isMobile: true },
  {
    name: 'footwear-desktop',
    path: '/xiefu-yuncang',
    hero: '.footwear-hero',
    width: 1440,
    height: 900,
    isMobile: false,
  },
  {
    name: 'footwear-mobile',
    path: '/xiefu-yuncang',
    hero: '.footwear-hero',
    width: 390,
    height: 844,
    isMobile: true,
  },
] as const

type Gate = { requestSeen: Promise<void>; release: () => void }
export type LayoutSnapshot = {
  suggestion: { top: number; bottom: number; height: number; position: string; hidden: boolean }
  header: { top: number; bottom: number; height: number }
  heading: { top: number; bottom: number; height: number }
  hero: { top: number; bottom: number; height: number }
  offset: string
}
export type ContactLayoutSnapshot = {
  suggestion: { top: number; bottom: number; height: number; position: string; hidden: boolean }
  header: { top: number; bottom: number; height: number }
  kicker: { top: number; bottom: number; height: number }
  heading: { top: number; bottom: number; height: number }
  hero: { top: number; bottom: number; height: number }
  offset: string
  layout: string | null
}

export async function createLanguageContext(
  browser: Browser,
  testInfo: TestInfo,
  width: number,
  height: number,
  isMobile: boolean,
  javaScriptEnabled = true
) {
  return browser.newContext({
    ...contextOptions(testInfo),
    viewport: { width, height },
    isMobile,
    hasTouch: isMobile,
    javaScriptEnabled,
  })
}

export async function holdLanguageScript(context: BrowserContext): Promise<Gate> {
  let seen = () => {}
  let release = () => {}
  const requestSeen = new Promise<void>((resolve) => {
    seen = resolve
  })
  const releasePromise = new Promise<void>((resolve) => {
    release = resolve
  })
  await context.route('**/_astro/LanguageSuggestion*.js', (route) => {
    seen()
    return releasePromise.then(() => route.continue())
  })
  return { requestSeen, release }
}

export async function waitForPaint(page: Page) {
  await page.evaluate(
    () =>
      new Promise<void>((resolve) =>
        requestAnimationFrame(() => requestAnimationFrame(() => resolve()))
      )
  )
}

export async function readLayout(page: Page, heroSelector: string): Promise<LayoutSnapshot> {
  return page.evaluate((selector) => {
    const rect = (element: Element | null) => {
      const r = element?.getBoundingClientRect()
      return { top: r?.top ?? 0, bottom: r?.bottom ?? 0, height: r?.height ?? 0 }
    }
    const suggestion = document.querySelector<HTMLElement>('#language-suggestion')
    const style = suggestion ? getComputedStyle(suggestion) : null
    return {
      suggestion: {
        ...rect(suggestion),
        position: style?.position ?? '',
        hidden: suggestion?.hidden === true,
      },
      header: rect(document.querySelector('.site-header')),
      heading: rect(document.querySelector('h1')),
      hero: rect(document.querySelector(selector)),
      offset: getComputedStyle(document.documentElement)
        .getPropertyValue('--language-suggestion-visible-height')
        .trim(),
    }
  }, heroSelector)
}

export async function readContactLayout(page: Page): Promise<ContactLayoutSnapshot> {
  return page.evaluate(() => {
    const rect = (element: Element | null) => {
      const r = element?.getBoundingClientRect()
      return { top: r?.top ?? 0, bottom: r?.bottom ?? 0, height: r?.height ?? 0 }
    }
    const suggestion = document.querySelector<HTMLElement>('#language-suggestion')
    const style = suggestion ? getComputedStyle(suggestion) : null
    const hero = document.querySelector('[aria-labelledby="contact-hero-heading"]')
    return {
      suggestion: {
        ...rect(suggestion),
        position: style?.position ?? '',
        hidden: suggestion?.hidden === true,
      },
      header: rect(document.querySelector('.site-header')),
      kicker: rect(hero?.querySelector('.text-brand-orange') ?? null),
      heading: rect(document.querySelector('#contact-hero-heading')),
      hero: rect(hero),
      offset: getComputedStyle(document.documentElement)
        .getPropertyValue('--language-suggestion-visible-height')
        .trim(),
      layout: suggestion?.getAttribute('data-language-layout') ?? null,
    }
  })
}

export function overlaps(a: { top: number; bottom: number }, b: { top: number; bottom: number }) {
  return a.top < b.bottom && a.bottom > b.top
}

export async function installEnglishPreference(page: Page) {
  await page.addInitScript(() => {
    Object.defineProperty(navigator, 'languages', {
      configurable: true,
      get: () => ['en-US', 'zh-CN'],
    })
    Object.defineProperty(navigator, 'language', { configurable: true, get: () => 'en-US' })
  })
}
