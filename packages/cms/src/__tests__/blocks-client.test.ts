// @vitest-environment happy-dom
import { describe, it, expect, beforeEach } from 'vitest'

describe('Admin client JS for blocks field', () => {
  beforeEach(() => {
    document.body.innerHTML = ''
  })

  it('adding a block creates expected DOM structure', async () => {
    document.body.innerHTML = '<div class="blocks-field" data-blocks-config="[{&quot;slug&quot;:&quot;hero&quot;,&quot;fields&quot;:[{&quot;type&quot;:&quot;text&quot;,&quot;name&quot;:&quot;heading&quot;}]}]"><input type="hidden" name="content" value="[]"><div class="blocks-add"><select class="blocks-type-select"><option value="hero">hero</option></select><button type="button" class="blocks-add-btn">+ Add block</button></div></div>'
    const { initBlocksFields } = await import('../admin/editor/blocks-client.js')
    initBlocksFields()
    const addBtn = document.querySelector('.blocks-add-btn') as HTMLButtonElement
    addBtn.click()
    expect(document.querySelector('.blocks-item')).not.toBeNull()
    const hidden = document.querySelector('input[type="hidden"]') as HTMLInputElement
    const parsed = JSON.parse(hidden.value)
    expect(parsed).toHaveLength(1)
    expect(parsed[0].blockType).toBe('hero')
  })

  it('removing a block updates hidden input JSON', async () => {
    document.body.innerHTML = '<div class="blocks-field" data-blocks-config="[{&quot;slug&quot;:&quot;hero&quot;,&quot;fields&quot;:[{&quot;type&quot;:&quot;text&quot;,&quot;name&quot;:&quot;heading&quot;}]}]"><input type="hidden" name="content" value="[{&quot;blockType&quot;:&quot;hero&quot;,&quot;heading&quot;:&quot;Hello&quot;}]"><fieldset class="blocks-item" data-block-index="0" data-block-type="hero"><legend>hero</legend><label class="form-field"><span>heading</span><input class="form-input" type="text" name="heading" value="Hello"></label><button type="button" class="blocks-remove">Remove</button></fieldset><div class="blocks-add"><select class="blocks-type-select"><option value="hero">hero</option></select><button type="button" class="blocks-add-btn">+ Add block</button></div></div>'
    const { initBlocksFields } = await import('../admin/editor/blocks-client.js')
    initBlocksFields()
    const removeBtn = document.querySelector('.blocks-remove') as HTMLButtonElement
    removeBtn.click()
    expect(document.querySelector('.blocks-item')).toBeNull()
    const hidden = document.querySelector('input[type="hidden"]') as HTMLInputElement
    const parsed = JSON.parse(hidden.value)
    expect(parsed).toHaveLength(0)
  })
})
