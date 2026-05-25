import React from 'react';

export default function ThemeToast({ message }) {
  return (
    <div className={`theme-toast${message ? ' show' : ''}`}>
      {message}
    </div>
  );
}
