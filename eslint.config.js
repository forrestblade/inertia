import neostandard from 'neostandard'
export default [
  { ignores: ['**/dist/', '**/public/js/'] },
  ...neostandard({ ts: true }),
  {
    rules: {
      '@typescript-eslint/no-redeclare': 'off',
      complexity: ['error', 20]
    }
  },
  // k6 performance test scripts use k6's own runtime globals
  {
    files: ['tests/perf/**/*.js'],
    languageOptions: {
      globals: {
        __ENV: 'readonly',
        __VU: 'readonly',
        __ITER: 'readonly',
        __SCENARIO: 'readonly',
        open: 'readonly'
      }
    }
  }
]
