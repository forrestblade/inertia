/** @type {import('@stryker-mutator/api/core').PartialStrykerOptions} */
export default {
  testRunner: 'vitest',
  vitest: {
    configFile: 'vitest.workspace.ts'
  },
  mutate: [
    'packages/*/src/**/*.ts',
    '!packages/*/src/**/__tests__/**',
    '!packages/*/src/**/index.ts'
  ],
  reporters: ['html', 'clear-text', 'progress'],
  thresholds: {
    high: 80,
    low: 70,
    break: 60
  },
  concurrency: 4,
  timeoutMS: 60_000,
  incremental: true,
  incrementalFile: '.stryker-tmp/incremental.json'
}
