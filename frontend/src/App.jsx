import { useState } from 'react'
import reactLogo from './assets/react.svg'
import viteLogo from '/vite.svg'
import './App.css'
import { ToastContainer } from 'react-toastify'

function App() {


  return (
    <>
      <div>
        <ToastContainer />
        <Route path='/main' element={
          <>
          <Header/>
          <Main/>
          </>
        }/>
      </div>
    </>
  )
}

export default App
