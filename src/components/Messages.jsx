import React from 'react';
import { BOT_IMG } from '../utils/helpers.js';

export function UserBubble({ text, time }) {
  return (
    <div className="msg-row user">
      <div className="bubble">
        {text}
        <time>{time}</time>
      </div>
    </div>
  );
}

export function BotBubble({ html, time, showAv = true }) {
  return (
    <div className="msg-row bot">
      <div className={`bot-mini-av${showAv ? '' : ' hidden'}`}>
        <img src={BOT_IMG} alt="" />
      </div>
      <div
        className="bubble"
        dangerouslySetInnerHTML={{ __html: html + `<time>${time}</time>` }}
      />
    </div>
  );
}

export function MediaRow({ html }) {
  return (
    <div
      className="msg-row bot"
      dangerouslySetInnerHTML={{
        __html: `<div class="bot-mini-av hidden"><img src="${BOT_IMG}" alt=""/></div>${html}`,
      }}
    />
  );
}

export function TypingIndicator() {
  return (
    <div className="typing-row">
      <div className="bot-mini-av">
        <img src={BOT_IMG} alt="" />
      </div>
      <div className="typing-bubble">
        <div className="dot" />
        <div className="dot" />
        <div className="dot" />
      </div>
    </div>
  );
}
