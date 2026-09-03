import { ReactNode, useState } from "react";
import { APP_BRAND, APP_LOGOS } from "@/config/branding";
import { AnimatedPage } from "@/components/layout/AnimatedPage";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import {
  Home,
  CheckSquare,
  ClipboardList,
  Newspaper,
  BookOpen,
  MessagesSquare,
  Calendar,
  GraduationCap,
  User,
  LogOut,
  Building2,
  Settings,
  Bell,
  Menu,
  ChevronDown,
  Sparkles,
  Clock,
  LifeBuoy,
  DoorOpen,
  Package,

} from "lucide-react";
import { Navigate, useNavigate, useLocation } from "react-router-dom";
import { useUser } from "@/contexts/UserContext";
import { getDepartmentById, DEFAULT_DEPARTMENTS } from "@/types/departments";
import { cn } from "@/lib/utils";
import { toast } from "sonner";
import {
  Sheet,
  SheetContent,
  SheetHeader,
  SheetTitle,
  SheetTrigger,
} from "@/components/ui/sheet";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";

interface UserLayoutProps {
  children: ReactNode;
}

const allNavItems = [
  { id: "dashboard", label: "Dashboard", icon: Home, path: "/user" },
  { id: "checklists", label: "Checklists", icon: CheckSquare, path: "/user/checklists" },
  { id: "tasks", label: "Tasks", icon: ClipboardList, path: "/user/tasks" },
  { id: "memos", label: "Memos & News", icon: Newspaper, path: "/user/memos" },
  { id: "communication-book", label: "Communication Book", icon: BookOpen, path: "/user/communication-book" },
  { id: "messaging", label: "Messaging", icon: MessagesSquare, path: "/user/messaging" },
  { id: "roster", label: "Roster", icon: Calendar, path: "/user/roster" },
  { id: "timesheets", label: "Timesheet", icon: Clock, path: "/user/timesheets" },
  { id: "training", label: "Training & Resources", icon: GraduationCap, path: "/user/training" },
  { id: "rooms", label: "Rooms", icon: DoorOpen, path: "/user/rooms" },
  { id: "stock-locations", label: "Stock Locations", icon: Package, path: "/user/stock" },
  { id: "staff-action-guide", label: "Staff Resource Centre", icon: LifeBuoy, path: "/user/staff-action-guide" },

];

const primaryNavItems = [
  { id: "dashboard", label: "Home", icon: Home, path: "/user" },
  { id: "checklists", label: "Checklists", icon: CheckSquare, path: "/user/checklists" },
  { id: "tasks", label: "Tasks", icon: ClipboardList, path: "/user/tasks" },
  { id: "memos", label: "News", icon: Newspaper, path: "/user/memos" },
];

