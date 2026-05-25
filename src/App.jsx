import React, { useState, useRef, useEffect, useCallback } from 'react';
import Header from './components/Header.jsx';
import CapsBar from './components/CapsBar.jsx';
import WelcomeScreen from './components/WelcomeScreen.jsx';
import { UserBubble, BotBubble, MediaRow, TypingIndicator } from './components/Messages.jsx';
import InputArea from './components/InputArea.jsx';
import Lightbox from './components/Lightbox.jsx';
import CreditsOverlay from './components/CreditsOverlay.jsx';
import ThemeToast from './components/ThemeToast.jsx';
import {
  callAI, fetchNeko, fetchWeather, fetchPinterest,
  fetchPokemon, fetchQuote, fetchFact, fetchJoke,
  generateImage, getWeatherDesc,
} from './utils/api.js';
import { now, formatText, escHtml, initTheme, applyTheme } from './utils/helpers.js';
import { initColorTheme, applyColorTheme } from './components/ColorPicker.jsx';

let msgIdCounter = 0;
function mkId() { return ++msgIdCounter; }

export default function App() {
  const [messages, setMessages]         = useState([]);
  const [welcomeGone, setWelcomeGone]   = useState(false);
  const [isTyping, setIsTyping]         = useState(false);
  const [statusText, setStatusText]     = useState('here for you~ ✨');
  const [lightboxSrc, setLightboxSrc]   = useState(null);
  const [creditsOpen, setCreditsOpen]   = useState(false);
  const [theme, setTheme]               = useState(() => initTheme().mode);
  const [colorTheme, setColorTheme]     = useState(() => {
    const { mode } = initTheme();
    return initColorTheme(mode === 'dark');
  });
  const [toast, setToast]               = useState('');

  const historyRef   = useRef([]);
  const chatWrapRef  = useRef(null);
  const toastTimer   = useRef(null);

  const scrollBottom = useCallback((smooth = true) => {
    requestAnimationFrame(() => {
      if (chatWrapRef.current) {
        chatWrapRef.current.scrollTo({ top: chatWrapRef.current.scrollHeight, behavior: smooth ? 'smooth' : 'auto' });
      }
    });
  }, []);

  useEffect(() => { scrollBottom(); }, [messages, isTyping, scrollBottom]);

  function addUserMsg(text) {
    setMessages(prev => [...prev, { id: mkId(), type: 'user', text, time: now() }]);
  }

  function addBotMsg(html, showAv = true) {
    const id = mkId();
    setMessages(prev => [...prev, { id, type: 'bot', html, showAv, time: now() }]);
    return id;
  }

  function addMediaMsg(html) {
    setMessages(prev => [...prev, { id: mkId(), type: 'media', html }]);
  }

  useEffect(() => {
    window.__chikuOpenLightbox = (src) => setLightboxSrc(src);
    return () => { delete window.__chikuOpenLightbox; };
  }, []);

  function toggleTheme() {
    const next = theme === 'dark' ? 'light' : 'dark';
    const currentThemeId = document.documentElement.getAttribute('data-color-theme') || 'golden';
    setTheme(next);
    applyTheme(next, currentThemeId);
    applyColorTheme(colorTheme, next === 'dark');
    showToast(next === 'dark' ? 'Dark mode' : 'Light mode');
  }

  function showToast(msg) {
    setToast(msg);
    clearTimeout(toastTimer.current);
    toastTimer.current = setTimeout(() => setToast(''), 1800);
  }

  function clearChat() {
    if (!window.confirm('Clear chat?')) return;
    setMessages([]);
    setWelcomeGone(false);
    historyRef.current = [];
  }

  async function handleAction(tag, textBefore) {
    const args   = tag.split(':');
    const action = args[0]?.toLowerCase();
    if (textBefore?.trim()) addBotMsg(formatText(textBefore.trim()));

    switch (action) {
      case 'reaction':
      case 'gif': {
        const gifAction = args[1]?.toLowerCase();
        if (!gifAction) break;
        const url = await fetchNeko(gifAction).catch(() => null);
        if (url) addMediaMsg(`<div class="gif-bubble"><img src="${url}" alt="${gifAction} gif" onclick="window.__chikuOpenLightbox('${url}')"></div>`);
        break;
      }
      case 'neko': {
        const types  = ['neko', 'waifu', 'husbando', 'kitsune'];
        const type   = types.includes(args[1]) ? args[1] : types[Math.floor(Math.random() * types.length)];
        const url    = await fetchNeko(type).catch(() => null);
        if (url) addMediaMsg(`<div class="gif-bubble"><img src="${url}" alt="${type}" onclick="window.__chikuOpenLightbox('${url}')"></div>`);
        else addBotMsg("couldn't fetch that rn");
        break;
      }
      case 'pinterest': {
        const query = args.slice(1).join(':').trim();
        try {
          const data = await fetchPinterest(query);
          if (!data) {
            addBotMsg(`couldn't find results for <em>${escHtml(query)}</em>`);
            break;
          }
          if (data.mode === 'pin') {
            if (data.type === 'video' && data.url) {
              addMediaMsg(`<div class="gif-bubble">
                <video src="${data.url}" controls playsinline style="max-width:100%;border-radius:12px;"></video>
                ${data.title ? `<div style="font-size:11px;opacity:0.6;text-align:center;margin-top:6px;">${escHtml(data.title)}</div>` : ''}
              </div>`);
            } else if (data.url) {
              addMediaMsg(`<div class="gif-bubble"><img src="${data.url}" alt="${escHtml(data.title || 'Pinterest pin')}" onclick="window.__chikuOpenLightbox('${data.url}')" loading="lazy"></div>`);
            } else {
              addBotMsg(`couldn't fetch that pin rn`);
            }
            break;
          }
          const imgs = data.images || [];
          if (imgs.length) {
            let g = `<div class="pinterest-grid">`;
            imgs.forEach(src => { g += `<img src="${src}" alt="" onclick="window.__chikuOpenLightbox('${src}')" loading="lazy">`; });
            g += `</div>`;
            addMediaMsg(g);
          } else {
            addBotMsg(`couldn't find results for <em>${escHtml(query)}</em>`);
          }
        } catch {
          addBotMsg("pinterest search failed rn");
        }
        break;
      }
      case 'imagine': {
        const prompt = args.slice(1).join(':').trim();
        const genId = addBotMsg(`🎨 generating <em>${escHtml(prompt)}</em>… hang tight~ ✨`);
        try {
          const imgUrl = await generateImage(prompt);
          setMessages(prev => prev.filter(m => m.id !== genId));
          addMediaMsg(`<div class="gif-bubble"><img src="${imgUrl}" alt="ai art: ${escHtml(prompt)}" onclick="window.__chikuOpenLightbox('${imgUrl}')" loading="lazy"></div>`);
        } catch {
          try {
            const fallbackUrl = `https://image.pollinations.ai/prompt/${encodeURIComponent(prompt)}?width=512&height=512&nologo=true&seed=${Date.now()}`;
            await new Promise((res, rej) => {
              const probe = new Image();
              probe.onload  = res;
              probe.onerror = () => rej(new Error('pollinations load error'));
              probe.src     = fallbackUrl;
              setTimeout(() => rej(new Error('pollinations timeout')), 30000);
            });
            setMessages(prev => prev.filter(m => m.id !== genId));
            addMediaMsg(`<div class="gif-bubble"><img src="${fallbackUrl}" alt="ai art: ${escHtml(prompt)}" onclick="window.__chikuOpenLightbox('${fallbackUrl}')" loading="lazy"></div>`);
          } catch {
            setMessages(prev => prev.filter(m => m.id !== genId));
            addBotMsg("couldn't generate that image rn 😔 both APIs seem down~");
          }
        }
        break;
      }
      case 'weather': {
        const city = args.slice(1).join(':').trim();
        try {
          const data = await fetchWeather(city);
          if (data) {
            const desc = getWeatherDesc(data.code);
            addMediaMsg(`<div class="weather-card">
              <div class="wc-city">📍 ${escHtml(data.city)}${data.country ? ', ' + data.country : ''}</div>
              <div class="wc-temp">${data.temp}°C</div>
              <div class="wc-desc">${desc}</div>
              <div class="wc-row"><div class="wc-item"><strong>${data.wind} km/h</strong>Wind</div></div>
            </div>`);
          } else {
            addBotMsg(`couldn't find weather for <em>${escHtml(city)}</em>`);
          }
        } catch {
          addBotMsg("weather fetch failed");
        }
        break;
      }
      case 'quote': {
        try {
          const q = await fetchQuote();
          if (q) addMediaMsg(`<div class="quote-card"><div class="qc-text">${escHtml(q.quote)}</div><div class="qc-author">— ${escHtml(q.author)}</div></div>`);
          else addBotMsg("couldn't fetch a quote rn");
        } catch { addBotMsg("quote failed"); }
        break;
      }
      case 'fact': {
        try {
          const f = await fetchFact();
          if (f) addMediaMsg(`<div class="fact-card"><div class="fc-label">Random Fact</div>${escHtml(f)}</div>`);
          else addBotMsg("couldn't fetch a fact rn");
        } catch { addBotMsg("fact failed"); }
        break;
      }
      case 'joke': {
        try {
          const j = await fetchJoke();
          if (j) {
            if (j.single) {
              addMediaMsg(`<div class="fact-card"><div class="fc-label">Joke</div>${escHtml(j.single)}</div>`);
            } else {
              addBotMsg(formatText(j.setup));
              await new Promise(r => setTimeout(r, 1200));
              addBotMsg(`...${formatText(j.delivery)}`);
            }
          } else {
            addBotMsg("couldn't fetch a joke rn");
          }
        } catch { addBotMsg("joke failed"); }
        break;
      }
      case 'pokemon': {
        const name = args.slice(1).join(':').trim();
        try {
          const pk = await fetchPokemon(name);
          if (pk) {
            const sprite = pk.sprite || pk.image || `https://img.pokemondb.net/sprites/home/normal/${name.toLowerCase()}.png`;
            const types  = (pk.types || []).map(t => `<span class="pk-type type-${t.toLowerCase()}">${t}</span>`).join('');
            const stats  = pk.stats || { hp: 50, attack: 50, defense: 50, speed: 50 };
            const statHtml = Object.entries(stats).slice(0, 5).map(([k, v]) => `
              <div class="pk-stat">
                <span class="pk-stat-name">${k}</span>
                <div class="pk-stat-bar-wrap"><div class="pk-stat-bar" style="width:${Math.min(v / 255 * 100, 100)}%"></div></div>
                <span class="pk-stat-val">${v}</span>
              </div>`).join('');
            addMediaMsg(`<div class="pokemon-card">
              <div class="pk-header">
                <img src="${sprite}" alt="${escHtml(name)}">
                <div>
                  <div class="pk-name">${escHtml(pk.name || name)}</div>
                  <div class="pk-id">#${pk.id || '???'}</div>
                  <div class="pk-types">${types}</div>
                </div>
              </div>
              <div class="pk-stats">${statHtml}</div>
            </div>`);
          } else {
            addBotMsg(`no pokémon found for <em>${escHtml(name)}</em>`);
          }
        } catch { addBotMsg("pokémon fetch failed"); }
        break;
      }
      case 'sticker':
        addBotMsg('');
        break;
      default:
        break;
    }
  }

  async function sendMessage(text) {
    if (isTyping || !text) return;
    if (!welcomeGone) setWelcomeGone(true);

    addUserMsg(text);
    setIsTyping(true);
    setStatusText('typing...');

    historyRef.current.push({ role: 'user', content: text });
    if (historyRef.current.length > 40) historyRef.current = historyRef.current.slice(-40);

    try {
      const response = await callAI(historyRef.current);
      const tagMatch  = response.match(/\[do:([^\]]+)\]/i);
      const textPart  = response.replace(/\s*\[do:[^\]]+\]\s*/gi, ' ').trim();
      const cleanText = textPart.replace(/\s{2,}/g, ' ').trim();

      historyRef.current.push({ role: 'assistant', content: cleanText || response });
      if (historyRef.current.length > 40) historyRef.current = historyRef.current.slice(-40);

      if (tagMatch) {
        await handleAction(tagMatch[1], cleanText);
      } else if (cleanText) {
        addBotMsg(formatText(cleanText));
      }
    } catch (e) {
      console.error('Chiku error:', e);
      const msg = e.message === 'timeout'
        ? 'Took too long — try again~'
        : "Couldn't reach Chiku right now — try again~";
      addBotMsg(`<div class="err-bubble">${msg}</div>`, true);
      if (historyRef.current.length && historyRef.current[historyRef.current.length - 1].role === 'user') {
        historyRef.current.pop();
      }
    }

    setIsTyping(false);
    setStatusText('here for you~ ✨');
  }

  function sendSuggestion(text) {
    sendMessage(text);
  }

  function handleInfo() {
    sendSuggestion('who made you and what can you do?');
  }

  return (
    <>
      <Header
        statusText={statusText}
        onAvatarClick={() => setCreditsOpen(true)}
        onToggleTheme={toggleTheme}
        onClearChat={clearChat}
        onInfo={handleInfo}
        theme={theme}
        colorTheme={colorTheme}
        onColorChange={setColorTheme}
      />
      <CapsBar onSendSuggestion={sendSuggestion} />

      <div className="chat-wrap" ref={chatWrapRef}>
        {!welcomeGone && <WelcomeScreen onSendSuggestion={sendSuggestion} />}
        {welcomeGone && (
          <div className="date-divider"><span>Today</span></div>
        )}
        {messages.map(msg => {
          if (msg.type === 'user') return <UserBubble key={msg.id} text={msg.text} time={msg.time} />;
          if (msg.type === 'bot')  return <BotBubble  key={msg.id} html={msg.html} showAv={msg.showAv} time={msg.time} />;
          if (msg.type === 'media') return <MediaRow  key={msg.id} html={msg.html} />;
          return null;
        })}
        {isTyping && <TypingIndicator />}
      </div>

      <InputArea onSend={sendMessage} onCreditsOpen={() => setCreditsOpen(true)} disabled={isTyping} />

      <Lightbox src={lightboxSrc} onClose={() => setLightboxSrc(null)} />
      <CreditsOverlay show={creditsOpen} onClose={() => setCreditsOpen(false)} />
      <ThemeToast message={toast} />
    </>
  );
}
