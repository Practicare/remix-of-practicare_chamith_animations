import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Checkbox } from "@/components/ui/checkbox";
import { Eye, EyeOff, Mail, Lock, User, Building2, Shield, Users, ArrowLeft } from "lucide-react";
import { toast } from "sonner";
import { mockStaffMembers } from "@/data/mockStaff";
import { APP_BRAND } from "@/config/branding";
import { cn } from "@/lib/utils";
import { useUser } from "@/contexts/UserContext";

type UserType = "admin" | "user";
type AuthMode = "login" | "register";

const Login = () => {
  const navigate = useNavigate();
  const { setCurrentUser, setUserRole } = useUser();
  const [showPassword, setShowPassword] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [userType, setUserType] = useState<UserType>("admin");
  const [authMode, setAuthMode] = useState<AuthMode>("login");
  
  // Staff login form state
  const [staffEmail, setStaffEmail] = useState("");
  const [staffPassword, setStaffPassword] = useState("");
  

  // Login form state
  const [loginEmail, setLoginEmail] = useState("");
  const [loginPassword, setLoginPassword] = useState("");
  const [rememberMe, setRememberMe] = useState(false);

  // Register form state
  const [registerName, setRegisterName] = useState("");
  const [registerEmail, setRegisterEmail] = useState("");
  const [registerPassword, setRegisterPassword] = useState("");
  const [registerConfirmPassword, setRegisterConfirmPassword] = useState("");
  const [companyName, setCompanyName] = useState("");
  const [agreeToTerms, setAgreeToTerms] = useState(false);


  const handleDemoLogin = (type: "admin" | "user") => {
    if (type === "admin") {
      setUserRole("admin");
      setCurrentUser(null);
      toast.success("Demo admin login successful!");
      navigate("/dashboard");
    } else {
      const demoStaff = mockStaffMembers[0]; // Use first staff member as demo
      setUserRole("user");
      setCurrentUser(demoStaff);
      toast.success(`Welcome, ${demoStaff.firstName}! (Demo mode)`);
      navigate("/user");
    }
  };

  const handleAdminLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!loginEmail || !loginPassword) {
      toast.error("Please fill in all fields");
      return;
    }
    
    setIsLoading(true);
    await new Promise(resolve => setTimeout(resolve, 1000));
    setIsLoading(false);
    
    setUserRole("admin");
    setCurrentUser(null); // Admin doesn't need a staff profile
    toast.success("Admin login successful!");
    navigate("/dashboard");
  };

  const handleUserLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!staffEmail || !staffPassword) {
      toast.error("Please fill in all fields");
      return;
    }

    setIsLoading(true);
    await new Promise(resolve => setTimeout(resolve, 800));
    
    // Mock: Find staff by email
    const staff = mockStaffMembers.find(s => s.email.toLowerCase() === staffEmail.toLowerCase());
    
    if (!staff) {
      setIsLoading(false);
      toast.error("Invalid email or password");
      return;
    }

    setIsLoading(false);
    
    // Route based on roleLevel — admins go to /dashboard, everyone else to /user
    if (staff.roleLevel === "admin") {
      setUserRole("admin");
      setCurrentUser(staff);
      toast.success(`Welcome back, ${staff.firstName}! (Admin)`);
      navigate("/dashboard");
    } else {
      setUserRole("user");
      setCurrentUser(staff);
      toast.success(`Welcome back, ${staff.firstName}!`);
      navigate("/user");
    }
  };

  const handleRegister = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!registerName || !registerEmail || !registerPassword || !registerConfirmPassword) {
      toast.error("Please fill in all required fields");
      return;
    }
    
    if (registerPassword !== registerConfirmPassword) {
      toast.error("Passwords do not match");
      return;
    }
    
    if (!agreeToTerms) {
      toast.error("Please agree to the terms and conditions");
      return;
    }
    
    setIsLoading(true);
    await new Promise(resolve => setTimeout(resolve, 1000));
    setIsLoading(false);
    
    toast.success(`${userType === "admin" ? "Admin" : "User"} account created successfully!`);
    navigate("/dashboard");
  };

  const isAdmin = userType === "admin";

  return (
    <div className="min-h-[100dvh] bg-gradient-to-b from-background to-muted/20 flex flex-col safe-area-inset">
      {/* Compact header */}
      <header className="sticky top-0 z-10 bg-background/80 backdrop-blur-lg border-b border-border/40 px-4 py-2.5">
        <div className="flex items-center justify-between max-w-md mx-auto">
          <button
            onClick={() => navigate("/")}
            className="flex items-center gap-1.5 text-muted-foreground hover:text-foreground transition-colors active:scale-95"
          >
            <ArrowLeft className="h-4 w-4" />
            <span className="text-sm">Back</span>
          </button>
          <h1 className="text-base font-bold text-primary">{APP_BRAND.name}</h1>
          <div className="w-12" />
        </div>
      </header>

      {/* Main content */}
      <main className="flex-1 overflow-y-auto px-4 py-4">
        <div className="max-w-md mx-auto space-y-4">
          {/* Compact hero */}
          <div className="text-center space-y-2 pt-2">
            <div className={cn(
              "inline-flex items-center justify-center w-14 h-14 rounded-xl transition-all duration-300",
              isAdmin ? "bg-primary/10" : "bg-accent/10"
            )}>
              {isAdmin ? (
                <Shield className="h-7 w-7 text-primary" />
              ) : (
                <Users className="h-7 w-7 text-accent-foreground" />
              )}
            </div>
            <div>
              <h2 className="text-xl font-bold text-foreground">
                {isAdmin ? "Admin Portal" : "Staff Portal"}
              </h2>
              <p className="text-muted-foreground text-xs">
                {authMode === "login" ? "Sign in to continue" : "Create your account"}
              </p>
            </div>
          </div>

          {/* Compact pill-style role toggle */}
          <div className="flex justify-center">
            <div className="inline-flex p-1 bg-muted/50 rounded-full border border-border/50">
              <button
                type="button"
                onClick={() => setUserType("admin")}
                className={cn(
                  "flex items-center gap-1.5 px-4 py-2 rounded-full text-sm font-medium transition-all duration-200 active:scale-[0.98]",
                  isAdmin
                    ? "bg-primary text-primary-foreground shadow-sm"
                    : "text-muted-foreground hover:text-foreground"
                )}
              >
                <Shield className="h-4 w-4" />
                Admin
              </button>
              <button
                type="button"
                onClick={() => setUserType("user")}
                className={cn(
                  "flex items-center gap-1.5 px-4 py-2 rounded-full text-sm font-medium transition-all duration-200 active:scale-[0.98]",
                  !isAdmin
                    ? "bg-primary text-primary-foreground shadow-sm"
                    : "text-muted-foreground hover:text-foreground"
                )}
              >
                <User className="h-4 w-4" />
                Staff
              </button>
            </div>
          </div>

          {/* Form Card */}
          <div className="bg-card rounded-xl border border-border/40 shadow-sm overflow-hidden">
            {isAdmin ? (
              <>
                {/* Compact auth mode toggle */}
                <div className="grid grid-cols-2 border-b border-border/40">
                  <button
                    type="button"
                    onClick={() => setAuthMode("login")}
                    className={cn(
                      "py-2.5 text-sm font-medium transition-colors",
                      authMode === "login"
                        ? "bg-primary/5 text-primary border-b-2 border-primary"
                        : "text-muted-foreground hover:text-foreground"
                    )}
                  >
                    Sign In
                  </button>
                  <button
                    type="button"
                    onClick={() => setAuthMode("register")}
                    className={cn(
                      "py-2.5 text-sm font-medium transition-colors",
                      authMode === "register"
                        ? "bg-primary/5 text-primary border-b-2 border-primary"
                        : "text-muted-foreground hover:text-foreground"
                    )}
                  >
                    Create Account
                  </button>
                </div>

                {authMode === "login" ? (
                  <form onSubmit={handleAdminLogin} className="p-4 space-y-3">
                    <div className="space-y-1.5">
                      <Label htmlFor="login-email" className="text-xs font-medium">
                        Email
                      </Label>
                      <div className="relative">
                        <Mail className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                        <Input
                          id="login-email"
                          type="email"
                          placeholder="Enter your email"
                          className="pl-10 h-11 text-sm rounded-lg"
                          value={loginEmail}
                          onChange={(e) => setLoginEmail(e.target.value)}
                        />
                      </div>
                    </div>

                    <div className="space-y-1.5">
                      <Label htmlFor="login-password" className="text-xs font-medium">
                        Password
                      </Label>
                      <div className="relative">
                        <Lock className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                        <Input
                          id="login-password"
                          type={showPassword ? "text" : "password"}
                          placeholder="Enter your password"
                          className="pl-10 pr-10 h-11 text-sm rounded-lg"
                          value={loginPassword}
                          onChange={(e) => setLoginPassword(e.target.value)}
                        />
                        <button
                          type="button"
                          onClick={() => setShowPassword(!showPassword)}
                          className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground transition-colors"
                        >
                          {showPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                        </button>
                      </div>
                    </div>

                    <div className="flex items-center justify-between">
                      <div className="flex items-center space-x-2">
                        <Checkbox
                          id="remember"
                          checked={rememberMe}
                          onCheckedChange={(checked) => setRememberMe(checked as boolean)}
                          className="h-4 w-4"
                        />
                        <Label htmlFor="remember" className="text-xs font-normal cursor-pointer">
                          Remember me
                        </Label>
                      </div>
                      <button
                        type="button"
                        className="text-xs text-primary font-medium active:opacity-70"
                        onClick={() => toast.info("Password reset functionality coming soon")}
                      >
                        Forgot password?
                      </button>
                    </div>

                    <div className="space-y-2.5 pt-1">
                      <Button 
                        type="submit" 
                        className="w-full h-11 text-sm font-semibold rounded-lg" 
                        disabled={isLoading}
                      >
                        {isLoading ? "Signing in..." : "Sign In"}
                      </Button>
                      
                      <div className="relative">
                        <div className="absolute inset-0 flex items-center">
                          <span className="w-full border-t border-border/50" />
                        </div>
                        <div className="relative flex justify-center text-[10px] uppercase">
                          <span className="bg-card px-2 text-muted-foreground">Or continue with</span>
                        </div>
                      </div>

                      <div className="grid grid-cols-2 gap-2">
                        <Button
                          type="button"
                          variant="outline"
                          className="h-11 text-sm font-medium rounded-lg gap-2"
                          onClick={() => toast.info("Google login coming soon")}
                        >
                          <svg className="h-4 w-4" viewBox="0 0 24 24">
                            <path d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92a5.06 5.06 0 0 1-2.2 3.32v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.1z" fill="#4285F4" />
                            <path d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" fill="#34A853" />
                            <path d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z" fill="#FBBC05" />
                            <path d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z" fill="#EA4335" />
                          </svg>
                          Google
                        </Button>
                        <Button
                          type="button"
                          variant="outline"
                          className="h-11 text-sm font-medium rounded-lg gap-2"
                          onClick={() => toast.info("Outlook login coming soon")}
                        >
                          <svg className="h-4 w-4" viewBox="0 0 24 24">
                            <path d="M2 3h9v9H2V3z" fill="#F25022" />
                            <path d="M13 3h9v9h-9V3z" fill="#7FBA00" />
                            <path d="M2 13h9v9H2v-9z" fill="#00A4EF" />
                            <path d="M13 13h9v9h-9v-9z" fill="#FFB900" />
                          </svg>
                          Outlook
                        </Button>
                      </div>
                      
                      <Button
                        type="button"
                        variant="outline"
                        className="w-full h-11 text-sm font-medium rounded-lg"
                        onClick={() => handleDemoLogin("admin")}
                      >
                        Continue as Demo
                      </Button>
                    </div>
                  </form>
                ) : (
                  <form onSubmit={handleRegister} className="p-4 space-y-3">
                    <div className="grid grid-cols-2 gap-3">
                      <div className="space-y-1.5">
                        <Label htmlFor="register-name" className="text-xs font-medium">
                          Full Name *
                        </Label>
                        <div className="relative">
                          <User className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                          <Input
                            id="register-name"
                            type="text"
                            placeholder="Your name"
                            className="pl-10 h-11 text-sm rounded-lg"
                            value={registerName}
                            onChange={(e) => setRegisterName(e.target.value)}
                          />
                        </div>
                      </div>

                      <div className="space-y-1.5">
                        <Label htmlFor="company-name" className="text-xs font-medium">
                          Company
                        </Label>
                        <div className="relative">
                          <Building2 className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                          <Input
                            id="company-name"
                            type="text"
                            placeholder="Company name"
                            className="pl-10 h-11 text-sm rounded-lg"
                            value={companyName}
                            onChange={(e) => setCompanyName(e.target.value)}
                          />
                        </div>
                      </div>
                    </div>

                    <div className="space-y-1.5">
                      <Label htmlFor="register-email" className="text-xs font-medium">
                        Email *
                      </Label>
                      <div className="relative">
                        <Mail className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                        <Input
                          id="register-email"
                          type="email"
                          placeholder="Enter your email"
                          className="pl-10 h-11 text-sm rounded-lg"
                          value={registerEmail}
                          onChange={(e) => setRegisterEmail(e.target.value)}
                        />
                      </div>
                    </div>

                    <div className="grid grid-cols-2 gap-3">
                      <div className="space-y-1.5">
                        <Label htmlFor="register-password" className="text-xs font-medium">
                          Password *
                        </Label>
                        <div className="relative">
                          <Lock className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                          <Input
                            id="register-password"
                            type={showPassword ? "text" : "password"}
                            placeholder="Password"
                            className="pl-10 pr-9 h-11 text-sm rounded-lg"
                            value={registerPassword}
                            onChange={(e) => setRegisterPassword(e.target.value)}
                          />
                          <button
                            type="button"
                            onClick={() => setShowPassword(!showPassword)}
                            className="absolute right-2.5 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground transition-colors"
                          >
                            {showPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                          </button>
                        </div>
                      </div>

                      <div className="space-y-1.5">
                        <Label htmlFor="confirm-password" className="text-xs font-medium">
                          Confirm *
                        </Label>
                        <div className="relative">
                          <Lock className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                          <Input
                            id="confirm-password"
                            type={showPassword ? "text" : "password"}
                            placeholder="Confirm"
                            className="pl-10 h-11 text-sm rounded-lg"
                            value={registerConfirmPassword}
                            onChange={(e) => setRegisterConfirmPassword(e.target.value)}
                          />
                        </div>
                      </div>
                    </div>

                    <div className="flex items-start space-x-2 pt-1">
                      <Checkbox
                        id="terms"
                        checked={agreeToTerms}
                        onCheckedChange={(checked) => setAgreeToTerms(checked as boolean)}
                        className="h-4 w-4 mt-0.5"
                      />
                      <Label htmlFor="terms" className="text-xs font-normal cursor-pointer leading-relaxed">
                        I agree to the{" "}
                        <button type="button" className="text-primary font-medium">Terms</button>{" "}
                        and{" "}
                        <button type="button" className="text-primary font-medium">Privacy Policy</button>
                      </Label>
                    </div>

                    <Button 
                      type="submit" 
                      className="w-full h-11 text-sm font-semibold rounded-lg mt-2" 
                      disabled={isLoading}
                    >
                      {isLoading ? "Creating..." : "Create Account"}
                    </Button>
                  </form>
                )}
              </>
            ) : (
              /* Staff Login - Compact */
              <form onSubmit={handleUserLogin} className="p-4 space-y-3">
                <div className="text-center pb-1">
                  <h3 className="font-semibold text-base">Staff Sign In</h3>
                  <p className="text-xs text-muted-foreground">
                    Enter your credentials to continue
                  </p>
                </div>

                <div className="space-y-1.5">
                  <Label htmlFor="staff-email" className="text-xs font-medium">
                    Email
                  </Label>
                  <div className="relative">
                    <Mail className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                    <Input
                      id="staff-email"
                      type="email"
                      placeholder="Enter your email"
                      className="pl-10 h-11 text-sm rounded-lg"
                      value={staffEmail}
                      onChange={(e) => setStaffEmail(e.target.value)}
                    />
                  </div>
                </div>

                <div className="space-y-1.5">
                  <Label htmlFor="staff-password" className="text-xs font-medium">
                    Password
                  </Label>
                  <div className="relative">
                    <Lock className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                    <Input
                      id="staff-password"
                      type={showPassword ? "text" : "password"}
                      placeholder="Enter your password"
                      className="pl-10 pr-10 h-11 text-sm rounded-lg"
                      value={staffPassword}
                      onChange={(e) => setStaffPassword(e.target.value)}
                    />
                    <button
                      type="button"
                      onClick={() => setShowPassword(!showPassword)}
                      className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground transition-colors"
                    >
                      {showPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                    </button>
                  </div>
                </div>

                <button
                  type="button"
                  className="text-xs text-primary font-medium active:opacity-70"
                  onClick={() => toast.info("Contact your admin for password reset")}
                >
                  Forgot password?
                </button>

                <div className="space-y-2.5 pt-1">
                  <Button 
                    type="submit" 
                    className="w-full h-11 text-sm font-semibold rounded-lg" 
                    disabled={isLoading}
                  >
                    {isLoading ? "Signing in..." : "Sign In"}
                  </Button>
                  
                  <div className="relative">
                    <div className="absolute inset-0 flex items-center">
                      <span className="w-full border-t border-border/50" />
                    </div>
                    <div className="relative flex justify-center text-[10px] uppercase">
                      <span className="bg-card px-2 text-muted-foreground">Or continue with</span>
                    </div>
                  </div>

                  <div className="grid grid-cols-2 gap-2">
                    <Button
                      type="button"
                      variant="outline"
                      className="h-11 text-sm font-medium rounded-lg gap-2"
                      onClick={() => toast.info("Google login coming soon")}
                    >
                      <svg className="h-4 w-4" viewBox="0 0 24 24">
                        <path d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92a5.06 5.06 0 0 1-2.2 3.32v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.1z" fill="#4285F4" />
                        <path d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" fill="#34A853" />
                        <path d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z" fill="#FBBC05" />
                        <path d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z" fill="#EA4335" />
                      </svg>
                      Google
                    </Button>
                    <Button
                      type="button"
                      variant="outline"
                      className="h-11 text-sm font-medium rounded-lg gap-2"
                      onClick={() => toast.info("Outlook login coming soon")}
                    >
                      <svg className="h-4 w-4" viewBox="0 0 24 24">
                        <path d="M2 3h9v9H2V3z" fill="#F25022" />
                        <path d="M13 3h9v9h-9V3z" fill="#7FBA00" />
                        <path d="M2 13h9v9H2v-9z" fill="#00A4EF" />
                        <path d="M13 13h9v9h-9v-9z" fill="#FFB900" />
                      </svg>
                      Outlook
                    </Button>
                  </div>
                  
                  <Button
                    type="button"
                    variant="outline"
                    className="w-full h-11 text-sm font-medium rounded-lg"
                    onClick={() => handleDemoLogin("user")}
                  >
                    Continue as Demo
                  </Button>
                </div>

                <p className="text-[11px] text-muted-foreground text-center">
                  Don't have an account? Contact your administrator.
                </p>
              </form>
            )}
          </div>

          {/* Compact footer */}
          <p className="text-[10px] text-muted-foreground text-center pb-2">
            By continuing, you agree to our Terms and Privacy Policy.
          </p>
        </div>
      </main>
    </div>
  );
};

export default Login;
