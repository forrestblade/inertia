// @vitest-environment happy-dom
import { describe, it, expect, afterEach } from 'vitest'
import { initLoginForm, _testGetSignals } from '../admin/editor/login-reactive.js'

describe('login-reactive', () => {
  afterEach(() => {
    document.body.innerHTML = ''
  })

  function createLoginForm (): HTMLFormElement {
    document.body.innerHTML = `
      <form method="POST" action="/admin/login">
        <input type="hidden" name="_csrf" value="tok">
        <input name="email" type="email" required>
        <input name="password" type="password" required>
        <button type="submit" class="km-gradient-btn">Sign In</button>
      </form>
    `
    return document.querySelector('form')!
  }

  it('disables submit button when fields are empty', () => {
    const form = createLoginForm()
    const dispose = initLoginForm(form)
    const btn = form.querySelector<HTMLButtonElement>('button')!
    expect(btn.disabled).toBe(true)
    dispose()
  })

  it('enables submit button when both signals have values', () => {
    const form = createLoginForm()
    const dispose = initLoginForm(form)
    const btn = form.querySelector<HTMLButtonElement>('button')!
    const signals = _testGetSignals()

    signals.email.value = 'test@test.com'
    signals.password.value = 'secret'

    expect(btn.disabled).toBe(false)
    dispose()
  })

  it('disables button again when a signal is cleared', () => {
    const form = createLoginForm()
    const dispose = initLoginForm(form)
    const btn = form.querySelector<HTMLButtonElement>('button')!
    const signals = _testGetSignals()

    signals.email.value = 'a@b.c'
    signals.password.value = 'x'
    expect(btn.disabled).toBe(false)

    signals.email.value = ''
    expect(btn.disabled).toBe(true)
    dispose()
  })

  it('returns a dispose function that cleans up all bindings', () => {
    const form = createLoginForm()
    const dispose = initLoginForm(form)
    const btn = form.querySelector<HTMLButtonElement>('button')!
    const signals = _testGetSignals()

    dispose()

    signals.email.value = 'after@dispose.com'
    signals.password.value = 'x'
    expect(btn.disabled).toBe(true)
  })
})
