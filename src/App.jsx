import { useState } from 'react'

import './App.css'
import { HashRouter, Route, Routes } from 'react-router'
import Home from './components/Home.jsx'
import AboutMe from './components/AboutMe.jsx'
function App() {
  return <HashRouter>
    <Routes>  
      <Route path='/' element={<Home />}> </Route>
      <Route path='/about' element={<AboutMe />}></Route>
    </Routes>
  </HashRouter>
}

export default App
