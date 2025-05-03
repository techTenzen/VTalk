import { apiRequest } from "./queryClient";

// User API
export const createUser = async (userData: { name: string; email: string; gender: string }) => {
  const response = await apiRequest('POST', '/api/users', userData);
  return response.json();
};

// Posts API
export const fetchPosts = async (category?: string, search?: string, sort?: string) => {
  let url = '/api/posts';
  const params = new URLSearchParams();
  
  if (category && category !== 'all') {
    params.append('category', category);
  } else if (category === 'all') {
    params.append('category', 'all');
  }
  
  if (search) {
    params.append('search', search);
  }
  
  if (sort) {
    params.append('sort', sort);
  }
  
  const queryString = params.toString();
  if (queryString) {
    url += `?${queryString}`;
  }
  
  const response = await apiRequest('GET', url);
  return response.json();
};

export const fetchPostById = async (id: number) => {
  const response = await apiRequest('GET', `/api/posts/${id}`);
  return response.json();
};

export const createPost = async (postData: any) => {
  const response = await apiRequest('POST', '/api/posts', postData);
  return response.json();
};

export const updatePost = async (id: number, postData: any) => {
  const response = await apiRequest('PUT', `/api/posts/${id}`, postData);
  return response.json();
};

export const deletePost = async (id: number) => {
  await apiRequest('DELETE', `/api/posts/${id}`);
  return true;
};

// Comments API
export const fetchComments = async (postId: number) => {
  const response = await apiRequest('GET', `/api/posts/${postId}/comments`);
  return response.json();
};

export const createComment = async (commentData: { post_id: number; content: string; author_id: number }) => {
  const response = await apiRequest('POST', '/api/comments', commentData);
  return response.json();
};

export const updateComment = async (id: number, content: string) => {
  const response = await apiRequest('PUT', `/api/comments/${id}`, { content });
  return response.json();
};

export const deleteComment = async (id: number) => {
  await apiRequest('DELETE', `/api/comments/${id}`);
  return true;
};

// Likes API
export const toggleLike = async (userId: number, postId: number) => {
  const response = await apiRequest('POST', '/api/likes', { user_id: userId, post_id: postId });
  return response.json();
};

// Media Likes API (for Media Station)
export const toggleMediaLike = async (userId: number, postId: number) => {
  const response = await apiRequest('POST', '/api/media-likes', { user_id: userId, post_id: postId });
  return response.json();
};
