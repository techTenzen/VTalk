import { useState, useEffect } from 'react';
import { useUser as useClerkUser, useSession } from '@clerk/clerk-react'; // Import Clerk hooks

export interface UserInfo {
  id: number;
  name: string;
  email: string;
  gender: string;
}

export function useUser() {
  const { user, isLoaded, isSignedIn } = useClerkUser(); // Clerk's user hook
  const { session } = useSession(); // Clerk's session hook
  const [isFirstVisit, setIsFirstVisit] = useState(false);

  // Effect for checking first visit status
  useEffect(() => {
    if (isLoaded && !isSignedIn) {
      // If the user is not signed in, they are a first-time visitor
      setIsFirstVisit(true);
    } else {
      // If the user is signed in, they are not a first-time visitor
      setIsFirstVisit(false);
    }
  }, [isLoaded, isSignedIn]);

  // Register a new user (if needed)
  const registerUser = async (userData: { name: string; email: string; gender: string }) => {
    try {
      // You can use Clerk's SignUp or SignIn methods, but for simplicity let's assume
      // the user registration is done via Clerk's API (like SignUp method).
      // Assuming `createUser` is a backend API for registering the user:

      // Clerk's createUser logic could be replaced by SignUp logic if applicable.
      // Clerk will handle authentication automatically.
      // setUserInfo(userData); This is not needed as Clerk handles session.

      setIsFirstVisit(false); // Set first visit to false once the user has registered
    } catch (error) {
      console.error('Failed to register user:', error);
      throw error;
    }
  };

  // Getting user initials from the name (if applicable)
  const getUserInitials = () => {
    if (!user?.firstName) return '';

    return user.firstName
        .split(' ')
        .map(name => name.charAt(0))
        .join('')
        .toUpperCase()
        .substring(0, 2);
  };

  return {
    user, // Clerk's user object
    isFirstVisit,
    isLoading: !isLoaded, // Loader state based on Clerk's loading state
    registerUser,
    getUserInitials
  };
}
