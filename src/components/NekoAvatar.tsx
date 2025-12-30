import { Skeleton } from "@/components/ui/skeleton";

interface NekoAvatarProps {
  nekoImage: string;
  isLoading: boolean;
  size?: "small" | "large";
}

const NekoAvatar = ({ nekoImage, isLoading, size = "large" }: NekoAvatarProps) => {
  const avatarSrc = nekoImage || "/main.jpg";

  if (size === "small") {
    return (
      <div className="w-8 h-8 sm:w-9 sm:h-9 rounded-lg sm:rounded-xl overflow-hidden ring-2 ring-primary/40 flex-shrink-0 animate-glow-pulse">
        {isLoading ? (
          <Skeleton className="w-full h-full" />
        ) : (
          <img
            src={avatarSrc}
            alt="Chiku AI"
            className="w-full h-full object-cover"
          />
        )}
      </div>
    );
  }

  return (
    <div className="relative flex items-center justify-center">
      {/* Avatar container */}
      <div className="relative w-20 h-20 md:w-24 md:h-24 rounded-full overflow-hidden shadow-lg">
        {isLoading ? (
          <Skeleton className="w-full h-full rounded-full" />
        ) : (
          <img
            src={avatarSrc}
            alt="Chiku AI Avatar"
            className="w-full h-full object-cover"
          />
        )}
      </div>
      
      {/* Status indicator */}
      <div className="absolute bottom-0 right-0 w-4 h-4 bg-green-500 rounded-full border-2 border-background" />
    </div>
  );
};

export default NekoAvatar;
