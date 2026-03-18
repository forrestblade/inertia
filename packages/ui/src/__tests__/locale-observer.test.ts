import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest'
import { localeObserver } from '../core/locale-observer.js'
import type { LocaleSubscriber } from '../core/locale-observer.js'
import { flushObservers } from './test-helpers.js'

describe('localeObserver', () => {
  let originalLang: string

  beforeEach(() => {
    originalLang = document.documentElement.lang
    document.documentElement.lang = 'en'
  })

  afterEach(() => {
    document.documentElement.lang = originalLang
  })

  it('reports the current locale from html[lang]', () => {
    document.documentElement.lang = 'fr'
    // Singleton reads live from the DOM
    expect(localeObserver.locale).toBe('fr')
  })

  it('defaults to "en" when html[lang] is empty', () => {
    document.documentElement.lang = ''
    expect(localeObserver.locale).toBe('en')
  })

  it('notifies subscribers when locale changes', async () => {
    const sub: LocaleSubscriber = { localeChanged: vi.fn() }
    localeObserver.subscribe(sub)

    document.documentElement.lang = 'de'
    await flushObservers()

    expect(sub.localeChanged).toHaveBeenCalledWith('de')

    localeObserver.unsubscribe(sub)
  })

  it('does not notify after unsubscribe', async () => {
    const sub: LocaleSubscriber = { localeChanged: vi.fn() }
    localeObserver.subscribe(sub)
    localeObserver.unsubscribe(sub)

    document.documentElement.lang = 'ja'
    await flushObservers()

    expect(sub.localeChanged).not.toHaveBeenCalled()
  })

  it('notifies multiple subscribers', async () => {
    const sub1: LocaleSubscriber = { localeChanged: vi.fn() }
    const sub2: LocaleSubscriber = { localeChanged: vi.fn() }
    localeObserver.subscribe(sub1)
    localeObserver.subscribe(sub2)

    document.documentElement.lang = 'es'
    await flushObservers()

    expect(sub1.localeChanged).toHaveBeenCalledWith('es')
    expect(sub2.localeChanged).toHaveBeenCalledWith('es')

    localeObserver.unsubscribe(sub1)
    localeObserver.unsubscribe(sub2)
  })

  it('does not notify when lang is set to the same value', async () => {
    const sub: LocaleSubscriber = { localeChanged: vi.fn() }
    localeObserver.subscribe(sub)

    // Setting to the current value — no change
    document.documentElement.lang = 'en'
    await flushObservers()

    expect(sub.localeChanged).not.toHaveBeenCalled()

    localeObserver.unsubscribe(sub)
  })

  it('stops observing when last subscriber unsubscribes', async () => {
    const sub: LocaleSubscriber = { localeChanged: vi.fn() }
    localeObserver.subscribe(sub)
    localeObserver.unsubscribe(sub)

    // Re-subscribe a fresh one to prove observer restarts cleanly
    const sub2: LocaleSubscriber = { localeChanged: vi.fn() }
    localeObserver.subscribe(sub2)

    document.documentElement.lang = 'ko'
    await flushObservers()

    expect(sub2.localeChanged).toHaveBeenCalledWith('ko')
    localeObserver.unsubscribe(sub2)
  })
})
