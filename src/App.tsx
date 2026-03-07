import React from 'react';
import CoursesPage from './components/CoursesPage';
import { BrowserRouter } from 'react-router-dom';
import './App.css';
import Router from './router/Router';

const App = () => {
  return (
    <div className="App">
      <CoursesPage />
    </div>
    <BrowserRouter>
      <Router />
    </BrowserRouter>
  );
}

export default App;
