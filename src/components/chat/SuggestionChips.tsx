import { Button } from '@/components/ui/button';
import { Lightbulb, Youtube, BookOpen, MoreHorizontal } from 'lucide-react';

interface SuggestionChipsProps {
  onSuggestionClick: (suggestion: string) => void;
}

export const SuggestionChips = ({ onSuggestionClick }: SuggestionChipsProps) => {
  const suggestions = [
    { icon: Lightbulb, text: 'Any advice for me?' },
    { icon: Youtube, text: 'Some youtube video idea' },
    { icon: BookOpen, text: 'Life lessons from kratos' },
  ];

  return (
    <div className="flex flex-wrap gap-2 justify-center">
      {suggestions.map((suggestion, index) => (
        <Button
          key={index}
          variant="outline"
          className="h-auto py-3 px-4 rounded-full bg-card/50 border-border/50 hover:bg-card hover:border-primary/50 transition-all"
          onClick={() => onSuggestionClick(suggestion.text)}
        >
          <suggestion.icon className="w-4 h-4 mr-2" />
          <span className="text-sm">{suggestion.text}</span>
        </Button>
      ))}
      <Button
        variant="outline"
        size="icon"
        className="h-12 w-12 rounded-full bg-card/50 border-border/50 hover:bg-card hover:border-primary/50 transition-all"
      >
        <MoreHorizontal className="w-5 h-5" />
      </Button>
    </div>
  );
};
