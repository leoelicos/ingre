/* self-hosted fonts (#176): no third-party font request at runtime */
import '@fontsource/poppins/400.css'
import '@fontsource-variable/open-sans/wdth.css'
import { createRoot } from 'react-dom/client'
import { Ingre } from './App'
import './index.css'
import { applyAppearance, readAppearance } from './utils/preferences/appearance'

/* the saved theme and text size, before the first paint */
applyAppearance(readAppearance())

const container = document.getElementById('root')
if (container === null) {
  throw new Error('Root element #root was not found')
}

createRoot(container).render(<Ingre />)
