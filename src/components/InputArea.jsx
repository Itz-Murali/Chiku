import React, { useRef, useEffect } from 'react';

export default function InputArea({ onSend, onCreditsOpen, disabled }) {
  const textareaRef = useRef(null);

  useEffect(() => {
    if (!disabled && textareaRef.current) {
      textareaRef.current.focus();
    }
  }, [disabled]);

  function handleInput(e) {
    const ta = e.target;
    ta.style.height = 'auto';
    ta.style.height = Math.min(ta.scrollHeight, 120) + 'px';
  }

  function handleKeyDown(e) {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSend();
    }
  }

  function handleSend() {
    const val = textareaRef.current?.value.trim();
    if (!val || disabled) return;
    onSend(val);
    textareaRef.current.value = '';
    textareaRef.current.style.height = 'auto';
  }

  return (
    <div className="input-area">
      <div className="input-row">
        <textarea
          ref={textareaRef}
          rows={1}
          placeholder="talk to chiku~"
          maxLength={1000}
          onInput={handleInput}
          onKeyDown={handleKeyDown}
          disabled={disabled}
        />
        <button className="send-btn" onClick={handleSend} disabled={disabled}>
          <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor">
            <line x1="22" y1="2" x2="11" y2="13" />
            <polygon points="22 2 15 22 11 13 2 9 22 2" />
          </svg>
        </button>
      </div>
      <div className="input-hint">
        Made with love by{' '}
        <button
          type="button"
          className="credits-link-btn"
          onClick={onCreditsOpen}
        >
          Murali &amp; Anya
        </button>
      </div>
    </div>
  );
}
