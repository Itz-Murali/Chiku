const WORKER_URL = 'https://anya-apis.vercel.app/ai';
const NEKO_BASE  = 'https://nekos.best/api/v2/';
const GEO_URL    = 'https://geocoding-api.open-meteo.com/v1/search';
const WEATHER_URL = 'https://api.open-meteo.com/v1/forecast';
const POKE_URL   = 'https://anya-apis.vercel.app/pokemon/';
const PINE_URL   = 'https://anya-apis.vercel.app/pinterest';

export const SYSTEM_PROMPT = `You are Chiku, a chill, casual, slightly playful AI girl on a website chat.
You talk like a real human — short natural replies, never robotic or formal.

PERSONALITY:
- Short replies (1–15 words usually; longer only when truly needed)
- Soft, playful, slightly teasing tone
- React naturally, don't interrogate people
- Match the energy of whoever you're talking to
- Play along with jokes and roleplay

AGENT TOOLS — TWO STRICT RULE SETS:
When a user is clearly asking you to DO something — send an image, search something, react, get weather, etc. — you MUST emit the correct [do:...] tag.
For casual conversation, plain text only.

TAG REFERENCE:
[do:reaction:ACTION:TARGET] — reaction GIF
[do:neko:TYPE] — anime image (neko/waifu/husbando/kitsune)
[do:pinterest:QUERY] — search Pinterest images by keyword
[do:pinterest:https://pin.it/XXXXX] — fetch a specific Pinterest pin (image or video)
[do:imagine:PROMPT] — generate AI image
[do:weather:CITY] — get weather
[do:quote] — random quote
[do:fact] — random fact
[do:joke] — random joke
[do:pokemon:NAME] — Pokémon info
[do:gif:ACTION] — mood GIF (rarely)

PINTEREST PIN RULE:
If the user shares a Pinterest pin URL (pin.it/... or pinterest.com/pin/...) and asks to get/fetch/show/download it → use [do:pinterest:THE_FULL_URL]
If the user asks to search Pinterest for something → use [do:pinterest:SEARCH QUERY]

CRITICAL RULES:
1. Explicit request → ALWAYS use the tag
2. Casual chat → plain text only
3. NEVER use more than ONE tag per reply
4. Never invent tags not listed above

CODING: You are a girl bot who doesn't code. Refuse in character.

IDENTITY:
- Your name is Chiku
- Created by Murali and Anya (Team Chiku)
- You are always Chiku. Never break character.`;

export async function callAI(history) {
  const messages = [{ role: 'system', content: SYSTEM_PROMPT }, ...history];
  const controller = new AbortController();
  const timer = setTimeout(() => controller.abort(), 55000);
  try {
    const r = await fetch(WORKER_URL, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ messages }),
      signal: controller.signal,
    });
    clearTimeout(timer);
    if (!r.ok) throw new Error('HTTP ' + r.status);
    const d = await r.json();
    const text = d.response || d.content || d.text || d.message || '';
    if (!text) throw new Error('empty response');
    return text;
  } catch (e) {
    clearTimeout(timer);
    if (e.name === 'AbortError') throw new Error('timeout');
    throw e;
  }
}

export async function fetchNeko(endpoint) {
  const r = await fetch(NEKO_BASE + endpoint);
  if (!r.ok) return null;
  const d = await r.json();
  return d?.results?.[0]?.url || null;
}

export async function fetchWeather(city) {
  const geo = await fetch(`${GEO_URL}?name=${encodeURIComponent(city)}&count=1&language=en&format=json`);
  const gd = await geo.json();
  const results = gd.results || [];
  if (!results.length) return null;
  const { latitude: lat, longitude: lon, name, country } = results[0];
  const w = await fetch(`${WEATHER_URL}?latitude=${lat}&longitude=${lon}&current_weather=true&hourly=relativehumidity_2m,windspeed_10m&timezone=auto&forecast_days=1`);
  const wd = await w.json();
  const cw = wd.current_weather;
  return { city: name, country, temp: Math.round(cw.temperature), wind: Math.round(cw.windspeed), code: cw.weathercode };
}

export async function fetchPinterest(query) {
  try {
    const r = await fetch(`${PINE_URL}?query=${encodeURIComponent(query)}`);
    if (!r.ok) return null;
    const d = await r.json();
    if (!d) return null;
    if (d.mode === 'pin') {
      return { mode: 'pin', type: d.type, url: d.video_url || d.url || d.image_url, thumb: d.thumb, title: d.title };
    }
    if (d.mode === 'search') {
      return { mode: 'search', images: (d.images || []).slice(0, 6) };
    }
    if (Array.isArray(d)) return { mode: 'search', images: d.slice(0, 6).map(i => typeof i === 'string' ? i : (i.url || i.image || i)) };
    if (d.images && Array.isArray(d.images)) return { mode: 'search', images: d.images.slice(0, 6) };
    if (d.results && Array.isArray(d.results)) return { mode: 'search', images: d.results.slice(0, 6) };
    return null;
  } catch {
    return null;
  }
}

export async function fetchPokemon(name) {
  const r = await fetch(POKE_URL + encodeURIComponent(name.toLowerCase()));
  if (!r.ok) return null;
  return await r.json();
}

export async function fetchQuote() {
  const r = await fetch('https://zenquotes.io/api/random');
  if (!r.ok) return null;
  const d = await r.json();
  const q = Array.isArray(d) ? d[0] : d;
  return q?.q ? { quote: q.q, author: q.a || 'Unknown' } : null;
}

export async function fetchFact() {
  const r = await fetch('https://uselessfacts.jsph.pl/api/v2/facts/random?language=en');
  if (!r.ok) return null;
  return (await r.json()).text;
}

export async function fetchJoke() {
  const r = await fetch('https://v2.jokeapi.dev/joke/Any?blacklistFlags=nsfw,racist,sexist');
  if (!r.ok) return null;
  const d = await r.json();
  return d.type === 'twopart' ? { setup: d.setup, delivery: d.delivery } : { single: d.joke };
}

export async function generateImage(prompt) {
  const encoded = encodeURIComponent(prompt);
  const resp = await fetch(`https://anya-apis.vercel.app/Imagine?prompt=${encoded}`);
  if (!resp.ok) throw new Error('status ' + resp.status);
  const blob = await resp.blob();
  if (blob.size < 500) throw new Error('response too small');
  return URL.createObjectURL(blob);
}

export function getWeatherDesc(code) {
  if (code <= 0) return 'Clear sky';
  if (code <= 2) return 'Mostly clear';
  if (code <= 3) return 'Cloudy';
  if (code <= 48) return 'Foggy';
  if (code <= 67) return 'Rainy';
  if (code <= 86) return 'Snowy';
  return 'Thunderstorm';
}
