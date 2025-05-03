import { useState, useEffect } from 'react';
import { USER_STORAGE_KEY } from '@/lib/constants';
import { createUser } from '@/lib/api';

export interface UserInfo {
  id: number;
  name: string;
  email: string;
  gender: string;
}

export function useUser() {
  const [userInfo, setUserInfo] = useState<UserInfo | null>(null);
  const [isFirstVisit, setIsFirstVisit] = useState(false);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const storedUser = localStorage.getItem(USER_STORAGE_KEY);
    
    if (storedUser) {
      try {
        setUserInfo(JSON.parse(storedUser));
      } catch (e) {
        console.error('Failed to parse user info from localStorage', e);
        setIsFirstVisit(true);
      }
    } else {
      setIsFirstVisit(true);
    }
    
    setIsLoading(false);
  }, []);

  const registerUser = async (userData: { name: string; email: string; gender: string }) => {
    try {
      const user = await createUser(userData);
      setUserInfo(user);
      localStorage.setItem(USER_STORAGE_KEY, JSON.stringify(user));
      setIsFirstVisit(false);
      return user;
    } catch (error) {
      console.error('Failed to register user:', error);
      throw error;
    }
  };

  const getUserInitials = () => {
    if (!userInfo?.name) return '';
    
    return userInfo.name
      .split(' ')
      .map(name => name.charAt(0))
      .join('')
      .toUpperCase()
      .substring(0, 2);
  };

  return {
    user: userInfo,
    isFirstVisit,
    isLoading,
    registerUser,
    getUserInitials
  };
}
