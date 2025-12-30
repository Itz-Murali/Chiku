import { useState, useRef, useEffect, useCallback } from "react";
import NekoAvatar from "./NekoAvatar";
import ChatMessage from "./ChatMessage";
import ChatInput from "./ChatInput";
import TypingIndicator from "./TypingIndicator";
import TypingTitle from "./TypingTitle";
import ThemeToggle from "./ThemeToggle";
import AboutModal from "./AboutModal";
import ParticleBackground from "./ParticleBackground";
import { Trash2, Info } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";

interface Message {
  id: string;
  content: string;
  isUser: boolean;
  isNew?: boolean;
  timestamp: Date;
  isError?: boolean;
  retryMessage?: string;
  generatedImage?: string;
  imagePrompt?: string;
  imageType?: "generated" | "neko" | "waifu" | "hug" | "pat" | "kiss" | "wave" | "smile" | "blush" | "poke" | "dance";
  audioUrl?: string;
  audioText?: string;
  isImageLoading?: boolean;
  isAudioLoading?: boolean;
}

const CACHE_KEY = "chiku-chat-cache";

interface CachedMessage {
  id: string;
  content: string;
  isUser: boolean;
  isNew?: boolean;
  timestamp: string;
  isError?: boolean;
  retryMessage?: string;
  generatedImage?: string;
  imagePrompt?: string;
  imageType?: "generated" | "neko" | "waifu" | "hug" | "pat" | "kiss" | "wave" | "smile" | "blush" | "poke" | "dance";
  audioUrl?: string;
  audioText?: string;
  isImageLoading?: boolean;
  isAudioLoading?: boolean;
}

interface ChatCache {
  messages: CachedMessage[];
  history: string[];
}

const getDefaultMessages = (): Message[] => [
  {
    id: "welcome",
    content: "Hi there! 😊✨ I'm Chiku AI! How can I make your day brighter today? 💖",
    isUser: false,
    timestamp: new Date(),
  },
];

const loadCachedChat = (): { messages: Message[]; history: string[] } | null => {
  try {
    const cached = localStorage.getItem(CACHE_KEY);
    if (cached) {
      const parsed: ChatCache = JSON.parse(cached);
      // Restore Date objects and convert all message fields
      const messages: Message[] = parsed.messages.map((msg) => ({
        ...msg,
        timestamp: new Date(msg.timestamp),
        isNew: false, // Don't animate cached messages
        isImageLoading: false, // Clear loading states
        isAudioLoading: false,
      }));
      return { messages, history: parsed.history };
    }
  } catch (e) {
    console.error("Failed to load chat cache:", e);
  }
  return null;
};

const saveChatCache = (messages: Message[], history: string[]) => {
  try {
    // Only save messages that are fully loaded (not in loading state)
    // This ensures we don't cache "loading..." messages without actual content
    const cacheableMessages: CachedMessage[] = messages
      .filter((msg) => !msg.isImageLoading && !msg.isAudioLoading) // Skip messages still loading
      .map((msg) => ({
        id: msg.id,
        content: msg.content,
        isUser: msg.isUser,
        timestamp: msg.timestamp.toISOString(),
        isNew: false,
        isError: msg.isError,
        retryMessage: msg.retryMessage,
        generatedImage: msg.generatedImage,
        imagePrompt: msg.imagePrompt,
        imageType: msg.imageType,
        audioUrl: msg.audioUrl,
        audioText: msg.audioText,
        isImageLoading: false,
        isAudioLoading: false,
      }));
    localStorage.setItem(CACHE_KEY, JSON.stringify({ messages: cacheableMessages, history }));
  } catch (e) {
    console.error("Failed to save chat cache:", e);
  }
};

const clearChatCache = () => {
  try {
    localStorage.removeItem(CACHE_KEY);
  } catch (e) {
    console.error("Failed to clear chat cache:", e);
  }
};