export function UserLayout({ children }: UserLayoutProps) {
  const navigate = useNavigate();
  const location = useLocation();
  const { currentUser, logout } = useUser();
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  if (!currentUser) {
    return <Navigate to="/login" replace state={{ from: location.pathname }} />;
  }

  const department = getDepartmentById(DEFAULT_DEPARTMENTS, currentUser.departmentId);

  const getInitials = (firstName: string, lastName: string) =>
    `${firstName.charAt(0)}${lastName.charAt(0)}`.toUpperCase();

  const handleLogout = () => {
    logout();
    toast.success("You have been logged out");
    navigate("/login");
  };

  const getActiveNav = () => {
    const path = location.pathname;
    // Exact match first, then prefix match
    const exact = allNavItems.find((n) => n.path === path);
    if (exact) return exact.id;
    const prefix = allNavItems.find((n) => n.path !== "/user" && path.startsWith(n.path));
    if (prefix) return prefix.id;
    if (path === "/user") return "dashboard";
    return "";
  };

  const activeNav = getActiveNav();
  const isProfileActive = location.pathname === "/user" && location.search.includes("tab=profile");

  const handleNavClick = (path: string) => {
    navigate(path);
    setMobileMenuOpen(false);
  };

  return (
    <div className="bg-background flex flex-col md:flex-row h-[100dvh] md:min-h-screen md:h-auto overflow-hidden">
      {/* Desktop Sidebar */}
      <aside className="hidden md:flex w-[250px] bg-card/50 border-r border-border/40 flex-col h-screen sticky top-0">
        {/* Brand */}
        <div className="px-5 h-14 flex items-center gap-2.5 shrink-0">
          <img src={APP_LOGOS.icon} alt={APP_BRAND.name} className="w-8 h-8 object-contain" />
          <span className="text-[15px] font-bold tracking-tight text-foreground">{APP_BRAND.name}</span>
        </div>

        {/* Navigation */}
        <nav className="flex-1 px-3 pt-3 space-y-0.5 overflow-hidden">
          {allNavItems.map((item) => (
            <button
              key={item.id}
              onClick={() => navigate(item.path)}
              className={`w-full flex items-center gap-3 px-3 py-2 rounded-lg text-[13px] transition-all duration-200 ${
                activeNav === item.id && !isProfileActive
                  ? "text-foreground font-semibold bg-muted/60"
                  : "text-muted-foreground hover:text-foreground hover:bg-muted/40 hover:translate-x-0.5 font-medium"
              }`}
            >
              <item.icon className={`w-[18px] h-[18px] shrink-0 transition-colors duration-200 ${activeNav === item.id && !isProfileActive ? "text-primary" : ""}`} />
              {item.label}
              {activeNav === item.id && !isProfileActive && (
                <span className="ml-auto w-1.5 h-1.5 rounded-full bg-primary" />
              )}
            </button>
          ))}
        </nav>

        {/* Bottom section - Profile */}
        <div className="px-3 pb-4 space-y-0.5">
          <button
            onClick={() => navigate("/user?tab=profile")}
            className={`w-full flex items-center gap-3 px-3 py-2 rounded-lg text-[13px] transition-colors ${
              isProfileActive
                ? "text-foreground font-semibold"
                : "text-muted-foreground hover:text-foreground font-medium"
            }`}
          >
            <User className={`w-[18px] h-[18px] shrink-0 ${isProfileActive ? "text-primary" : ""}`} />
            My Profile
          </button>
        </div>

        {/* User Info */}
        <div className="px-3 pb-4 border-t border-border pt-3">
          <div className="flex items-center gap-3 px-3 py-2">
            <Avatar className="h-9 w-9">
              <AvatarFallback className="bg-primary text-primary-foreground text-sm font-semibold">
                {getInitials(currentUser.firstName, currentUser.lastName)}
              </AvatarFallback>
            </Avatar>
            <div className="flex-1 min-w-0">
              <p className="text-sm font-medium truncate">{currentUser.firstName} {currentUser.lastName}</p>
              <p className="text-xs text-muted-foreground">{currentUser.role}</p>
            </div>
            <Button
              variant="ghost"
              size="icon"
              className="text-destructive hover:text-destructive hover:bg-destructive/10 h-8 w-8"
              onClick={handleLogout}
              title="Logout"
            >
              <LogOut className="w-4 h-4" />
            </Button>
          </div>
          {department && (
            <Badge variant="outline" className="w-full justify-center gap-1.5 py-1.5 mt-2">
              <Building2 className="w-3 h-3" />
              {department.name}
            </Badge>
          )}
        </div>
      </aside>

      {/* Mobile Header */}
      <header className="md:hidden fixed top-0 left-0 right-0 h-14 bg-card border-b border-border flex items-center justify-between px-3 z-50">
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <button className="flex items-center gap-2 px-2 py-1.5 rounded-lg hover:bg-muted transition-colors">
              <Avatar className="h-8 w-8">
                <AvatarFallback className="bg-primary text-primary-foreground text-sm font-semibold">
                  {getInitials(currentUser.firstName, currentUser.lastName)}
                </AvatarFallback>
              </Avatar>
              <div className="min-w-0 text-left">
                <p className="text-sm font-medium truncate max-w-[120px]">{currentUser.firstName}</p>
                <p className="text-[10px] text-muted-foreground">{currentUser.role}</p>
              </div>
              <ChevronDown className="w-3.5 h-3.5 text-muted-foreground shrink-0" />
            </button>
          </DropdownMenuTrigger>
          <DropdownMenuContent align="start" className="w-56 bg-popover">
            <div className="px-2 py-2 border-b border-border">
              <p className="font-semibold text-sm">{currentUser.firstName} {currentUser.lastName}</p>
              <p className="text-xs text-muted-foreground">{currentUser.email}</p>
            </div>
            <DropdownMenuItem onClick={() => navigate("/user?tab=profile")} className="py-3">
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
            <DropdownMenuItem onClick={handleLogout} className="text-destructive focus:text-destructive py-3">
              <LogOut className="w-4 h-4 mr-3" />
              Logout
            </DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>

        <Sheet open={mobileMenuOpen} onOpenChange={setMobileMenuOpen}>
          <SheetTrigger asChild>
            <Button variant="ghost" size="icon">
              <Menu className="w-5 h-5" />
            </Button>
          </SheetTrigger>
          <SheetContent side="right" className="w-72 p-0">
            <SheetHeader className="p-4 border-b border-border">
              <SheetTitle className="text-left">Menu</SheetTitle>
            </SheetHeader>
            <nav className="p-4 space-y-1">
              {allNavItems.map((item) => (
                <button
                  key={item.id}
                  onClick={() => handleNavClick(item.path)}
                  className={`w-full flex items-center gap-3 px-4 py-3 rounded-lg text-sm font-medium transition-colors ${
                    activeNav === item.id
                      ? "bg-primary text-primary-foreground"
                      : "text-muted-foreground hover:bg-muted hover:text-foreground"
                  }`}
                >
                  <item.icon className="w-5 h-5" />
                  {item.label}
                </button>
              ))}
              <div className="pt-2 mt-2 border-t border-border">
                <button
                  onClick={() => handleNavClick("/user?tab=profile")}
                  className={`w-full flex items-center gap-3 px-4 py-3 rounded-lg text-sm font-medium transition-colors ${
                    isProfileActive
                      ? "bg-primary text-primary-foreground"
                      : "text-muted-foreground hover:bg-muted hover:text-foreground"
                  }`}
                >
                  <User className="w-5 h-5" />
                  My Profile
                </button>
              </div>
            </nav>
          </SheetContent>
        </Sheet>
      </header>

      {/* Main Content */}
      <main className="flex-1 overflow-y-auto md:overflow-auto pt-14 pb-20 md:pt-0 md:pb-0">
        <AnimatedPage key={location.pathname}>
          {children}
        </AnimatedPage>
      </main>

      {/* Mobile Bottom Navigation */}
      <nav className="md:hidden fixed bottom-0 left-0 right-0 h-16 bg-card/95 backdrop-blur-md border-t border-border/50 flex items-center justify-around px-2 z-50 safe-area-pb">
        {primaryNavItems.map((item) => (
          <button
            key={item.id}
            onClick={() => navigate(item.path)}
            className={`relative flex flex-col items-center justify-center gap-1 px-3 py-2 rounded-lg min-w-[60px] transition-all duration-200 ${
              activeNav === item.id ? "text-primary scale-105" : "text-muted-foreground active:scale-95"
            }`}
          >
            <item.icon className={`w-5 h-5 ${activeNav === item.id ? "text-primary" : ""}`} />
            <span className="text-[10px] font-medium">{item.label}</span>
            {activeNav === item.id && (
              <span className="absolute -top-0 w-8 h-0.5 rounded-full bg-primary" />
            )}
          </button>
        ))}
        <button
          onClick={() => setMobileMenuOpen(true)}
          className="flex flex-col items-center justify-center gap-1 px-3 py-2 rounded-lg min-w-[60px] text-muted-foreground active:scale-95 transition-transform duration-200"
        >
          <Menu className="w-5 h-5" />
          <span className="text-[10px] font-medium">More</span>
        </button>
      </nav>
    </div>
  );
}
