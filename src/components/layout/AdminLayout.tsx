import { ReactNode, useState, useMemo, useEffect } from "react";
import { APP_BRAND, APP_LOGOS } from "@/config/branding";
import { AnimatedPage } from "@/components/layout/AnimatedPage";
import { Button } from "@/components/ui/button";
import {
  Users,
  ShieldCheck,
  ClipboardList,
  Settings,
  Home,
  LogOut,
  UserCog,
  CheckSquare,
  Newspaper,
  Calendar,
  Lightbulb,
  MessageSquare,
  Menu,
  ChevronDown,
  Plus,
  CreditCard,
  GraduationCap,
  Map,
  Sparkles,
  BookOpen,
  BarChart3,
  Store,
  Layers,
  HelpCircle,
  Mail,
  Clock,
  LifeBuoy,
  CalendarX,
  Monitor,
  MessagesSquare,
  FolderOpen,
  StickyNote,
  Shield,
  Inbox,
  AlertTriangle,
  DoorOpen,
  Package,
  Target,

} from "lucide-react";
import { useNavigate, useLocation } from "react-router-dom";
import { useUser } from "@/contexts/UserContext";
import { useIssues } from "@/contexts/IssuesContext";
import { FeatureRequestDialog } from "@/components/feedback/FeatureRequestDialog";

import { FeedbackDialog } from "@/components/feedback/FeedbackDialog";
import { InviteFriendDialog } from "@/components/feedback/InviteFriendDialog";
import { Gift, CalendarDays } from "lucide-react";
import {
  Tooltip,
  TooltipContent,
  TooltipTrigger,
} from "@/components/ui/tooltip";
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
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";
import { toast } from "sonner";
import { ProductTour } from "@/components/layout/ProductTour";
import { AIChatDialog } from "@/components/ai/AIChatDialog";
import { SiteSwitcher } from "@/components/layout/SiteSwitcher";
import { useModules } from "@/contexts/ModulesContext";

interface AdminLayoutProps {
  children: ReactNode;
}

// Primary nav items for bottom bar (max 5 for mobile)
const primaryNavItems = [
  { id: "dashboard", label: "Home", icon: Home, path: "/dashboard" },
  { id: "tasks", label: "Tasks", icon: ClipboardList, path: "/tasks" },
  { id: "checklists", label: "Checklists", icon: CheckSquare, path: "/checklists" },
  { id: "roster", label: "Roster", icon: Calendar, path: "/roster" },
];

// All nav items for sidebar/full menu (flat list, used by mobile sheet & route lookup)
const allNavItems = [
  { id: "dashboard", label: "Dashboard", icon: Home, path: "/dashboard" },
  { id: "expiry-centre", label: "Expiry Centre", icon: CalendarX, path: "/expiry-centre" },
  { id: "tasks", label: "Tasks", icon: ClipboardList, path: "/tasks" },
  { id: "checklists", label: "Checklists", icon: CheckSquare, path: "/checklists" },
  { id: "roster", label: "Roster", icon: Calendar, path: "/roster" },
  { id: "timesheets", label: "Timesheets", icon: Clock, path: "/timesheets" },
  { id: "notes", label: "Notes", icon: StickyNote, path: "/notes" },
  { id: "staff", label: "Staff", icon: Users, path: "/staff" },
  { id: "kpi", label: "KPI", icon: Target, path: "/kpi" },

  { id: "inventory", label: "Inventory", icon: Layers, path: "/inventory" },
  { id: "rooms", label: "Rooms", icon: DoorOpen, path: "/room-setup" },
  { id: "stock-locations", label: "Stock Locations", icon: Package, path: "/stock" },

  { id: "requests", label: "Issues", icon: AlertTriangle, path: "/requests" },
  { id: "compliance", label: "Compliance", icon: ShieldCheck, path: "/compliance" },
  { id: "accreditation", label: "Accreditation Intelligence", icon: Shield, path: "/accreditation" },
  { id: "memos", label: "Memos & News", icon: Newspaper, path: "/memos" },
  { id: "noticeboards", label: "Noticeboards", icon: Monitor, path: "/noticeboards" },
  { id: "communication-book", label: "Communication Book", icon: BookOpen, path: "/communication-book" },
  { id: "messaging", label: "Messaging", icon: MessagesSquare, path: "/messaging" },
  { id: "meeting-schedule", label: "Meetings & Schedules", icon: CalendarDays, path: "/meeting-schedule" },
  { id: "training", label: "Training & Resources", icon: GraduationCap, path: "/training" },
  { id: "staff-action-guide", label: "Staff Resource Centre", icon: LifeBuoy, path: "/staff-action-guide" },
  { id: "faq", label: "FAQ", icon: HelpCircle, path: "/faq" },
  { id: "email-templates", label: "Email Templates", icon: Mail, path: "/email-templates" },
  { id: "reports", label: "Reports", icon: BarChart3, path: "/reports" },
  { id: "documents", label: "Document Library", icon: FolderOpen, path: "/documents" },
  { id: "marketplace", label: "Marketplace", icon: Store, path: "/marketplace" },
];

