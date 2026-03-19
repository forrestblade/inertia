import { describe, it, expect } from 'vitest'
import { renderDashboard } from '../admin/dashboard.js'
import type { DashboardData } from '../admin/dashboard.js'

describe('renderDashboard()', () => {
  it('renders stat cards with counts', () => {
    const data: DashboardData = {
      stats: [
        { slug: 'posts', label: 'Posts', count: 42, recent: [] },
        { slug: 'pages', label: 'Pages', count: 7, recent: [] }
      ]
    }
    const html = renderDashboard(data)
    expect(html).toContain('42')
    expect(html).toContain('Posts')
    expect(html).toContain('/admin/posts')
    expect(html).toContain('7')
    expect(html).toContain('Pages')
    expect(html).toContain('/admin/pages')
  })

  it('renders recent items table', () => {
    const data: DashboardData = {
      stats: [
        {
          slug: 'posts',
          label: 'Posts',
          count: 2,
          recent: [
            { id: 'a1', title: 'First Post', created_at: '2026-03-18T10:00:00Z' },
            { id: 'b2', title: 'Second Post', created_at: '2026-03-17T10:00:00Z' }
          ]
        }
      ]
    }
    const html = renderDashboard(data)
    expect(html).toContain('Recent Activity')
    expect(html).toContain('First Post')
    expect(html).toContain('Second Post')
    expect(html).toContain('Posts')
    expect(html).toContain('<table')
  })

  it('renders zero counts gracefully', () => {
    const data: DashboardData = {
      stats: [
        { slug: 'posts', label: 'Posts', count: 0, recent: [] }
      ]
    }
    const html = renderDashboard(data)
    expect(html).toContain('0')
    expect(html).toContain('Posts')
    expect(html).not.toContain('Recent Activity')
  })

  it('renders multiple collections in recent activity', () => {
    const data: DashboardData = {
      stats: [
        {
          slug: 'posts',
          label: 'Posts',
          count: 1,
          recent: [{ id: 'p1', title: 'My Post', created_at: '2026-03-18T10:00:00Z' }]
        },
        {
          slug: 'pages',
          label: 'Pages',
          count: 1,
          recent: [{ id: 'pg1', title: 'About Us', created_at: '2026-03-17T10:00:00Z' }]
        }
      ]
    }
    const html = renderDashboard(data)
    expect(html).toContain('My Post')
    expect(html).toContain('About Us')
  })
})
