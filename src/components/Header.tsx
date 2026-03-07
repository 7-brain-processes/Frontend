import React from 'react';
import './Header.css';

interface HeaderProps {
  onMenuClick: () => void;
}

const Header: React.FC<HeaderProps> = ({ onMenuClick }) => {
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
        <button className="icon-button" data-testid="add-button" aria-label="Добавить">
          <svg width="24" height="24" viewBox="0 0 24 24" fill="currentColor">
            <path d="M19 13h-6v6h-2v-6H5v-2h6V5h2v6h6v2z"/>
          </svg>
        </button>
        <button className="icon-button profile-button" data-testid="profile-button" aria-label="Профиль">
          <img 
            src="https://via.placeholder.com/32/FF6B35/FFFFFF?text=У" 
            alt="Профиль" 
            className="profile-image"
          />
        </button>
      </div>
    </header>
  );
};

export default Header;
