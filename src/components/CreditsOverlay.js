import React from 'react';
import { X, Palette, Code2, Github, Send, Sparkles, Heart, Star } from 'lucide-react';
import { BOT_IMG } from '../utils/helpers.js';

const CREATORS = [
  {
    name: "Anya",
    role: "Designer & Developer",
    tag: "Frontend",
    Icon: Palette,
    accent: "linear-gradient(135deg, oklch(0.75 0.18 320), oklch(0.7 0.2 350))",
    accentSolid: "oklch(0.75 0.18 320)",
    img: "https://random-images-anya.vercel.app/anya",
    github: "https://github.com/itz-Anya",
    githubLabel: "itz-Anya",
    telegram: "https://t.me/SylveonLab",
    telegramLabel: "SylveonLab",
    quote: "Crafts the calm.",
    skills: ["UI Design", "React", "CSS"],
  },
  {
    name: "Murali",
    role: "API Owner & Pro Coder",
    tag: "Backend",
    Icon: Code2,
    accent: "linear-gradient(135deg, oklch(0.7 0.18 50), oklch(0.65 0.2 25))",
    accentSolid: "oklch(0.7 0.18 50)",
    img: "https://itz-murali-images.vercel.app/api",
    github: "https://github.com/Itz-Murali",
    githubLabel: "Itz-Murali",
    telegram: "https://t.me/ChikuBots",
    telegramLabel: "ChikuBots",
    quote: "Powers the engine.",
    skills: ["Node.js", "APIs", "Bot Dev"],
  },
];

function CreatorCard({ creator }) {
  const { name, role, tag, Icon, accent, accentSolid, img, github, githubLabel, telegram, telegramLabel, quote, skills } = creator;
  return (
    <div className="cred-creator-card">
      <div className="cred-creator-bar" style={{ background: accent }} />
      <div className="cred-creator-inner">
        <div className="cred-creator-head">
          <div className="cred-av-ring" style={{ '--ac': accentSolid }}>
            <img className="cred-creator-av" src={img} alt={name} loading="lazy" />
          </div>
          <div className="cred-creator-meta">
            <div className="cred-creator-name">{name}</div>
            <div className="cred-creator-role">{role}</div>
            <div className="cred-creator-chip" style={{ background: accentSolid + '22', borderColor: accentSolid + '55' }}>
              <Icon size={9} strokeWidth={2.5} style={{ color: accentSolid }} />
              <span style={{ color: accentSolid }}>{tag}</span>
            </div>
          </div>
        </div>
        <div className="cred-creator-quote">
          <span className="cred-quote-mark">"</span>{quote}<span className="cred-quote-mark">"</span>
        </div>
        <div className="cred-skills">
          {skills.map(s => (
            <span key={s} className="cred-skill">{s}</span>
          ))}
        </div>
        <div className="cred-creator-links">
          <a href={github} target="_blank" rel="noopener noreferrer" className="cred-link cred-link--gh">
            <Github size={12} strokeWidth={2} />
            {githubLabel}
          </a>
          <a href={telegram} target="_blank" rel="noopener noreferrer" className="cred-link cred-link--tg">
            <Send size={12} strokeWidth={2} />
            {telegramLabel}
          </a>
        </div>
      </div>
    </div>
  );
}

export default function CreditsOverlay({ show, onClose }) {
  return (
    <div className={`credits-overlay${show ? ' show' : ''}`} onClick={e => e.target === e.currentTarget && onClose()}>
      <div className="credits-card">
        <button className="credits-close" onClick={onClose}>
          <X size={16} strokeWidth={2.5} />
        </button>
        <div className="cred-hero">
          
            <img className="credits-image" src={BOT_IMG} alt="Chiku" />
          
          <h2 className="credits-title">Chiku <em>AI</em></h2>
          <p className="credits-subtitle">Your Chill AI Companion</p>
          <div className="cred-badges">
            <span className="cred-badge"><Sparkles size={10} strokeWidth={2} /> AI Powered</span>
            <span className="cred-badge"><Heart size={10} strokeWidth={2} /> Made with love</span>
            <span className="cred-badge"><Star size={10} strokeWidth={2} /> Free Forever</span>
          </div>
        </div>
        <div className="credits-divider" />
        <p className="credits-text">
          A playful AI companion who searches Pinterest, generates art, fetches weather,
          finds Pokémon, tells jokes & quotes — all through natural conversation.
        </p>
        <div className="credits-creators">
          {CREATORS.map(c => <CreatorCard key={c.name} creator={c} />)}
        </div>
        <p className="credits-footer">
          Built with passion by <strong>Team Chiku</strong>
        </p>
      </div>
    </div>
  );
}
