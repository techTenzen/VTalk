import { useState, useEffect } from 'react';
import { CreateCommentForm } from './CreateCommentForm';
import { Comment } from './Comment';
import { useToast } from '@/hooks/use-toast';
import { fetchComments } from '@/lib/api';
import { useQuery } from '@tanstack/react-query';

interface CommentSectionProps {
  postId: number;
}

export function CommentSection({ postId }: CommentSectionProps) {
  const { toast } = useToast();
  
  const { 
    data: comments = [], 
    isLoading, 
    error,
    refetch
  } = useQuery({
    queryKey: [`/api/posts/${postId}/comments`],
    queryFn: () => fetchComments(postId),
  });

  useEffect(() => {
    if (error) {
      toast({
        title: "Error",
        description: "Failed to load comments",
        variant: "destructive",
      });
    }
  }, [error, toast]);

  const handleCommentAdded = () => {
    refetch();
  };

  return (
    <div className="bg-secondary bg-opacity-30 p-4 border-t border-border">
      {isLoading ? (
        <div className="flex justify-center py-4">
          <p className="text-muted-foreground">Loading comments...</p>
        </div>
      ) : (
        <div className="mb-4 space-y-3">
          {comments.length === 0 ? (
            <p className="text-muted-foreground text-center py-2">No comments yet. Be the first to comment!</p>
          ) : (
            comments.map(comment => (
              <Comment 
                key={comment.id} 
                comment={comment} 
                onCommentUpdated={refetch}
              />
            ))
          )}
        </div>
      )}
      
      <CreateCommentForm postId={postId} onCommentAdded={handleCommentAdded} />
    </div>
  );
}
