import { createEditor, $getRoot, $insertNodes, type LexicalEditor } from 'lexical'
import { registerRichText, HeadingNode, QuoteNode } from '@lexical/rich-text'
import { ListNode, ListItemNode, registerList } from '@lexical/list'
import { LinkNode } from '@lexical/link'
import { $generateHtmlFromNodes, $generateNodesFromDOM } from '@lexical/html'
import { registerHistory, createEmptyHistoryState } from '@lexical/history'
import { FORMAT_TEXT_COMMAND } from 'lexical'

interface ToolbarAction {
  readonly label: string
  readonly command: () => void
}

function createToolbar (editor: LexicalEditor): HTMLElement {
  const toolbar = document.createElement('div')
  toolbar.className = 'richtext-toolbar'

  const actions: readonly ToolbarAction[] = [
    { label: 'B', command: () => editor.dispatchCommand(FORMAT_TEXT_COMMAND, 'bold') },
    { label: 'I', command: () => editor.dispatchCommand(FORMAT_TEXT_COMMAND, 'italic') },
    { label: 'U', command: () => editor.dispatchCommand(FORMAT_TEXT_COMMAND, 'underline') }
  ]

  for (const action of actions) {
    const btn = document.createElement('button')
    btn.type = 'button'
    btn.className = 'richtext-toolbar-btn'
    btn.textContent = action.label
    btn.addEventListener('click', (e) => {
      e.preventDefault()
      action.command()
    })
    toolbar.appendChild(btn)
  }

  return toolbar
}

function initEditor (container: HTMLElement): void {
  const fieldName = container.getAttribute('data-field')
  if (!fieldName) return

  const wrap = container.closest('.richtext-wrap')
  if (!wrap) return

  const hiddenInput = wrap.querySelector<HTMLInputElement>(`input[name="${fieldName}"]`)
  if (!hiddenInput) return

  const templateEl = wrap.querySelector<HTMLTemplateElement>('template.richtext-initial')
  const initialHtml = templateEl?.innerHTML ?? ''

  const config = {
    namespace: `richtext-${fieldName}`,
    nodes: [HeadingNode, QuoteNode, ListNode, ListItemNode, LinkNode],
    onError: (error: Error) => { console.error('Lexical error:', error) },
    theme: {
      paragraph: 'richtext-p',
      heading: {
        h2: 'richtext-h2',
        h3: 'richtext-h3'
      },
      text: {
        bold: 'richtext-bold',
        italic: 'richtext-italic',
        underline: 'richtext-underline'
      },
      list: {
        ul: 'richtext-ul',
        ol: 'richtext-ol',
        listitem: 'richtext-li'
      },
      quote: 'richtext-quote',
      link: 'richtext-link'
    }
  }

  const editor = createEditor(config)

  const toolbar = createToolbar(editor)
  container.parentElement?.insertBefore(toolbar, container)

  const contentEditable = document.createElement('div')
  contentEditable.contentEditable = 'true'
  contentEditable.className = 'richtext-content'
  container.appendChild(contentEditable)

  editor.setRootElement(contentEditable)
  registerRichText(editor)
  registerList(editor)
  registerHistory(editor, createEmptyHistoryState(), 300)

  // Load initial HTML content
  if (initialHtml) {
    editor.update(() => {
      const parser = new DOMParser()
      const dom = parser.parseFromString(initialHtml, 'text/html')
      const nodes = $generateNodesFromDOM(editor, dom)
      const root = $getRoot()
      root.clear()
      $insertNodes(nodes)
    })
  }

  // Sync editor state to hidden input on every change
  editor.registerUpdateListener(({ editorState }) => {
    editorState.read(() => {
      const html = $generateHtmlFromNodes(editor)
      hiddenInput.value = html
    })
  })
}

export function initAllEditors (): void {
  const editors = document.querySelectorAll<HTMLElement>('.richtext-editor')
  for (const el of editors) {
    initEditor(el)
  }
}
