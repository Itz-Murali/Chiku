import { useState } from "react";
import { Download, Loader2, Sparkles, Cat, Wand2, Heart, Hand, HeartHandshake, Waves, Smile, Flower2, Pointer, Music } from "lucide-react";
import { Skeleton } from "@/components/ui/skeleton";

interface ImageMessageProps {
  imageUrl: string;
  prompt: string;
  imageType?: "generated" | "neko" | "waifu" | "hug" | "pat" | "kiss" | "wave" | "smile" | "blush" | "poke" | "dance";
}

const ImageMessage = ({ imageUrl, prompt, imageType = "generated" }: ImageMessageProps) => {
  const [isLoading, setIsLoading] = useState(true);
  const [isDownloading, setIsDownloading] = useState(false);

  const handleDownload = async (e: React.MouseEvent) => {
    e.stopPropagation();
    setIsDownloading(true);
    try {
      const response = await fetch(imageUrl);
      const blob = await response.blob();
      const url = window.URL.createObjectURL(blob);
      const link = document.createElement("a");
      link.href = url;
      link.download = `chiku-${imageType}-${Date.now()}.png`;
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      window.URL.revokeObjectURL(url);
    } catch (error) {
      console.error("Failed to download image:", error);
    } finally {
      setIsDownloading(false);
    }
  };

  const getTypeConfig = () => {
    const configs = {
      neko: {
        colors: ["#ff6b9d", "#c44eff", "#00d4ff"],
        icon: <Cat className="w-3 h-3" />,
        label: "Neko",
      },
      waifu: {
        colors: ["#8b5cf6", "#ec4899", "#f43f5e"],
        icon: <Sparkles className="w-3 h-3" />,
        label: "Waifu",
      },
      hug: {
        colors: ["#f43f5e", "#fb923c", "#fbbf24"],
        icon: <Heart className="w-3 h-3" />,
        label: "Hug",
      },
      pat: {
        colors: ["#10b981", "#14b8a6", "#06b6d4"],
        icon: <Hand className="w-3 h-3" />,
        label: "Pat",
      },
      kiss: {
        colors: ["#ec4899", "#ef4444", "#f43f5e"],
        icon: <HeartHandshake className="w-3 h-3" />,
        label: "Kiss",
      },
      wave: {
        colors: ["#3b82f6", "#6366f1", "#8b5cf6"],
        icon: <Waves className="w-3 h-3" />,
        label: "Wave",
      },
      smile: {
        colors: ["#fbbf24", "#f59e0b", "#fb923c"],
        icon: <Smile className="w-3 h-3" />,
        label: "Smile",
      },
      blush: {
        colors: ["#f472b6", "#ec4899", "#db2777"],
        icon: <Flower2 className="w-3 h-3" />,
        label: "Blush",
      },
      poke: {
        colors: ["#a855f7", "#7c3aed", "#6366f1"],
        icon: <Pointer className="w-3 h-3" />,
        label: "Poke",
      },
      dance: {
        colors: ["#22c55e", "#10b981", "#14b8a6"],
        icon: <Music className="w-3 h-3" />,
        label: "Dance",
      },
      generated: {
        colors: ["hsl(280, 70%, 60%)", "hsl(320, 65%, 55%)", "hsl(45, 90%, 55%)"],
        icon: <Wand2 className="w-3 h-3" />,
        label: "AI Generated",
      },
    };
    return configs[imageType] || configs.generated;
  };

  const config = getTypeConfig();

  return (
    <div className="relative group max-w-[220px] sm:max-w-xs">
      {/* Animated color-changing border */}
      <div 
        className="absolute -inset-[1px] rounded-xl animate-border-flow"
        style={{
          background: `linear-gradient(90deg, ${config.colors[0]}, ${config.colors[1]}, ${config.colors[2]}, ${config.colors[0]})`,
          backgroundSize: "300% 100%",
        }}
      />
      
      {/* Main container */}
      <div className="relative rounded-xl overflow-hidden bg-card">
        {/* Type badge */}
        <div className="absolute top-2 left-2 z-20">
          <div 
            className="flex items-center gap-1 px-2 py-1 rounded-full text-white text-[10px] font-semibold backdrop-blur-md"
            style={{ 
              background: `linear-gradient(135deg, ${config.colors[0]}, ${config.colors[1]})`,
            }}
          >
            {config.icon}
            <span>{config.label}</span>
          </div>
        </div>

        {/* Image container */}
        <div className="relative p-1">
          {isLoading && (
            <Skeleton className="w-48 sm:w-56 h-64 sm:h-72 rounded-lg" />
          )}
          
          <img
            src={imageUrl}
            alt={prompt}
            className={`w-full h-auto rounded-lg transition-all duration-300 group-hover:scale-[1.01] ${isLoading ? "hidden" : "block"}`}
            onLoad={() => setIsLoading(false)}
          />
          
          {!isLoading && (
            <>
              {/* Bottom gradient */}
              <div className="absolute inset-x-1 bottom-1 h-16 bg-gradient-to-t from-black/60 to-transparent rounded-b-lg" />
              
              {/* Download button - unique pill style */}
              <button
                onClick={handleDownload}
                disabled={isDownloading}
                className="absolute bottom-3 right-3 flex items-center gap-1.5 px-3 py-1.5 rounded-full text-[10px] font-medium text-white transition-all duration-300 hover:scale-105"
                style={{ 
                  background: `linear-gradient(135deg, ${config.colors[0]}dd, ${config.colors[1]}dd)`,
                  boxShadow: `0 2px 12px ${config.colors[0]}50`,
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

              {/* Prompt on hover for generated */}
              {prompt && imageType === "generated" && (
                <div className="absolute bottom-3 left-3 right-20 opacity-0 group-hover:opacity-100 transition-opacity duration-300">
                  <p className="text-[10px] text-white/90 bg-black/50 backdrop-blur-sm rounded-lg px-2 py-1 line-clamp-2">
                    {prompt}
                  </p>
                </div>
              )}
            </>
          )}
        </div>
      </div>
    </div>
  );
};

export default ImageMessage;