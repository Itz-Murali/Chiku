import { useState } from "react";
import { User, Copy, Check, RotateCcw } from "lucide-react";
import ReactMarkdown from "react-markdown";
import ImageMessage from "./ImageMessage";
import AudioMessage from "./AudioMessage";
import ImageOverlay from "./ImageOverlay";
import { Skeleton } from "@/components/ui/skeleton";

interface ChatMessageProps {
  message: string;
  isUser: boolean;
  isNew?: boolean;
  timestamp?: Date;
  nekoImage?: string;
  isNekoLoading?: boolean;
  isError?: boolean;
  onRetry?: () => void;
  generatedImage?: string;
  imagePrompt?: string;
  imageType?: "generated" | "neko" | "waifu" | "hug" | "pat" | "kiss" | "wave" | "smile" | "blush" | "poke" | "dance";
  audioUrl?: string;
  audioText?: string;
  isImageLoading?: boolean;
  isAudioLoading?: boolean;
}

const ChatMessage = ({ 
  message, 
  isUser, 
  isNew = false, 
  timestamp, 
  nekoImage,
  isNekoLoading = false,
  isError = false,
  onRetry,
  generatedImage,
  imagePrompt,
  imageType = "generated",
  audioUrl,
  audioText,
  isImageLoading = false,
  isAudioLoading = false,
}: ChatMessageProps) => {
  const [copied, setCopied] = useState(false);
  const [avatarLoaded, setAvatarLoaded] = useState(false);
  const [showAvatarOverlay, setShowAvatarOverlay] = useState(false);
  
  // Show skeleton if neko is still loading OR if avatar image hasn't loaded yet
  const showSkeleton = isNekoLoading || !avatarLoaded;

  const formatTime = (date?: Date) => {
    if (!date) return "";
    return date.toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" });
  };

  const handleCopy = async () => {
    await navigator.clipboard.writeText(message);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const isLongMessage = message.length > 100;
  
  // Use local avatar - fallback to main.jpg if not provided
  const avatarSrc = nekoImage || "/main.jpg";

  return (
    <>
      <div
        className={`flex gap-3 ${isUser ? "flex-row-reverse" : "flex-row"} ${
          isNew ? "animate-slide-up" : ""
        }`}
      >
        {/* Avatar */}
        <div
          className={`flex-shrink-0 w-8 h-8 sm:w-9 sm:h-9 rounded-lg sm:rounded-xl overflow-hidden ${
            isUser
              ? "bg-accent/10 ring-2 ring-accent/30 flex items-center justify-center"
              : "ring-2 ring-primary/40 cursor-pointer hover:ring-primary/60 transition-all"
          }`}
          onClick={!isUser ? () => setShowAvatarOverlay(true) : undefined}
        >
          {isUser ? (
            <User className="w-3.5 h-3.5 sm:w-4 sm:h-4 text-accent" />
          ) : (
            <>
              {showSkeleton && <Skeleton className="w-full h-full" />}
              {!isNekoLoading && (
                <img 
                  src={avatarSrc} 
                  alt="Chiku"
                  className={`w-full h-full object-cover ${showSkeleton ? 'hidden' : ''}`}
                  onLoad={() => setAvatarLoaded(true)}
                />
              )}
            </>
          )}
        </div>

        {/* Message Bubble */}
        <div className="flex flex-col gap-1 flex-1 max-w-[90%] sm:max-w-[85%] md:max-w-[75%]">
          <div
            className={`relative group px-3 py-2.5 sm:px-4 sm:py-3 rounded-xl sm:rounded-2xl ${
              isUser
                ? "bg-accent/10 border border-accent/20 rounded-tr-sm ml-auto"
                : "bg-card/80 backdrop-blur-sm border border-primary/20 rounded-tl-sm mr-auto dark:bg-gradient-to-br dark:from-primary/10 dark:to-secondary/10 dark:border-primary/30 dark:shadow-[0_0_25px_hsl(var(--primary)/0.2)]"
            } ${isError ? "border-destructive/40" : ""}`}
          >
          {message && (
              isUser ? (
                <p className="text-[13px] sm:text-sm md:text-base leading-relaxed whitespace-pre-wrap">
                  {message}
                </p>
              ) : (
                <div className="text-[13px] sm:text-sm md:text-base leading-relaxed prose prose-sm dark:prose-invert max-w-none prose-p:my-1 prose-ul:my-1 prose-ol:my-1 prose-li:my-0.5 prose-headings:my-2 prose-pre:bg-muted prose-pre:text-foreground prose-code:text-primary prose-code:bg-muted/50 prose-code:px-1 prose-code:py-0.5 prose-code:rounded prose-code:before:content-none prose-code:after:content-none">
                  <ReactMarkdown>{message}</ReactMarkdown>
                </div>
              )
            )}
            
            {/* Generated Image */}
            {isImageLoading && (
              <div className="mt-2">
                <Skeleton className="w-64 h-80 rounded-xl" />
              </div>
            )}
            {generatedImage && !isImageLoading && (
              <div className="mt-2">
                <ImageMessage imageUrl={generatedImage} prompt={imagePrompt || ""} imageType={imageType} />
              </div>
            )}
            
            {/* Audio Player */}
            {isAudioLoading && (
              <div className="mt-2">
                <Skeleton className="w-64 h-16 rounded-xl" />
              </div>
            )}
            {audioUrl && !isAudioLoading && (
              <div className="mt-2">
                <AudioMessage audioUrl={audioUrl} text={audioText || ""} />
              </div>
            )}
            
            {/* Copy button for AI messages */}
            {!isUser && isLongMessage && !isError && (
              <button
                onClick={handleCopy}
                className="absolute top-2 right-2 p-1.5 rounded-lg bg-muted/50 opacity-0 group-hover:opacity-100 hover:bg-muted transition-all duration-200"
                title="Copy message"
              >
                {copied ? (
                  <Check className="w-3.5 h-3.5 text-primary" />
                ) : (
                  <Copy className="w-3.5 h-3.5 text-muted-foreground" />
                )}
              </button>
            )}

            {/* Retry button for error messages */}
            {isError && onRetry && (
              <button
                onClick={onRetry}
                className="absolute -bottom-3 right-2 px-3 py-1.5 rounded-full bg-primary text-primary-foreground text-xs font-medium flex items-center gap-1.5 hover:bg-primary/90 transition-all shadow-lg glow-primary"
              >
                <RotateCcw className="w-3 h-3" />
                Retry
              </button>
            )}
          </div>
          {timestamp && (
            <span className={`text-[10px] text-muted-foreground/50 ${isUser ? "text-right" : "text-left"} ${isError ? "mt-2" : ""}`}>
              {formatTime(timestamp)}
            </span>
          )}
        </div>
      </div>

      {/* Avatar Overlay */}
      {!isUser && (
        <ImageOverlay
          isOpen={showAvatarOverlay}
          imageUrl={avatarSrc}
          onClose={() => setShowAvatarOverlay(false)}
        />
      )}
    </>
  );
};

export default ChatMessage;
