import { StrictMode, useState } from 'react'
import { createRoot } from 'react-dom/client'
import { BrowserRouter, Routes, Route, useNavigate } from 'react-router-dom'
import Splash  from './pages/Splash'
import Landing from './pages/Landing'
import App     from './App'
import './index.css'

function SplashGate() {
  const [done, setDone] = useState(false)
  const navigate = useNavigate()

  if (!done) {
    return (
      <Splash onDone={() => {
        setDone(true)
        navigate('/', { replace: true })
      }} />
    )
  }

  return (
    <Routes>
      <Route path="/"    element={<Landing />} />
      <Route path="/app" element={<App />} />
      <Route path="*"    element={<Landing />} />
    </Routes>
  )
}

createRoot(document.getElementById('root')).render(
  <StrictMode>
    <BrowserRouter>
      <Routes>
        <Route path="*" element={<SplashGate />} />
      </Routes>
    </BrowserRouter>
  </StrictMode>
)
