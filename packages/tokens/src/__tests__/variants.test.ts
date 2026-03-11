import { describe, it, expect } from 'vitest'
import { cn, tv } from '../variants.js'

describe('cn', () => {
  it('merges multiple class strings', () => {
    const result = cn('px-4', 'py-2', 'text-sm')
    expect(result).toBe('px-4 py-2 text-sm')
  })

  it('handles conditional classes (falsy values filtered)', () => {
    const isActive = false
    const result = cn('base', isActive && 'active', 'end')
    expect(result).toBe('base end')
  })

  it('resolves Tailwind conflicts (later class wins)', () => {
    const result = cn('px-4', 'px-8')
    expect(result).toBe('px-8')
  })

  it('handles undefined/null/empty inputs', () => {
    const result = cn(undefined, null, '', 'valid')
    expect(result).toBe('valid')
  })

  it('handles array inputs', () => {
    const result = cn(['px-4', 'py-2'], 'text-sm')
    expect(result).toBe('px-4 py-2 text-sm')
  })
})

describe('tv', () => {
  it('re-export produces variant function', () => {
    const buttonVariants = tv({
      base: 'inline-flex items-center',
      variants: {
        variant: {
          primary: 'bg-primary text-primary-foreground',
          secondary: 'bg-secondary text-secondary-foreground'
        },
        size: {
          sm: 'h-8 px-3 text-xs',
          md: 'h-9 px-4 text-sm'
        }
      },
      defaultVariants: {
        variant: 'primary',
        size: 'md'
      }
    })

    const classes = buttonVariants({ variant: 'secondary', size: 'sm' })
    expect(classes).toContain('bg-secondary')
    expect(classes).toContain('h-8')
    expect(classes).toContain('inline-flex')
  })

  it('with slots produces slot accessor functions', () => {
    const cardVariants = tv({
      slots: {
        root: 'rounded-lg border',
        header: 'flex flex-col space-y-1.5 p-6',
        content: 'p-6 pt-0'
      }
    })

    const { root, header, content } = cardVariants()
    expect(root()).toContain('rounded-lg')
    expect(header()).toContain('p-6')
    expect(content()).toContain('pt-0')
  })

  it('defaultVariants apply when no props given', () => {
    const badgeVariants = tv({
      base: 'inline-flex items-center rounded-full',
      variants: {
        variant: {
          default: 'bg-primary',
          outline: 'border border-input'
        }
      },
      defaultVariants: {
        variant: 'default'
      }
    })

    const classes = badgeVariants()
    expect(classes).toContain('bg-primary')
    expect(classes).not.toContain('border-input')
  })
})