const Chatbot = () => {
  const cachedChat = loadCachedChat();
  
  const [messages, setMessages] = useState<Message[]>(
    cachedChat?.messages || getDefaultMessages()
  );
  const [isLoading, setIsLoading] = useState(false);
  const [history, setHistory] = useState<string[]>(cachedChat?.history || []);
  const [nekoImage, setNekoImage] = useState<string>("");
  const [isNekoLoading, setIsNekoLoading] = useState(true);
  const [showAbout, setShowAbout] = useState(false);
  const [isInitialized, setIsInitialized] = useState(false);
  const [lastUserMessage, setLastUserMessage] = useState<string>("");
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const messagesContainerRef = useRef<HTMLDivElement>(null);
  const userScrolledRef = useRef(false);

  // Select random avatar image on mount
  useEffect(() => {
    const avatars = ["/main.jpg", "/main1.jpg"];
    const randomAvatar = avatars[Math.floor(Math.random() * avatars.length)];
    setNekoImage(randomAvatar);
    setIsNekoLoading(false);
    setTimeout(() => setIsInitialized(true), 100);
  }, []);

  // Save to cache whenever messages or history change
  useEffect(() => {
    if (isInitialized && messages.length > 0) {
      saveChatCache(messages, history);
    }
  }, [messages, history, isInitialized]);

  const scrollToBottom = useCallback((force = false) => {
    if ((force || !userScrolledRef.current) && isInitialized) {
      messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
    }
  }, [isInitialized]);

  // Handle scroll events to detect user scrolling
  useEffect(() => {
    const container = messagesContainerRef.current;
    if (!container) return;

    const handleScroll = () => {
      const { scrollTop, scrollHeight, clientHeight } = container;
      const isAtBottom = scrollHeight - scrollTop - clientHeight < 100;
      userScrolledRef.current = !isAtBottom;
    };

    container.addEventListener("scroll", handleScroll, { passive: true });
    return () => container.removeEventListener("scroll", handleScroll);
  }, []);

  // Track previous message count to only scroll on NEW messages
  const prevMessageCountRef = useRef(messages.length);
  
  useEffect(() => {
    // Only scroll if messages were added (not on initial load or other rerenders)
    if (isInitialized && messages.length > prevMessageCountRef.current) {
      // Only auto-scroll if user hasn't scrolled up
      if (!userScrolledRef.current) {
        scrollToBottom();
      }
    }
    prevMessageCountRef.current = messages.length;
  }, [messages.length, isInitialized, scrollToBottom]);
  
  // Scroll when loading state changes (for typing indicator)
  useEffect(() => {
    if (isInitialized && isLoading && !userScrolledRef.current) {
      scrollToBottom();
    }
  }, [isLoading, isInitialized, scrollToBottom]);

  useEffect(() => {
    const timer = setTimeout(() => {
      setMessages((prev) =>
        prev.map((msg) => ({ ...msg, isNew: false }))
      );
    }, 500);
    return () => clearTimeout(timer);
  }, [messages]);

  const clearChat = () => {
    clearChatCache();
    setMessages(getDefaultMessages());
    setHistory([]);
    setLastUserMessage("");
    userScrolledRef.current = false;
  };

  const handleImageGen = async (prompt: string) => {
    userScrolledRef.current = false;
    const userMsgId = Date.now().toString();
    const aiMsgId = (Date.now() + 1).toString();

    const fullCommand = `/ImageGen ${prompt}`;
    setLastUserMessage(fullCommand);

    setMessages((prev) => [
      ...prev,
      {
        id: userMsgId,
        content: fullCommand,
        isUser: true,
        isNew: true,
        timestamp: new Date(),
      },
      {
        id: aiMsgId,
        content: "Generating your image... ✨",
        isUser: false,
        isNew: true,
        timestamp: new Date(),
        isImageLoading: true,
        retryMessage: fullCommand,
      },
    ]);

    try {
      const { data, error } = await supabase.functions.invoke("chiku-commands", {
        body: { command: "imagegen", prompt },
      });

      if (error) throw new Error(error.message || "Failed to generate image");

      const imageUrls: string[] = data?.images || [];
      if (imageUrls.length === 0) throw new Error("No images generated");

      setMessages((prev) =>
        prev.map((msg) =>
          msg.id === aiMsgId
            ? {
                ...msg,
                content: "Here's your generated image! 🎨",
                isImageLoading: false,
                generatedImage: imageUrls[0],
                imagePrompt: prompt,
                imageType: "generated" as const,
              }
            : msg,
        ),
      );
    } catch (error) {
      console.error("Failed to generate image:", error);
      setMessages((prev) =>
        prev.map((msg) =>
          msg.id === aiMsgId
            ? {
                ...msg,
                content: "Oops! Failed to generate image. Please try again! 🌸",
                isImageLoading: false,
                isError: true,
              }
            : msg,
        ),
      );
    }
  };

  const handleTTS = async (text: string) => {
    userScrolledRef.current = false;
    const userMsgId = Date.now().toString();
    const aiMsgId = (Date.now() + 1).toString();

    const fullCommand = `/tts ${text}`;
    setLastUserMessage(fullCommand);

    setMessages((prev) => [
      ...prev,
      {
        id: userMsgId,
        content: fullCommand,
        isUser: true,
        isNew: true,
        timestamp: new Date(),
      },
      {
        id: aiMsgId,
        content: "Converting to speech... 🎵",
        isUser: false,
        isNew: true,
        timestamp: new Date(),
        isAudioLoading: true,
        retryMessage: fullCommand,
      },
    ]);

    try {
      const { data, error } = await supabase.functions.invoke("chiku-commands", {
        body: { command: "tts", text },
      });

      if (error) throw new Error(error.message || "Failed to generate audio");

      const audioUrl: string | undefined = data?.audioDataUrl;
      if (!audioUrl) throw new Error("No audio received");

      setMessages((prev) =>
        prev.map((msg) =>
          msg.id === aiMsgId
            ? {
                ...msg,
                content: "Here's your audio! 🔊",
                isAudioLoading: false,
                audioUrl,
                audioText: text,
              }
            : msg,
        ),
      );
    } catch (error) {
      console.error("Failed to generate TTS:", error);
      setMessages((prev) =>
        prev.map((msg) =>
          msg.id === aiMsgId
            ? {
                ...msg,
                content: "Oops! Failed to generate audio. Please try again! 🌸",
                isAudioLoading: false,
                isError: true,
              }
            : msg,
        ),
      );
    }
  };

  const handleNekosBestCommand = async (command: "neko" | "waifu" | "hug" | "pat" | "kiss" | "wave" | "smile" | "blush" | "poke" | "dance") => {
    userScrolledRef.current = false;
    const userMsgId = Date.now().toString();
    const aiMsgId = (Date.now() + 1).toString();

    const fullCommand = `/${command}`;
    setLastUserMessage(fullCommand);

    const loadingMessages: Record<string, string> = {
      neko: "Finding a cute neko... 🐱",
      waifu: "Finding a waifu... ✨",
      hug: "Getting a warm hug... 🤗",
      pat: "Finding a headpat... 🫳",
      kiss: "Finding a kiss... 💋",
      wave: "Getting a wave... 👋",
      smile: "Finding a smile... 😊",
      blush: "Finding a blush... 😳",
      poke: "Getting a poke... 👆",
      dance: "Finding a dance... 💃",
    };

    const successMessages: Record<string, string> = {
      neko: "Here's a cute neko for you! 🐱💖",
      waifu: "Here's a beautiful waifu! ✨💕",
      hug: "Here's a warm hug for you! 🤗💕",
      pat: "Here's a gentle headpat! 🫳✨",
      kiss: "Here's a sweet kiss! 💋💖",
      wave: "Here's a friendly wave! 👋✨",
      smile: "Here's a happy smile! 😊💕",
      blush: "Here's a cute blush! 😳💖",
      poke: "Poke poke! 👆✨",
      dance: "Let's dance! 💃🎵",
    };

    setMessages((prev) => [
      ...prev,
      {
        id: userMsgId,
        content: fullCommand,
        isUser: true,
        isNew: true,
        timestamp: new Date(),
      },
      {
        id: aiMsgId,
        content: loadingMessages[command],
        isUser: false,
        isNew: true,
        timestamp: new Date(),
        isImageLoading: true,
        retryMessage: fullCommand,
      },
    ]);

    try {
      const { data, error } = await supabase.functions.invoke("chiku-commands", {
        body: { command },
      });

      if (error) throw new Error(error.message || `Failed to fetch ${command}`);

      const imageUrls: string[] = data?.images || [];
      if (imageUrls.length === 0) throw new Error(`No ${command} image found`);

      setMessages((prev) =>
        prev.map((msg) =>
          msg.id === aiMsgId
            ? {
                ...msg,
                content: successMessages[command],
                isImageLoading: false,
                generatedImage: imageUrls[0],
                imagePrompt: command,
                imageType: command,
              }
            : msg,
        ),
      );
    } catch (error) {
      console.error(`Failed to fetch ${command}:`, error);
      setMessages((prev) =>
        prev.map((msg) =>
          msg.id === aiMsgId
            ? {
                ...msg,
                content: `Oops! Failed to get ${command} image. Please try again! 🌸`,
                isImageLoading: false,
                isError: true,
              }
            : msg,
        ),
      );
    }
  };

  const sendMessage = async (userMessage: string, isRetry = false) => {
    // Check for commands
    if (userMessage.toLowerCase().startsWith("/imagegen ")) {
      const prompt = userMessage.slice(10).trim();
      if (prompt) {
        handleImageGen(prompt);
        return;
      }
    }
    
    if (userMessage.toLowerCase().startsWith("/tts ")) {
      const text = userMessage.slice(5).trim();
      if (text) {
        handleTTS(text);
        return;
      }
    }

    const nekosBestCommands = ["neko", "waifu", "hug", "pat", "kiss", "wave", "smile", "blush", "poke", "dance"] as const;
    const lowerMessage = userMessage.toLowerCase();
    
    for (const cmd of nekosBestCommands) {
      if (lowerMessage === `/${cmd}`) {
        handleNekosBestCommand(cmd);
        return;
      }
    }

    userScrolledRef.current = false;
    const userMsgId = Date.now().toString();
    
    if (!isRetry) {
      setMessages((prev) => [
        ...prev,
        { id: userMsgId, content: userMessage, isUser: true, isNew: true, timestamp: new Date() },
      ]);
      setLastUserMessage(userMessage);
    } else {
      // Remove the last error message before retrying
      setMessages((prev) => prev.filter((msg) => !msg.isError));
    }

    const newHistory = isRetry ? history : [...history, `User: ${userMessage}`];
    if (!isRetry) setHistory(newHistory);

    setIsLoading(true);

    try {
      const historyString = newHistory.join("\n");
      
      const { data, error } = await supabase.functions.invoke('chiku-chat', {
        body: { message: historyString }
      });
      
      if (error) {
        throw new Error(error.message || 'Failed to get response');
      }
      
      const botResponse = data?.answer || "I'm having trouble responding right now. Please try again! 💫";

      setHistory((prev) => [...prev, `Chiku: ${botResponse}`]);

      setMessages((prev) => [
        ...prev,
        {
          id: (Date.now() + 1).toString(),
          content: botResponse,
          isUser: false,
          isNew: true,
          timestamp: new Date(),
        },
      ]);
    } catch (error) {
      console.error("Failed to get response:", error);
      setMessages((prev) => [
        ...prev,
        {
          id: (Date.now() + 1).toString(),
          content: "Oops! Something went wrong. Please try again! 🌸",
          isUser: false,
          isNew: true,
          timestamp: new Date(),
          isError: true,
          retryMessage: userMessage,
        },
      ]);
    } finally {
      setIsLoading(false);
    }
  };


  return (
    <div className="h-[100dvh] flex flex-col overflow-hidden relative">
      {/* Particle Background for Dark Mode */}
      <ParticleBackground />
      {/* Fixed Top Navigation Bar - Always stays on top */}
      <nav className="fixed top-0 left-0 right-0 z-50 glass-strong border-b border-border/10">
        <div className="w-full px-3 sm:px-4 py-2.5 sm:py-3 flex items-center justify-between">
          <div className="flex items-center gap-2 sm:gap-3">
            {/* About button */}
            <button
              onClick={() => setShowAbout(true)}
              className="p-1.5 sm:p-2 rounded-lg sm:rounded-xl bg-muted/30 hover:bg-primary/20 transition-all duration-300 group"
              title="About Chiku AI"
            >
              <Info className="w-4 h-4 text-muted-foreground group-hover:text-primary transition-colors" />
            </button>
            <NekoAvatar nekoImage={nekoImage} isLoading={isNekoLoading} size="small" />
            <div>
              <h1 className="text-xl sm:text-2xl font-script font-extrabold tracking-wide">
                <TypingTitle text="Chiku AI" speed={120} />
              </h1>
              <p className="text-[10px] sm:text-xs text-muted-foreground font-body hidden sm:block">Always here for you</p>
            </div>
          </div>
          <div className="flex items-center gap-1.5 sm:gap-2">
            <button
              onClick={clearChat}
              className="p-2 sm:p-2.5 rounded-lg sm:rounded-xl bg-muted/30 hover:bg-destructive/20 transition-all duration-300 group"
              title="Clear Chat"
            >
              <Trash2 className="w-4 h-4 text-muted-foreground group-hover:text-destructive transition-colors" />
            </button>
            <ThemeToggle />
          </div>
        </div>
      </nav>

      {/* Spacer for fixed navbar */}
      <div className="h-[56px] sm:h-[68px] flex-shrink-0" />

      {/* Messages Container - responsive width */}
      <div 
        ref={messagesContainerRef}
        className="flex-1 overflow-y-auto scrollbar-thin min-h-0"
      >
        <div className="w-full px-3 sm:px-4 md:px-0 md:w-[85%] lg:w-[75%] xl:w-[65%] mx-auto py-4 sm:py-6 space-y-3 sm:space-y-4">
          {messages.map((msg) => (
            <ChatMessage
              key={msg.id}
              message={msg.content}
              isUser={msg.isUser}
              isNew={msg.isNew}
              timestamp={msg.timestamp}
              nekoImage={nekoImage}
              isNekoLoading={isNekoLoading}
              isError={msg.isError}
              onRetry={
                msg.isError && msg.retryMessage
                  ? () => sendMessage(msg.retryMessage!, true)
                  : undefined
              }
              generatedImage={msg.generatedImage}
              imagePrompt={msg.imagePrompt}
              imageType={msg.imageType}
              audioUrl={msg.audioUrl}
              audioText={msg.audioText}
              isImageLoading={msg.isImageLoading}
              isAudioLoading={msg.isAudioLoading}
            />
          ))}
          {isLoading && <TypingIndicator nekoImage={nekoImage} />}
          <div ref={messagesEndRef} />
        </div>
      </div>

      {/* Fixed Bottom Input - Always stays at bottom */}
      <div className="fixed bottom-0 left-0 right-0 z-50 glass-strong border-t border-border/10">
        <div className="w-full px-3 sm:px-4 md:px-0 md:w-[85%] lg:w-[75%] xl:w-[65%] mx-auto py-3 sm:py-4">
          <ChatInput onSend={sendMessage} disabled={isLoading} />
        </div>
      </div>

      {/* Spacer for fixed input - responsive height */}
      <div className="h-[72px] sm:h-[80px] flex-shrink-0" />

      {/* About Modal */}
      <AboutModal isOpen={showAbout} onClose={() => setShowAbout(false)} nekoImage={nekoImage} />
    </div>
  );
};

export default Chatbot;
