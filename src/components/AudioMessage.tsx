import { useState, useRef, useEffect } from "react";
import { Play, Pause, Download, Loader2, Volume2 } from "lucide-react";

interface AudioMessageProps {
  audioUrl: string;
  text: string;
}

const AudioMessage = ({ audioUrl, text }: AudioMessageProps) => {
  const [isPlaying, setIsPlaying] = useState(false);
  const [isDownloading, setIsDownloading] = useState(false);
  const [currentTime, setCurrentTime] = useState(0);
  const [duration, setDuration] = useState(0);
  const audioRef = useRef<HTMLAudioElement>(null);
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const animationRef = useRef<number>();

  // Generate static waveform bars
  const bars = useRef<number[]>(
    Array.from({ length: 28 }, () => Math.random() * 0.6 + 0.2)
  ).current;

  const colors = ["#a855f7", "#ec4899", "#8b5cf6"];

  const drawWaveform = () => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    const ctx = canvas.getContext("2d");
    if (!ctx) return;

    const width = canvas.width;
    const height = canvas.height;
    const barWidth = width / bars.length;
    const progress = duration > 0 ? currentTime / duration : 0;

    ctx.clearRect(0, 0, width, height);

    bars.forEach((barHeight, i) => {
      const x = i * barWidth;
      const h = barHeight * height * 0.75;
      const y = (height - h) / 2;

      const barProgress = i / bars.length;
      const isPlayed = barProgress <= progress;

      const animatedHeight = isPlaying 
        ? h * (0.85 + Math.sin(Date.now() / 120 + i * 0.4) * 0.15)
        : h;
      const animatedY = (height - animatedHeight) / 2;

      const gradient = ctx.createLinearGradient(0, animatedY, 0, animatedY + animatedHeight);
      if (isPlayed) {
        gradient.addColorStop(0, colors[0]);
        gradient.addColorStop(1, colors[1]);
      } else {
        gradient.addColorStop(0, "rgba(168, 85, 247, 0.25)");
        gradient.addColorStop(1, "rgba(236, 72, 153, 0.25)");
      }

      ctx.fillStyle = gradient;
      ctx.beginPath();
      ctx.roundRect(x + 1.5, animatedY, barWidth - 3, animatedHeight, 2);
      ctx.fill();
    });

    if (isPlaying) {
      animationRef.current = requestAnimationFrame(drawWaveform);
    }
  };

  useEffect(() => {
    drawWaveform();
    return () => {
      if (animationRef.current) {
        cancelAnimationFrame(animationRef.current);
      }
    };
  }, [currentTime, duration, isPlaying]);

  const togglePlay = () => {
    if (audioRef.current) {
      if (isPlaying) {
        audioRef.current.pause();
      } else {
        audioRef.current.play();
      }
      setIsPlaying(!isPlaying);
    }
  };

  const handleTimeUpdate = () => {
    if (audioRef.current) {
      setCurrentTime(audioRef.current.currentTime);
    }
  };

  const handleLoadedMetadata = () => {
    if (audioRef.current) {
      setDuration(audioRef.current.duration);
    }
  };

  const handleEnded = () => {
    setIsPlaying(false);
    setCurrentTime(0);
  };

  const handleCanvasClick = (e: React.MouseEvent<HTMLCanvasElement>) => {
    if (!audioRef.current || duration === 0) return;
    
    const canvas = canvasRef.current;
    if (!canvas) return;

    const rect = canvas.getBoundingClientRect();
    const x = e.clientX - rect.left;
    const progress = x / rect.width;
    audioRef.current.currentTime = progress * duration;
    setCurrentTime(progress * duration);
  };

  const handleDownload = async () => {
    setIsDownloading(true);
    try {
      const response = await fetch(audioUrl);
      const blob = await response.blob();
      const url = window.URL.createObjectURL(blob);
      const link = document.createElement("a");
      link.href = url;
      link.download = `chiku-audio-${Date.now()}.mp3`;
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      window.URL.revokeObjectURL(url);
    } catch (error) {
      console.error("Failed to download audio:", error);
    } finally {
      setIsDownloading(false);
    }
  };

  const formatDuration = (time: number) => {
    if (!isFinite(time) || isNaN(time)) return "0:00";
    const minutes = Math.floor(time / 60);
    const seconds = Math.floor(time % 60);
    return `${minutes}:${seconds.toString().padStart(2, "0")}`;
  };

  return (
    <div className="flex flex-col gap-2">
      <p className="text-sm text-muted-foreground italic">"{text}"</p>
      
      {/* Audio player with animated border */}
      <div className="relative group max-w-xs">
        {/* Animated color-changing border */}
        <div 
          className="absolute -inset-[1px] rounded-xl animate-border-flow opacity-75"
          style={{
            background: `linear-gradient(90deg, ${colors[0]}, ${colors[1]}, ${colors[2]}, ${colors[0]})`,
            backgroundSize: "300% 100%",
          }}
        />
        
        <div className="relative flex items-center gap-3 p-3 rounded-xl bg-card">
          <audio 
            ref={audioRef} 
            src={audioUrl} 
            onEnded={handleEnded}
            onTimeUpdate={handleTimeUpdate}
            onLoadedMetadata={handleLoadedMetadata}
          />
          
          {/* Type badge */}
          <div className="absolute -top-2 left-3 z-10">
            <div 
              className="flex items-center gap-1 px-2 py-0.5 rounded-full text-white text-[9px] font-semibold"
              style={{ 
                background: `linear-gradient(135deg, ${colors[0]}, ${colors[1]})`,
              }}
            >
              <Volume2 className="w-2.5 h-2.5" />
              <span>TTS</span>
            </div>
          </div>
          
          {/* Play/Pause button */}
          <button
            onClick={togglePlay}
            className="p-2.5 rounded-full text-white transition-all duration-300 hover:scale-110 flex-shrink-0"
            style={{ 
              background: `linear-gradient(135deg, ${colors[0]}, ${colors[1]})`,
              boxShadow: `0 2px 12px ${colors[0]}50`,
            }}
          >
            {isPlaying ? (
              <Pause className="w-4 h-4" />
            ) : (
              <Play className="w-4 h-4 ml-0.5" />
            )}
          </button>
          
          {/* Waveform and time */}
          <div className="flex-1 flex flex-col gap-1">
            <canvas
              ref={canvasRef}
              width={140}
              height={28}
              onClick={handleCanvasClick}
              className="cursor-pointer w-full h-7"
            />
            <div className="flex justify-between text-[9px] text-muted-foreground font-medium">
              <span>{formatDuration(currentTime)}</span>
              <span>{formatDuration(duration)}</span>
            </div>
          </div>
          
          {/* Download button - unique pill style matching image */}
          <button
            onClick={handleDownload}
            disabled={isDownloading}
            className="flex items-center gap-1 px-2.5 py-1.5 rounded-full text-[9px] font-medium text-white transition-all duration-300 hover:scale-105 flex-shrink-0"
            style={{ 
              background: `linear-gradient(135deg, ${colors[0]}dd, ${colors[1]}dd)`,
              boxShadow: `0 2px 10px ${colors[0]}40`,
            }}
            title="Download"
          >
            {isDownloading ? (
              <Loader2 className="w-3 h-3 animate-spin" />
            ) : (
              <>
                <Download className="w-3 h-3" />
                <span>Save</span>
              </>
            )}
          </button>
        </div>
      </div>
    </div>
  );
};

export default AudioMessage;