import { Link, useRoute } from 'wouter';
import { CATEGORIES } from '@/lib/constants';
import { Button } from '@/components/ui/button';
import { Plus } from 'lucide-react';

interface SidebarProps {
  onCreatePostClick: () => void;
  isMobile?: boolean;
  onCloseMobile?: () => void;
}

export function Sidebar({ onCreatePostClick, isMobile = false, onCloseMobile }: SidebarProps) {
  // Helper function to get icon component
  const getIcon = (iconName: string) => {
    // This is a simplified way to get Font Awesome icons
    // In a production app, we might use a proper icon library like lucide-react
    return <i className={`fas fa-${iconName} w-5 h-5 mr-3 group-hover:text-primary`} />;
  };

  return (
    <aside className={`${isMobile ? 'w-full' : 'md:w-64 lg:w-72 flex-shrink-0'} pt-4 md:h-screen-minus-header md:sticky md:top-16`}>
      <nav className="space-y-1 mb-6">
        {CATEGORIES.map((category) => {
          const [isActive] = useRoute(category.id === 'all' ? '/' : `/${category.id}`);
          
          return (
            <Link 
              key={category.id} 
              href={category.id === 'all' ? '/' : `/${category.id}`}
              onClick={isMobile && onCloseMobile ? onCloseMobile : undefined}
            >
              <a 
                className={`flex items-center px-4 py-2 rounded-md group ${
                  isActive 
                    ? 'bg-secondary text-foreground' 
                    : 'text-muted-foreground hover:bg-secondary hover:text-foreground'
                }`}
              >
                <i 
                  className={`fas fa-${category.icon} w-5 h-5 mr-3 ${
                    isActive ? 'text-primary' : 'text-muted-foreground group-hover:text-primary'
                  }`}
                />
                <span>{category.name}</span>
              </a>
            </Link>
          );
        })}
      </nav>
      
      <div className="border-t border-border pt-4 pb-8 px-3">
        <Button 
          className="w-full"
          onClick={onCreatePostClick}
        >
          <Plus className="mr-2 h-4 w-4" /> Create Post
        </Button>
      </div>
    </aside>
  );
}
