import { useState } from 'react';
import { formatDistanceToNow } from 'date-fns';
import { Heart, MoreVertical } from 'lucide-react';
import { 
  DropdownMenu, 
  DropdownMenuContent, 
  DropdownMenuItem, 
  DropdownMenuTrigger 
} from '@/components/ui/dropdown-menu';
import { Button } from '@/components/ui/button';
import { useUserContext } from './UserProvider';
import { useToast } from '@/hooks/use-toast';
import { toggleMediaLike, deletePost } from '@/lib/api';
import { useQueryClient } from '@tanstack/react-query';
import { PostWithRelations } from '@shared/schema';

interface MediaPostProps {
  post: PostWithRelations;
  onEdit?: (post: PostWithRelations) => void;
}

export function MediaPost({ post, onEdit }: MediaPostProps) {
  const { user, getUserInitials } = useUserContext();
  const { toast } = useToast();
  const queryClient = useQueryClient();
  const [isLiked, setIsLiked] = useState(false);
  const [likesCount, setLikesCount] = useState(post._count?.likes || 0);

  const isAuthor = user?.id === post.author_id;

  // Format date
  const formattedDate = formatDistanceToNow(new Date(post.created_at), { addSuffix: true });

  const handleLikeClick = async () => {
    if (!user) {
      toast({
        title: "Authentication required",
        description: "You must be logged in to like posts",
        variant: "destructive",
      });
      return;
    }

    try {
      const result = await toggleMediaLike(user.id, post.id);
      
      if (result.liked) {
        setIsLiked(true);
        setLikesCount(prev => prev + 1);
      } else {
        setIsLiked(false);
        setLikesCount(prev => Math.max(0, prev - 1));
      }
      
      // Invalidate queries to refetch posts
      queryClient.invalidateQueries({ queryKey: ['/api/posts'] });
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to like media",
        variant: "destructive",
      });
    }
  };

  const handleDeletePost = async () => {
    if (!isAuthor) return;
    
    try {
      await deletePost(post.id);
      
      toast({
        title: "Success",
        description: "Media post deleted successfully",
      });
      
      // Invalidate queries to refetch posts
      queryClient.invalidateQueries({ queryKey: ['/api/posts'] });
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to delete media post",
        variant: "destructive",
      });
    }
  };

  return (
    <div className="bg-card rounded-lg shadow-lg overflow-hidden">
      <div className="p-4">
        {/* Post header */}
        <div className="flex items-center space-x-2 mb-3">
          <div className="avatar w-8 h-8 text-sm">
            {getUserInitials()}
          </div>
          <div>
            <div className="text-sm font-medium text-foreground">{post.author.name}</div>
            <div className="text-xs text-muted-foreground">{formattedDate} • Media Station</div>
          </div>
          
          {isAuthor && (
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button variant="ghost" size="sm" className="ml-auto">
                  <MoreVertical className="h-4 w-4" />
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end">
                {onEdit && (
                  <DropdownMenuItem onClick={() => onEdit(post)}>
                    Edit
                  </DropdownMenuItem>
                )}
                <DropdownMenuItem 
                  className="text-destructive"
                  onClick={handleDeletePost}
                >
                  Delete
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
          )}
        </div>
        
        {/* Media */}
        {post.media && (
          <div className="rounded-md overflow-hidden mb-3 bg-muted">
            <img 
              src={post.media} 
              alt="Media content" 
              className="w-full h-80 object-cover" 
              onError={(e) => {
                const target = e.target as HTMLImageElement;
                target.onerror = null;
                
                // Try to fix common problematic image URLs
                const originalSrc = target.src;
                let success = false;
                
                // Check if it's a Pixabay URL
                if (originalSrc.includes('pixabay.com/photos/')) {
                  const match = originalSrc.match(/pixabay\.com\/photos\/([^\/]+)\/([0-9]+)/);
                  if (match && match[2]) {
                    target.src = `https://pixabay.com/get/g${match[2]}.jpg`;
                    success = true;
                  }
                }
                
                // If our fixes don't work, show fallback
                if (!success) {
                  target.style.height = "120px";
                  target.style.objectFit = "contain";
                  target.style.padding = "1rem";
                  target.src = "https://placehold.co/600x400?text=Image+Not+Available";
                }
              }}
            />
          </div>
        )}
        
        {/* Caption */}
        <div className="text-foreground mb-4">{post.content}</div>
        
        {/* Likes */}
        <div className="flex items-center space-x-2">
          <Button 
            variant="ghost" 
            size="sm" 
            className={isLiked ? 'text-red-500 hover:text-red-400' : 'text-muted-foreground hover:text-red-500'}
            onClick={handleLikeClick}
          >
            <Heart className="h-4 w-4" />
          </Button>
          <span className="text-foreground">{likesCount} likes</span>
        </div>
      </div>
    </div>
  );
}
