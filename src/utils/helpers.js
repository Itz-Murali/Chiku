import { getRandomThemeId, applyThemeTokens } from '../themes.js';

export const BOT_IMG = 'https://files.catbox.moe/1f6ks8.jpg';

export function now() {
  return new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
}

export function escHtml(t) {
  return String(t)
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;');
}

export function formatText(t) {
  return escHtml(t)
    .replace(/\*\*(.+?)\*\*/g, '<strong>$1</strong>')
    .replace(/\*(.+?)\*/g, '<em>$1</em>')
    .replace(/`(.+?)`/g, '<code style="background:rgba(var(--accent-rgb,200,169,126),0.12);padding:1px 6px;border-radius:3px;font-family:monospace;font-size:0.9em;">$1</code>')
    .replace(/\n/g, '<br>');
}

export function getFilename(src) {
  try {
    const u = new URL(src);
    const last = u.pathname.split('/').pop();
    return last && last.includes('.') ? last : 'chiku-image.jpg';
  } catch {
    return 'chiku-image.jpg';
  }
}

export function initTheme() {
  const savedMode = localStorage.getItem('chiku-mode');
  const prefersDark = window.matchMedia('(prefers-color-scheme: dark)').matches;
  const mode = savedMode || (prefersDark ? 'dark' : 'light');
  const themeId = getRandomThemeId();
  document.documentElement.setAttribute('data-theme', mode);
  document.documentElement.setAttribute('data-color-theme', themeId);
  applyThemeTokens(themeId, mode);
  return { mode, themeId };
}

export function applyTheme(mode, themeId) {
  document.documentElement.setAttribute('data-theme', mode);
  document.documentElement.setAttribute('data-color-theme', themeId);
  applyThemeTokens(themeId, mode);
  localStorage.setItem('chiku-mode', mode);
}
