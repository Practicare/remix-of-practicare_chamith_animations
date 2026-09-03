import { useLocation, useNavigate } from "react-router-dom";
import { useEffect } from "react";
import { Button } from "@/components/ui/button";
import { ArrowLeft, Home, LayoutDashboard } from "lucide-react";
import { APP_BRAND, APP_LOGOS } from "@/config/branding";

const NotFound = () => {
  const location = useLocation();
  const navigate = useNavigate();

  useEffect(() => {
    console.error("404 Error: User attempted to access non-existent route:", location.pathname);
  }, [location.pathname]);

  return (
    <div className="min-h-screen bg-background flex items-center justify-center px-6">
      <div className="w-full max-w-md text-center">
        <div className="flex items-center justify-center gap-2.5 mb-8">
          <img src={APP_LOGOS.icon} alt={APP_BRAND.name} className="w-8 h-8 object-contain" />
          <span className="text-[15px] font-bold tracking-tight text-foreground">{APP_BRAND.name}</span>
        </div>

        <p className="text-sm font-semibold text-primary mb-2">404</p>
        <h1 className="text-2xl font-bold text-foreground mb-2">This page doesn’t exist</h1>
        <p className="text-sm text-muted-foreground mb-1">
          We couldn’t find anything at
        </p>
        <p className="text-sm font-medium text-foreground bg-muted rounded-lg px-3 py-2 inline-block mb-6 break-all">
          {location.pathname}
        </p>

        <div className="flex flex-col sm:flex-row gap-2 justify-center">
          <Button variant="outline" className="rounded-lg" onClick={() => navigate(-1)}>
            <ArrowLeft className="w-4 h-4 mr-2" />
            Go back
          </Button>
          <Button className="rounded-lg" onClick={() => navigate("/dashboard")}>
            <LayoutDashboard className="w-4 h-4 mr-2" />
            Dashboard
          </Button>
          <Button variant="ghost" className="rounded-lg" onClick={() => navigate("/")}>
            <Home className="w-4 h-4 mr-2" />
            Home
          </Button>
        </div>
      </div>
    </div>
  );
};

export default NotFound;
