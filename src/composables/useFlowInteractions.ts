import { useVueFlow } from '@vue-flow/core'
import { useQuasar } from 'quasar'
import { useLandscapeStore } from '@/stores/landscape'
import { L3_SIZE } from '@/composables/useLayout'

/**
 * Wires Vue Flow drag interactions to the store:
 *  - L2 gates drag horizontally only (y locked to the top band).
 *  - L3 milestones snap to the nearest lane and clamp to their parent gate (x ≤ gate.x).
 *  - Moving a gate pulls back any children that would end up right of it.
 * Must be called from the component that renders <VueFlow> (shares its instance).
 */
export function useFlowInteractions() {
  const store = useLandscapeStore()
  const $q = useQuasar()
  const { onNodeDrag, onNodeDragStop } = useVueFlow()

  onNodeDrag(({ node }) => {
    // Keep gates pinned to the top while dragging (horizontal-only).
    if (node.type === 'l2') node.position.y = 0
  })

  onNodeDragStop(({ node }) => {
    if (node.type === 'l2') {
      const affected = store.moveL2(node.data.id, node.position.x)
      if (affected > 0) {
        $q.notify({
          message: `${affected} milestone(s) pulled back to stay at/before this gate.`,
          color: 'warning',
          icon: 'warning',
          position: 'top',
          timeout: 2500,
        })
      }
    } else if (node.type === 'l3') {
      const centerX = node.position.x + L3_SIZE / 2
      const centerY = node.position.y + L3_SIZE / 2
      const { clamped } = store.moveMilestone(node.data.id, centerX, centerY)
      if (clamped) {
        $q.notify({
          message: 'A milestone can’t sit right of its gate (pulled-forward limit).',
          color: 'warning',
          icon: 'block',
          position: 'top',
          timeout: 2500,
        })
      }
    }
  })
}
