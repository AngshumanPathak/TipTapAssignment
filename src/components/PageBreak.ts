import { Extension, Node, mergeAttributes } from '@tiptap/core'
import { Plugin, PluginKey } from 'prosemirror-state'
import type { Node as ProseMirrorNode } from 'prosemirror-model'
import { EditorView } from 'prosemirror-view'
import { nextPageNumber} from './PageNumber'


declare module '@tiptap/core' {
  interface Commands<ReturnType> {
    pageBreak: {
      setPageBreak: () => ReturnType
    }
    pageNumber: {
      setPageNumber: () => ReturnType
    }
  }
}

export interface AutoPageBreakOptions {
  a4HeightPx: number
  fullMeasureDebounce: number
  longPauseMs: number
  minBreakGapChars: number // to prevent breaks too close together
}

/** The manual page break node */
export const PageBreak = Node.create({
  name: 'pageBreak',
  group: 'block',
  atom: true,

  parseHTML() {
    return [{ tag: 'hr.page-break' }]
  },

  renderHTML({ HTMLAttributes }) {
    return [
      'div',
      mergeAttributes(HTMLAttributes, {
        class: 'page-break-container'
      }),
      [
        'hr',
        {
          class: 'border-0 border-t-2 border-dashed border-gray-400 my-5 print:break-after-page'
        }
      ]
    ]
  },

  addCommands() {
    return {
      setPageBreak: () => ({ chain, state }) => {
        
        const pos = state.selection.$from.after(1)
        if (pos <= state.doc.content.size) {
          const pageNum = nextPageNumber()
          return chain()
          .insertContent({ type: 'pageBreak' })
          .insertContent({type: 'pageNumber',attrs: { page: pageNum }})
          .run()
        }
        return false
      }
    }
  }
})




/** Automatically inserts page breaks */
export const AutoPageBreak = Extension.create<AutoPageBreakOptions>({
  name: 'autoPageBreak',
  

 

  addOptions() {
    return {
      a4HeightPx: 1122,         // A4 height at 96 DPI
      fullMeasureDebounce: 300, // debounce for measuring DOM height
      longPauseMs: 1500,        // long pause threshold
      minBreakGapChars: 5       // don't insert breaks too close
    }
  },

  addProseMirrorPlugins() {
    const pluginKey = new PluginKey('autoPageBreak')
    const options = this.options

    let lastActionTime = Date.now()
    let measureTimer: ReturnType<typeof setTimeout> | null = null
    let isProcessing = false

    /** Measure total editor height */
    const measureHeight = (view: EditorView) => {
      const editorEl = view.dom as HTMLElement
      return editorEl.scrollHeight
    }

    /** Measure height up to a specific pos */
    const measureHeightUpTo = (view: EditorView, pos: number) => {
      try {
        const startTop = view.coordsAtPos(0).top
        const endBottom = view.coordsAtPos(pos).bottom
        return endBottom - startTop
      } catch {
        return 0
      }
    }

    /** Finds all break positions for multi-page docs */
    const findAllBreakPositions = (view: EditorView) => {
      const { state } = view
      const { doc } = state
      const positions: number[] = []

      let lastBreakHeight = 0

      doc.nodesBetween(0, doc.content.size, (node: ProseMirrorNode, pos: number) => {
        if (!node.isBlock) return true

        const height = measureHeightUpTo(view, pos + node.nodeSize)

        if (height - lastBreakHeight > options.a4HeightPx) {
          positions.push(pos)
          lastBreakHeight = height
        }

        return true
      })

      return positions
    }

    /** Inserts breaks, skipping near-duplicates */
    const insertPageBreaks = (view: EditorView) => {

      
      const { state, dispatch } = view
      const pageBreakType = state.schema.nodes.pageBreak
      const pageNumberType = state.schema.nodes.pageNumber
      if (!pageBreakType || !pageNumberType) return

       

      //Reset page counter

      
        
      // Existing breaks
      const existingBreaks: number[] = []
      state.doc.descendants((node, pos) => {
        if (node.type === pageBreakType) {
          existingBreaks.push(pos)
        }
      })

      // Find where we need breaks
      const breakPositions = findAllBreakPositions(view).filter(pos =>
        !existingBreaks.includes(pos)
      )

      if (!breakPositions.length) return

      let tr = state.tr
      let offset = 1

      

      for (let pos of breakPositions) {
        const adjustedPos = pos+ offset
        tr = tr.insert(adjustedPos, pageBreakType.create())
        .insert(adjustedPos + 1, pageNumberType.create({page: nextPageNumber()}))
        offset += 2
      }
      dispatch(tr)

     
    }

    /** Remove extra breaks if content shrinks */
    const removeExtraBreaks = (view: EditorView) => {
      const { state, dispatch } = view
      const pageBreakType = state.schema.nodes.pageBreak
      if (!pageBreakType) return

      const tr = state.tr
      let changed = false
      const height = measureHeight(view)

      if (height < options.a4HeightPx) {
        state.doc.descendants((node: ProseMirrorNode, pos: number) => {
          if (node.type === pageBreakType) {
            tr.delete(pos, pos + 1)
            changed = true
          }
        })
      state.doc.descendants((node: ProseMirrorNode, pos: number) => {
      if (node.type === pageBreakType) {
        tr.delete(pos, pos + 1)
        changed = true
      }
    })

    

      }

      

      if (changed) dispatch(tr)
    }

    /** Debounced measure and break handling */
    const debounceMeasure = (view: EditorView, callback?: () => void) => {
      if (measureTimer) clearTimeout(measureTimer)
      measureTimer = setTimeout(() => {
        if (callback) callback()
      }, options.fullMeasureDebounce)
    }

    /** Main logic to handle page breaks */
    const handlePossibleBreak = (view: EditorView) => {
      if (isProcessing) return
      isProcessing = true

      debounceMeasure(view, () => {
        const height = measureHeight(view)
        if (height > options.a4HeightPx) {
          insertPageBreaks(view)
        } else if (height < options.a4HeightPx * 0.9) {
          removeExtraBreaks(view)
        }
        isProcessing = false
      })
    }

    return [
      new Plugin({
        key: pluginKey,
        props: {
          handlePaste(view) {
            handlePossibleBreak(view)
            return false
          },
          handleDrop(view) {
            handlePossibleBreak(view)
            return false
          }
        },
        view(view) {
          const onResize = () => handlePossibleBreak(view)
          window.addEventListener('resize', onResize)

          return {
            update(view) {
              const now = Date.now()
              const timeSinceLast = now - lastActionTime

              if (timeSinceLast > options.longPauseMs) {
                handlePossibleBreak(view)
              } else {
                handlePossibleBreak(view)
              }
              lastActionTime = now
            },
            destroy() {
              window.removeEventListener('resize', onResize)
            }
          }
        }
      })
    ]
  }
})
