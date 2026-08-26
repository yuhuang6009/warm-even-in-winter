import { HashRouter, Routes, Route } from 'react-router-dom'
import Home from './pages/Home'
import Console from './pages/Console'

function App() {
  return (
    <HashRouter>
      <Routes>
        <Route path="/" element={<Home />} />
        <Route path="/console" element={<Console />} />
      </Routes>
    </HashRouter>
  )
}

export default App
