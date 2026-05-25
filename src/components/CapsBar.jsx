import React from 'react';
import { Zap, Image, Sparkles, MapPin, MessageCircle, Quote, Cat, Star, Users, Heart } from 'lucide-react';

const chips = [
  { label: 'Pokémon',   text: 'search pokemon pikachu',                              Icon: Zap },
  { label: 'Pinterest', text: 'search pinterest anime wallpaper',                    Icon: Image },
  { label: 'AI Art',    text: 'generate an AI image of cherry blossoms at night',    Icon: Sparkles },
  { label: 'Weather',   text: 'weather in tokyo',                                    Icon: MapPin },
  { label: 'Joke',      text: 'tell me a joke',                                      Icon: MessageCircle },
  { label: 'Quote',     text: 'give me a quote',                                     Icon: Quote },
  { label: 'Neko',      text: 'send me a neko image',                                Icon: Cat },
  { label: 'Fact',      text: 'tell me a random fact',                               Icon: Star },
  { label: 'Reactions', text: 'hug me',                                              Icon: Users },
  { label: 'Waifu',     text: 'send waifu image',                                    Icon: Heart },
];

export default function CapsBar({ onSendSuggestion }) {
  return (
    <div className="caps-bar">
      {chips.map(({ label, text, Icon }) => (
        <div key={label} className="cap-chip" onClick={() => onSendSuggestion(text)}>
          <Icon size={14} strokeWidth={2} />
          {label}
        </div>
      ))}
    </div>
  );
}
