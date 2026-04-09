import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { useDispatch } from "react-redux";
import { Menu, X, Search, Settings, User, ChevronLeft, ChevronRight, Edit2, Save, LogOut, Moon, Sun } from "lucide-react";
import { useTheme } from "next-themes";
import { NotificationBell } from "./NotificationBell";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Badge } from "@/components/ui/badge";
import { LeftSidebar } from "./LeftSidebar";
// import { RightSidebar } from "./RightSidebar";
import { useEditMode } from "@/contexts/EditModeContext";
import { useAuth } from "@/hooks/useAuth";
import { toast } from "sonner";
import { GlobalLearningLogoLink } from "@/components/UECampusLogoLink";
import { useIsMobile } from "@/hooks/use-mobile";
import { logoutThunk } from "@/store/redux/thunks/logoutThunk";
import type { AppDispatch } from "@/store/redux/store";

interface DashboardLayoutProps {
  children: React.ReactNode;
}

export function DashboardLayout({ children }: DashboardLayoutProps) {
  const navigate = useNavigate();
  const isMobile = useIsMobile();
  const dispatch = useDispatch<AppDispatch>();
  const [leftSidebarOpen, setLeftSidebarOpen] = useState(!isMobile);
  const [rightSidebarOpen, setRightSidebarOpen] = useState(!isMobile);
  const { isEditMode, toggleEditMode, isAdmin } = useEditMode();
  const { user, loading, status, signOut } = useAuth();
  const { theme, setTheme } = useTheme();
  useEffect(() => {
    if (status === "checking") return;
    if (!user) {
      signOut();
    }
  }, [user, status, signOut]);

  useEffect(() => {
    if (isMobile) {
      setLeftSidebarOpen(false);
      setRightSidebarOpen(false);
    }
  }, [isMobile]);

  const handleEditModeToggle = () => {
    if (!isAdmin) {
      toast.error("Only admins can enable edit mode");
      return;
    }
    
    toggleEditMode();
    if (!isEditMode) {
      toast.info("Edit Mode Enabled - All content is now editable");
    } else {
      toast.success("Edit Mode Disabled - Changes saved");
    }
  };

  const handleSignOut = async () => {
    try {
      await dispatch(logoutThunk()).unwrap();
      toast.success("Signed out successfully");
    } catch {
      // API call failed but session is already cleared in the slice;
      // still treat it as a successful logout on the client.
      toast.success("Signed out successfully");
    }
    await signOut();
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary"></div>
      </div>
    );
  }

  if (!user) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary"></div>
      </div>
    );
  }

  const leftSidebarClasses = isMobile
    ? `fixed top-16 bottom-0 left-0 w-72 max-w-[85vw] transform ${
        leftSidebarOpen ? "translate-x-0" : "-translate-x-full"
      }`
    : `${leftSidebarOpen ? "w-64" : "w-0"} relative`;

  const rightSidebarClasses = isMobile
    ? `fixed top-16 bottom-0 right-0 w-80 max-w-[85vw] transform ${
        rightSidebarOpen ? "translate-x-0" : "translate-x-full"
      }`
    : `${rightSidebarOpen ? "w-80" : "w-0"} relative`;

  return (
    <div className="min-h-screen bg-orange-50 dark:bg-background flex flex-col">
      {/* Top Header */}
      <header className="fixed top-0 left-0 right-0 z-50 w-full border-b border-orange-100/70 bg-orange-50/95 dark:border-border/50 dark:bg-card/95 backdrop-blur-xl supports-[backdrop-filter]:bg-orange-50/80 dark:supports-[backdrop-filter]:bg-card/80 shadow-lg">
        <div className="flex h-16 items-center gap-4 px-4">
          <Button
            variant="ghost"
            size="icon"
            onClick={() => setLeftSidebarOpen(!leftSidebarOpen)}
            className="hover:bg-orange-100 hover:text-orange-700 transition-all duration-300 dark:hover:bg-primary/20 dark:hover:text-primary"
            aria-label="Toggle navigation menu"
          >
            {leftSidebarOpen ? <ChevronLeft className="h-5 w-5" /> : <Menu className="h-5 w-5" />}
          </Button>
          
          <div className="flex-1 flex items-center gap-4">
          <div className="flex items-center">
            <GlobalLearningLogoLink className="h-12 sm:h-12 w-auto" />
          </div>
            
            <div className="hidden md:flex flex-1 max-w-md">
              <div className="relative w-full">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-orange-400 dark:text-muted-foreground" />
                <Input
                  placeholder="Search courses, assignments..."
                  className="pl-10 bg-orange-50 border-orange-100 focus:border-orange-500 transition-all duration-300 dark:bg-muted/50 dark:border-border/50 dark:focus:border-primary"
                  aria-label="Search"
                />
              </div>
            </div>
          </div>

          <div className="flex items-center gap-2">
            {/* Theme Toggle */}
            <Button
              variant="ghost"
              size="icon"
              onClick={() => setTheme(theme === "dark" ? "light" : "dark")}
              className="hover:bg-orange-100 hover:text-orange-700 transition-all duration-300 dark:hover:bg-primary/20 dark:hover:text-primary"
              aria-label="Toggle theme"
            >
              <Sun className="h-5 w-5 rotate-0 scale-100 transition-all dark:-rotate-90 dark:scale-0" />
              <Moon className="absolute h-5 w-5 rotate-90 scale-0 transition-all dark:rotate-0 dark:scale-100" />
            </Button>

            <NotificationBell />
            
            {/* Settings Dropdown with Edit Mode */}
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button 
                  variant="ghost" 
                  size="icon"
                  className="hover:bg-orange-100 hover:text-orange-700 transition-all duration-300 dark:hover:bg-primary/20 dark:hover:text-primary relative"
                  aria-label="Settings"
                >
                  <Settings className="h-5 w-5" />
                  {isEditMode && (
                    <span className="absolute top-1 right-1 h-2 w-2 bg-success rounded-full" />
                  )}
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end" className="w-56">
                <DropdownMenuLabel className="flex flex-col gap-1">
                  <span>Settings</span>
                  <div className="flex items-center gap-2">
                    {isEditMode && <Badge variant="outline" className="text-xs">EDITING</Badge>}
                    {isAdmin && <Badge className="text-xs bg-primary text-primary-foreground">ADMIN</Badge>}
                  </div>
                </DropdownMenuLabel>
                <DropdownMenuSeparator />
                {isAdmin && (
                  <>
                    <DropdownMenuItem onClick={handleEditModeToggle} className="cursor-pointer">
                      {isEditMode ? (
                        <>
                          <Save className="mr-2 h-4 w-4 text-success" />
                          <span>Save & Exit Edit Mode</span>
                        </>
                      ) : (
                        <>
                          <Edit2 className="mr-2 h-4 w-4 text-primary" />
                          <span>Enable Edit Mode</span>
                        </>
                      )}
                    </DropdownMenuItem>
                    <DropdownMenuSeparator />
                  </>
                )}
                <DropdownMenuItem className="cursor-pointer" onClick={() => navigate("/profile")}>
                  <User className="mr-2 h-4 w-4" />
                  <span>Profile: {user?.email}</span>
                </DropdownMenuItem>
                <DropdownMenuSeparator />
                <DropdownMenuItem onClick={handleSignOut} className="cursor-pointer text-destructive">
                  <LogOut className="mr-2 h-4 w-4" />
                  <span>Sign Out</span>
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>

            {/* <Button 
              variant="ghost" 
              size="icon"
              className="hover:bg-primary/20 hover:text-primary transition-all duration-300"
              aria-label="Profile"
            >
              <User className="h-5 w-5" />
            </Button> */}
            {/* Right sidebar toggle temporarily disabled */}
          </div>
        </div>
      </header>

      {/* Main Content Area */}
      <div className="flex flex-1 overflow-hidden relative pt-16">
        {/* Left Sidebar */}
        <aside
          className={`transition-all duration-300 ease-smooth overflow-y-auto hide-scrollbar h-[calc(100vh-4rem)] border-r border-orange-100/70 bg-orange-50/20 shadow-2xl z-40 dark:border-border/50 dark:bg-sidebar ${leftSidebarClasses}`}
          aria-label="Main navigation"
          style={{ msOverflowStyle: "none", scrollbarWidth: "none" }}
        >
          <LeftSidebar />
          {/* Decorative gradient overlay */}
          <div className="absolute inset-0 bg-gradient-to-br from-orange-100/60 to-transparent pointer-events-none dark:from-primary/5" />
        </aside>

        {/* Main Content */}
        <main
          className="flex-1 overflow-y-auto hide-scrollbar p-3 md:p-4 lg:p-4 relative h-[calc(100vh-4rem)] bg-orange-50/10 dark:bg-sidebar"
          style={{ msOverflowStyle: "none", scrollbarWidth: "none" }}
        >
          {/* Background decorative elements */}
          <div className="fixed inset-0 pointer-events-none overflow-hidden">
            <div className="absolute top-0 right-0 w-96 h-96 bg-orange-100/40 rounded-full blur-3xl animate-pulse-glow dark:bg-primary/10" />
            <div className="absolute bottom-0 left-0 w-96 h-96 bg-orange-200/40 rounded-full blur-3xl animate-pulse-glow dark:bg-accent/10" style={{ animationDelay: "1s" }} />
          </div>
          <div className="relative z-10">
            {children}
          </div>
        </main>

        {/* Right Sidebar disabled for now */}
        {/*
        <aside
          className={`transition-all duration-300 ease-smooth overflow-y-auto hide-scrollbar h-[calc(100vh-4rem)] border-l border-border/50 bg-sidebar shadow-2xl z-40 ${rightSidebarClasses}`}
          aria-label="Alerts and deadlines"
          style={{ msOverflowStyle: "none", scrollbarWidth: "none" }}
        >
          <RightSidebar />
          <div className="absolute inset-0 bg-gradient-to-br from-primary/5 to-transparent pointer-events-none" />
        </aside>
        */}

        {/* Overlay for mobile when sidebars are open */}
        {isMobile && (leftSidebarOpen || rightSidebarOpen) && (
          <div 
            className="fixed inset-0 bg-orange-50/80 dark:bg-background/80 backdrop-blur-sm z-30"
            onClick={() => {
              setLeftSidebarOpen(false);
              setRightSidebarOpen(false);
            }}
          />
        )}
      </div>
    </div>
  );
}
