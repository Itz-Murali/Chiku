import { useState } from "react";
import { Skeleton } from "@/components/ui/skeleton";

interface TypingIndicatorProps {
  nekoImage?: string;
}

const TypingIndicator = ({ nekoImage }: TypingIndicatorProps) => {
  const [avatarLoading, setAvatarLoading] = useState(true);
  
  const avatarSrc = nekoImage || "/main.jpg";

  return (
    <div className="flex gap-3 animate-fade-in">
      {/* Avatar */}
      <div className="flex-shrink-0 w-9 h-9 rounded-xl overflow-hidden ring-2 ring-primary/40">
        {avatarLoading && <Skeleton className="w-full h-full" />}
        <img 
          src={avatarSrc} 
          alt="Chiku"
          className={`w-full h-full object-cover ${avatarLoading ? 'hidden' : ''}`}
          onLoad={() => setAvatarLoading(false)}
        />
      </div>

      {/* Typing Bubble */}
      <div className="px-4 py-3 rounded-2xl rounded-tl-sm glass border border-primary/20">
        <div className="flex gap-1.5">
          <span className="w-2 h-2 rounded-full bg-primary typing-dot" />
          <span className="w-2 h-2 rounded-full bg-primary typing-dot" />
          <span className="w-2 h-2 rounded-full bg-primary typing-dot" />
        </div>
      </div>
    </div>
  );
};

export default TypingIndicator;
