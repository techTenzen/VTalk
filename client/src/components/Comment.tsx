import { useState } from 'react';
import { formatDistanceToNow } from 'date-fns';
import { Textarea } from '@/components/ui/textarea';
import { Button } from '@/components/ui/button';
import { 
  DropdownMenu, 
  DropdownMenuContent, 
  DropdownMenuItem, 
  DropdownMenuTrigger 
} from '@/components/ui/dropdown-menu';
import { MoreVertical, Check, X } from 'lucide-react';
import { useUserContext } from './UserProvider';
import { useToast } from '@/hooks/use-toast';
import { updateComment, deleteComment } from '@/lib/api';
import { CommentWithAuthor } from '@shared/schema';

interface CommentProps {
  comment: CommentWithAuthor;
  onCommentUpdated: () => void;
}

export function Comment({ comment, onCommentUpdated }: CommentProps) {
  const { user, getUserInitials } = useUserContext();
  const { toast } = useToast();
  const [isEditing, setIsEditing] = useState(false);
  const [editContent, setEditContent] = useState(comment.content);
  
  const isGossipsPost = comment.post_id.toString().startsWith('gossips-');
  const isAuthor = user?.id === comment.author_id;
  const formattedDate = formatDistanceToNow(new Date(comment.created_at), { addSuffix: true });

  const handleSaveEdit = async () => {
    if (!editContent.trim()) {
      toast({
        title: "Error",
        description: "Comment cannot be empty",
        variant: "destructive",
      });
      return;
    }
    
    try {
      await updateComment(comment.id, editContent);
      setIsEditing(false);
      onCommentUpdated();
      
      toast({
        title: "Success",
        description: "Comment updated successfully",
      });
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to update comment",
        variant: "destructive",
      });
    }
  };

  const handleDelete = async () => {
    try {
      await deleteComment(comment.id);
      onCommentUpdated();
      
      toast({
        title: "Success",
        description: "Comment deleted successfully",
      });
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to delete comment",
        variant: "destructive",
      });
    }
  };

  return (
    <div className="flex items-start space-x-3">
      <div className={`avatar w-7 h-7 text-xs flex-shrink-0 ${isGossipsPost ? 'avatar-anonymous' : ''}`}>
        {isGossipsPost ? (
          <i className="fas fa-user-secret text-xs"></i>
        ) : (
          getUserInitials()
        )}
      </div>
      
      <div className="flex-grow">
        <div className="flex items-center">
          <span className="text-sm font-medium text-foreground">
            {isGossipsPost ? 'Anonymous' : comment.author.name}
          </span>
          <span className="text-xs text-muted-foreground ml-2">{formattedDate}</span>
          
          {isAuthor && (
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button variant="ghost" size="sm" className="h-6 w-6 p-0 ml-auto">
                  <MoreVertical className="h-3 w-3" />
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end">
                <DropdownMenuItem onClick={() => setIsEditing(true)}>
                  Edit
                </DropdownMenuItem>
                <DropdownMenuItem 
                  className="text-destructive"
                  onClick={handleDelete}
                >
                  Delete
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
          )}
        </div>
        
        {isEditing ? (
          <div className="mt-1 space-y-2">
            <Textarea
              value={editContent}
              onChange={(e) => setEditContent(e.target.value)}
              className="min-h-0 text-sm"
            />
            <div className="flex space-x-2">
              <Button 
                size="sm" 
                variant="outline" 
                className="h-7 px-2"
                onClick={handleSaveEdit}
              >
                <Check className="h-3 w-3 mr-1" /> Save
              </Button>
              <Button 
                size="sm" 
                variant="ghost" 
                className="h-7 px-2"
                onClick={() => {
                  setIsEditing(false);
                  setEditContent(comment.content);
                }}
              >
                <X className="h-3 w-3 mr-1" /> Cancel
              </Button>
            </div>
          </div>
        ) : (
          <p className="text-sm text-foreground mt-1">{comment.content}</p>
        )}
      </div>
    </div>
  );
}
