import React from 'react';
import { getFilename } from '../utils/helpers.js';

export default function Lightbox({ src, onClose }) {
  const show = !!src;

  function handleBackdropClick(e) {
    if (e.target === e.currentTarget) onClose();
  }

  return (
    <div className={`lightbox${show ? ' show' : ''}`} onClick={handleBackdropClick}>
      <a
        className="lb-download"
        href={src || '#'}
        download={src ? getFilename(src) : undefined}
        onClick={(e) => e.stopPropagation()}
        title="Download image"
      >
        <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor">
          <path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4" />
          <polyline points="7 10 12 15 17 10" />
          <line x1="12" y1="15" x2="12" y2="3" />
        </svg>
      </a>
      <button className="lb-close" onClick={onClose}>
        <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor">
          <line x1="18" y1="6" x2="6" y2="18" />
          <line x1="6" y1="6" x2="18" y2="18" />
        </svg>
      </button>
      {src && (
        <img src={src} alt="" onClick={(e) => e.stopPropagation()} />
      )}
    </div>
  );
}
