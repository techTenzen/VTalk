import { useUserContext } from './UserProvider';

export function WelcomeBanner() {
  const { user } = useUserContext();
  
  if (!user) return null;
  
  return (
    <div className="bg-secondary border-b border-border p-3 text-center">
      <p className="text-foreground">
        Welcome back, <span className="font-semibold">{user.name}</span>!
      </p>
    </div>
  );
}
