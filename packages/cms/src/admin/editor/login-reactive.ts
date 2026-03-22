// Login form reactive bindings — powered by @valencets/reactive
// Hydrates server-rendered login form with client-side validation and state.

import { signal, computed, effect } from '@valencets/reactive'
import type { Signal } from '@valencets/reactive'

// Test-only access to the last created signals
let lastSignals: { email: Signal<string>, password: Signal<string> } | null = null

/** @internal test helper — returns the signals from the last initLoginForm call */
export function _testGetSignals (): { email: Signal<string>, password: Signal<string> } {
  if (lastSignals === null) {
    const err = new Error('initLoginForm has not been called')
    throw err // eslint-disable-line no-restricted-syntax
  }
  return lastSignals
}

/** Initialize reactive bindings on the login form. Returns dispose function. */
export function initLoginForm (form: HTMLFormElement): () => void {
  const emailInput = form.querySelector<HTMLInputElement>('input[name="email"]')
  const passwordInput = form.querySelector<HTMLInputElement>('input[name="password"]')
  const submitBtn = form.querySelector<HTMLButtonElement>('button[type="submit"]')

  if (!emailInput || !passwordInput || !submitBtn) return () => {}

  const email = signal(emailInput.value)
  const password = signal(passwordInput.value)
  const canSubmit = computed(() => email.value.length > 0 && password.value.length > 0)

  lastSignals = { email, password }

  const disposers: Array<() => void> = []

  // Two-way: input events → signals
  const onEmail = (): void => { email.value = emailInput.value }
  const onPassword = (): void => { password.value = passwordInput.value }
  emailInput.addEventListener('input', onEmail)
  passwordInput.addEventListener('input', onPassword)
  disposers.push(() => { emailInput.removeEventListener('input', onEmail) })
  disposers.push(() => { passwordInput.removeEventListener('input', onPassword) })

  // One-way: canSubmit signal → button disabled
  disposers.push(effect(() => {
    submitBtn.disabled = !canSubmit.value
  }))

  return () => {
    for (const dispose of disposers) {
      dispose()
    }
    lastSignals = null
  }
}
