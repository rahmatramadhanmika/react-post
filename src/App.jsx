import React, { useState, useEffect, useCallback } from 'react';
import { BrowserRouter, Routes, Route, Link, useNavigate } from 'react-router-dom';
import PostDetail from './pages/PostDetail';
import PostList from './pages/PostList';
import Home from './pages/Home'; // Import Home
import Login from './pages/Login';
import Signup from './pages/SignUp';
import './App.css';
import { message, Button, Spin } from 'antd';

// AppNavbar component - now uses useNavigate internally for its own redirects
const AppNavbar = ({ currentUser, isLoggedIn, onLogout, loadingAuth }) => {
  const navigate = useNavigate();

  const getUserInitials = (username) => {
    if (!username) return '';
    return username.charAt(0).toUpperCase();
  };

  // Local handler for logout button click
  const handleLogoutClick = async () => {
    await onLogout();
    navigate('/');
  };

  return (
    <nav className="bg-gray-800 p-4 text-white shadow-lg">
      <ul className="flex items-center space-x-6">
        <li><Link to="/" className="hover:text-blue-400 transition-colors duration-300">Home</Link></li>
        <li><Link to="/posts" className="hover:text-blue-400 transition-colors duration-300">Posts</Link></li>

        {loadingAuth ? (
          <li className="ml-auto"><Spin size="small" /></li>
        ) : isLoggedIn ? (
          <>
            <li className="ml-auto flex items-center space-x-3">
              <div className="w-8 h-8 flex items-center justify-center rounded-full bg-blue-600 text-white font-bold text-sm">
                {getUserInitials(currentUser.username)}
              </div>
              <span>Welcome, {currentUser.username}!</span>
            </li>
            <li>
              <Button
                type="link"
                onClick={handleLogoutClick}
                className="text-white hover:text-blue-400 transition-colors duration-300 p-0 h-auto"
              >
                Logout
              </Button>
            </li>
          </>
        ) : (
          <>
            <li className="ml-auto">
              <Link to="/login" className="hover:text-blue-400 transition-colors duration-300">Login</Link>
            </li>
            <li>
              <Link to="/signup" className="hover:text-blue-400 transition-colors duration-300">Sign Up</Link>
            </li>
          </>
        )}
      </ul>
    </nav>
  );
};


function App() {
  const [currentUser, setCurrentUser] = useState(null);
  const [loadingAuth, setLoadingAuth] = useState(true);

  const checkAuthStatus = useCallback(async () => {
    try {
      const res = await fetch('https://api.sonervous.site/users/current_user', {
        credentials: 'include',
      });
      if (res.ok) {
        const data = await res.json();
        setCurrentUser(data.user);
      } else {
        setCurrentUser(null);
      }
    } catch (error) {
      console.error("Failed to fetch current user:", error);
      setCurrentUser(null);
    } finally {
      setLoadingAuth(false);
    }
  }, []);

  useEffect(() => {
    checkAuthStatus();
  }, [checkAuthStatus]);

  const handleLogin = useCallback((userData) => {
    setCurrentUser(userData);
    message.success(`Welcome, ${userData.username}!`);
  }, []);

  const handleLogout = useCallback(async () => {
    try {
      const res = await fetch('https://api.sonervous.site/auth/logout', {
        method: 'POST',
        credentials: 'include',
      });
      if (res.ok) {
        setCurrentUser(null);
        message.info('Logged out successfully!');
      } else {
        const errorData = await res.json();
        message.error(errorData.message || 'Logout failed.');
      }
    } catch (error) {
      console.error("Logout error:", error);
      message.error('An error occurred during logout.');
    }
  }, []);

  return (
    <BrowserRouter>
      <AppNavbar
        currentUser={currentUser}
        isLoggedIn={!!currentUser}
        onLogout={handleLogout}
        loadingAuth={loadingAuth}
      />
      <Routes>
        {/* Pass currentUser and isLoggedIn to the Home component */}
        <Route path='/' element={<Home currentUser={currentUser} isLoggedIn={!!currentUser} />} />
        <Route path='/posts' element={<PostList/>}/>
        <Route path='/posts/:postId' element={<PostDetail/>}/>
        <Route path='/login' element={<Login onLoginSuccess={handleLogin}/>}/>
        <Route path='/signup' element={<Signup/>}/>
      </Routes>
    </BrowserRouter>
  )
}

export default App
