import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import { MappingPage } from '../mapping'

createRoot(document.getElementById('root')!).render(
  <StrictMode>
    <MappingPage />
  </StrictMode>,
)
