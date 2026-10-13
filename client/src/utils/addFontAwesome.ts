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
  faCircleXmark,
  faXmark,
  faAdd,
  faFloppyDisk,
  faRightToBracket,
  faRightFromBracket,
  faUserPlus,
  faTruckLoading,
  faRotateRight,
  faEraser,
  faCropSimple,
  faDownLeftAndUpRightToCenter,
  faMagnifyingGlassChart,
  faUserGroup,
  faSpinner,
  faBookOpen
} from '@fortawesome/free-solid-svg-icons'

export const addFontAwesome = () =>
  library.add(
    faStar,
    faBars,
    faEgg,
    faCircleInfo,
    faCookie,
    faMagnifyingGlass,
    faCartShopping,
    faSquareCheck,
    faCircleXmark,
    faXmark,
    faAdd,
    faFloppyDisk,

    faRightToBracket,
    faRightFromBracket,
    faUserPlus,
    faTruckLoading,
    faRotateRight,
    faEraser,
    faCropSimple,
    faDownLeftAndUpRightToCenter,
    faMagnifyingGlassChart,
    faUserGroup,
    faSpinner,
    faBookOpen
  )
