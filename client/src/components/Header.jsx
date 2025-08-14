import React from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useSelector, useDispatch } from 'react-redux';
import { logOut } from '../features/auth/authSlice.js';

function Header() {
  const { isAuthenticated, user } = useSelector((state) => state.auth);
  const dispatch = useDispatch();
  const navigate = useNavigate();

  const handleLogout = () => {
    dispatch(logOut());
    navigate('/');
  };

  return (
    <header className="main-header">
      <div className="header-content">
        <Link to={isAuthenticated ? '/dashboard' : '/'} className="logo">
          Shrink-It
        </Link>
        <nav className="nav-links">
          {isAuthenticated ? (
            <div className="nav-user-actions">
              <span className="nav-user-greeting">Hi, {user?.name || 'User'}!</span>
              <button onClick={handleLogout} className="nav-button logout">Logout</button>
            </div>
          ) : (
            <>
              <Link to="/login" className="nav-link">Login</Link>
              <Link to="/register" className="nav-button primary">Register</Link>
            </>
          )}
        </nav>
      </div>
    </header>
  );
}

export default Header;