import React from 'react';
import { Moon, Sun, Trash2, Info } from 'lucide-react';
import { BOT_IMG } from '../utils/helpers.js';
import ColorPicker from './ColorPicker.jsx';

export default function Header({ statusText, onAvatarClick, onToggleTheme, onClearChat, onInfo, theme, colorTheme, onColorChange }) {
  return (
    <header className="header">
      <div className="avatar-wrap" onClick={onAvatarClick} title="About Chiku">
        <img className="avatar" src={BOT_IMG} alt="Chiku" />
        <div className="online-dot" />
      </div>
      <div className="header-info">
        <div className="header-name"><em>Chiku AI</em></div>
        <div className="header-status">
          <span className="status-dot" />
          <span>{statusText}</span>
        </div>
      </div>
      <div className="header-actions">
        <ColorPicker isDark={theme === 'dark'} currentColor={colorTheme} onChange={onColorChange} />
        <button className="header-btn" onClick={onToggleTheme} title="Toggle theme">
          {theme === 'dark' ? <Sun size={18} strokeWidth={2} /> : <Moon size={18} strokeWidth={2} />}
        </button>
        <button className="header-btn header-btn--danger" onClick={onClearChat} title="Clear chat">
          <Trash2 size={18} strokeWidth={2} />
        </button>
        <button className="header-btn header-btn--info" onClick={onInfo} title="About Chiku">
          <Info size={18} strokeWidth={2} />
        </button>
      </div>
    </header>
  );
}
