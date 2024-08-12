import './App.css'
import { BrowserRouter as Router, Route, Routes } from 'react-router-dom'

import Landing from './pages/Landing.jsx'
import Header from './pages/Header.jsx'

function App() {
  return (
    <div>
      <Router>
        <Routes>
          <Route path='/' 
          element={
            <>
            <Header/>
            <Landing/>
            </>
          }
          />
        </Routes>
      </Router>
    </div>
  )
}

export default App
