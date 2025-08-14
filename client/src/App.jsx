// client/src/App.jsx

import React from 'react';
// Corrected the typo in the import statement below
import { Routes, Route } from 'react-router-dom';

// Page & Component Imports
import HomePage from './pages/HomePage.jsx';
import LoginPage from './pages/LoginPage.jsx';
import RegisterPage from './pages/RegisterPage.jsx';
import DashboardPage from './pages/DashboardPage.jsx';
import ProtectedRoute from './components/ProtectedRoute.jsx';
import Header from './components/Header.jsx';
import LinkAnalyticsPage from './pages/LinkAnalyticsPage.jsx';

// CSS Imports
import './App.css';

function App() {
  return (
    <>
      <Header />
      <main className="main-content-area">
        <Routes>
          {/* Public Routes */}
          <Route path="/" element={<HomePage />} />
          <Route path="/login" element={<LoginPage />} />
          <Route path="/register" element={<RegisterPage />} />

          {/* Protected Route */}
          <Route
            path="/dashboard"
            element={
              <ProtectedRoute>
                <DashboardPage />
              </ProtectedRoute>
            }
          />
            <Route
            path="/dashboard/links/:id"
            element={
              <ProtectedRoute>
                <LinkAnalyticsPage />
              </ProtectedRoute>
            }
          />
        </Routes>
      </main>
    </>
  );
}

export default App;