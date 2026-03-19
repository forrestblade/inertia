import { initAllEditors } from './lexical-entry.js'

// Script is defer'd so DOM is ready — no need for DOMContentLoaded
initAllEditors()

// Wire up delete dialog triggers
const trigger = document.querySelector<HTMLElement>('.delete-trigger')
const dialog = document.getElementById('delete-dialog') as HTMLElement & { show?: () => void; close?: () => void } | null
const cancel = document.getElementById('delete-cancel')
const confirmBtn = document.getElementById('delete-confirm')
const form = document.getElementById('delete-form') as HTMLFormElement | null

if (trigger && dialog) {
  trigger.addEventListener('click', () => {
    if (typeof dialog.show === 'function') dialog.show()
  })
}
if (cancel && dialog) {
  cancel.addEventListener('click', () => {
    if (typeof dialog.close === 'function') dialog.close()
  })
}
if (confirmBtn && form) {
  confirmBtn.addEventListener('click', () => {
    form.submit()
  })
}
