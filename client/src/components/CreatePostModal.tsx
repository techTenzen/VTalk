import { useState, useEffect, useRef } from 'react';
import { 
  Dialog, 
  DialogContent, 
  DialogHeader, 
  DialogTitle,
  DialogFooter,
  DialogClose
} from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Checkbox } from '@/components/ui/checkbox';
import { 
  Select, 
  SelectContent, 
  SelectItem, 
  SelectTrigger, 
  SelectValue 
} from '@/components/ui/select';
import { CATEGORIES, POST_DEFAULTS } from '@/lib/constants';
import { useUserContext } from './UserProvider';
import { useToast } from '@/hooks/use-toast';
import { createPost } from '@/lib/api';
import { useQueryClient } from '@tanstack/react-query';
import imageCompression from 'browser-image-compression';

interface CreatePostModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  initialCategory?: string;
}

export function CreatePostModal({ open, onOpenChange, initialCategory }: CreatePostModalProps) {
  const queryClient = useQueryClient();
  const { user } = useUserContext();
  const { toast } = useToast();
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [postData, setPostData] = useState({
    ...POST_DEFAULTS,
    category: initialCategory || 'technology'
  });
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [isDragging, setIsDragging] = useState(false);
  const [isUploading, setIsUploading] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  // Reset form when modal opens/closes
  useEffect(() => {
    if (open) {
      setPostData({
        ...POST_DEFAULTS,
        category: initialCategory || 'technology'
      });
      setErrors({});
    }
  }, [open, initialCategory]);

  const validateForm = () => {
    const newErrors: Record<string, string> = {};
    
    if (!postData.title.trim() && !isMediaStation) {
      newErrors.title = 'Title is required';
    }
    
    if (!postData.content.trim()) {
      newErrors.content = 'Content is required';
    }
    
    if (postData.category === 'gaming' || postData.category === 'movies' || postData.category === 'music') {
      if (!postData.genre) {
        newErrors.genre = 'Genre is required for this category';
      }
      if (!postData.language) {
        newErrors.language = 'Language is required for this category';
      }
    }
    
    // Skip URL validation for data URLs (uploaded images)
    // and validate normal URLs
    if (postData.media && 
        !postData.media.startsWith('data:') && 
        !isValidUrl(postData.media)) {
      newErrors.media = 'Please enter a valid URL';
    }
    
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };
  
  // Helper function to validate URLs
  const isValidUrl = (urlString: string): boolean => {
    // Special case for common image hosting sites that don't have direct image URLs
    if (urlString.includes('pixabay.com') || 
        urlString.includes('unsplash.com') || 
        urlString.includes('pexels.com') ||
        urlString.includes('flickr.com')) {
      return true;
    }
    
    try {
      // Try to construct URL as-is
      const url = new URL(urlString);
      return url.protocol === 'http:' || url.protocol === 'https:';
    } catch (e) {
      // If that fails, try to add https:// prefix and check again
      try {
        if (!urlString.startsWith('http://') && !urlString.startsWith('https://')) {
          const urlWithPrefix = `https://${urlString}`;
          new URL(urlWithPrefix);
          return true;
        }
        return false;
      } catch (e) {
        return false;
      }
    }
  };
  
  // Helper to normalize URL by adding https:// if needed
  const normalizeUrl = (urlString: string): string => {
    if (!urlString) return urlString;
    
    // Handle common image sites
    // Pixabay
    if (urlString.includes('pixabay.com/photos/')) {
      // Extract the image ID and build a direct URL to the image
      const match = urlString.match(/pixabay\.com\/photos\/([^\/]+)\/([0-9]+)/);
      if (match && match[2]) {
        return `https://pixabay.com/get/g${match[2]}.jpg`;
      }
    }
    
    try {
      new URL(urlString);
      return urlString; // URL is valid as-is
    } catch (e) {
      if (!urlString.startsWith('http://') && !urlString.startsWith('https://')) {
        return `https://${urlString}`;
      }
      return urlString;
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!user) {
      toast({
        title: "Error",
        description: "You must be signed in to create a post",
        variant: "destructive",
      });
      return;
    }
    
    if (!validateForm()) {
      return;
    }
    
    setIsSubmitting(true);
    
    try {
      // Normalize the media URL if provided
      const normalizedPostData = {
        ...postData,
        media: postData.media ? normalizeUrl(postData.media) : postData.media,
        author_id: user.id
      };
      
      await createPost(normalizedPostData);
      
      toast({
        title: "Success",
        description: "Your post has been created successfully.",
      });
      
      // Invalidate queries to refetch posts
      queryClient.invalidateQueries({ queryKey: ['/api/posts'] });
      
      // Close the modal
      onOpenChange(false);
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to create your post. Please try again.",
        variant: "destructive",
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  const updatePostData = (field: string, value: any) => {
    setPostData(prev => ({ ...prev, [field]: value }));
    
    // Clear error for the field if it exists
    if (errors[field]) {
      setErrors(prev => {
        const newErrors = { ...prev };
        delete newErrors[field];
        return newErrors;
      });
    }
  };
  
  // Handle drag events
  const handleDragEnter = (e: React.DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    e.stopPropagation();
    setIsDragging(true);
  };
  
  const handleDragLeave = (e: React.DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    e.stopPropagation();
    setIsDragging(false);
  };
  
  const handleDragOver = (e: React.DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    e.stopPropagation();
    if (!isDragging) {
      setIsDragging(true);
    }
  };
  
  // Process the dropped files
  const handleDrop = async (e: React.DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    e.stopPropagation();
    setIsDragging(false);
    
    const files = e.dataTransfer.files;
    if (files && files.length > 0) {
      await processFile(files[0]);
    }
  };
  
  // Process file from file input
  const handleFileInputChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files;
    if (files && files.length > 0) {
      await processFile(files[0]);
    }
  };
  
  // Process the file and create a URL
  const processFile = async (file: File) => {
    // Check if file is an image
    if (!file.type.match('image/*')) {
      toast({
        title: "Error",
        description: "Only image files are supported",
        variant: "destructive",
      });
      return;
    }
    
    setIsUploading(true);
    
    try {
      // Compress the image
      const options = {
        maxSizeMB: 1,
        maxWidthOrHeight: 1200,
        useWebWorker: true
      };
      
      const compressedFile = await imageCompression(file, options);
      
      // Convert to data URL
      const reader = new FileReader();
      reader.onloadend = () => {
        if (typeof reader.result === 'string') {
          // Clear any existing errors
          setErrors(prev => {
            const newErrors = { ...prev };
            delete newErrors.media;
            return newErrors;
          });
          
          updatePostData('media', reader.result);
          setIsUploading(false);
        }
      };
      reader.onerror = () => {
        toast({
          title: "Error",
          description: "Failed to process image",
          variant: "destructive",
        });
        setIsUploading(false);
      };
      reader.readAsDataURL(compressedFile);
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to process image",
        variant: "destructive",
      });
      setIsUploading(false);
    }
  };

  const showTechFields = postData.category === 'technology';
  const showMediaFields = ['gaming', 'movies', 'music'].includes(postData.category);
  const isMediaStation = postData.category === 'media_station';

  // Get friendly category name for display
  const getCategoryName = (id: string) => {
    const category = CATEGORIES.find(cat => cat.id === id);
    return category ? category.name : 'Unknown Category';
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-2xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="text-xl font-heading font-bold">Create a Post</DialogTitle>
        </DialogHeader>
        
        <form onSubmit={handleSubmit} className="space-y-4">
          {/* Category selection - hide for category-specific pages */}
          {!initialCategory && (
            <div className="space-y-2">
              <Label htmlFor="postCategory">Category</Label>
              <Select 
                value={postData.category} 
                onValueChange={(value) => updatePostData('category', value)}
              >
                <SelectTrigger>
                  <SelectValue placeholder="Select a category" />
                </SelectTrigger>
                <SelectContent>
                  {CATEGORIES.filter(cat => cat.id !== 'all').map((category) => (
                    <SelectItem key={category.id} value={category.id}>
                      {category.name}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          )}
          
          {/* Title - except for Media Station */}
          {!isMediaStation && (
            <div className="space-y-2">
              <Label htmlFor="postTitle">Title</Label>
              <Input
                id="postTitle"
                value={postData.title}
                onChange={(e) => updatePostData('title', e.target.value)}
                placeholder={`What's on your mind about ${getCategoryName(postData.category)}?`}
                className={errors.title ? "border-destructive" : ""}
              />
              {errors.title && <p className="text-xs text-destructive">{errors.title}</p>}
            </div>
          )}
          
          {/* Content */}
          <div className="space-y-2">
            <Label htmlFor="postContent">Content</Label>
            <Textarea
              id="postContent"
              rows={5}
              value={postData.content}
              onChange={(e) => updatePostData('content', e.target.value)}
              placeholder={isMediaStation ? "Add a caption..." : "Write your post content here..."}
              className={errors.content ? "border-destructive" : ""}
            />
            {errors.content && <p className="text-xs text-destructive">{errors.content}</p>}
          </div>
          
          {/* Tech-specific fields */}
          {showTechFields && (
            <div className="p-3 border border-border rounded-md bg-secondary bg-opacity-30">
              <div className="flex items-center space-x-2">
                <Checkbox 
                  id="isIdea" 
                  checked={postData.is_idea}
                  onCheckedChange={(checked) => updatePostData('is_idea', checked)}
                />
                <Label htmlFor="isIdea" className="cursor-pointer">Mark as Idea</Label>
              </div>
              <p className="text-xs text-muted-foreground mt-1">
                Ideas are highlighted and receive special visibility.
              </p>
            </div>
          )}
          
          {/* Gaming/Movies/Music specific fields */}
          {showMediaFields && (
            <div className="p-3 border border-border rounded-md bg-secondary bg-opacity-30 space-y-3">
              <div className="space-y-2">
                <Label htmlFor="genre">Genre</Label>
                <Input
                  id="genre"
                  value={postData.genre}
                  onChange={(e) => updatePostData('genre', e.target.value)}
                  placeholder="e.g. MMORPG, Action, Pop, etc."
                  className={errors.genre ? "border-destructive" : ""}
                />
                {errors.genre && <p className="text-xs text-destructive">{errors.genre}</p>}
              </div>
              <div className="space-y-2">
                <Label htmlFor="language">Language</Label>
                <Input
                  id="language"
                  value={postData.language}
                  onChange={(e) => updatePostData('language', e.target.value)}
                  placeholder="e.g. English, Spanish, etc."
                  className={errors.language ? "border-destructive" : ""}
                />
                {errors.language && <p className="text-xs text-destructive">{errors.language}</p>}
              </div>
            </div>
          )}
          
          {/* Media upload - with drag & drop support */}
          <div className="space-y-2">
            <Label>Media (optional)</Label>
            <div 
              className={`border-2 border-dashed rounded-md p-8 text-center transition-colors 
                ${isDragging 
                  ? "border-primary bg-primary bg-opacity-5" 
                  : "border-border hover:border-primary hover:bg-primary hover:bg-opacity-5"}`}
              onDragEnter={handleDragEnter}
              onDragOver={handleDragOver}
              onDragLeave={handleDragLeave}
              onDrop={handleDrop}
            >
              <div className="flex flex-col items-center">
                <i className="fas fa-cloud-upload-alt text-2xl text-muted-foreground mb-2"></i>
                {isUploading ? (
                  <p className="text-muted-foreground mb-2">Processing image...</p>
                ) : (
                  <>
                    <p className="text-muted-foreground mb-2">
                      Drag and drop an image here, or
                    </p>
                    <div className="mt-2 mb-4">
                      <input
                        ref={fileInputRef}
                        type="file"
                        accept="image/*"
                        className="hidden"
                        onChange={handleFileInputChange}
                      />
                      <Button 
                        type="button" 
                        variant="secondary" 
                        size="sm"
                        onClick={() => fileInputRef.current?.click()}
                      >
                        Choose File
                      </Button>
                    </div>
                    <div className="my-2 flex items-center">
                      <div className="border-t border-border flex-grow" />
                      <span className="mx-4 text-xs text-muted-foreground">OR</span>
                      <div className="border-t border-border flex-grow" />
                    </div>
                    <p className="text-muted-foreground mb-2">Enter an image URL</p>
                    <Input
                      id="media"
                      type="text"
                      value={postData.media}
                      onChange={(e) => updatePostData('media', e.target.value)}
                      placeholder="https://example.com/image.jpg"
                      className={`max-w-sm mb-2 ${errors.media ? "border-destructive" : ""}`}
                    />
                    {errors.media && <p className="text-xs text-destructive">{errors.media}</p>}
                  </>
                )}
                
                {postData.media && (
                  <div className="mt-4 max-w-sm">
                    <p className="text-sm text-foreground mb-2">Preview:</p>
                    <div className="border border-border rounded-md p-2 bg-background">
                      <img 
                        src={postData.media}
                        alt="Media preview" 
                        className="max-h-52 object-contain mx-auto"
                        onError={(e) => {
                          const target = e.target as HTMLImageElement;
                          target.onerror = null;
                          target.src = "https://placehold.co/600x400?text=Invalid+Image+URL";
                        }}
                      />
                    </div>
                  </div>
                )}
                <p className="text-xs text-muted-foreground mt-4">
                  Supported formats: JPG, PNG, GIF, WebP
                </p>
              </div>
            </div>
          </div>
          
          <DialogFooter>
            <DialogClose asChild>
              <Button type="button" variant="outline">Cancel</Button>
            </DialogClose>
            <Button 
              type="submit" 
              disabled={isSubmitting}
            >
              {isSubmitting ? "Creating..." : "Create Post"}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}
