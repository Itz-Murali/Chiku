import React, { useState, useRef, useEffect } from 'react';
import { Palette } from 'lucide-react';

export const COLOR_THEMES = [
  { id: 'gold',   label: 'Gold',   dark: ['#c8a97e','#a07850','#d4bb95'], light: ['#9a6830','#7a5020','#b88840'] },
  { id: 'rose',   label: 'Rose',   dark: ['#e07090','#b85070','#f090a8'], light: ['#b03060','#8a2040','#d06080'] },
  { id: 'violet', label: 'Violet', dark: ['#9a80d4','#7060a8','#b8a8e8'], light: ['#6040b0','#4820a0','#8060d0'] },
  { id: 'teal',   label: 'Teal',   dark: ['#50b8b0','#309090','#80d0c8'], light: ['#1a8080','#0a6060','#30a0a0'] },
  { id: 'sky',    label: 'Sky',    dark: ['#60a8e0','#4080c0','#88c4f0'], light: ['#1a70c0','#0a50a8','#3090d8'] },
  { id: 'green',  label: 'Green',  dark: ['#70b870','#489048','#98d098'], light: ['#2a7830','#1a5a20','#4a9850'] },
];

export function applyColorTheme(colorId, isDark) {
  const ct = COLOR_THEMES.find(c => c.id === colorId) || COLOR_THEMES[0];
  const [g, g2, g3] = isDark ? ct.dark : ct.light;
  const root = document.documentElement;
  root.style.setProperty('--gold',  g);
  root.style.setProperty('--gold2', g2);
  root.style.setProperty('--gold3', g3);
  localStorage.setItem('chiku-color', colorId);
}

export function initColorTheme(isDark) {
  const saved = localStorage.getItem('chiku-color') || 'gold';
  applyColorTheme(saved, isDark);
  return saved;
}

export default function ColorPicker({ isDark, currentColor, onChange }) {
  const [open, setOpen] = useState(false);
  const ref = useRef(null);

  useEffect(() => {
    function handleClick(e) {
      if (ref.current && !ref.current.contains(e.target)) setOpen(false);
    }
    document.addEventListener('mousedown', handleClick);
    document.addEventListener('touchstart', handleClick);
    return () => {
      document.removeEventListener('mousedown', handleClick);
      document.removeEventListener('touchstart', handleClick);
    };
  }, []);

  function pick(colorId) {
    onChange(colorId);
    applyColorTheme(colorId, isDark);
    setOpen(false);
  }

  return (
    <div className="color-picker-wrap" ref={ref}>
      <button
        className={`header-btn header-btn--palette${open ? ' active' : ''}`}
        onClick={() => setOpen(o => !o)}
        title="Change accent color"
      >
        <Palette size={18} strokeWidth={2} />
      </button>
      {open && (
        <div className="color-picker-popup">
          <div className="color-picker-label">Accent Color</div>
          <div className="color-swatches">
            {COLOR_THEMES.map(ct => {
              const swatch = isDark ? ct.dark[0] : ct.light[0];
              return (
                <button
                  key={ct.id}
                  className={`color-swatch${currentColor === ct.id ? ' selected' : ''}`}
                  style={{ background: swatch }}
                  title={ct.label}
                  onClick={() => pick(ct.id)}
                />
              );
            })}
          </div>
        </div>
      )}
    </div>
  );
}
