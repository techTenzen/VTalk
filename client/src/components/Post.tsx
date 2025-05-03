import { useState } from 'react';
import { formatDistanceToNow } from 'date-fns';
import { LightbulbIcon, ArrowUp, MessageSquare, Share2, MoreVertical } from 'lucide-react';
import { 
  DropdownMenu, 
  DropdownMenuContent, 
  DropdownMenuItem, 
  DropdownMenuTrigger 
} from '@/components/ui/dropdown-menu';
import { Button } from '@/components/ui/button';
import { useUserContext } from './UserProvider';
import { useToast } from '@/hooks/use-toast';
import { toggleLike, deletePost } from '@/lib/api';
import { useQueryClient } from '@tanstack/react-query';
import { CommentSection } from './CommentSection';
import { PostWithRelations } from '@shared/schema';
import { CATEGORIES } from '@/lib/constants';
import { Badge } from '@/components/ui/badge';

interface PostProps {
  post: PostWithRelations;
  onEdit?: (post: PostWithRelations) => void;
}

export function Post({ post, onEdit }: PostProps) {
  const { user, getUserInitials } = useUserContext();
  const { toast } = useToast();
  const queryClient = useQueryClient();
  const [showComments, setShowComments] = useState(false);
  const [isLiked, setIsLiked] = useState(false);
  const [likesCount, setLikesCount] = useState(post._count?.likes || 0);

  const isGossipsCategory = post.category === 'gossips';
  const isMediaStation = post.category === 'media_station';
  const isAuthor = user?.id === post.author_id;
  const showCommentsButton = post.category !== 'media_station';

  // Format date
  const formattedDate = formatDistanceToNow(new Date(post.created_at), { addSuffix: true });

  // Get category name for display
  const getCategoryName = (categoryId: string) => {
    const category = CATEGORIES.find(cat => cat.id === categoryId);
    return category ? category.name : categoryId;
  };

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
      const result = await toggleLike(user.id, post.id);
      
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
        description: "Failed to like post",
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
        description: "Post deleted successfully",
      });
      
      // Invalidate queries to refetch posts
      queryClient.invalidateQueries({ queryKey: ['/api/posts'] });
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to delete post",
        variant: "destructive",
      });
    }
  };

  return (
    <div className={`bg-card rounded-lg shadow-lg overflow-hidden ${post.is_idea ? 'post-idea' : ''}`}>
      <div className="p-4">
        {/* Post header */}
        <div className="flex items-center justify-between mb-2">
          <div className="flex items-center space-x-2">
            <div className={`avatar w-8 h-8 text-sm ${isGossipsCategory ? 'avatar-anonymous' : ''}`}>
              {isGossipsCategory ? (
                <i className="fas fa-user-secret"></i>
              ) : (
                getUserInitials()
              )}
            </div>
            <div>
              <div className="text-sm font-medium text-foreground">
                {isGossipsCategory ? 'Anonymous' : post.author.name}
              </div>
              <div className="text-xs text-muted-foreground">
                {formattedDate} • {getCategoryName(post.category)}
              </div>
            </div>
          </div>
          
          {/* Idea tag or Post actions */}
          <div className="flex items-center space-x-2">
            {post.is_idea && (
              <div className="px-2 py-1 bg-amber-500 bg-opacity-20 rounded-md text-amber-400 text-xs font-medium">
                <LightbulbIcon className="h-3 w-3 inline mr-1" /> Idea
              </div>
            )}
            
            {isAuthor && (
              <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <Button variant="ghost" size="sm">
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
        </div>
        
        {/* Post title - except for Media Station */}
        {!isMediaStation && (
          <h3 className="text-lg font-semibold text-foreground mb-2">{post.title}</h3>
        )}
        
        {/* Post content */}
        <div className="text-foreground mb-4">{post.content}</div>
        
        {/* Genre and language tags for specific categories */}
        {(post.genre || post.language) && (
          <div className="flex flex-wrap gap-2 mb-4">
            {post.genre && (
              <Badge variant="secondary" className="text-xs">
                #{post.genre}
              </Badge>
            )}
            {post.language && (
              <Badge variant="secondary" className="text-xs">
                #{post.language}
              </Badge>
            )}
          </div>
        )}
        
        {/* Post media */}
        {post.media && (
          <div className="rounded-md overflow-hidden mb-4 bg-muted">
            <img 
              src={post.media} 
              alt="Post media" 
              className="w-full h-64 object-cover" 
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
                  target.style.height = "100px";
                  target.style.objectFit = "contain";
                  target.style.padding = "1rem";
                  target.src = "https://placehold.co/600x400?text=Invalid+Image+URL";
                }
              }}
            />
          </div>
        )}
        
        {/* Post actions */}
        <div className="flex items-center justify-between">
          <div className="flex space-x-4">
            <Button 
              variant="ghost" 
              size="sm" 
              className={`flex items-center space-x-1 ${isLiked ? 'text-primary' : 'text-muted-foreground hover:text-primary'}`}
              onClick={handleLikeClick}
            >
              <ArrowUp className="h-4 w-4" />
              <span>{likesCount}</span>
            </Button>
            
            {showCommentsButton && (
              <Button
                variant="ghost"
                size="sm"
                className="flex items-center space-x-1 text-muted-foreground hover:text-foreground"
                onClick={() => setShowComments(!showComments)}
              >
                <MessageSquare className="h-4 w-4" />
                <span>{post._count?.comments || 0} comments</span>
              </Button>
            )}
          </div>
          
          <Button variant="ghost" size="sm" className="text-muted-foreground hover:text-foreground">
            <Share2 className="h-4 w-4" />
          </Button>
        </div>
      </div>
      
      {/* Comments section */}
      {showComments && !isMediaStation && (
        <CommentSection postId={post.id} />
      )}
    </div>
  );
}
