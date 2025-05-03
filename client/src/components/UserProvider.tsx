import { createContext, ReactNode, useContext } from 'react';
import { useUser, UserInfo } from '@/hooks/useUser';

interface UserContextType {
  user: UserInfo | null;
  isFirstVisit: boolean;
  isLoading: boolean;
  registerUser: (userData: { name: string; email: string; gender: string }) => Promise<UserInfo>;
  getUserInitials: () => string;
}

const UserContext = createContext<UserContextType | undefined>(undefined);

export function UserProvider({ children }: { children: ReactNode }) {
  const userValues = useUser();
  
  return (
    <UserContext.Provider value={userValues}>
      {children}
    </UserContext.Provider>
  );
}

export function useUserContext() {
  const context = useContext(UserContext);
  
  if (context === undefined) {
    throw new Error('useUserContext must be used within a UserProvider');
  }
  
  return context;
}
