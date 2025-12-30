import { Image, Volume2, Cat, Sparkles, Heart, Hand, HeartHandshake, Waves, Smile, Flower2, Pointer, Music } from "lucide-react";

interface Command {
  name: string;
  description: string;
  icon: React.ReactNode;
  isNekosBest?: boolean;
}

const commands: Command[] = [
  {
    name: "/ImageGen",
    description: "Generate an image from your prompt",
    icon: <Image className="w-4 h-4" />,
  },
  {
    name: "/tts",
    description: "Convert text to speech audio",
    icon: <Volume2 className="w-4 h-4" />,
  },
  {
    name: "/neko",
    description: "Get a random cute neko image",
    icon: <Cat className="w-4 h-4" />,
    isNekosBest: true,
  },
  {
    name: "/waifu",
    description: "Get a random waifu image",
    icon: <Sparkles className="w-4 h-4" />,
    isNekosBest: true,
  },
  {
    name: "/hug",
    description: "Get a cute hug reaction GIF",
    icon: <Heart className="w-4 h-4" />,
    isNekosBest: true,
  },
  {
    name: "/pat",
    description: "Get a headpat reaction GIF",
    icon: <Hand className="w-4 h-4" />,
    isNekosBest: true,
  },
  {
    name: "/kiss",
    description: "Get a kiss reaction GIF",
    icon: <HeartHandshake className="w-4 h-4" />,
    isNekosBest: true,
  },
  {
    name: "/wave",
    description: "Get a waving reaction GIF",
    icon: <Waves className="w-4 h-4" />,
    isNekosBest: true,
  },
  {
    name: "/smile",
    description: "Get a happy smiling GIF",
    icon: <Smile className="w-4 h-4" />,
    isNekosBest: true,
  },
  {
    name: "/blush",
    description: "Get a cute blushing GIF",
    icon: <Flower2 className="w-4 h-4" />,
    isNekosBest: true,
  },
  {
    name: "/poke",
    description: "Get a poking reaction GIF",
    icon: <Pointer className="w-4 h-4" />,
    isNekosBest: true,
  },
  {
    name: "/dance",
    description: "Get a dancing anime GIF",
    icon: <Music className="w-4 h-4" />,
    isNekosBest: true,
  },
];

interface CommandPopupProps {
  onSelect: (command: string) => void;
  onInstantSend?: (command: string) => void;
  filter: string;
}

const CommandPopup = ({ onSelect, onInstantSend, filter }: CommandPopupProps) => {
  const filteredCommands = commands.filter((cmd) =>
    cmd.name.toLowerCase().startsWith(filter.toLowerCase())
  );

  const handleSelect = (cmd: Command) => {
    if (cmd.isNekosBest && onInstantSend) {
      onInstantSend(cmd.name);
    } else {
      onSelect(cmd.name);
    }
  };

  if (filteredCommands.length === 0) return null;

  return (
    <div 
      className="absolute bottom-full left-0 right-0 mb-2 glass border border-border/30 rounded-lg sm:rounded-xl overflow-hidden shadow-xl animate-slide-up z-50"
      onWheel={(e) => e.stopPropagation()}
    >
      <div className="max-h-[180px] sm:max-h-[200px] overflow-y-auto overscroll-contain scrollbar-thin scrollbar-thumb-primary/30 scrollbar-track-transparent">
        <div className="p-1.5 sm:p-2 space-y-0.5 sm:space-y-1">
          {filteredCommands.map((cmd) => (
            <button
              key={cmd.name}
              onClick={() => handleSelect(cmd)}
              className="w-full flex items-center gap-2 sm:gap-3 px-2 sm:px-3 py-2 sm:py-2.5 rounded-lg transition-all duration-200 group text-left hover:bg-primary/10"
            >
              <div className="p-1.5 sm:p-2 rounded-lg transition-all bg-primary/10 text-primary group-hover:bg-primary group-hover:text-primary-foreground">
                {cmd.icon}
              </div>
              <div className="flex-1 min-w-0">
                <div className="flex items-center gap-1.5 sm:gap-2">
                  <p className="font-medium text-xs sm:text-sm text-foreground">{cmd.name}</p>
                  {cmd.isNekosBest && (
                    <span className="text-[9px] sm:text-[10px] px-1 sm:px-1.5 py-0.5 rounded-full bg-primary/20 text-primary font-medium">
                      instant
                    </span>
                  )}
                </div>
                <p className="text-[10px] sm:text-xs text-muted-foreground truncate">{cmd.description}</p>
              </div>
            </button>
          ))}
        </div>
      </div>
    </div>
  );
};

export default CommandPopup;