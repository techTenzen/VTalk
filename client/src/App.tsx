import { useState } from 'react';
import { Switch, Route } from "wouter";
import { queryClient } from "./lib/queryClient";
import { QueryClientProvider } from "@tanstack/react-query";
import { Toaster } from "@/components/ui/toaster";
import { TooltipProvider } from "@/components/ui/tooltip";
import { UserProvider } from "@/components/UserProvider";
import { FirstTimeModal } from "@/components/FirstTimeModal";
import { WelcomeBanner } from "@/components/WelcomeBanner";
import { Header } from "@/components/Header";
import { Sidebar } from "@/components/Sidebar";
import { RightSidebar } from "@/components/RightSidebar";
import { CreatePostModal } from "@/components/CreatePostModal";
import Home from "@/pages/Home";
import CategoryPage from "@/pages/CategoryPage";
import Search from "@/pages/Search";
import NotFound from "@/pages/not-found";
import { useUserContext } from "@/components/UserProvider";

// Main layout component with sidebars and content
function Layout({ children }: { children: React.ReactNode }) {
  const { isFirstVisit, isLoading } = useUserContext();
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const [isCreatePostModalOpen, setIsCreatePostModalOpen] = useState(false);
  const [createPostCategory, setCreatePostCategory] = useState<string | undefined>(undefined);
  
  const openCreatePostModal = (category?: string) => {
    setCreatePostCategory(category);
    setIsCreatePostModalOpen(true);
  };

  return (
    <>
      {/* First-time visitor modal */}
      {!isLoading && isFirstVisit && (
        <FirstTimeModal open={isFirstVisit} />
      )}
      
      {/* Create post modal */}
      <CreatePostModal 
        open={isCreatePostModalOpen} 
        onOpenChange={setIsCreatePostModalOpen}
        initialCategory={createPostCategory}
      />
      
      {/* Welcome banner for returning users */}
      {!isLoading && !isFirstVisit && <WelcomeBanner />}
      
      {/* Header */}
      <Header onOpenMobileMenu={() => setIsMobileMenuOpen(true)} />
      
      {/* Mobile sidebar */}
      {isMobileMenuOpen && (
        <div className="fixed inset-0 bg-black bg-opacity-80 z-50 md:hidden">
          <div className="h-full w-3/4 max-w-xs bg-background overflow-y-auto">
            <div className="p-4 border-b border-border flex items-center justify-between">
              <span className="text-xl text-primary font-heading font-bold">v Space</span>
              <button className="text-foreground" onClick={() => setIsMobileMenuOpen(false)}>
                <i className="fas fa-times"></i>
              </button>
            </div>
            
            <Sidebar 
              onCreatePostClick={() => openCreatePostModal()} 
              isMobile={true}
              onCloseMobile={() => setIsMobileMenuOpen(false)}
            />
          </div>
        </div>
      )}
      
      {/* Main content */}
      <div className="container mx-auto px-4 flex flex-col md:flex-row">
        {/* Left sidebar */}
        <div className="hidden md:block">
          <Sidebar onCreatePostClick={() => openCreatePostModal()} />
        </div>
        
        {/* Main content area */}
        <main className="flex-grow md:max-w-2xl lg:max-w-3xl xl:max-w-4xl py-6 md:px-6">
          {children}
        </main>
        
        {/* Right sidebar */}
        <RightSidebar />
      </div>
    </>
  );
}

// Router component with all routes
function Router() {
  return (
    <Layout>
      <Switch>
        <Route path="/" component={Home} />
        <Route path="/:category" component={CategoryPage} />
        <Route path="/search" component={Search} />
        <Route component={NotFound} />
      </Switch>
    </Layout>
  );
}

// Main App component with providers
function App() {
  return (
    <QueryClientProvider client={queryClient}>
      <TooltipProvider>
        <UserProvider>
          <Toaster />
          <Router />
        </UserProvider>
      </TooltipProvider>
    </QueryClientProvider>
  );
}

export default App;
