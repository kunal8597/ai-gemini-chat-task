import { useState, useRef, useEffect } from 'react';
import { useChatStore } from '@/stores/chatStore';
import { useThemeStore } from '@/stores/themeStore';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
import { Avatar, AvatarFallback } from '@/components/ui/avatar';
import {
  ArrowLeft,
  Send,
  ImagePlus,
  Copy,
  Sparkles,
  User,
  Moon,
  Sun,
  Loader2,
} from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { toast } from 'sonner';

export const ChatInterface = () => {
  const [input, setInput] = useState('');
  const [selectedImage, setSelectedImage] = useState<string | null>(null);
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const activeChatroom = useChatStore((state) => state.getActiveChatroom());
  const addMessage = useChatStore((state) => state.addMessage);
  const isTyping = useChatStore((state) => state.isTyping);
  const setTyping = useChatStore((state) => state.setTyping);
  const isDark = useThemeStore((state) => state.isDark);
  const toggleTheme = useThemeStore((state) => state.toggleTheme);
  const navigate = useNavigate();

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [activeChatroom?.messages, isTyping]);

  useEffect(() => {
    if (!activeChatroom) {
      navigate('/dashboard');
    }
  }, [activeChatroom, navigate]);

  const handleImageSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onloadend = () => {
        setSelectedImage(reader.result as string);
      };
      reader.readAsDataURL(file);
    }
  };

  const simulateAIResponse = (userMessage: string) => {
    setTyping(true);

    // Simulate AI thinking time (1-3 seconds)
    const thinkingTime = Math.random() * 2000 + 1000;

    setTimeout(() => {
      if (activeChatroom) {
        const responses = [
          "That's an interesting question! Let me help you with that.",
          "I understand what you're asking. Here's what I think...",
          "Great question! Based on what you've shared, I'd suggest...",
          "Let me analyze that for you. From my perspective...",
          "I can definitely help with that. Here's my take...",
        ];

        const randomResponse =
          responses[Math.floor(Math.random() * responses.length)] +
          ' ' +
          userMessage.split(' ').reverse().join(' ');

        addMessage(activeChatroom.id, {
          content: randomResponse,
          role: 'assistant',
        });
      }
      setTyping(false);
    }, thinkingTime);
  };

  const handleSend = () => {
    if ((!input.trim() && !selectedImage) || !activeChatroom) return;

    const messageContent = input.trim();
    addMessage(activeChatroom.id, {
      content: messageContent || '📷 Image',
      role: 'user',
      image: selectedImage || undefined,
    });

    toast.success('Message sent');
    setInput('');
    setSelectedImage(null);

    // Simulate AI response
    simulateAIResponse(messageContent);
  };

  const handleCopy = (content: string) => {
    navigator.clipboard.writeText(content);
    toast.success('Copied to clipboard');
  };

  if (!activeChatroom) {
    return null;
  }

  return (
    <div className="flex flex-col h-screen bg-background">
      {/* Header */}
      <header className="border-b bg-card/50 backdrop-blur-sm p-4 flex items-center justify-between">
        <div className="flex items-center gap-3">
          <Button variant="ghost" size="icon" onClick={() => navigate('/dashboard')}>
            <ArrowLeft className="h-5 w-5" />
          </Button>
          <div>
            <h2 className="font-semibold">{activeChatroom.title}</h2>
            <p className="text-sm text-muted-foreground">
              {activeChatroom.messages.length} messages
            </p>
          </div>
        </div>
        <Button variant="ghost" size="icon" onClick={toggleTheme}>
          {isDark ? <Sun className="h-5 w-5" /> : <Moon className="h-5 w-5" />}
        </Button>
      </header>

      {/* Messages */}
      <div className="flex-1 overflow-y-auto p-4 space-y-4">
        {activeChatroom.messages.length === 0 ? (
          <div className="h-full flex items-center justify-center">
            <div className="text-center space-y-4">
              <div className="inline-flex items-center justify-center w-20 h-20 rounded-full gradient-primary">
                <Sparkles className="w-10 h-10 text-white" />
              </div>
              <div>
                <h3 className="text-xl font-semibold mb-2">Start a conversation</h3>
                <p className="text-muted-foreground">
                  Send a message to begin chatting with Gemini AI
                </p>
              </div>
            </div>
          </div>
        ) : (
          <>
            {activeChatroom.messages.map((message) => (
              <div
                key={message.id}
                className={`flex gap-3 animate-slide-up group ${
                  message.role === 'user' ? 'flex-row-reverse' : 'flex-row'
                }`}
              >
                <Avatar className="h-8 w-8 mt-1">
                  <AvatarFallback
                    className={
                      message.role === 'user'
                        ? 'bg-primary text-primary-foreground'
                        : 'gradient-primary text-white'
                    }
                  >
                    {message.role === 'user' ? (
                      <User className="h-4 w-4" />
                    ) : (
                      <Sparkles className="h-4 w-4" />
                    )}
                  </AvatarFallback>
                </Avatar>

                <div
                  className={`flex-1 max-w-[70%] ${
                    message.role === 'user' ? 'text-right' : 'text-left'
                  }`}
                >
                  <div
                    className={`inline-block p-3 rounded-2xl ${
                      message.role === 'user'
                        ? 'bg-primary text-primary-foreground'
                        : 'bg-muted'
                    }`}
                  >
                    {message.image && (
                      <img
                        src={message.image}
                        alt="Uploaded"
                        className="rounded-lg mb-2 max-w-full h-auto"
                      />
                    )}
                    <p className="whitespace-pre-wrap break-words">{message.content}</p>
                  </div>
                  <div className="flex items-center gap-2 mt-1 text-xs text-muted-foreground">
                    <span>{new Date(message.timestamp).toLocaleTimeString()}</span>
                    <Button
                      variant="ghost"
                      size="icon"
                      className="h-6 w-6 opacity-0 group-hover:opacity-100 transition-opacity"
                      onClick={() => handleCopy(message.content)}
                    >
                      <Copy className="h-3 w-3" />
                    </Button>
                  </div>
                </div>
              </div>
            ))}

            {isTyping && (
              <div className="flex gap-3 animate-slide-up">
                <Avatar className="h-8 w-8 mt-1">
                  <AvatarFallback className="gradient-primary text-white">
                    <Sparkles className="h-4 w-4" />
                  </AvatarFallback>
                </Avatar>
                <div className="bg-muted p-3 rounded-2xl">
                  <div className="flex gap-1">
                    <div className="w-2 h-2 bg-primary rounded-full animate-bounce" />
                    <div className="w-2 h-2 bg-primary rounded-full animate-bounce delay-100" />
                    <div className="w-2 h-2 bg-primary rounded-full animate-bounce delay-200" />
                  </div>
                </div>
              </div>
            )}

            <div ref={messagesEndRef} />
          </>
        )}
      </div>

      {/* Input */}
      <div className="border-t bg-card p-4">
        {selectedImage && (
          <div className="mb-2 relative inline-block">
            <img
              src={selectedImage}
              alt="Selected"
              className="h-20 rounded-lg border"
            />
            <Button
              variant="destructive"
              size="icon"
              className="absolute -top-2 -right-2 h-6 w-6 rounded-full"
              onClick={() => setSelectedImage(null)}
            >
              ×
            </Button>
          </div>
        )}
        <div className="flex gap-2">
          <input
            ref={fileInputRef}
            type="file"
            accept="image/*"
            className="hidden"
            onChange={handleImageSelect}
          />
          <Button
            variant="outline"
            size="icon"
            onClick={() => fileInputRef.current?.click()}
          >
            <ImagePlus className="h-5 w-5" />
          </Button>
          <Textarea
            placeholder="Type your message..."
            value={input}
            onChange={(e) => setInput(e.target.value)}
            onKeyDown={(e) => {
              if (e.key === 'Enter' && !e.shiftKey) {
                e.preventDefault();
                handleSend();
              }
            }}
            className="resize-none"
            rows={1}
          />
          <Button
            className="gradient-primary"
            onClick={handleSend}
            disabled={!input.trim() && !selectedImage}
          >
            <Send className="h-5 w-5" />
          </Button>
        </div>
      </div>
    </div>
  );
};
