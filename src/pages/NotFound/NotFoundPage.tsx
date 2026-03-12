import React from 'react';
import { Link } from 'react-router-dom';
import './NotFoundPage.css';

const NotFoundPage = () => {
  return (
    <div className="not-found-page">
      <div className="not-found-card">
        <div className="not-found-code">404</div>
        <h1>Страница не найдена</h1>
        <p>Такого адреса нет или страница была перемещена.</p>
        <div className="not-found-actions">
          <Link to={localStorage.getItem('token') ? '/main' : '/login'} className="not-found-button">
            На главную
          </Link>
        </div>
      </div>
    </div>
  );
};

export default NotFoundPage;
