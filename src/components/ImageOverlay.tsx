import { X } from "lucide-react";

interface ImageOverlayProps {
  isOpen: boolean;
  imageUrl: string;
  onClose: () => void;
}

const ImageOverlay = ({ isOpen, imageUrl, onClose }: ImageOverlayProps) => {
  if (!isOpen) return null;

  return (
    <div 
      className="fixed inset-0 z-50 flex items-center justify-center p-4"
      onClick={onClose}
    >
      {/* Backdrop with blur animation */}
      <div className="absolute inset-0 overlay-backdrop" />
      
      {/* Image container */}
      <div 
        className="relative overlay-content"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Close button */}
        <button
          onClick={onClose}
          className="absolute -top-3 -right-3 z-10 p-2.5 rounded-full bg-card border border-border shadow-lg hover:bg-muted transition-all duration-300 hover:rotate-90"
        >
          <X className="w-4 h-4 text-foreground" />
        </button>

        {/* Image */}
        <div className="rounded-3xl overflow-hidden shadow-2xl glow-neon ring-4 ring-primary/20">
          <img
            src={imageUrl}
            alt="Neko"
            className="w-64 h-64 md:w-80 md:h-80 object-cover"
          />
        </div>
      </div>
    </div>
  );
};

export default ImageOverlay;
