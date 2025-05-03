import { useState } from 'react';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { useUserContext } from './UserProvider';
import { useToast } from '@/hooks/use-toast';
import { createComment } from '@/lib/api';

interface CreateCommentFormProps {
  postId: number;
  onCommentAdded: () => void;
}

export function CreateCommentForm({ postId, onCommentAdded }: CreateCommentFormProps) {
  const { user, getUserInitials } = useUserContext();
  const { toast } = useToast();
  const [content, setContent] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!user) {
      toast({
        title: "Authentication required",
        description: "You must be logged in to comment",
        variant: "destructive",
      });
      return;
    }
    
    if (!content.trim()) {
      toast({
        title: "Error",
        description: "Comment cannot be empty",
        variant: "destructive",
      });
      return;
    }
    
    setIsSubmitting(true);
    
    try {
      await createComment({
        post_id: postId,
        content: content.trim(),
        author_id: user.id
      });
      
      setContent('');
      onCommentAdded();
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to add comment",
        variant: "destructive",
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <form onSubmit={handleSubmit} className="flex items-center space-x-2">
      <div className="avatar w-7 h-7 text-xs">
        {getUserInitials()}
      </div>
      <Input
        type="text"
        placeholder="Add a comment..."
        className="flex-grow p-2 text-sm"
        value={content}
        onChange={(e) => setContent(e.target.value)}
        disabled={isSubmitting}
      />
      <Button
        type="submit"
        size="sm"
        variant="ghost"
        className="px-2"
        disabled={!content.trim() || isSubmitting}
      >
        Post
      </Button>
    </form>
  );
}
