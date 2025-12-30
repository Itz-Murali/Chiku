import { useState, useEffect } from "react";

interface TypingTitleProps {
  text: string;
  className?: string;
  speed?: number;
}

const Sparkle = ({ delay, style }: { delay: number; style: React.CSSProperties }) => (
  <span
    className="absolute animate-sparkle pointer-events-none"
    style={{
      ...style,
      animationDelay: `${delay}ms`,
    }}
  >
    ✦
  </span>
);

const TypingTitle = ({ text, className = "", speed = 100 }: TypingTitleProps) => {
  const [displayedText, setDisplayedText] = useState("");
  const [isComplete, setIsComplete] = useState(false);
  const [showSparkles, setShowSparkles] = useState(false);

  useEffect(() => {
    let currentIndex = 0;
    setDisplayedText("");
    setIsComplete(false);
    setShowSparkles(false);

    const typingInterval = setInterval(() => {
      if (currentIndex < text.length) {
        setDisplayedText(text.slice(0, currentIndex + 1));
        currentIndex++;
      } else {
        clearInterval(typingInterval);
        setIsComplete(true);
        setShowSparkles(true);
        // Hide sparkles after animation
        setTimeout(() => setShowSparkles(false), 2000);
      }
    }, speed);

    return () => clearInterval(typingInterval);
  }, [text, speed]);

  const sparklePositions = [
    { top: '-8px', left: '-8px' },
    { top: '-10px', right: '20%' },
    { top: '-6px', right: '-6px' },
    { bottom: '-8px', left: '15%' },
    { bottom: '-6px', right: '10%' },
    { top: '50%', left: '-12px' },
    { top: '50%', right: '-10px' },
  ];

  return (
    <span className={`relative inline-block ${className}`}>
      <span className="gradient-text">{displayedText}</span>
      {!isComplete && (
        <span className="animate-pulse ml-0.5 inline-block w-[2px] h-[1em] bg-primary align-middle" />
      )}
      {showSparkles && sparklePositions.map((pos, i) => (
        <Sparkle key={i} delay={i * 100} style={pos} />
      ))}
    </span>
  );
};

export default TypingTitle;
