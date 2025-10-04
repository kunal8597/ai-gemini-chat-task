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
      <header className="border-b bg-card/50 backdrop-blur-sm sticky top-0 z-10">
        <div className="container mx-auto px-4 py-4 flex items-center justify-between">
          <h1 className="text-2xl font-bold gradient-text">Gemini Chat</h1>
          <div className="flex items-center gap-2">
            <Button
              variant="ghost"
              size="icon"
              onClick={toggleTheme}
              aria-label="Toggle theme"
            >
              {isDark ? <Sun className="h-5 w-5" /> : <Moon className="h-5 w-5" />}
            </Button>
            <Button variant="ghost" size="icon" onClick={handleLogout} aria-label="Logout">
              <LogOut className="h-5 w-5" />
            </Button>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="container mx-auto px-4 py-8">
        <div className="max-w-4xl mx-auto space-y-6">
          {/* Search and Create */}
          <div className="flex flex-col sm:flex-row gap-4">
            <div className="relative flex-1">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
              <Input
                placeholder="Search chatrooms..."
                value={searchQuery}
                onChange={(e) => handleSearchChange(e.target.value)}
                className="pl-10"
              />
            </div>
            <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
              <DialogTrigger asChild>
                <Button className="gradient-primary">
                  <Plus className="mr-2 h-4 w-4" />
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
          <div className="space-y-4">
            {filteredChatrooms.length === 0 ? (
              <div className="text-center py-16 space-y-4">
                <div className="inline-flex items-center justify-center w-20 h-20 rounded-full bg-muted">
                  <MessageSquare className="w-10 h-10 text-muted-foreground" />
                </div>
                <div>
                  <h3 className="text-xl font-semibold mb-2">No chatrooms yet</h3>
                  <p className="text-muted-foreground">
                    {searchQuery
                      ? 'No chatrooms match your search'
                      : 'Create your first chatroom to start chatting with AI'}
                  </p>
                </div>
              </div>
            ) : (
              filteredChatrooms.map((room) => (
                <div
                  key={room.id}
                  className="bg-card border rounded-lg p-4 hover:border-primary/50 transition-all cursor-pointer group animate-slide-up"
                  onClick={() => handleOpenChat(room.id)}
                >
                  <div className="flex items-start justify-between">
                    <div className="flex-1">
                      <h3 className="font-semibold text-lg mb-1">{room.title}</h3>
                      <p className="text-sm text-muted-foreground">
                        {room.messages.length} messages •{' '}
                        {new Date(room.createdAt).toLocaleDateString()}
                      </p>
                    </div>
                    <AlertDialog>
                      <AlertDialogTrigger asChild>
                        <Button
                          variant="ghost"
                          size="icon"
                          className="opacity-0 group-hover:opacity-100 transition-opacity"
                          onClick={(e) => e.stopPropagation()}
                        >
                          <Trash2 className="h-4 w-4 text-destructive" />
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
