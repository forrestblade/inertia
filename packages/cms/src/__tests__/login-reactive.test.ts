import { describe, it, expect, afterEach } from 'vitest'
import { initLoginForm } from '../admin/editor/login-reactive.js'

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
        <div class="login-error" style="display:none"></div>
      </form>
    `
    return document.querySelector('form')!
  }

  it('disables submit button when fields are empty', () => {
    const form = createLoginForm()
    const dispose = initLoginForm(form)
    const btn = form.querySelector('button')!
    expect(btn.disabled).toBe(true)
    dispose()
  })

  it('enables submit button when both fields have values', () => {
    const form = createLoginForm()
    const dispose = initLoginForm(form)
    const email = form.querySelector<HTMLInputElement>('input[name="email"]')!
    const password = form.querySelector<HTMLInputElement>('input[name="password"]')!
    const btn = form.querySelector('button')!

    email.value = 'test@test.com'
    email.dispatchEvent(new Event('input', { bubbles: true }))
    expect(btn.disabled).toBe(true) // password still empty

    password.value = 'secret'
    password.dispatchEvent(new Event('input', { bubbles: true }))
    expect(btn.disabled).toBe(false) // both filled
    dispose()
  })

  it('disables button again when a field is cleared', () => {
    const form = createLoginForm()
    const dispose = initLoginForm(form)
    const email = form.querySelector<HTMLInputElement>('input[name="email"]')!
    const password = form.querySelector<HTMLInputElement>('input[name="password"]')!
    const btn = form.querySelector('button')!

    email.value = 'a@b.c'
    email.dispatchEvent(new Event('input', { bubbles: true }))
    password.value = 'x'
    password.dispatchEvent(new Event('input', { bubbles: true }))
    expect(btn.disabled).toBe(false)

    email.value = ''
    email.dispatchEvent(new Event('input', { bubbles: true }))
    expect(btn.disabled).toBe(true)
    dispose()
  })

  it('returns a dispose function that cleans up all bindings', () => {
    const form = createLoginForm()
    const dispose = initLoginForm(form)
    const email = form.querySelector<HTMLInputElement>('input[name="email"]')!
    const btn = form.querySelector('button')!

    dispose()

    email.value = 'after@dispose.com'
    email.dispatchEvent(new Event('input', { bubbles: true }))
    // Button state should not have changed after dispose
    expect(btn.disabled).toBe(true)
  })
})
