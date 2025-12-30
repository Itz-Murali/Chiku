import { useState, KeyboardEvent } from "react";
import { Send } from "lucide-react";
import CommandPopup from "./CommandPopup";

interface ChatInputProps {
  onSend: (message: string) => void;
  disabled?: boolean;
}

const ChatInput = ({ onSend, disabled = false }: ChatInputProps) => {
  const [message, setMessage] = useState("");
  const [showCommands, setShowCommands] = useState(false);

  const handleSend = () => {
    if (message.trim() && !disabled) {
      onSend(message.trim());
      setMessage("");
      setShowCommands(false);
    }
  };

  const handleKeyDown = (e: KeyboardEvent<HTMLTextAreaElement>) => {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault();
      handleSend();
    }
    if (e.key === "Escape") {
      setShowCommands(false);
    }
  };

  const handleChange = (value: string) => {
    setMessage(value);
    // Show commands when message starts with /
    if (value.startsWith("/")) {
      setShowCommands(true);
    } else {
      setShowCommands(false);
    }
  };

  const handleCommandSelect = (command: string) => {
    setMessage(command + " ");
    setShowCommands(false);
  };

  const handleInstantSend = (command: string) => {
    setShowCommands(false);
    setMessage("");
    onSend(command);
  };

  return (
    <div className="relative">
      {/* Command Popup */}
      {showCommands && (
        <CommandPopup
          onSelect={handleCommandSelect}
          onInstantSend={handleInstantSend}
          filter={message}
        />
      )}
      
      <div className="bg-muted/30 backdrop-blur-xl rounded-xl sm:rounded-2xl p-1 sm:p-1.5 flex items-end gap-1.5 sm:gap-2 border border-border/20">
        <textarea
          value={message}
          onChange={(e) => handleChange(e.target.value)}
          onKeyDown={handleKeyDown}
          placeholder="Say something nice..."
          disabled={disabled}
          rows={1}
          className="flex-1 bg-transparent px-3 sm:px-4 py-2.5 sm:py-3 text-foreground placeholder:text-muted-foreground/60 resize-none focus:outline-none min-h-[42px] sm:min-h-[48px] max-h-[100px] sm:max-h-[120px] text-sm"
          style={{ height: "42px" }}
          onInput={(e) => {
            const target = e.target as HTMLTextAreaElement;
            target.style.height = "42px";
            target.style.height = Math.min(target.scrollHeight, 100) + "px";
          }}
        />
        <button
          onClick={() => handleChange("/")}
          disabled={disabled}
          className="flex-shrink-0 w-9 h-9 sm:w-10 sm:h-10 rounded-lg sm:rounded-xl flex items-center justify-center transition-all duration-300 bg-primary/10 hover:bg-primary/20 text-primary border border-primary/20 hover:border-primary/40 disabled:opacity-40 disabled:cursor-not-allowed"
          title="Show commands"
        >
          <span className="text-base sm:text-lg font-bold">/</span>
        </button>
        <button
          onClick={handleSend}
          disabled={disabled || !message.trim()}
          className="send-button flex-shrink-0 w-10 h-10 sm:w-11 sm:h-11 rounded-lg sm:rounded-xl flex items-center justify-center transition-all duration-300 disabled:opacity-40 disabled:cursor-not-allowed"
        >
          <Send className="w-4 h-4 sm:w-5 sm:h-5" />
        </button>
      </div>
    </div>
  );
};

export default ChatInput;