// Grouped nav for desktop sidebar — reduces visual noise
const navGroups: { label: string; items: typeof allNavItems }[] = [
  {
    label: "Overview",
    items: [
      { id: "dashboard", label: "Dashboard", icon: Home, path: "/dashboard" },
      { id: "expiry-centre", label: "Expiry Centre", icon: CalendarX, path: "/expiry-centre" },
    ],
  },
  {
    label: "Workflow",
    items: [
      { id: "tasks", label: "Tasks", icon: ClipboardList, path: "/tasks" },
      { id: "checklists", label: "Checklists", icon: CheckSquare, path: "/checklists" },
      { id: "roster", label: "Roster", icon: Calendar, path: "/roster" },
      { id: "timesheets", label: "Timesheets", icon: Clock, path: "/timesheets" },
      { id: "notes", label: "Notes", icon: StickyNote, path: "/notes" },
      { id: "requests", label: "Issues", icon: AlertTriangle, path: "/requests" },
    ],
  },
  {
    label: "Practice",
    items: [
      { id: "staff", label: "Staff", icon: Users, path: "/staff" },
      { id: "kpi", label: "KPI", icon: Target, path: "/kpi" },
      { id: "inventory", label: "Inventory", icon: Layers, path: "/inventory" },
      { id: "inventory-planner", label: "Inventory Planner", icon: ClipboardList, path: "/inventory/planner" },
      { id: "rooms", label: "Rooms", icon: DoorOpen, path: "/room-setup" },
      { id: "stock-locations", label: "Stock Locations", icon: Package, path: "/stock" },

      { id: "compliance", label: "Compliance", icon: ShieldCheck, path: "/compliance" },
      { id: "accreditation", label: "Accreditation Intelligence", icon: Shield, path: "/accreditation" },
    ],
  },
  {
    label: "Communications",
    items: [
      { id: "memos", label: "Memos & News", icon: Newspaper, path: "/memos" },
      { id: "noticeboards", label: "Noticeboards", icon: Monitor, path: "/noticeboards" },
      { id: "communication-book", label: "Communication Book", icon: BookOpen, path: "/communication-book" },
      { id: "messaging", label: "Messaging", icon: MessagesSquare, path: "/messaging" },
      { id: "meeting-schedule", label: "Meetings & Schedules", icon: CalendarDays, path: "/meeting-schedule" },
      { id: "email-templates", label: "Email Templates", icon: Mail, path: "/email-templates" },
    ],
  },
  {
    label: "Resources",
    items: [
      { id: "training", label: "Training & Resources", icon: GraduationCap, path: "/training" },
      { id: "staff-action-guide", label: "Staff Resource Centre", icon: LifeBuoy, path: "/staff-action-guide" },
      { id: "documents", label: "Document Library", icon: FolderOpen, path: "/documents" },
      { id: "faq", label: "FAQ", icon: HelpCircle, path: "/faq" },
      { id: "reports", label: "Reports", icon: BarChart3, path: "/reports" },
      { id: "marketplace", label: "Marketplace", icon: Store, path: "/marketplace" },
    ],
  },
];

