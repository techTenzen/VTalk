import { useState } from 'react';
import { useLocation, useNavigate } from 'wouter';
import { useUserContext } from './UserProvider';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Search, Bell, Menu } from 'lucide-react';

interface HeaderProps {
  onOpenMobileMenu: () => void;
}

export function Header({ onOpenMobileMenu }: HeaderProps) {
  const { user, getUserInitials } = useUserContext();
  const [, navigate] = useLocation();
  const [searchQuery, setSearchQuery] = useState('');
  const [showMobileSearch, setShowMobileSearch] = useState(false);
  
  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    if (searchQuery.trim()) {
      navigate(`/search?q=${encodeURIComponent(searchQuery.trim())}`);
    }
  };
  
  return (
    <header className="bg-card border-b border-border sticky top-0 z-40">
      <div className="container mx-auto px-4 py-3 flex items-center justify-between">
        {/* Logo */}
        <div className="flex items-center space-x-2">
          <Button 
            variant="ghost" 
            size="icon" 
            className="md:hidden mr-2" 
            onClick={onOpenMobileMenu}
          >
            <Menu className="h-5 w-5" />
          </Button>
          <span 
            className="text-2xl text-primary font-heading font-bold cursor-pointer" 
            onClick={() => navigate('/')}
          >
            V Exchange
          </span>
        </div>
        
        {/* Search bar - desktop */}
        <div className="hidden md:block flex-grow max-w-2xl mx-4">
          <form onSubmit={handleSearch} className="relative">
            <Input
              type="text"
              placeholder="Search posts..."
              className="w-full pl-10 pr-4 py-2 bg-secondary"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
            />
            <Search className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
          </form>
        </div>
        
        {/* User section */}
        <div className="flex items-center space-x-4">
          <Button 
            variant="ghost" 
            size="icon" 
            className="md:hidden" 
            onClick={() => setShowMobileSearch(!showMobileSearch)}
          >
            <Search className="h-5 w-5" />
          </Button>
          
          <Button variant="secondary" size="icon">
            <Bell className="h-5 w-5" />
          </Button>
          
          {user && (
            <div className="avatar w-8 h-8 text-sm">
              {getUserInitials()}
            </div>
          )}
        </div>
      </div>
      
      {/* Mobile search */}
      {showMobileSearch && (
        <div className="md:hidden px-4 py-2 border-t border-border">
          <form onSubmit={handleSearch}>
            <Input
              type="text"
              placeholder="Search posts..."
              className="w-full px-4 py-2 bg-secondary"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
            />
          </form>
        </div>
      )}
    </header>
  );
}
