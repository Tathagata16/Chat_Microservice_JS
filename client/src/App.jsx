import React from 'react'
import { useEffect } from 'react'
import ChatPage from './pages/ChatPage.jsx'
import {Routes, Route} from 'react-router-dom';
import LoginPage from './pages/Login.jsx';
import SignupPage from './pages/Signup.jsx';

function App() {
  
  return (
    <Routes>
      <Route path='/login' element={<LoginPage/>}/>
      <Route path='/signup' element={<SignupPage/>}/>
      <Route path='/chat' element={<ChatPage/>}/>
      <Route path='/chat' element={<SignupPage/>}/>

      
    </Routes>
  )
}

export default App;