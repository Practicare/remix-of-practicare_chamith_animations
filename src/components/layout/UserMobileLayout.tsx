import { ReactNode } from "react";
import { useNavigate, useLocation } from "react-router-dom";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import {
  Home,
  CheckSquare,
  LayoutGrid,
  User,
  Bell,
  ChevronDown,
  LogOut,
  Building2,
  ClipboardList,
  Package,
  Newspaper,
  MoreHorizontal,
} from "lucide-react";
import { cn } from "@/lib/utils";
import { useUser } from "@/contexts/UserContext";
import { getDepartmentById, DEFAULT_DEPARTMENTS } from "@/types/departments";
import { toast } from "sonner";

interface UserMobileLayoutProps {
  children: ReactNode;
  title?: string;
  subtitle?: string;
  headerActions?: ReactNode;
  hideHeader?: boolean;
}

export function UserMobileLayout({ 
  children, 
  title, 
  subtitle, 
  headerActions,
  hideHeader = false 
}: UserMobileLayoutProps) {
  const navigate = useNavigate();
  const location = useLocation();
  const { currentUser, logout } = useUser();

  if (!currentUser) return null;

  const department = getDepartmentById(DEFAULT_DEPARTMENTS, currentUser.departmentId);

  const getInitials = (firstName: string, lastName: string) => {
    return `${firstName.charAt(0)}${lastName.charAt(0)}`.toUpperCase();
  };

  const handleLogout = () => {
    logout();
    toast.success("You have been logged out");
    navigate("/login");
  };

  const navItems = [
    { id: "dashboard", label: "Home", icon: Home, path: "/user" },
    { id: "checklists", label: "Checklists", icon: CheckSquare, path: "/user/checklists" },
    { id: "tasks", label: "Tasks", icon: ClipboardList, path: "/tasks" },
    { id: "memos", label: "News", icon: Newspaper, path: "/memos" },
    { id: "profile", label: "Profile", icon: User, path: "/user?tab=profile" },
  ];

  const isActive = (path: string) => {
    if (path === "/user") return location.pathname === "/user" && !location.search.includes("tab=profile");
    if (path === "/user?tab=profile") return location.search.includes("tab=profile");
    return location.pathname === path;
  };

  return (
    <div className="md:hidden flex flex-col h-[100dvh] bg-background overflow-hidden">
      {/* Fixed Header */}
      {!hideHeader && (
        <header className="shrink-0 h-14 bg-card border-b border-border flex items-center justify-between px-4 safe-area-top">
          {/* User Badge with Dropdown */}
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <button className="flex items-center gap-2.5 px-2 py-1.5 rounded-xl hover:bg-muted transition-colors active:scale-[0.98]">
                <Avatar className="h-9 w-9">
                  <AvatarFallback className="bg-primary text-primary-foreground text-sm font-semibold">
                    {getInitials(currentUser.firstName, currentUser.lastName)}
                  </AvatarFallback>
                </Avatar>
                <div className="min-w-0 text-left">
                  <p className="text-sm font-semibold truncate max-w-[100px]">
                    {currentUser.firstName}
                  </p>
                  <p className="text-[10px] text-muted-foreground leading-none">{currentUser.role}</p>
                </div>
                <ChevronDown className="w-4 h-4 text-muted-foreground shrink-0" />
              </button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="start" className="w-56 bg-popover">
              <div className="px-2 py-2 border-b border-border">
                <p className="font-semibold text-sm">{currentUser.firstName} {currentUser.lastName}</p>
                <p className="text-xs text-muted-foreground">{currentUser.email}</p>
              </div>
              <DropdownMenuItem 
                onClick={() => navigate("/user?tab=profile")}
                className="py-3"
              >
                <User className="w-4 h-4 mr-3 text-primary" />
                My Profile
              </DropdownMenuItem>
              {department && (
                <DropdownMenuItem disabled className="opacity-70 py-3">
                  <Building2 className="w-4 h-4 mr-3 text-muted-foreground" />
                  {department.name}
                </DropdownMenuItem>
              )}
              <DropdownMenuSeparator />
              <DropdownMenuItem 
                onClick={handleLogout} 
                className="text-destructive focus:text-destructive py-3"
              >
                <LogOut className="w-4 h-4 mr-3" />
                Logout
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>

          {/* Title (if provided) */}
          {title && (
            <div className="flex-1 text-center">
              <h1 className="text-base font-bold">{title}</h1>
              {subtitle && <p className="text-[10px] text-muted-foreground">{subtitle}</p>}
            </div>
          )}

          {/* Actions */}
          <div className="flex items-center gap-1">
            {headerActions}
            <Button variant="ghost" size="icon" className="relative h-10 w-10 rounded-full">
              <Bell className="w-5 h-5" />
              <span className="absolute top-1 right-1 w-2 h-2 bg-destructive rounded-full" />
            </Button>
          </div>
        </header>
      )}

      {/* Scrollable Content */}
      <main className="flex-1 min-h-0 overflow-y-auto">
        {children}
      </main>

      {/* Fixed Bottom Navigation */}
      <nav className="shrink-0 h-16 bg-card border-t border-border flex items-stretch safe-area-bottom">
        {navItems.map((item) => {
          const active = isActive(item.path);
          return (
            <button
              key={item.id}
              onClick={() => navigate(item.path)}
              className={cn(
                "flex-1 flex flex-col items-center justify-center gap-1 transition-colors active:bg-muted",
                active ? "text-primary" : "text-muted-foreground"
              )}
            >
              <item.icon className={cn("w-5 h-5", active && "text-primary")} />
              <span className={cn(
                "text-[10px] font-medium",
                active ? "text-primary" : "text-muted-foreground"
              )}>
                {item.label}
              </span>
            </button>
          );
        })}
      </nav>
    </div>
  );
}
