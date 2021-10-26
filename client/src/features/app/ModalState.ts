import { Location } from 'history'

export default interface ModalState {
  background: Location<unknown>
  metadata: Record<string, any>
}
