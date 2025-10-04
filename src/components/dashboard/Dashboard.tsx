import { useState } from 'react';
import { useChatStore } from '@/stores/chatStore';
import { useAuthStore } from '@/stores/authStore';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from '@/components/ui/dialog';
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from '@/components/ui/alert-dialog';
import { Label } from '@/components/ui/label';
import { Plus, MessageSquare, Trash2, Moon, Sun, LogOut, Search } from 'lucide-react';
import { useThemeStore } from '@/stores/themeStore';
import { toast } from 'sonner';
import { useNavigate } from 'react-router-dom';

export const Dashboard = () => {
  const [newChatTitle, setNewChatTitle] = useState('');
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [debouncedSearch, setDebouncedSearch] = useState('');

  const chatrooms = useChatStore((state) => state.chatrooms);
  const createChatroom = useChatStore((state) => state.createChatroom);
  const deleteChatroom = useChatStore((state) => state.deleteChatroom);
  const setActiveChatroom = useChatStore((state) => state.setActiveChatroom);
  const logout = useAuthStore((state) => state.logout);
  const isDark = useThemeStore((state) => state.isDark);
  const toggleTheme = useThemeStore((state) => state.toggleTheme);
  const navigate = useNavigate();

  // Debounced search
  const handleSearchChange = (value: string) => {
    setSearchQuery(value);
    setTimeout(() => {
      setDebouncedSearch(value);
    }, 300);
  };

  const filteredChatrooms = chatrooms.filter((room) =>
    room.title.toLowerCase().includes(debouncedSearch.toLowerCase())
  );

  const handleCreateChat = () => {
    if (newChatTitle.trim()) {
      createChatroom(newChatTitle);
      setNewChatTitle('');
      setIsDialogOpen(false);
      toast.success('Chatroom created!');
      const createdRoom = chatrooms[chatrooms.length];
      navigate('/chat');
    }
  };

  const handleDeleteChat = (id: string, title: string) => {
    deleteChatroom(id);
    toast.success(`Deleted "${title}"`);
  };

  const handleOpenChat = (id: string) => {
    setActiveChatroom(id);
    navigate('/chat');
  };

  const handleLogout = () => {
    logout();
    toast.success('Logged out successfully');
  };

  return (
    <div className="min-h-screen bg-background">
      {/* Header */}
      <header className="border-b bg-card/30 backdrop-blur-md sticky top-0 z-10">
        <div className="container mx-auto px-4 py-5 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-2xl bg-primary/10 flex items-center justify-center">
              <MessageSquare className="w-5 h-5 text-primary" />
            </div>
            <h1 className="text-2xl font-bold gradient-text">Gemini Chat</h1>
          </div>
          <div className="flex items-center gap-2">
            <Button
              variant="ghost"
              size="icon"
              onClick={toggleTheme}
              aria-label="Toggle theme"
              className="rounded-xl"
            >
              {isDark ? <Sun className="h-5 w-5" /> : <Moon className="h-5 w-5" />}
            </Button>
            <Button 
              variant="ghost" 
              size="icon" 
              onClick={handleLogout} 
              aria-label="Logout"
              className="rounded-xl"
            >
              <LogOut className="h-5 w-5" />
            </Button>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="container mx-auto px-4 py-8">
        <div className="max-w-4xl mx-auto space-y-6">
          {/* Search and Create */}
          <div className="flex flex-col sm:flex-row gap-4 animate-slide-up">
            <div className="relative flex-1">
              <Search className="absolute left-4 top-1/2 -translate-y-1/2 h-5 w-5 text-muted-foreground" />
              <Input
                placeholder="Search chatrooms..."
                value={searchQuery}
                onChange={(e) => handleSearchChange(e.target.value)}
                className="pl-12 h-12 bg-card/50 border-border/50 rounded-xl"
              />
            </div>
            <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
              <DialogTrigger asChild>
                <Button className="gradient-primary h-12 px-6 rounded-xl hover:opacity-90 transition-opacity">
                  <Plus className="mr-2 h-5 w-5" />
                  New Chat
                </Button>
              </DialogTrigger>
              <DialogContent>
                <DialogHeader>
                  <DialogTitle>Create New Chatroom</DialogTitle>
                  <DialogDescription>
                    Give your new chatroom a name to get started.
                  </DialogDescription>
                </DialogHeader>
                <div className="space-y-4 py-4">
                  <div className="space-y-2">
                    <Label htmlFor="title">Chatroom Title</Label>
                    <Input
                      id="title"
                      placeholder="e.g., Project Ideas"
                      value={newChatTitle}
                      onChange={(e) => setNewChatTitle(e.target.value)}
                      onKeyDown={(e) => {
                        if (e.key === 'Enter') handleCreateChat();
                      }}
                    />
                  </div>
                </div>
                <DialogFooter>
                  <Button onClick={handleCreateChat} disabled={!newChatTitle.trim()}>
                    Create
                  </Button>
                </DialogFooter>
              </DialogContent>
            </Dialog>
          </div>

          {/* Chatrooms List */}
          <div className="space-y-3">
            {filteredChatrooms.length === 0 ? (
              <div className="text-center py-20 space-y-6 animate-fade-in">
                <div className="inline-flex items-center justify-center w-24 h-24 rounded-3xl bg-card/50 backdrop-blur-sm border border-border/50">
                  <MessageSquare className="w-12 h-12 text-muted-foreground" />
                </div>
                <div className="space-y-2">
                  <h3 className="text-2xl font-semibold">No chatrooms yet</h3>
                  <p className="text-muted-foreground max-w-md mx-auto">
                    {searchQuery
                      ? 'No chatrooms match your search. Try different keywords.'
                      : 'Create your first chatroom to start having intelligent conversations with AI'}
                  </p>
                </div>
              </div>
            ) : (
              filteredChatrooms.map((room, index) => (
                <div
                  key={room.id}
                  className="bg-card/50 backdrop-blur-sm border border-border/50 rounded-2xl p-5 hover:border-primary/50 hover:bg-card/70 transition-all cursor-pointer group"
                  onClick={() => handleOpenChat(room.id)}
                  style={{ animationDelay: `${index * 50}ms` }}
                >
                  <div className="flex items-start justify-between gap-4">
                    <div className="flex-1 min-w-0">
                      <h3 className="font-semibold text-lg mb-2 truncate">{room.title}</h3>
                      <div className="flex items-center gap-3 text-sm text-muted-foreground">
                        <span className="flex items-center gap-1">
                          <MessageSquare className="h-3.5 w-3.5" />
                          {room.messages.length}
                        </span>
                        <span>•</span>
                        <span>{new Date(room.createdAt).toLocaleDateString()}</span>
                      </div>
                    </div>
                    <AlertDialog>
                      <AlertDialogTrigger asChild>
                        <Button
                          variant="ghost"
                          size="icon"
                          className="opacity-0 group-hover:opacity-100 transition-all rounded-xl hover:bg-destructive/10 shrink-0"
                          onClick={(e) => e.stopPropagation()}
                        >
                          <Trash2 className="h-5 w-5 text-destructive" />
                        </Button>
                      </AlertDialogTrigger>
                      <AlertDialogContent>
                        <AlertDialogHeader>
                          <AlertDialogTitle>Delete Chatroom?</AlertDialogTitle>
                          <AlertDialogDescription>
                            This will permanently delete "{room.title}" and all its messages.
                            This action cannot be undone.
                          </AlertDialogDescription>
                        </AlertDialogHeader>
                        <AlertDialogFooter>
                          <AlertDialogCancel>Cancel</AlertDialogCancel>
                          <AlertDialogAction
                            onClick={(e) => {
                              e.stopPropagation();
                              handleDeleteChat(room.id, room.title);
                            }}
                            className="bg-destructive hover:bg-destructive/90"
                          >
                            Delete
                          </AlertDialogAction>
                        </AlertDialogFooter>
                      </AlertDialogContent>
                    </AlertDialog>
                  </div>
                </div>
              ))
            )}
          </div>
        </div>
      </main>
    </div>
  );
};
