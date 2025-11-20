import { useState } from 'react'

import './App.css'
import { HashRouter, Route, Routes } from 'react-router'
import Home from './components/Home.jsx'
import AboutMe from './components/AboutMe.jsx'
import NavBar from './components/NavBar.jsx'
import Destinations from './components/Destinations.jsx'
import DestinationDetails from "./components/DestinationDetails.jsx";

function App() {
  return <HashRouter>
    <NavBar />  
    <Routes>  
      <Route path='/' element={<Home />}> </Route>
      <Route path='/about' element={<AboutMe />}></Route>
      <Route path='/destinations' element={<Destinations />}></Route>
      <Route path="/destinations/:name" element={<DestinationDetails />} />
    </Routes>
  </HashRouter>
}

export default App
