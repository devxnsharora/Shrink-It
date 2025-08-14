// client/src/pages/HomePage.jsx
import React from 'react';
import { useSelector } from 'react-redux';
import { Link } from 'react-router-dom';

function HomePage() {
  // Check if the user is already logged in
  const { isAuthenticated } = useSelector((state) => state.auth);

  return (
    <div className="homepage-content">
      <header className="homepage-header">
        {/* The h1 is already in the main Header, so we use a larger h2 here */}
        <h2>The Ultimate Link Shortener</h2>
        <p>Create clean, memorable links. Track every click. All in one place.</p>
      </header>

      <div className="cta-section">
        {isAuthenticated ? (
          // If the user is logged in, guide them to their dashboard
          <>
            <p className="cta-text">You're ready to go!</p>
            <Link to="/dashboard" className="cta-button">
              Go to My Dashboard
            </Link>
          </>
        ) : (
          // If the user is a guest, guide them to sign up
          <>
            <p className="cta-text">Join for free and unlock powerful features.</p>
            <Link to="/register" className="cta-button">
              Get Started Now
            </Link>
          </>
        )}
      </div>

      <div className="features-grid">
        <div className="feature-card">
          <h3>Secure Accounts</h3>
          <p>All your links are saved permanently and privately to your account.</p>
        </div>
        <div className="feature-card">
          <h3>Deep Analytics</h3>
          <p>Understand your audience with detailed click-tracking and reports.</p>
        </div>
        <div className="feature-card">
          <h3>Total Control</h3>
          <p>Set custom aliases, passwords, and expiration dates for your links.</p>
        </div>
      </div>
    </div>
  );
}

export default HomePage;