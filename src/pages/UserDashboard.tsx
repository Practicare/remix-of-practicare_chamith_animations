import { useState } from "react";
import { Badge } from "@/components/ui/badge";
import {
  Calendar,
  User,
} from "lucide-react";
import { useNavigate, useSearchParams } from "react-router-dom";
import { useUser } from "@/contexts/UserContext";
import { cn } from "@/lib/utils";
import { format } from "date-fns";
import { UserProfileTab } from "@/components/user/UserProfileTab";
import { DashboardWorkspace } from "@/components/user/DashboardWorkspace";
import { UserLayout } from "@/components/layout/UserLayout";
import { useIsMobile } from "@/hooks/use-mobile";

const UserDashboard = () => {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const { currentUser } = useUser();
  const isMobile = useIsMobile();

  if (!currentUser) {
    navigate("/login");
    return null;
  }

  const isProfileTab = searchParams.get("tab") === "profile";

  const getGreeting = () => {
    const hour = new Date().getHours();
    if (hour < 12) return "Good morning";
    if (hour < 18) return "Good afternoon";
    return "Good evening";
  };

  return (
    <UserLayout>
      <div className="p-4 md:p-8">
        <div className="max-w-4xl mx-auto space-y-4 md:space-y-6">
          {/* Welcome Section */}
          {!isProfileTab && (
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-3 md:gap-4">
              <div>
                <h1 className="text-xl font-semibold tracking-tight">
                  {getGreeting()}, {currentUser.firstName}!
                </h1>
                <p className="text-sm md:text-base text-muted-foreground mt-0.5 md:mt-1">
                  Here's everything you need to complete today
                </p>
              </div>
              <div className="hidden md:flex items-center gap-2">
                <Badge variant="secondary" className="gap-1.5">
                  <Calendar className="w-3 h-3" />
                  {format(new Date(), "EEEE, MMM d")}
                </Badge>
              </div>
            </div>
          )}

          {/* Content */}
          {isProfileTab ? <UserProfileTab /> : <DashboardWorkspace />}
        </div>
      </div>
    </UserLayout>
  );
};

export default UserDashboard;
