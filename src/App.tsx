import React from 'react';
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import CoursesPage from './pages/CoursesPage';
import CoursePage from './pages/CoursePage';
import AuthPage from './pages/AuthPage';
import { getAuthToken } from './api/client';
import './App.css';

function App() {
  return (
    <BrowserRouter>
      <div className="App">
        <Routes>
          <Route path="/auth" element={<AuthPage />} />
          <Route path="/" element={<Navigate to="/courses" replace />} />
          <Route 
            path="/courses" 
            element={getAuthToken() ? <CoursesPage /> : <Navigate to="/auth" replace />} 
          />
          <Route 
            path="/courses/:courseId" 
            element={getAuthToken() ? <CoursePage /> : <Navigate to="/auth" replace />} 
          />
        </Routes>
      </div>
    </BrowserRouter>
  );
}

export default App;
