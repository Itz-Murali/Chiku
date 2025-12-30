import { X, Heart, Star, Github, ExternalLink, Sparkles, Code, Palette, Zap } from "lucide-react";
import { useState } from "react";

interface AboutModalProps {
  isOpen: boolean;
  onClose: () => void;
  nekoImage?: string;
}

const AboutModal = ({ isOpen, onClose, nekoImage }: AboutModalProps) => {
  const [isFlipped, setIsFlipped] = useState(false);

  if (!isOpen) return null;

  const handleFlip = () => {
    setIsFlipped(!isFlipped);
  };

  return (
    <div 
      className="fixed inset-0 z-[100] flex items-center justify-center p-3 sm:p-4 animate-overlay-fade-in"
      onClick={onClose}
      style={{ perspective: "1500px" }}
    >
      {/* Backdrop with blur */}
      <div className="absolute inset-0 backdrop-blur-md bg-background/40" />
      
      {/* Flip Card Container */}
      <div 
        className="relative w-full max-w-[340px] sm:max-w-md animate-overlay-scale-in cursor-pointer"
        onClick={(e) => e.stopPropagation()}
        style={{
          transformStyle: "preserve-3d",
          transition: "transform 0.8s cubic-bezier(0.4, 0, 0.2, 1)",
          transform: isFlipped ? "rotateY(180deg)" : "rotateY(0deg)",
        }}
      >
        {/* ===== FRONT SIDE ===== */}
        <div 
          className="relative rounded-3xl border border-border/30 shadow-2xl overflow-hidden"
          style={{
            backfaceVisibility: "hidden",
            background: "linear-gradient(145deg, hsl(var(--background)) 0%, hsl(var(--muted) / 0.3) 100%)",
          }}
        >
          {/* Animated border glow */}
          <div className="absolute -inset-[1px] rounded-3xl bg-gradient-to-r from-primary via-accent to-primary opacity-50 blur-sm animate-border-flow" />
          
          {/* Inner content wrapper */}
          <div className="relative rounded-3xl bg-background/95 m-[1px] overflow-hidden">
            {/* Content container */}
            <div className="relative z-10 p-5 sm:p-8">
              {/* Close button */}
              <button
                onClick={onClose}
                className="absolute top-4 right-4 p-2.5 rounded-full bg-muted/40 hover:bg-muted/70 transition-all duration-300 hover:rotate-90 group shadow-lg z-20"
              >
                <X className="w-4 h-4 text-muted-foreground group-hover:text-foreground transition-colors" />
              </button>

              {/* Content */}
              <div className="text-center space-y-6" onClick={handleFlip}>
                {/* Header with Neko image */}
                <div className="space-y-4">
                  <div className="relative inline-block">
                    {/* Glowing ring effect */}
                    <div className="absolute -inset-3 bg-gradient-to-r from-primary/40 via-accent/40 to-primary/40 rounded-3xl blur-xl animate-pulse" />
                    <div className="absolute -inset-1 bg-gradient-to-r from-primary to-accent rounded-2xl animate-border-flow opacity-60" />
                    <div className="relative w-24 h-24 rounded-2xl overflow-hidden ring-2 ring-background shadow-xl">
                      <img 
                        src={nekoImage || "/main.jpg"} 
                        alt="Chiku" 
                        className="w-full h-full object-cover"
                      />
                    </div>
                    {/* Sparkle decoration */}
                    <Sparkles className="absolute -top-3 -right-3 w-6 h-6 text-accent animate-pulse drop-shadow-lg" />
                  </div>
                  
                  <div>
                    <h2 className="text-4xl sm:text-5xl font-script font-bold gradient-text tracking-wide drop-shadow-sm">Chiku AI</h2>
                    <p className="text-sm text-muted-foreground font-body mt-1 tracking-wider">Your Kawaii Companion</p>
                  </div>
                  
                  <div className="flex items-center justify-center gap-2">
                    <span className="px-3 py-1.5 rounded-full bg-gradient-to-r from-primary/20 to-primary/10 text-primary text-xs font-body font-medium border border-primary/20 shadow-md">
                      <span className="flex items-center gap-1.5">
                        <Heart className="w-3 h-3" />
                        AI Assistant
                      </span>
                    </span>
                    <span className="px-3 py-1.5 rounded-full bg-gradient-to-r from-accent/20 to-accent/10 text-accent text-xs font-body font-medium border border-accent/20 shadow-md">
                      <span className="flex items-center gap-1.5">
                        <Star className="w-3 h-3" />
                        v2.0
                      </span>
                    </span>
                  </div>
                </div>

                {/* Features cards */}
                <div className="grid grid-cols-2 gap-3 text-left font-body">
                  <div className="rounded-2xl p-4 border border-primary/10 hover:border-primary/30 transition-all duration-300 bg-gradient-to-br from-background to-muted/20 shadow-lg">
                    <div className="flex items-center gap-2 mb-2">
                      <div className="p-1.5 rounded-lg bg-primary/15 shadow-inner">
                        <Heart className="w-4 h-4 text-primary" />
                      </div>
                      <h3 className="font-semibold text-foreground text-sm">Friendly</h3>
                    </div>
                    <p className="text-xs text-muted-foreground leading-relaxed">
                      Cheerful conversations to brighten your day
                    </p>
                  </div>
                  <div className="rounded-2xl p-4 border border-accent/10 hover:border-accent/30 transition-all duration-300 bg-gradient-to-br from-background to-muted/20 shadow-lg">
                    <div className="flex items-center gap-2 mb-2">
                      <div className="p-1.5 rounded-lg bg-accent/15 shadow-inner">
                        <Star className="w-4 h-4 text-accent" />
                      </div>
                      <h3 className="font-semibold text-foreground text-sm">Smart</h3>
                    </div>
                    <p className="text-xs text-muted-foreground leading-relaxed">
                      Powered by advanced AI technology
                    </p>
                  </div>
                </div>

                {/* Source code button */}
                <a
                  href="https://github.com/Itz-Murali/Chiku"
                  target="_blank"
                  rel="noopener noreferrer"
                  onClick={(e) => e.stopPropagation()}
                  className="inline-flex items-center gap-2 px-6 py-3 rounded-xl bg-gradient-to-r from-primary/20 via-accent/20 to-primary/20 hover:from-primary/30 hover:via-accent/30 hover:to-primary/30 border border-primary/30 hover:border-primary/50 text-foreground font-medium transition-all duration-300 hover:scale-105 shadow-xl hover:shadow-2xl hover:shadow-primary/20"
                >
                  <Github className="w-5 h-5" />
                  <span>View Source Code</span>
                  <ExternalLink className="w-4 h-4 opacity-70" />
                </a>

                {/* Click me hint */}
                <div className="pt-2 animate-pulse">
                  <p className="text-xs text-muted-foreground/70 font-body tracking-wider">
                    ✨ Click anywhere to see credits ✨
                  </p>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* ===== BACK SIDE (Credits) ===== */}
        <div 
          className="absolute inset-0 rounded-3xl border border-border/30 shadow-2xl overflow-hidden"
          style={{
            backfaceVisibility: "hidden",
            transform: "rotateY(180deg)",
            background: "linear-gradient(145deg, hsl(var(--background)) 0%, hsl(var(--muted) / 0.3) 100%)",
          }}
          onClick={handleFlip}
        >
          {/* Animated border glow */}
          <div className="absolute -inset-[1px] rounded-3xl bg-gradient-to-r from-accent via-primary to-accent opacity-50 blur-sm animate-border-flow" />
          
          {/* Inner content wrapper */}
          <div className="relative rounded-3xl bg-background/95 m-[1px] h-full overflow-hidden">
            {/* Content container */}
            <div className="relative z-10 p-5 sm:p-8 h-full flex flex-col">
              {/* Close button */}
              <button
                onClick={(e) => {
                  e.stopPropagation();
                  onClose();
                }}
                className="absolute top-4 right-4 p-2.5 rounded-full bg-muted/40 hover:bg-muted/70 transition-all duration-300 hover:rotate-90 group shadow-lg z-20"
              >
                <X className="w-4 h-4 text-muted-foreground group-hover:text-foreground transition-colors" />
              </button>

              {/* Credits Header */}
              <div className="text-center space-y-4 mb-6">
                <div className="relative inline-block">
                  <div className="absolute -inset-3 bg-gradient-to-r from-accent/40 via-primary/40 to-accent/40 rounded-3xl blur-xl animate-pulse" />
                  <h2 className="text-3xl sm:text-4xl font-script font-bold gradient-text tracking-wide relative z-10">Credits</h2>
                </div>
                <p className="text-sm text-muted-foreground font-body tracking-wider">The amazing people behind Chiku</p>
              </div>

              {/* Credits cards - same style as feature cards */}
              <div className="flex-1 flex flex-col gap-3">
                {/* Murali - Main Dev */}
                <a
                  href="https://github.com/Itz-Murali"
                  target="_blank"
                  rel="noopener noreferrer"
                  onClick={(e) => e.stopPropagation()}
                  className="rounded-2xl p-4 border border-primary/10 hover:border-primary/30 transition-all duration-300 bg-gradient-to-br from-background to-muted/20 shadow-lg hover:scale-[1.02] group"
                >
                  <div className="flex items-center gap-3">
                    <div className="p-2.5 rounded-xl bg-primary/15 shadow-inner group-hover:bg-primary/25 transition-colors">
                      <Code className="w-5 h-5 text-primary" />
                    </div>
                    <div className="flex-1">
                      <h3 className="font-semibold text-foreground flex items-center gap-2">
                        Murali
                        <ExternalLink className="w-3 h-3 text-primary opacity-0 group-hover:opacity-100 transition-opacity" />
                      </h3>
                      <p className="text-xs text-muted-foreground">Main Developer</p>
                    </div>
                    <Heart className="w-4 h-4 text-primary/50" />
                  </div>
                </a>

                {/* Nekos.best - API */}
                <a
                  href="https://nekos.best"
                  target="_blank"
                  rel="noopener noreferrer"
                  onClick={(e) => e.stopPropagation()}
                  className="rounded-2xl p-4 border border-accent/10 hover:border-accent/30 transition-all duration-300 bg-gradient-to-br from-background to-muted/20 shadow-lg hover:scale-[1.02] group"
                >
                  <div className="flex items-center gap-3">
                    <div className="p-2.5 rounded-xl bg-accent/15 shadow-inner group-hover:bg-accent/25 transition-colors">
                      <Palette className="w-5 h-5 text-accent" />
                    </div>
                    <div className="flex-1">
                      <h3 className="font-semibold text-foreground flex items-center gap-2">
                        Nekos.best
                        <ExternalLink className="w-3 h-3 text-accent opacity-0 group-hover:opacity-100 transition-opacity" />
                      </h3>
                      <p className="text-xs text-muted-foreground">Nekos API Provider</p>
                    </div>
                    <Star className="w-4 h-4 text-accent/50" />
                  </div>
                </a>

                {/* Ashlynn - APIs */}
                <div className="rounded-2xl p-4 border border-border/30 hover:border-border/50 transition-all duration-300 bg-gradient-to-br from-background to-muted/20 shadow-lg hover:scale-[1.02] group">
                  <div className="flex items-center gap-3">
                    <div className="p-2.5 rounded-xl bg-muted/30 shadow-inner group-hover:bg-muted/50 transition-colors">
                      <Zap className="w-5 h-5 text-foreground/70" />
                    </div>
                    <div className="flex-1">
                      <h3 className="font-semibold text-foreground">Ashlynn</h3>
                      <p className="text-xs text-muted-foreground">Additional APIs</p>
                    </div>
                    <Sparkles className="w-4 h-4 text-muted-foreground/50" />
                  </div>
                </div>
              </div>

              {/* Footer */}
              <div className="text-center pt-4 animate-pulse">
                <p className="text-xs text-muted-foreground/70 font-body tracking-wider">
                  ✨ Click to go back ✨
                </p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default AboutModal;