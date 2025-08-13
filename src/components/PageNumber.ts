import { Node, mergeAttributes } from '@tiptap/core'

// Make counter module-scoped but exportable
let currentPage = 1;


export const resetPageCount = () => {
  currentPage ;
}

export const nextPageNumber = () => {
  return currentPage++
}


export const PageNumber = Node.create({
  name: 'pageNumber',
  group: 'block',
  atom: true,

  addOptions() {
    return {
      position: 'bottom-right' as 'bottom-right' | 'bottom-left' | 'top-right' | 'top-left',
    }
  },

  addAttributes() {
    return {
      page: {
        default: 1,
        parseHTML: element => parseInt(element.getAttribute('data-page') || '0', 10),
        renderHTML: attributes => ({
          'data-page': attributes.page
        })
      }
    };
  },

  parseHTML() {
    return [{ tag: 'div.page-number' }]
  },

  renderHTML({ node, HTMLAttributes }) {
    return [
      'div',
      mergeAttributes(HTMLAttributes, {
        class: `page-number page-number-${this.options.position}`,
      }),
      `Page ${node.attrs.page}`
    ];
  },


  addCommands() {
    return {
      setPageNumber: () => ({ chain }) => {
        const page = nextPageNumber()
        return chain()
          .insertContent({ type: 'pageNumber', attrs: {page: page} })
          .run()
      }
      
    }
  }
})