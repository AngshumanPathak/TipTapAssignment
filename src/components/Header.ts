import { Node, mergeAttributes } from '@tiptap/core'

export const HeaderNode = Node.create({
  name: 'header',
  group: 'block',
  atom: true, // treated as a single object
  selectable: false,
  draggable: false,
  content: 'inline*',
  addAttributes() {
    return {
      text: {
        default: 'Document Header'
      }
    }
  },
  parseHTML() {
    return [{ tag: 'header' }]
  },
  renderHTML({ HTMLAttributes }) {
    return ['header', mergeAttributes({
      class: 'text-center text-lg font-bold py-2 border-b'
    }, HTMLAttributes), HTMLAttributes.text]
  }
})