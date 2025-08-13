import { Node, mergeAttributes } from '@tiptap/core'

export const FooterNode = Node.create({
  name: 'footer',
  group: 'block',
  atom: true,
  selectable: false,
  draggable: false,
  addAttributes() {
    return {
      page: {
        default: 1
      }
    }
  },
  parseHTML() {
    return [{ tag: 'footer' }]
  },
  renderHTML({ HTMLAttributes }) {
    return ['footer', mergeAttributes({
      class: 'text-center text-sm text-gray-500 border-t py-2'
    }, HTMLAttributes), `Page ${HTMLAttributes.page}`]
  }
})
