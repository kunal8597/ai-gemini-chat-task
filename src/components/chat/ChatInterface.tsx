import { useRef, useEffect } from 'react';
import { useChatStore } from '@/stores/chatStore';
import { Button } from '@/components/ui/button';
import { Avatar, AvatarFallback } from '@/components/ui/avatar';
import { SuggestionChips } from './SuggestionChips';
import { PromptInputBox } from '@/components/ui/ai-prompt-box';
import {
  ArrowLeft,
  Copy,
  Sparkles,
  User,
} from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { toast } from 'sonner';
import { BackgroundGradient } from "@/components/ui/bg-gradient";

export const ChatInterface = () => {
  const messagesEndRef = useRef<HTMLDivElement>(null);

  const activeChatroom = useChatStore((state) => state.getActiveChatroom());
  const addMessage = useChatStore((state) => state.addMessage);
  const isTyping = useChatStore((state) => state.isTyping);
  const setTyping = useChatStore((state) => state.setTyping);
  const navigate = useNavigate();

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [activeChatroom?.messages, isTyping]);

  useEffect(() => {
    if (!activeChatroom) {
      navigate('/dashboard');
    }
  }, [activeChatroom, navigate]);


  const simulateAIResponse = (userMessage: string) => {
    setTyping(true);

    // Simulate more realistic AI thinking time (2-4 seconds)
    const thinkingTime = Math.random() * 2000 + 2000;

    setTimeout(() => {
      if (activeChatroom) {
        // More sophisticated response generation
        const templates = [
          {
            condition: (msg: string) => msg.toLowerCase().includes('advice'),
            response: "Here's my advice: Stay focused on your goals, embrace challenges as learning opportunities, and remember that progress, not perfection, is what matters most. What specific area would you like guidance on?"
          },
          {
            condition: (msg: string) => msg.toLowerCase().includes('youtube') || msg.toLowerCase().includes('video'),
            response: "For YouTube content ideas, consider: 1) Behind-the-scenes of your daily work, 2) Solving common problems in your niche, 3) Comparison videos, or 4) Educational tutorials. What's your channel focus?"
          },
          {
            condition: (msg: string) => msg.toLowerCase().includes('kratos') || msg.toLowerCase().includes('lesson'),
            response: "Kratos teaches us powerful lessons: Control your rage, learn from your past mistakes, protect what matters most, and never give up no matter the odds. The journey of redemption is always possible. Which lesson resonates with you?"
          },
          {
            condition: (msg: string) => msg.toLowerCase().includes('help') || msg.toLowerCase().includes('?'),
            response: `I'd be happy to help you with "${userMessage}". Could you provide more details about what you're looking for? The more specific you are, the better I can assist you.`
          },
        ];

        // Find matching template or use generic response
        const matchedTemplate = templates.find(t => t.condition(userMessage));
        const response = matchedTemplate 
          ? matchedTemplate.response 
          : `That's an interesting point about "${userMessage}". Let me think about this... Based on my understanding, I'd suggest approaching this from multiple angles. Would you like me to elaborate on any specific aspect?`;

        addMessage(activeChatroom.id, {
          content: response,
          role: 'assistant',
        });
      }
      setTyping(false);
    }, thinkingTime);
  };

  const handleSuggestionClick = (suggestion: string) => {
    if (activeChatroom) {
      addMessage(activeChatroom.id, {
        content: suggestion,
        role: 'user',
      });
      toast.success('Message sent');
      simulateAIResponse(suggestion);
    }
  };

  const handleSend = (messageContent: string, files?: File[]) => {
    if (!activeChatroom || (!messageContent.trim() && !files?.length)) return;

    let imageUrl: string | undefined = undefined;

    if (files && files.length > 0) {
      const reader = new FileReader();
      reader.onload = (e) => {
        imageUrl = e.target?.result as string;
        
        addMessage(activeChatroom.id, {
          content: messageContent || '📷 Image',
          role: 'user',
          image: imageUrl,
        });

        toast.success('Message sent');
        simulateAIResponse(messageContent);
      };
      reader.readAsDataURL(files[0]);
    } else {
      addMessage(activeChatroom.id, {
        content: messageContent,
        role: 'user',
      });

      toast.success('Message sent');
      simulateAIResponse(messageContent);
    }
  };

  const handleCopy = (content: string) => {
    navigator.clipboard.writeText(content);
    toast.success('Copied to clipboard');
  };

  if (!activeChatroom) {
    return null;
  }

  return (
    <div className="relative min-h-screen overflow-hidden">
      <BackgroundGradient 
        className="dark:opacity-85"
        gradientFrom="hsl(var(--gradient-start))"
        gradientTo="hsl(var(--gradient-end))"
      />
      <div className=" mx-auto p-4">
        <div className="relative z-10 flex flex-col h-[calc(100vh-2rem)] rounded-xl overflow-hidden   backdrop-blur-sm">
          {/* Header */}
          <header className="border-b p-4 flex items-center justify-between">
            <div className="flex items-center gap-3">
              <Button variant="ghost" size="icon" onClick={() => navigate('/dashboard')}>
                <ArrowLeft className="h-5 w-5" />
              </Button>
              <div>
                <h2 className="font-semibold">{activeChatroom.title}</h2>
                <p className="text-sm  ">
                  {activeChatroom.messages.length} messages
                </p>
              </div>
            </div>
          
          </header>

          {/* Messages */}
          <div className="flex-1 overflow-y-auto p-4 space-y-4">
            {activeChatroom.messages.length === 0 ? (
              <div className="h-full flex flex-col items-center justify-center p-8 space-y-8">
                <div className="text-center space-y-6 max-w-2xl animate-fade-in">
                  <div className="inline-flex items-center justify-center w-24 h-24 rounded-3xl bg-card/50 backdrop-blur-sm border border-border/50">
                    <Sparkles className="w-12 h-12 text-primary animate-pulse-slow" />
                  </div>
                  <div className="space-y-3">
                    <h2 className="text-4xl md:text-5xl font-bold">
                      Good to See You!
                    </h2>
                    <p className="text-xl text-muted-foreground font-light">
                      How Can I be an Assistance?
                    </p>
                    <p className="text-sm text-muted-foreground">
                      I'm available 24/7 for you, ask me anything.
                    </p>
                  </div>
                </div>

                {/* Suggestion Chips */}
                <div className="w-full max-w-2xl">
                  <SuggestionChips onSuggestionClick={handleSuggestionClick} />
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
                            : 'gradient-primary text-black'
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
                            ? 'bg-black text-primary-foreground'
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
          <div className=" p-4">
            <div className="max-w-4xl mx-auto">
              <PromptInputBox
                onSend={handleSend}
                isLoading={isTyping}
                placeholder="Ask anything..."
              />
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};