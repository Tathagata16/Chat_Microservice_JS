import React from 'react'
import ChatPage from './pages/ChatPage.jsx'
import { Navigate, Route, Routes } from 'react-router-dom';
import LoginPage from './pages/Login.jsx';
import SignupPage from './pages/Signup.jsx';

const getInitialRoute = () => {
  const hasSession = Boolean(localStorage.getItem('userInfo'));
  return hasSession ? '/chat' : '/login';
};

function App() {

  return (
    <Routes>
      <Route path='/' element={<Navigate to={getInitialRoute()} replace />} />
      <Route path='/login' element={<LoginPage />} />
      <Route path='/signup' element={<SignupPage />} />
      <Route path='/chat' element={<ChatPage />} />
      <Route path='*' element={<Navigate to={getInitialRoute()} replace />} />


    </Routes>
  )
}

export default App;