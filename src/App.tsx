import { HashRouter, Routes, Route } from 'react-router-dom'
import Home from './pages/Home'
import Console from './pages/Console'
import Skills from './pages/Skills'

function App() {
  return (
    <HashRouter>
      <Routes>
        <Route path="/" element={<Home />} />
        <Route path="/console" element={<Console />} />
        <Route path="/skills" element={<Skills />} />
      </Routes>
    </HashRouter>
  )
}

export default App
