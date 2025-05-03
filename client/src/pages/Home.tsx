import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { useQuery } from '@tanstack/react-query';
import { fetchPosts } from '@/lib/api';
import { Post } from '@/components/Post';
import { MediaPost } from '@/components/MediaPost';
import { SORT_OPTIONS } from '@/lib/constants';
import { Skeleton } from '@/components/ui/skeleton';
import { Clock, Flame } from 'lucide-react';

export default function Home() {
  const [sort, setSort] = useState<'recent' | 'popular'>('recent');
  
  const { data: posts = [], isLoading } = useQuery({ 
    queryKey: ['/api/posts', { sort }],
    queryFn: () => fetchPosts(undefined, undefined, sort),
  });

  // Function to render the appropriate post component based on category
  const renderPost = (post: any) => {
    if (post.category === 'media_station') {
      return <MediaPost key={post.id} post={post} />;
    }
    return <Post key={post.id} post={post} />;
  };

  return (
    <>
      {/* Sort options */}
      <div className="flex items-center justify-between mb-6">
        <div className="text-xl font-heading font-bold text-foreground">All Posts</div>
        <div className="flex space-x-2">
          <Button
            variant={sort === 'recent' ? 'secondary' : 'ghost'}
            size="sm"
            onClick={() => setSort('recent')}
            className="text-sm"
          >
            <Clock className="h-4 w-4 mr-2" /> Recent
          </Button>
          <Button
            variant={sort === 'popular' ? 'secondary' : 'ghost'}
            size="sm"
            onClick={() => setSort('popular')}
            className="text-sm"
          >
            <Flame className="h-4 w-4 mr-2" /> Popular
          </Button>
        </div>
      </div>
      
      {/* Posts */}
      <div className="space-y-6">
        {isLoading ? (
          // Skeleton loading states
          Array.from({ length: 3 }).map((_, index) => (
            <div key={index} className="bg-card rounded-lg shadow-lg p-4 space-y-4">
              <div className="flex items-center space-x-2">
                <Skeleton className="h-10 w-10 rounded-full" />
                <div className="space-y-2">
                  <Skeleton className="h-4 w-32" />
                  <Skeleton className="h-3 w-24" />
                </div>
              </div>
              <Skeleton className="h-5 w-3/4" />
              <Skeleton className="h-32 w-full rounded-md" />
              <div className="flex space-x-4">
                <Skeleton className="h-6 w-16" />
                <Skeleton className="h-6 w-24" />
              </div>
            </div>
          ))
        ) : posts.length === 0 ? (
          <div className="text-center py-12">
            <p className="text-muted-foreground">No posts found. Be the first to create a post!</p>
          </div>
        ) : (
          posts.map(renderPost)
        )}
      </div>
    </>
  );
}
