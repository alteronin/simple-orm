import { test, expect } from '@playwright/test'

const BASE = 'https://simple-orm.vercel.app'

test.describe('Lighthouse Audit', () => {
  const pages = ['/task', '/stacks', '/settings']

  for (const path of pages) {
    test(`${path} - performance audit`, async ({ page }) => {
      await page.goto(path)
      await page.waitForLoadState('networkidle')

      // Collect Core Web Vitals via Performance API
      const metrics = await page.evaluate(() => {
        const perf = performance.getEntriesByType(
          'navigation'
        )[0] as PerformanceNavigationTiming
        const paint = performance.getEntriesByType('paint')
        return {
          // Timing
          dns: Math.round(perf.domainLookupEnd - perf.domainLookupStart),
          tcp: Math.round(perf.connectEnd - perf.connectStart),
          ttfb: Math.round(perf.responseStart - perf.requestStart),
          domContentLoaded: Math.round(
            perf.domContentLoadedEventEnd - perf.startTime
          ),
          load: Math.round(perf.loadEventEnd - perf.startTime),
          // Paint
          firstPaint: paint.find((p) => p.name === 'first-paint')?.startTime,
          firstContentfulPaint: paint.find(
            (p) => p.name === 'first-contentful-paint'
          )?.startTime,
          // Resources
          resourceCount: performance.getEntriesByType('resource').length,
          transferSize: performance
            .getEntriesByType('resource')
            .reduce((acc, r) => acc + (r as any).transferSize || 0, 0),
        }
      })

      console.log(`\n=== ${path} Performance Metrics ===`)
      console.log(`DNS Lookup:     ${metrics.dns}ms`)
      console.log(`TCP Connect:    ${metrics.tcp}ms`)
      console.log(`TTFB:           ${metrics.ttfb}ms`)
      console.log(`First Paint:    ${metrics.firstPaint?.toFixed(0)}ms`)
      console.log(`FCP:            ${metrics.firstContentfulPaint?.toFixed(0)}ms`)
      console.log(`DOM Ready:      ${metrics.domContentLoaded}ms`)
      console.log(`Load:           ${metrics.load}ms`)
      console.log(`Resources:      ${metrics.resourceCount}`)
      console.log(`Transfer Size:  ${(metrics.transferSize / 1024).toFixed(1)}KB`)

      // Assertions
      expect(metrics.ttfb).toBeLessThan(2000)
      expect(metrics.load).toBeLessThan(5000)
    })
  }
})