export function AdminLayout({ children }: AdminLayoutProps) {
  const navigate = useNavigate();
  const location = useLocation();
  const { currentUser, userRole, logout, isLoggedIn } = useUser();
  const { activeCount: requestsCount } = useIssues();
  const { isModuleEnabled, isPathEnabled } = useModules();
  const [featureRequestOpen, setFeatureRequestOpen] = useState(false);
  const [inviteOpen, setInviteOpen] = useState(false);
  
  const [feedbackOpen, setFeedbackOpen] = useState(false);
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [tourOpen, setTourOpen] = useState(false);
  const [smsDialogOpen, setSmsDialogOpen] = useState(false);
  const [smsCredits, setSmsCredits] = useState(250);
  const [smsToPurchase, setSmsToPurchase] = useState(100);

  const smsPricing = [
    { amount: 100, price: 15, perSms: "0.15" },
    { amount: 250, price: 30, perSms: "0.12" },
    { amount: 500, price: 50, perSms: "0.10" },
    { amount: 1000, price: 80, perSms: "0.08" },
  ];

  const maxCredits = 1000;
  const creditPercentage = Math.min((smsCredits / maxCredits) * 100, 100);
  
  const getSmsStatus = () => {
    if (smsCredits < 50) return { label: "Critical", color: "bg-destructive", textColor: "text-destructive" };
    if (smsCredits < 100) return { label: "Low", color: "bg-amber-500", textColor: "text-amber-500" };
    if (smsCredits < 250) return { label: "OK", color: "bg-primary", textColor: "text-primary" };
    return { label: "Good", color: "bg-emerald-500", textColor: "text-emerald-500" };
  };

  const smsStatus = getSmsStatus();

  const handlePurchaseSms = () => {
    const pricing = smsPricing.find(p => p.amount === smsToPurchase);
    if (pricing) {
      setSmsCredits(prev => prev + smsToPurchase);
      setSmsDialogOpen(false);
      toast.success(`Successfully purchased ${smsToPurchase} SMS credits for $${pricing.price}`);
    }
  };

  const handleLogout = () => {
    logout();
    navigate("/login");
  };

  // Hide modules the practice has switched off
  const visibleNavGroups = useMemo(
    () =>
      navGroups
        .map((g) => ({ ...g, items: g.items.filter((i) => isModuleEnabled(i.id)) }))
        .filter((g) => g.items.length > 0),
    [isModuleEnabled]
  );
  const visibleNavItems = useMemo(
    () => allNavItems.filter((i) => isModuleEnabled(i.id)),
    [isModuleEnabled]
  );
  const visiblePrimaryNavItems = useMemo(
    () => primaryNavItems.filter((i) => isModuleEnabled(i.id)),
    [isModuleEnabled]
  );

  // Guard: a disabled module's route falls back to the dashboard
  useEffect(() => {
    if (!isPathEnabled(location.pathname)) {
      navigate("/dashboard", { replace: true });
    }
  }, [location.pathname, isPathEnabled, navigate]);

  const getActiveNav = () => {
    const path = location.pathname;
    const item = allNavItems.find((nav) => nav.path === path);
    return item?.id || "dashboard";
  };

  const activeNav = getActiveNav();

  const pageContext = useMemo(() => {
    const path = location.pathname.replace("/", "") || "dashboard";
    const navItem = allNavItems.find(n => n.path === location.pathname);
    return {
      context: path.replace(/\//g, "-"),
      title: navItem?.label || path.charAt(0).toUpperCase() + path.slice(1),
    };
  }, [location.pathname]);

  const displayName = currentUser 
    ? `${currentUser.firstName} ${currentUser.lastName}` 
    : "Admin User";
  const displayRole = currentUser?.role || (userRole === "admin" ? "Practice Manager" : "Staff");

  const handleNavClick = (path: string) => {
    navigate(path);
    setMobileMenuOpen(false);
  };

  return (
    <>
      <div className="bg-background flex flex-col md:flex-row h-[100dvh] overflow-hidden">
        {/* Desktop Sidebar - Hidden on mobile */}
        <aside className="hidden md:flex w-[264px] bg-card/50 border-r border-border/40 flex-col h-full shrink-0 overflow-hidden">
          {/* Brand */}
          <div className="px-4 h-14 flex items-center gap-2.5 shrink-0 border-b border-border/30">
            <img src={APP_LOGOS.icon} alt={APP_BRAND.name} className="w-8 h-8 object-contain" />
            <span className="text-lg font-bold tracking-tight text-primary">{APP_BRAND.name}</span>
          </div>

          {/* Site Switcher */}
          <div className="px-3 py-1.5 shrink-0">
            <SiteSwitcher compact />
          </div>

          {/* Navigation - grouped sections (scrollable) */}
          <nav className="flex-1 px-3 pt-2 pb-2 overflow-y-auto min-h-0 scrollbar-hide">
            {visibleNavGroups.map((group, gi) => (
              <div key={group.label} className={gi === 0 ? "" : "mt-2.5"}>
                <div className="px-3 pb-0.5 text-[10px] font-semibold uppercase tracking-[0.08em] text-muted-foreground/60">
                  {group.label}
                </div>
                <div className="space-y-0.5">
                  {group.items.map((item) => (
                    <button
                      key={item.id}
                      data-tour={`nav-${item.id}`}
                      onClick={() => navigate(item.path)}
                      className={`w-full flex items-center gap-3 px-3 py-1.5 rounded-lg text-[12.5px] leading-[1.2] tracking-[-0.01em] transition-colors duration-200 ${
                        activeNav === item.id
                          ? "bg-primary/10 text-foreground font-semibold"
                          : "text-muted-foreground hover:text-foreground hover:bg-muted/50 font-medium"
                      }`}
                    >
                      <item.icon className={`w-4 h-4 shrink-0 transition-colors duration-200 ${activeNav === item.id ? "text-primary" : ""}`} />
                      <span className="min-w-0 flex-1 truncate text-left leading-[1.2]">{item.label}</span>
                      {item.id === "requests" && requestsCount > 0 && (
                        <Badge variant="secondary" className="h-4 px-1.5 text-[10px] font-semibold bg-primary text-primary-foreground">
                          {requestsCount}
                        </Badge>
                      )}
                    </button>
                  ))}
                </div>
              </div>
            ))}
          </nav>

          {/* Utilities - pinned to bottom, always visible */}
          <div className="shrink-0 px-3 py-2 border-t border-border/40 space-y-0.5 bg-card">
            <button
              data-tour="sms-credits"
              onClick={() => setSmsDialogOpen(true)}
              className="w-full flex items-center gap-3 px-3 py-1.5 rounded-lg text-[12.5px] leading-[1.2] font-medium text-muted-foreground hover:text-foreground hover:bg-muted/50 transition-colors"
            >
              <MessageSquare className="w-4 h-4 shrink-0" />
              <span className="flex-1 text-left truncate">SMS Credits</span>
              <span className={`text-[11px] font-semibold tabular-nums ${smsStatus.textColor}`}>{smsCredits}</span>
            </button>

            <button
              onClick={() => setTourOpen(true)}
              className="w-full flex items-center gap-3 px-3 py-1.5 rounded-lg text-[12.5px] leading-[1.2] font-medium text-muted-foreground hover:text-foreground hover:bg-muted/50 transition-colors"
            >
              <Map className="w-4 h-4 shrink-0" />
              <span className="flex-1 text-left truncate">Take a Tour</span>
            </button>

            <button
              onClick={() => navigate("/settings")}
              className="w-full flex items-center gap-3 px-3 py-1.5 rounded-lg text-[12.5px] leading-[1.2] font-medium text-muted-foreground hover:text-foreground hover:bg-muted/50 transition-colors"
            >
              <Settings className="w-4 h-4 shrink-0" />
              <span className="flex-1 text-left truncate">Settings</span>
            </button>

            {/* User Profile + Logout dropdown */}
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <button
                  data-tour="user-profile"
                  className="w-full flex items-center gap-2.5 px-2 py-1.5 mt-1 rounded-lg hover:bg-muted/50 transition-colors"
                >
                  <div className="w-8 h-8 rounded-full bg-primary/15 flex items-center justify-center shrink-0">
                    <UserCog className="w-4 h-4 text-primary" />
                  </div>
                  <div className="min-w-0 flex-1 text-left">
                    <p className="text-[12.5px] font-semibold truncate leading-tight">{displayName}</p>
                    <p className="text-[10px] text-muted-foreground truncate leading-tight">{displayRole}</p>
                  </div>
                  <ChevronDown className="w-3.5 h-3.5 text-muted-foreground shrink-0" />
                </button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end" side="top" className="w-56 bg-popover">
                <DropdownMenuItem onClick={() => navigate("/settings")}>
                  <UserCog className="w-4 h-4 mr-2" />
                  Profile & Settings
                </DropdownMenuItem>
                <DropdownMenuSeparator />
                <DropdownMenuItem onClick={() => setInviteOpen(true)}>
                  <Gift className="w-4 h-4 mr-2 text-primary" />
                  Invite a friend
                  <span className="ml-auto text-[10px] text-muted-foreground">10% off</span>
                </DropdownMenuItem>
                <DropdownMenuItem onClick={() => setFeatureRequestOpen(true)}>
                  <Lightbulb className="w-4 h-4 mr-2 text-primary" />
                  Feature Request
                </DropdownMenuItem>
                <DropdownMenuItem onClick={() => setFeedbackOpen(true)}>
                  <MessageSquare className="w-4 h-4 mr-2 text-blue-500" />
                  Send Feedback
                </DropdownMenuItem>
                <DropdownMenuSeparator />
                <DropdownMenuItem onClick={handleLogout} className="text-destructive focus:text-destructive">
                  <LogOut className="w-4 h-4 mr-2" />
                  Logout
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
          </div>
        </aside>

        {/* Mobile Header */}
        <header className="md:hidden fixed top-0 left-0 right-0 h-14 bg-card border-b border-border flex items-center justify-between px-3 z-50">
          {/* User Badge with Dropdown */}
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <button className="flex items-center gap-2 px-2 py-1.5 rounded-lg hover:bg-muted transition-colors">
                <div className="w-8 h-8 rounded-full bg-primary/20 flex items-center justify-center">
                  <UserCog className="w-4 h-4 text-primary" />
                </div>
                <div className="min-w-0 text-left">
                  <p className="text-sm font-medium truncate max-w-[120px]">{displayName}</p>
                  <p className="text-[10px] text-muted-foreground">{displayRole}</p>
                </div>
                <ChevronDown className="w-3.5 h-3.5 text-muted-foreground shrink-0" />
              </button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="start" className="w-52 bg-popover">
              <DropdownMenuItem onClick={() => setInviteOpen(true)}>
                <Gift className="w-4 h-4 mr-2 text-primary" />
                Invite a friend
                <span className="ml-auto text-[10px] text-muted-foreground">10% off</span>
              </DropdownMenuItem>
              <DropdownMenuItem onClick={() => setFeatureRequestOpen(true)}>
                <Lightbulb className="w-4 h-4 mr-2 text-primary" />
                Feature Request
              </DropdownMenuItem>
              <DropdownMenuItem onClick={() => setFeedbackOpen(true)}>
                <MessageSquare className="w-4 h-4 mr-2 text-blue-500" />
                Send Feedback
              </DropdownMenuItem>
              <DropdownMenuSeparator />
              <DropdownMenuItem onClick={handleLogout} className="text-destructive focus:text-destructive">
                <LogOut className="w-4 h-4 mr-2" />
                Logout
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>

          {/* SMS Credits Quick Indicator - Mobile */}
          <button 
            onClick={() => setSmsDialogOpen(true)}
            className="flex items-center gap-1.5 px-2 py-1 rounded-lg bg-muted/50 hover:bg-muted transition-colors"
          >
            <div className="relative">
              <MessageSquare className={`w-4 h-4 ${smsStatus.textColor}`} />
              {smsCredits < 100 && (
                <span className="absolute -top-1 -right-1 w-2 h-2 bg-destructive rounded-full animate-pulse" />
              )}
            </div>
            <div className="flex items-center gap-1">
              <div className="w-8 h-1.5 bg-muted rounded-full overflow-hidden">
                <div 
                  className={`h-full ${smsStatus.color} transition-all`}
                  style={{ width: `${creditPercentage}%` }}
                />
              </div>
              <span className="text-[10px] font-medium tabular-nums">{smsCredits}</span>
            </div>
          </button>

          {/* Full Menu Sheet */}
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
              <div className="px-4 pt-3 pb-2">
                <SiteSwitcher compact />
              </div>
              <nav className="p-4 pt-2 space-y-1">
                {visibleNavItems.map((item) => (
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
                    onClick={() => { setMobileMenuOpen(false); setTourOpen(true); }}
                    className="w-full flex items-center gap-3 px-4 py-3 rounded-lg text-sm font-medium text-primary hover:bg-primary/10 transition-colors"
                  >
                    <Map className="w-5 h-5" />
                    Take a Tour
                  </button>
                </div>
              </nav>
            </SheetContent>
          </Sheet>
        </header>

        {/* Main Content */}
        <main data-tour="main-content" className="flex-1 overflow-y-auto min-h-0 pt-14 pb-20 md:pt-0 md:pb-0">
          <AnimatedPage key={location.pathname}>
            {children}
          </AnimatedPage>
        </main>

        {/* Mobile Bottom Navigation */}
        <nav className="md:hidden fixed bottom-0 left-0 right-0 h-16 bg-card/95 backdrop-blur-md border-t border-border/50 flex items-center justify-around px-2 z-50 safe-area-pb">
          {visiblePrimaryNavItems.map((item) => (
            <button
              key={item.id}
              onClick={() => navigate(item.path)}
              className={`flex flex-col items-center justify-center gap-1 px-3 py-2 rounded-lg min-w-[60px] transition-all duration-200 ${
                activeNav === item.id
                  ? "text-primary scale-105"
                  : "text-muted-foreground active:scale-95"
              }`}
            >
              <item.icon className={`w-5 h-5 transition-transform duration-200 ${activeNav === item.id ? "text-primary" : ""}`} />
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

      <FeatureRequestDialog 
        open={featureRequestOpen} 
        onOpenChange={setFeatureRequestOpen} 
      />
      <FeedbackDialog 
        open={feedbackOpen} 
        onOpenChange={setFeedbackOpen} 
      />
      <InviteFriendDialog
        open={inviteOpen}
        onOpenChange={setInviteOpen}
      />
      <ProductTour
        open={tourOpen}
        onClose={() => setTourOpen(false)}
      />

      {/* Global AI Assistant - floating on all pages */}
      <div className="fixed bottom-20 right-4 md:bottom-6 md:right-6 z-50 flex flex-col items-end gap-2">
        <AIChatDialog pageContext={pageContext.context} pageTitle={pageContext.title} />
      </div>


      {/* SMS Purchase Dialog */}
      <Dialog open={smsDialogOpen} onOpenChange={setSmsDialogOpen}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              <MessageSquare className="w-5 h-5" />
              Purchase SMS Credits
            </DialogTitle>
            <DialogDescription>
              Select the number of SMS credits you'd like to purchase.
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-4 py-4">
            {/* Current Balance */}
            <div className="flex items-center justify-between p-3 rounded-lg bg-muted/50">
              <div className="flex items-center gap-2">
                <div className={`w-10 h-10 rounded-full ${smsStatus.color}/20 flex items-center justify-center`}>
                  <MessageSquare className={`w-5 h-5 ${smsStatus.textColor}`} />
                </div>
                <div>
                  <p className="text-sm text-muted-foreground">Current Balance</p>
                  <p className="text-xl font-bold">{smsCredits.toLocaleString()} credits</p>
                </div>
              </div>
              <Badge variant="outline" className={`${smsStatus.textColor} border-current`}>
                {smsStatus.label}
              </Badge>
            </div>

            <div className="grid grid-cols-2 gap-3">
              {smsPricing.map((tier) => (
                <button
                  key={tier.amount}
                  onClick={() => setSmsToPurchase(tier.amount)}
                  className={`p-4 rounded-xl border-2 transition-all text-left ${
                    smsToPurchase === tier.amount
                      ? "border-primary bg-primary/5"
                      : "border-border hover:border-primary/30"
                  }`}
                >
                  <div className="flex items-center justify-between mb-2">
                    <span className="font-bold text-xl">{tier.amount}</span>
                    {tier.amount === 500 && (
                      <Badge variant="secondary" className="text-xs">Popular</Badge>
                    )}
                  </div>
                  <p className="text-sm text-muted-foreground">SMS credits</p>
                  <div className="mt-3 flex items-baseline gap-1">
                    <span className="text-2xl font-bold text-primary">${tier.price}</span>
                    <span className="text-xs text-muted-foreground">(${tier.perSms}/SMS)</span>
                  </div>
                </button>
              ))}
            </div>

            <Separator />

            <div className="flex items-center justify-between p-4 rounded-lg bg-muted/50">
              <div>
                <p className="text-sm text-muted-foreground">Total to pay</p>
                <p className="text-2xl font-bold">
                  ${smsPricing.find(p => p.amount === smsToPurchase)?.price || 0}
                </p>
              </div>
              <div className="text-right">
                <p className="text-sm text-muted-foreground">New balance</p>
                <p className="text-lg font-semibold text-primary">
                  {(smsCredits + smsToPurchase).toLocaleString()} credits
                </p>
              </div>
            </div>

            <Button onClick={handlePurchaseSms} className="w-full gap-2">
              <CreditCard className="w-4 h-4" />
              Complete Purchase
            </Button>
          </div>
        </DialogContent>
      </Dialog>
    </>
  );
}
