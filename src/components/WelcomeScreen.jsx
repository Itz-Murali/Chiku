import React from 'react';
import { BOT_IMG } from '../utils/helpers.js';

const welcomeChips = [
  { label: 'Say hi', text: 'hi chiku!', icon: <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor"><path d="M23 7l-7 5 7 5V7z"/><rect x="1" y="5" width="15" height="14" rx="2" ry="2"/></svg> },
  { label: 'Pinterest', text: 'search pinterest sakura anime', icon: <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor"><path d="M20.84 4.61a5.5 5.5 0 0 0-7.78 0L12 5.67l-1.06-1.06a5.5 5.5 0 0 0-7.78 7.78l1.06 1.06L12 21.23l7.78-7.78 1.06-1.06a5.5 5.5 0 0 0 0-7.78z"/></svg> },
  { label: 'Generate', text: 'generate a dragon flying over neon city', icon: <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor"><path d="M12 2L15.09 8.26H22L17.55 12.74L19.64 19.26L12 14.78L4.36 19.26L6.45 12.74L2 8.26H8.91L12 2Z"/></svg> },
  { label: 'Pokémon', text: 'pokemon info on eevee', icon: <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor"><circle cx="12" cy="12" r="1"/><path d="M12 1v6m0 6v6M4.22 4.22l4.24 4.24m2.12 2.12l4.24 4.24M1 12h6m6 0h6M4.22 19.78l4.24-4.24m2.12-2.12l-4.24-4.24M19.78 4.22l-4.24 4.24"/></svg> },
  { label: 'Weather', text: 'weather in london', icon: <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor"><path d="M12 2a7 7 0 0 1 7 7c0 4-7 13-7 13S5 13 5 9a7 7 0 0 1 7-7z"/><circle cx="12" cy="9" r="2.5"/></svg> },
  { label: 'About', text: 'who made you?', icon: <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor"><path d="M20.84 4.61a5.5 5.5 0 0 0-7.78 0L12 5.67l-1.06-1.06a5.5 5.5 0 0 0-7.78 7.78l1.06 1.06L12 21.23l7.78-7.78 1.06-1.06a5.5 5.5 0 0 0 0-7.78z"/></svg> },
];

export default function WelcomeScreen({ onSendSuggestion }) {
  return (
    <div className="welcome">
      <img className="welcome-avatar" src={BOT_IMG} alt="Chiku" />
      <div className="welcome-eyebrow">Your chill AI companion</div>
      <h2><em>Hey I'm Chiku~</em></h2>
      <div className="welcome-line" />
      <p>Ask me anything naturally — I'll search Pinterest, generate images, fetch weather, Pokémon data and more.</p>
      <div className="welcome-chips">
        {welcomeChips.map((chip) => (
          <div key={chip.label} className="welcome-chip" onClick={() => onSendSuggestion(chip.text)}>
            {chip.icon}
            {chip.label}
          </div>
        ))}
      </div>
    </div>
  );
}
