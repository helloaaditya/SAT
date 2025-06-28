import React, { useState, Suspense, useEffect } from 'react'
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom'
import Login from './pages/Login'
import Register from './pages/Register'
import Navbar from './components/Shared/Navbar'
import Footer from './components/Shared/Footer'
import Home from './pages/Home'
import Betting from './pages/Betting'
import Results from './pages/Results'
import Admin from './pages/Admin'
import Terms from './pages/Terms'
import Privacy from './pages/Privacy'
import Contact from './pages/Contact'
import Loader from './components/Shared/Loader'
import './App.css'

function App() {
  const [user, setUser] = useState(() => {
    const saved = localStorage.getItem('user')
    return saved ? JSON.parse(saved) : null
  })
  const [token, setToken] = useState(() => localStorage.getItem('token'))

  // Poll for user balance every 5 seconds
  useEffect(() => {
    if (!token) return;
    const interval = setInterval(() => {
      fetch('/api/auth/user', {
        headers: { Authorization: `Bearer ${token}` }
      })
        .then(res => res.json())
        .then(data => {
          if (data.user && data.user.balance !== user?.balance) {
            setUser(u => ({ ...u, balance: data.user.balance }));
            localStorage.setItem('user', JSON.stringify({ ...user, balance: data.user.balance }));
          }
        });
    }, 5000);
    return () => clearInterval(interval);
  }, [token, user?.balance]);

  const handleLogin = (token, user) => {
    setToken(token)
    setUser(user)
    localStorage.setItem('token', token)
    localStorage.setItem('user', JSON.stringify(user))
  }

  const handleLogout = () => {
    setToken(null)
    setUser(null)
    localStorage.removeItem('token')
    localStorage.removeItem('user')
  }

  return (
    <Router>
      <div className="min-h-screen flex flex-col bg-gray-100">
        <Navbar user={user} onLogout={handleLogout} onLogin={handleLogin} token={token} />
        <main className="flex-1 flex flex-col">
          <Suspense fallback={<Loader />}>
            <Routes>
              <Route path="/" element={<Home user={user} />} />
              <Route path="/login" element={!user ? <Login onLogin={handleLogin} /> : <Navigate to="/" />} />
              <Route path="/register" element={!user ? <Register onLogin={handleLogin} /> : <Navigate to="/" />} />
              <Route path="/bet" element={user ? <Betting user={user} token={token} /> : <Navigate to="/login" />} />
              <Route path="/results" element={user ? <Results user={user} token={token} /> : <Navigate to="/login" />} />
              <Route path="/admin" element={user?.isAdmin ? <Admin user={user} token={token} /> : <Navigate to="/" />} />
              <Route path="/terms" element={<Terms />} />
              <Route path="/privacy" element={<Privacy />} />
              <Route path="/contact" element={<Contact />} />
              <Route path="*" element={<Home />} />
            </Routes>
          </Suspense>
        </main>
        <Footer />
      </div>
    </Router>
  )
}

export default App
