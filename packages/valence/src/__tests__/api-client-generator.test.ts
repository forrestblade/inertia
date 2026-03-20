import { describe, it, expect } from 'vitest'
import { generateApiClient } from '../codegen/api-client-generator.js'
import { collection, field } from '@valencets/cms'

describe('generateApiClient', () => {
  it('generates valid identifier for hyphenated collection slug', () => {
    const col = collection({
      slug: 'chat-messages',
      fields: [field.text({ name: 'content', required: true })]
    })
    const output = generateApiClient(col)
    expect(output).toContain('export const chatMessages = {')
    expect(output).not.toContain('export const chat-messages')
  })

  it('generates valid identifier for simple collection slug', () => {
    const col = collection({
      slug: 'users',
      fields: [field.text({ name: 'name', required: true })]
    })
    const output = generateApiClient(col)
    expect(output).toContain('export const users = {')
  })

  it('preserves raw slug in the API path', () => {
    const col = collection({
      slug: 'chat-messages',
      fields: [field.text({ name: 'content', required: true })]
    })
    const output = generateApiClient(col)
    expect(output).toContain("apiClient<ChatMessage>('/api/chat-messages')")
  })
})
