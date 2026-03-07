import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { removeAuthToken } from '../api/client';
import './Header.css';

interface HeaderProps {
  onMenuClick: () => void;
}

const Header: React.FC<HeaderProps> = ({ onMenuClick }) => {
  const navigate = useNavigate();
  const [showProfileMenu, setShowProfileMenu] = useState(false);

  const handleLogout = () => {
    if (window.confirm('Вы уверены, что хотите выйти?')) {
      removeAuthToken();
      navigate('/login');
    }
  };

  return (
    <header className="header" data-testid="header">
      <div className="header-left">
        <button 
          className="menu-button" 
          onClick={onMenuClick}
          data-testid="menu-button"
          aria-label="Меню"
        >
          <svg width="24" height="24" viewBox="0 0 24 24" fill="currentColor">
            <path d="M3 18h18v-2H3v2zm0-5h18v-2H3v2zm0-7v2h18V6H3z"/>
          </svg>
        </button>
        <div className="header-logo">
          <span className="header-title" data-testid="app-title">Classroom</span>
        </div>
      </div>
      <div className="header-right">
        <div className="profile-menu-container">
          <button 
            className="icon-button profile-button" 
            data-testid="profile-button" 
            aria-label="Профиль"
            onClick={() => setShowProfileMenu(!showProfileMenu)}
          >
            <img 
              src="https://via.placeholder.com/32/FF6B35/FFFFFF?text=У" 
              alt="Профиль" 
              className="profile-image"
            />
          </button>
          {showProfileMenu && (
            <>
              <div 
                className="profile-menu-overlay" 
                onClick={() => setShowProfileMenu(false)}
              />
              <div className="profile-menu">
                <button onClick={handleLogout} className="profile-menu-item">
                  <svg width="20" height="20" viewBox="0 0 24 24" fill="currentColor">
                    <path d="M17 7l-1.41 1.41L18.17 11H8v2h10.17l-2.58 2.58L17 17l5-5zM4 5h8V3H4c-1.1 0-2 .9-2 2v14c0 1.1.9 2 2 2h8v-2H4V5z"/>
                  </svg>
                  Выйти
                </button>
              </div>
            </>
          )}
        </div>
      </div>
    </header>
  );
};

export default Header;
