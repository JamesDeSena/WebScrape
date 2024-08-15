import { BrowserRouter as Router, Route, Routes } from 'react-router-dom'

import Landing from './pages/Landing.jsx'
import Header from './pages/Header.jsx'

import ABSCBN from './pages/tabs/abs-cbn.jsx'
import BWorld from './pages/tabs/business-world.jsx'
import GMA from './pages/tabs/gma.jsx'
import Inquirer from './pages/tabs/inquirer.jsx'
import MBulletin from './pages/tabs/manila-bulletin.jsx'
import MTimes from './pages/tabs/manila-times.jsx'
import PHStar from './pages/tabs/ph-star.jsx'
import Rappler from './pages/tabs/rappler.jsx'
import TV5 from './pages/tabs/tv-5.jsx'

import Article from './pages/articles/sample.jsx'

function App() {
  return (
    <div>
      <Router>
        <Routes>
          <Route path='/'
            element={
              <>
                <Header />
                <Landing />
              </>
            }
          />
          <Route path='/abs-cbn'
            element={
              <>
                <Header />
                <ABSCBN />
              </>
            }
          />
          <Route path='/business-world'
            element={
              <>
                <Header />
                <BWorld />
              </>
            }
          />
             <Route path='/gma'
            element={
              <>
                <Header />
                <GMA />
              </>
            }
          />
          <Route path='/inquirer'
            element={
              <>
                <Header />
                <Inquirer />
              </>
            }
          />
          <Route path='/manila-bulletin'
            element={
              <>
                <Header />
                <MBulletin />
              </>
            }
          />
          <Route path='/manila-times'
            element={
              <>
                <Header />
                <MTimes />
              </>
            }
          />
          <Route path='/phil-star'
            element={
              <>
                <Header />
                <PHStar/>
              </>
            }
          />
          <Route path='/rappler'
            element={
              <>
                <Header />
                <Rappler />
              </>
            }
          />
          <Route path='/TV-5'
            element={
              <>
                <Header />
                <TV5/>
              </>
            }
          />
          <Route path='/article'
            element={
              <>
                <Header />
                <Article/>
              </>
            }
          />
        </Routes>
      </Router>
    </div>
  )
}

export default App
