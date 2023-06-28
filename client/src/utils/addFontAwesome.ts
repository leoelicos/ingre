// Add Font Awesome to library so they can be accessed by children
import { library } from '@fortawesome/fontawesome-svg-core'

import {
  faStar,
  faBars,
  faEgg,
  faCircleInfo,
  faCookie,
  faMagnifyingGlass,
  faCartShopping,
  faSquareCheck,
  faPen,
  faCircleXmark,
  faXmark,
  faAdd,
  faFloppyDisk,
  faTrash,
  faRightToBracket,
  faRightFromBracket,
  faUserPlus,
  faTruckLoading,
  faRotateRight,
  faRotateLeft,
  faEraser,
  faExclamation,
  faCropSimple,
  faDownLeftAndUpRightToCenter,
  faMagnifyingGlassChart,
  faUserGroup,
  faSpinner,
  faBookOpen
} from '@fortawesome/free-solid-svg-icons'

const addFontAwesome = () =>
  library.add(
    faStar,
    faBars,
    faEgg,
    faCircleInfo,
    faCookie,
    faMagnifyingGlass,
    faCartShopping,
    faSquareCheck,
    faPen,
    faCircleXmark,
    faXmark,
    faAdd,
    faFloppyDisk,
    faTrash,

    faRightToBracket,
    faRightFromBracket,
    faUserPlus,
    faTruckLoading,
    faRotateRight,
    faRotateLeft,
    faEraser,
    faExclamation,
    faCropSimple,
    faDownLeftAndUpRightToCenter,
    faMagnifyingGlassChart,
    faUserGroup,
    faSpinner,
    faBookOpen
  )
export default addFontAwesome
