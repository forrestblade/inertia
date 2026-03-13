import { describe, it, expect, beforeAll, afterEach } from 'vitest'
import type { ContactNotification } from '../server/send-notification.js'

let sendContactNotification: typeof import('../server/send-notification.js').sendContactNotification

beforeAll(async () => {
  const mod = await import('../server/send-notification.js')
  sendContactNotification = mod.sendContactNotification
})

const baseData: ContactNotification = {
  name: 'Jane Doe',
  email: 'jane@example.com',
  subject: 'Test Subject',
  message: 'Hello, this is a test.'
}

afterEach(() => {
  delete process.env['SMTP_HOST']
  delete process.env['SMTP_USER']
  delete process.env['SMTP_PORT']
  delete process.env['SMTP_PASS']
})

describe('sendContactNotification', () => {
  it('resolves Ok when SMTP_HOST is empty (no-op)', async () => {
    process.env['SMTP_HOST'] = ''
    process.env['SMTP_USER'] = 'user@test.com'
    const result = await sendContactNotification(baseData, 'to@test.com')
    expect(result.isOk()).toBe(true)
  })

  it('resolves Ok when SMTP_USER is empty (no-op)', async () => {
    process.env['SMTP_HOST'] = 'smtp.test.com'
    process.env['SMTP_USER'] = ''
    const result = await sendContactNotification(baseData, 'to@test.com')
    expect(result.isOk()).toBe(true)
  })

  it('resolves Ok when both SMTP vars are unset (no-op)', async () => {
    const result = await sendContactNotification(baseData, 'to@test.com')
    expect(result.isOk()).toBe(true)
  })

  it('returns Err with NOTIFICATION_FAILED code on SMTP failure', async () => {
    process.env['SMTP_HOST'] = '127.0.0.1'
    process.env['SMTP_PORT'] = '19999'
    process.env['SMTP_USER'] = 'user@test.com'
    process.env['SMTP_PASS'] = 'pass'

    const result = await sendContactNotification(baseData, 'to@test.com')
    expect(result.isErr()).toBe(true)
    if (result.isErr()) {
      expect(result.error.code).toBe('NOTIFICATION_FAILED')
      expect(result.error.message).toBeTruthy()
    }
  })
})
