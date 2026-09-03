import { useState } from "react";
import { AdminLayout } from "@/components/layout/AdminLayout";
import { MobileHeader } from "@/components/layout/MobileHeader";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Switch } from "@/components/ui/switch";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { ModulesTab } from "@/components/settings/ModulesTab";
import { LayoutGrid } from "lucide-react";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from "@/components/ui/alert-dialog";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import {
  User,
  CreditCard,
  Mail,
  AlertTriangle,
  Receipt,
  Building,
  Building2,
  Shield,
  Download,
  ExternalLink,
  Check,
  Zap,
  Users,
  ArrowRight,
  MessageSquare,
  Plus,
  ClipboardCheck,
  CheckSquare,
  FileText,
  Bell,
  Clock,
  X,
} from "lucide-react";
import { useUser } from "@/contexts/UserContext";
import { toast } from "sonner";
import { DepartmentsTab } from "@/components/settings/DepartmentsTab";
import { OperatingHoursTab } from "@/components/settings/OperatingHoursTab";
import { PermissionsTab } from "@/components/settings/PermissionsTab";

type BillingCycle = "monthly" | "annual";

const subscriptionPlans = [
  {
    id: "small",
    name: "Small",
    monthlyPrice: 179,
    staffRange: "Up to 10 staff",
    description: "Perfect for small practices just getting started.",
    features: [
      "Up to 10 staff members",
      "Task management",
      "Team management",
      "Stock management",
      "Checklist management",
      "5GB storage",
      "Email support",
    ],
  },
  {
    id: "medium",
    name: "Medium",
    monthlyPrice: 279,
    staffRange: "11-25 staff",
    description: "For growing practices that need more power.",
    features: [
      "11-25 staff members",
      "Everything in Small",
      "Advanced reporting",
      "Full compliance suite",
      "SMS & email reminders",
      "25GB storage",
      "Priority support",
      "Reporting & analytics",
    ],
    popular: true,
  },
  {
    id: "large",
    name: "Large",
    monthlyPrice: 379,
    staffRange: "26-51 staff",
    description: "For larger practices with advanced needs.",
    features: [
      "26-51 staff members",
      "Everything in Medium",
      "Multi-location support",
      "Custom integrations",
      "Dedicated account manager",
      "Unlimited storage",
      "24/7 phone support",
      "API access",
    ],
  },
];

const billingCycleOptions: { value: BillingCycle; label: string; discount?: number }[] = [
  { value: "monthly", label: "Monthly" },
  { value: "annual", label: "Annual", discount: 15 },
];

const getPriceForCycle = (plan: typeof subscriptionPlans[0], cycle: BillingCycle) => {
  switch (cycle) {
    case "monthly":
      return plan.monthlyPrice;
    case "annual":
      return Math.round(plan.monthlyPrice * 12 * 0.85);
  }
};

const getPriceLabel = (cycle: BillingCycle) => {
  switch (cycle) {
    case "monthly":
      return "/month";
    case "annual":
      return "/year";
  }
};

const getBillingDescription = (cycle: BillingCycle) => {
  switch (cycle) {
    case "monthly":
      return "Billed monthly";
    case "annual":
      return "Billed annually (save 15%)";
  }
};

const Settings = () => {
  const { currentUser } = useUser();
  const [activeTab, setActiveTab] = useState("account");
  const [showUpgradeDialog, setShowUpgradeDialog] = useState(false);
  const [showSmsDialog, setShowSmsDialog] = useState(false);
  const [smsCredits, setSmsCredits] = useState(250);
  const [smsToPurchase, setSmsToPurchase] = useState(100);
  const [currentPlan, setCurrentPlan] = useState("medium");
  const [billingCycle, setBillingCycle] = useState<BillingCycle>("monthly");
  const [dialogBillingCycle, setDialogBillingCycle] = useState<BillingCycle>("monthly");

  // Mock data
  const [accountData, setAccountData] = useState({
    practiceName: "Sunrise Medical Practice",
    email: currentUser?.email || "admin@practice.com",
    phone: "+61 2 9000 0000",
    address: "123 Medical Street, Sydney NSW 2000",
    abn: "12 345 678 901",
  });

  const [emailPreferences, setEmailPreferences] = useState({
    taskReminders: true,
    checklistAlerts: true,
    complianceExpiry: true,
    stockAlerts: true,
    weeklyDigest: true,
    marketingUpdates: false,
  });

  type AlertKey = "taskReminders" | "checklistAlerts" | "complianceExpiry" | "stockAlerts";
  type RecipientStatus = "verified" | "pending";
  interface Recipient {
    email: string;
    status: RecipientStatus;
    sentAt?: number;
  }
  const defaultEmail = currentUser?.email || "admin@practice.com";
  const [alertRecipients, setAlertRecipients] = useState<Record<AlertKey, Recipient[]>>({
    taskReminders: [{ email: defaultEmail, status: "verified" }],
    checklistAlerts: [{ email: defaultEmail, status: "verified" }],
    complianceExpiry: [{ email: defaultEmail, status: "verified" }],
    stockAlerts: [{ email: defaultEmail, status: "verified" }],
  });
  const [newAlertEmail, setNewAlertEmail] = useState<Record<AlertKey, string>>({
    taskReminders: "",
    checklistAlerts: "",
    complianceExpiry: "",
    stockAlerts: "",
  });
  const [previewLink, setPreviewLink] = useState<{ key: AlertKey; email: string; url: string } | null>(null);

  const makeConfirmUrl = (email: string) =>
    `${window.location.origin}/settings?confirm_email=${encodeURIComponent(email)}&token=${Math.random().toString(36).slice(2, 10)}`;

  const addAlertEmail = (key: AlertKey) => {
    const value = newAlertEmail[key].trim().toLowerCase();
    if (!value) return;
    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(value)) {
      toast.error("Please enter a valid email address");
      return;
    }
    const list = alertRecipients[key];
    if (list.some((r) => r.email === value)) {
      toast.error("Email already added");
      return;
    }
    if (list.length >= 3) {
      toast.error("Maximum of 3 emails allowed");
      return;
    }
    setAlertRecipients({
      ...alertRecipients,
      [key]: [...list, { email: value, status: "pending", sentAt: Date.now() }],
    });
    setNewAlertEmail({ ...newAlertEmail, [key]: "" });
    toast.success(`Confirmation link sent to ${value}`);
  };

  const removeAlertEmail = (key: AlertKey, email: string) => {
    setAlertRecipients({
      ...alertRecipients,
      [key]: alertRecipients[key].filter((r) => r.email !== email),
    });
  };

  const resendConfirmation = (key: AlertKey, email: string) => {
    setAlertRecipients({
      ...alertRecipients,
      [key]: alertRecipients[key].map((r) =>
        r.email === email ? { ...r, status: "pending", sentAt: Date.now() } : r
      ),
    });
    toast.success(`Confirmation link re-sent to ${email}`);
  };

  const openPreviewLink = (key: AlertKey, email: string) => {
    setPreviewLink({ key, email, url: makeConfirmUrl(email) });
  };

  const simulateConfirm = () => {
    if (!previewLink) return;
    const { key, email } = previewLink;
    setAlertRecipients({
      ...alertRecipients,
      [key]: alertRecipients[key].map((r) =>
        r.email === email ? { ...r, status: "verified" } : r
      ),
    });
    toast.success(`${email} confirmed`);
    setPreviewLink(null);
  };



  const [smsPreferences, setSmsPreferences] = useState({
    complianceReminders: true,
    importantTaskReminders: true,
    checklistReminders: false,
    mandatoryMemoReminders: true,
  });

  const smsModules = [
    {
      key: "complianceReminders" as const,
      label: "Compliance Reminders",
      description: "SMS alerts when compliance items are expiring or overdue",
      icon: Shield,
      estimatedUsage: "~5-15 SMS/month",
    },
    {
      key: "importantTaskReminders" as const,
      label: "Important Task Reminders",
      description: "SMS alerts for high-priority tasks and urgent deadlines",
      icon: CheckSquare,
      estimatedUsage: "~10-30 SMS/month",
    },
    {
      key: "checklistReminders" as const,
      label: "Checklist Reminders",
      description: "SMS alerts for incomplete or overdue checklists",
      icon: ClipboardCheck,
      estimatedUsage: "~20-50 SMS/month",
    },
    {
      key: "mandatoryMemoReminders" as const,
      label: "Mandatory Memo Reminders",
      description: "SMS alerts when staff haven't acknowledged mandatory memos",
      icon: FileText,
      estimatedUsage: "~2-10 SMS/month",
    },
  ];

  const handleSaveSmsPreferences = () => {
    toast.success("SMS preferences updated");
  };

  const currentPlanData = subscriptionPlans.find(p => p.id === currentPlan)!;

  const [billingInfo] = useState({
    billingCycle: "Monthly",
    nextBilling: "February 15, 2026",
    cardLast4: "4242",
    cardBrand: "Visa",
  });

  const [invoices] = useState([
    { id: "INV-2026-001", date: "January 15, 2026", amount: "$289.00", status: "paid" },
    { id: "INV-2025-012", date: "December 15, 2025", amount: "$289.00", status: "paid" },
    { id: "INV-2025-011", date: "November 15, 2025", amount: "$289.00", status: "paid" },
    { id: "INV-2025-010", date: "October 15, 2025", amount: "$289.00", status: "paid" },
    { id: "INV-2025-009", date: "September 15, 2025", amount: "$189.00", status: "paid" },
  ]);

  const handleSaveAccount = () => {
    toast.success("Account settings saved successfully");
  };

  const handleSaveEmail = () => {
    toast.success("Email preferences updated");
  };

  const handleUpdateBilling = () => {
    toast.info("Stripe billing portal would open here");
  };

  const handleCancelAccount = () => {
    toast.success("Account cancellation request submitted");
  };

  const handleChangePlan = (planId: string) => {
    const plan = subscriptionPlans.find(p => p.id === planId);
    if (plan) {
      setCurrentPlan(planId);
      setShowUpgradeDialog(false);
      toast.success(`Successfully switched to ${plan.name} plan`);
    }
  };

  const smsPricing = [
    { amount: 100, price: 15, perSms: "0.15" },
    { amount: 250, price: 30, perSms: "0.12" },
    { amount: 500, price: 50, perSms: "0.10" },
    { amount: 1000, price: 80, perSms: "0.08" },
  ];

  const handlePurchaseSms = () => {
    const pricing = smsPricing.find(p => p.amount === smsToPurchase);
    if (pricing) {
      setSmsCredits(prev => prev + smsToPurchase);
      setShowSmsDialog(false);
      toast.success(`Successfully purchased ${smsToPurchase} SMS credits for $${pricing.price}`);
    }
  };

  const tabItems = [
    { value: "account", label: "Account", icon: User },
    { value: "modules", label: "Modules", icon: LayoutGrid },
    { value: "departments", label: "Departments", icon: Building2 },
    { value: "permissions", label: "Permissions", icon: Shield },
    { value: "hours", label: "Hours", icon: Clock },
    { value: "billing", label: "Billing", icon: CreditCard },
    { value: "sms", label: "SMS", icon: MessageSquare },
    { value: "email", label: "Email", icon: Mail },
    { value: "invoices", label: "Invoices", icon: Receipt },
  ];

  return (
    <AdminLayout>
      <MobileHeader
        title="Settings"
        subtitle="Manage your account and preferences"
      />

      {/* Desktop Header */}
      <header className="hidden md:flex min-h-[72px] bg-card border-b border-border px-8 items-center justify-between sticky top-0 z-10">
        <div className="flex-1 min-w-0">
          <h2 className="text-xl font-semibold leading-tight">Settings</h2>
          <p className="text-[13px] text-muted-foreground mt-0.5">Manage your account and preferences</p>
        </div>
      </header>

      <div className="p-4 md:p-8 max-w-4xl mx-auto">
        <Tabs value={activeTab} onValueChange={setActiveTab} className="space-y-6">
          <TabsList className="grid w-full grid-cols-3 sm:grid-cols-5 lg:w-auto lg:inline-flex">
            {tabItems.map((tab) => (
              <TabsTrigger
                key={tab.value}
                value={tab.value}
                className="flex items-center gap-2 data-[state=active]:bg-primary data-[state=active]:text-primary-foreground"
              >
                <tab.icon className="w-4 h-4" />
                <span className="hidden sm:inline">{tab.label}</span>
              </TabsTrigger>
            ))}
          </TabsList>

          {/* Modules Tab */}
          <TabsContent value="modules" className="space-y-6">
            <ModulesTab />
          </TabsContent>

          {/* Account Tab */}
          <TabsContent value="account" className="space-y-6">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Building className="w-5 h-5" />
                  Practice Information
                </CardTitle>
                <CardDescription>Update your practice details and contact information</CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="grid gap-4 md:grid-cols-2">
                  <div className="space-y-2">
                    <Label htmlFor="practiceName">Practice Name</Label>
                    <Input
                      id="practiceName"
                      value={accountData.practiceName}
                      onChange={(e) => setAccountData({ ...accountData, practiceName: e.target.value })}
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="abn">ABN</Label>
                    <Input
                      id="abn"
                      value={accountData.abn}
                      onChange={(e) => setAccountData({ ...accountData, abn: e.target.value })}
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="email">Email</Label>
                    <Input
                      id="email"
                      type="email"
                      value={accountData.email}
                      onChange={(e) => setAccountData({ ...accountData, email: e.target.value })}
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="phone">Phone</Label>
                    <Input
                      id="phone"
                      value={accountData.phone}
                      onChange={(e) => setAccountData({ ...accountData, phone: e.target.value })}
                    />
                  </div>
                  <div className="space-y-2 md:col-span-2">
                    <Label htmlFor="address">Address</Label>
                    <Input
                      id="address"
                      value={accountData.address}
                      onChange={(e) => setAccountData({ ...accountData, address: e.target.value })}
                    />
                  </div>
                </div>
                <div className="flex justify-end">
                  <Button onClick={handleSaveAccount}>Save Changes</Button>
                </div>
              </CardContent>
            </Card>

            {/* Security Section */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Shield className="w-5 h-5" />
                  Security
                </CardTitle>
                <CardDescription>Manage your account security settings</CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="font-medium">Two-Factor Authentication</p>
                    <p className="text-sm text-muted-foreground">Add an extra layer of security to your account</p>
                  </div>
                  <Button variant="outline">Enable 2FA</Button>
                </div>
                <Separator />
                <div className="flex items-center justify-between">
                  <div>
                    <p className="font-medium">Change Password</p>
                    <p className="text-sm text-muted-foreground">Update your account password</p>
                  </div>
                  <Button variant="outline">Change Password</Button>
                </div>
              </CardContent>
            </Card>

            {/* Cancel Account Section */}
            <Card className="border-destructive/50">
              <CardHeader>
                <CardTitle className="flex items-center gap-2 text-destructive">
                  <AlertTriangle className="w-5 h-5" />
                  Danger Zone
                </CardTitle>
                <CardDescription>Irreversible actions for your account</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="flex items-center justify-between">
                  <div>
                    <p className="font-medium">Cancel Account</p>
                    <p className="text-sm text-muted-foreground">Permanently delete your account and all data</p>
                  </div>
                  <AlertDialog>
                    <AlertDialogTrigger asChild>
                      <Button variant="destructive">Cancel Account</Button>
                    </AlertDialogTrigger>
                    <AlertDialogContent>
                      <AlertDialogHeader>
                        <AlertDialogTitle>Are you absolutely sure?</AlertDialogTitle>
                        <AlertDialogDescription>
                          This action cannot be undone. This will permanently delete your account
                          and remove all your data from our servers. All staff members will lose access.
                        </AlertDialogDescription>
                      </AlertDialogHeader>
                      <AlertDialogFooter>
                        <AlertDialogCancel>Cancel</AlertDialogCancel>
                        <AlertDialogAction
                          onClick={handleCancelAccount}
                          className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
                        >
                          Yes, cancel my account
                        </AlertDialogAction>
                      </AlertDialogFooter>
                    </AlertDialogContent>
                  </AlertDialog>
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          {/* Departments Tab */}
          <TabsContent value="departments" className="space-y-6">
            <DepartmentsTab />
          </TabsContent>

          {/* Permissions Tab */}
          <TabsContent value="permissions" className="space-y-6">
            <PermissionsTab />
          </TabsContent>

          {/* Operating Hours Tab */}
          <TabsContent value="hours" className="space-y-6">
            <OperatingHoursTab />
          </TabsContent>

          {/* Billing Tab */}
          <TabsContent value="billing" className="space-y-6">
            {/* Current Subscription Card */}
            <Card className="overflow-hidden">
              <CardHeader className="bg-gradient-to-r from-primary/10 to-primary/5 border-b">
                <div className="flex items-center justify-between">
                  <div>
                    <CardTitle className="flex items-center gap-2">
                      <Zap className="w-5 h-5 text-primary" />
                      Your Subscription
                    </CardTitle>
                    <CardDescription>Manage your plan and billing</CardDescription>
                  </div>
                  <Badge className="bg-primary/20 text-primary border-primary/30">Active</Badge>
                </div>
              </CardHeader>
              <CardContent className="p-6 space-y-6">
                {/* Billing Cycle Selector */}
                <div className="space-y-3">
                  <Label className="text-sm font-medium">Billing Frequency</Label>
                  <div className="flex flex-wrap gap-2">
                    {billingCycleOptions.map((option) => (
                      <button
                        key={option.value}
                        onClick={() => setBillingCycle(option.value)}
                        className={`px-3.5 py-1.5 rounded-lg text-[13px] font-medium transition-colors flex items-center ${
                          billingCycle === option.value
                            ? "bg-primary text-primary-foreground"
                            : "bg-muted hover:bg-muted/80 text-muted-foreground"
                        }`}
                      >
                        {option.label}
                        {option.discount && (
                          <Badge 
                            variant="secondary" 
                            className={`ml-2 text-xs border-0 ${
                              billingCycle === option.value 
                                ? "bg-white/20 text-white" 
                                : "bg-emerald-500/20 text-emerald-600"
                            }`}
                          >
                            Save {option.discount}%
                          </Badge>
                        )}
                      </button>
                    ))}
                  </div>
                  <p className="text-xs text-muted-foreground">{getBillingDescription(billingCycle)}</p>
                </div>

                <Separator />

                {/* Current Plan Display */}
                <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 p-5 bg-card rounded-xl border-2 border-primary/20 shadow-sm">
                  <div className="flex items-start gap-4">
                    <div className="w-14 h-14 rounded-xl bg-primary/10 flex items-center justify-center">
                      <Users className="w-7 h-7 text-primary" />
                    </div>
                    <div>
                      <div className="flex items-center gap-2 mb-1">
                        <h3 className="text-xl font-bold">{currentPlanData.name} Plan</h3>
                        <Badge variant="secondary" className="text-xs">Current</Badge>
                      </div>
                      <p className="text-muted-foreground">{currentPlanData.staffRange}</p>
                      <p className="text-sm text-muted-foreground mt-1">{currentPlanData.description}</p>
                    </div>
                  </div>
                  <div className="text-left md:text-right">
                    <div className="flex items-baseline gap-1">
                      <span className="text-3xl font-bold">${getPriceForCycle(currentPlanData, billingCycle)}</span>
                      <span className="text-muted-foreground">{getPriceLabel(billingCycle)}</span>
                    </div>
                    {billingCycle === "annual" && (
                      <p className="text-sm text-emerald-600 font-medium">
                        Save ${Math.round(currentPlanData.monthlyPrice * 12 * 0.15)}/year
                      </p>
                    )}
                  </div>
                </div>

                {/* Plan Features */}
                <div className="grid gap-2 sm:grid-cols-2">
                  {currentPlanData.features.slice(0, 6).map((feature) => (
                    <div key={feature} className="flex items-center gap-2 text-sm">
                      <Check className="w-4 h-4 text-primary flex-shrink-0" />
                      <span>{feature}</span>
                    </div>
                  ))}
                </div>

                <Separator />

                {/* Billing Details */}
                <div className="grid gap-4 sm:grid-cols-3">
                  <div className="space-y-1">
                    <p className="text-sm text-muted-foreground">Billing Cycle</p>
                    <p className="font-medium capitalize">{billingCycle}</p>
                  </div>
                  <div className="space-y-1">
                    <p className="text-sm text-muted-foreground">Next Billing Date</p>
                    <p className="font-medium">{billingInfo.nextBilling}</p>
                  </div>
                  <div className="space-y-1">
                    <p className="text-sm text-muted-foreground">Status</p>
                    <p className="font-medium text-success">Active</p>
                  </div>
                </div>

                {/* Actions */}
                <div className="flex flex-wrap gap-3 pt-2">
                  <Button onClick={() => { setDialogBillingCycle(billingCycle); setShowUpgradeDialog(true); }} className="gap-2">
                    <ArrowRight className="w-4 h-4" />
                    Change Plan
                  </Button>
                  <Button variant="outline" onClick={handleUpdateBilling} className="gap-2">
                    <ExternalLink className="w-4 h-4" />
                    Manage Billing
                  </Button>
                </div>
              </CardContent>
            </Card>

            {/* Payment Method Card */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <CreditCard className="w-5 h-5" />
                  Payment Method
                </CardTitle>
                <CardDescription>Manage your payment details</CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="flex items-center justify-between p-4 border rounded-lg bg-muted/30">
                  <div className="flex items-center gap-3">
                    <div className="w-12 h-8 bg-gradient-to-r from-blue-600 to-blue-400 rounded flex items-center justify-center text-white text-xs font-bold">
                      {billingInfo.cardBrand}
                    </div>
                    <div>
                      <p className="font-medium">•••• •••• •••• {billingInfo.cardLast4}</p>
                      <p className="text-sm text-muted-foreground">Expires 12/2027</p>
                    </div>
                  </div>
                  <Badge variant="outline" className="gap-1">
                    <Check className="w-3 h-3" />
                    Default
                  </Badge>
                </div>
                <Button variant="outline" onClick={handleUpdateBilling} className="gap-2">
                  <ExternalLink className="w-4 h-4" />
                  Update Payment Method
                </Button>
              </CardContent>
            </Card>

            {/* Upgrade Dialog */}
            <Dialog open={showUpgradeDialog} onOpenChange={setShowUpgradeDialog}>
              <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto">
                <DialogHeader>
                  <DialogTitle className="text-2xl">Change Your Plan</DialogTitle>
                  <DialogDescription>
                    Choose the plan that best fits your practice. Changes take effect immediately.
                  </DialogDescription>
                </DialogHeader>

                {/* Billing Cycle Toggle in Dialog */}
                <div className="flex flex-wrap items-center justify-center gap-2 mt-4 p-4 bg-muted/30 rounded-xl">
                  {billingCycleOptions.map((option) => (
                    <button
                      key={option.value}
                      onClick={() => setDialogBillingCycle(option.value)}
                      className={`px-3.5 py-1.5 rounded-lg text-[13px] font-medium transition-colors ${
                        dialogBillingCycle === option.value
                          ? "bg-primary text-primary-foreground shadow-md"
                          : "bg-background hover:bg-muted text-foreground border"
                      }`}
                    >
                      {option.label}
                      {option.discount && (
                        <span className="ml-1.5 text-xs bg-emerald-500/20 text-emerald-600 px-1.5 py-0.5 rounded-lg">
                          -{option.discount}%
                        </span>
                      )}
                    </button>
                  ))}
                </div>

                <div className="grid gap-4 md:grid-cols-3 mt-4">
                  {subscriptionPlans.map((plan) => {
                    const isCurrentPlan = plan.id === currentPlan && dialogBillingCycle === billingCycle;
                    const price = getPriceForCycle(plan, dialogBillingCycle);
                    const originalMonthlyTotal = plan.monthlyPrice * 12;
                    const annualSaving = dialogBillingCycle === "annual" ? Math.round(originalMonthlyTotal * 0.15) : 0;
                    
                    return (
                      <div
                        key={plan.id}
                        className={`relative rounded-xl p-5 border-2 transition-all ${
                          isCurrentPlan
                            ? "border-primary bg-primary/5"
                            : plan.popular
                            ? "border-primary/50 bg-card"
                            : "border-border bg-card hover:border-primary/30"
                        }`}
                      >
                        {plan.popular && !isCurrentPlan && (
                          <div className="absolute -top-3 left-1/2 -translate-x-1/2 px-3 py-0.5 bg-primary text-primary-foreground rounded-full text-xs font-medium">
                            Popular
                          </div>
                        )}
                        {isCurrentPlan && (
                          <div className="absolute -top-3 left-1/2 -translate-x-1/2 px-3 py-0.5 bg-primary text-primary-foreground rounded-full text-xs font-medium">
                            Current Plan
                          </div>
                        )}
                        
                        <div className="text-center mb-4 pt-2">
                          <h3 className="text-lg font-bold">{plan.name}</h3>
                          <div className="flex items-baseline justify-center gap-1 mt-2">
                            <span className="text-3xl font-bold">${price}</span>
                            <span className="text-muted-foreground text-sm">{getPriceLabel(dialogBillingCycle)}</span>
                          </div>
                          {dialogBillingCycle === "annual" && (
                            <p className="text-xs text-emerald-600 font-medium">Save ${annualSaving}/year</p>
                          )}
                          <p className="text-sm text-muted-foreground mt-2">{plan.staffRange}</p>
                        </div>

                        <ul className="space-y-2 mb-5">
                          {plan.features.slice(0, 5).map((feature) => (
                            <li key={feature} className="flex items-start gap-2 text-sm">
                              <Check className="w-4 h-4 text-primary flex-shrink-0 mt-0.5" />
                              <span>{feature}</span>
                            </li>
                          ))}
                        </ul>

                        <Button
                          variant={isCurrentPlan ? "outline" : "default"}
                          className="w-full"
                          disabled={isCurrentPlan}
                          onClick={() => {
                            setBillingCycle(dialogBillingCycle);
                            handleChangePlan(plan.id);
                          }}
                        >
                          {isCurrentPlan ? "Current Plan" : plan.id === "large" ? "Upgrade" : plan.id === "small" ? "Downgrade" : "Switch Plan"}
                        </Button>
                      </div>
                    );
                  })}
                </div>
                <p className="text-center text-sm text-muted-foreground mt-4">
                  Need help choosing? <button className="text-primary underline">Contact our sales team</button>
                </p>
              </DialogContent>
            </Dialog>
          </TabsContent>

          {/* SMS Tab */}
          <TabsContent value="sms" className="space-y-6">
            {/* SMS Notification Settings */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Bell className="w-5 h-5" />
                  SMS Notification Settings
                </CardTitle>
                <CardDescription>
                  Choose which modules send SMS notifications to use your credits wisely
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="space-y-4">
                  {smsModules.map((module) => (
                    <div
                      key={module.key}
                      className={`flex items-start justify-between p-4 rounded-lg border transition-colors ${
                        smsPreferences[module.key] 
                          ? "bg-primary/5 border-primary/30" 
                          : "bg-muted/30 border-border"
                      }`}
                    >
                      <div className="flex items-start gap-3">
                        <div className={`w-10 h-10 rounded-lg flex items-center justify-center ${
                          smsPreferences[module.key] 
                            ? "bg-primary/10" 
                            : "bg-muted"
                        }`}>
                          <module.icon className={`w-5 h-5 ${
                            smsPreferences[module.key] 
                              ? "text-primary" 
                              : "text-muted-foreground"
                          }`} />
                        </div>
                        <div className="space-y-1">
                          <div className="flex items-center gap-2">
                            <p className="font-medium">{module.label}</p>
                            {smsPreferences[module.key] && (
                              <Badge variant="secondary" className="text-xs bg-primary/10 text-primary border-0">
                                Active
                              </Badge>
                            )}
                          </div>
                          <p className="text-sm text-muted-foreground">{module.description}</p>
                          <p className="text-xs text-muted-foreground">
                            Estimated usage: <span className="font-medium">{module.estimatedUsage}</span>
                          </p>
                        </div>
                      </div>
                      <Switch
                        checked={smsPreferences[module.key]}
                        onCheckedChange={(checked) => 
                          setSmsPreferences({ ...smsPreferences, [module.key]: checked })
                        }
                      />
                    </div>
                  ))}
                </div>

                <Separator />

                <div className="flex items-center justify-between p-4 rounded-lg bg-muted/50">
                  <div>
                    <p className="text-sm text-muted-foreground">Active SMS modules</p>
                    <p className="text-lg font-bold">
                      {Object.values(smsPreferences).filter(Boolean).length} of {smsModules.length}
                    </p>
                  </div>
                  <div className="text-right">
                    <p className="text-sm text-muted-foreground">Est. monthly usage</p>
                    <p className="text-lg font-semibold text-primary">
                      ~{Object.values(smsPreferences).filter(Boolean).length * 15}-{Object.values(smsPreferences).filter(Boolean).length * 25} SMS
                    </p>
                  </div>
                </div>

                <div className="flex justify-end">
                  <Button onClick={handleSaveSmsPreferences}>Save Preferences</Button>
                </div>
              </CardContent>
            </Card>

            {/* SMS Credits Card */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <MessageSquare className="w-5 h-5" />
                  SMS Credits
                </CardTitle>
                <CardDescription>Purchase credits for SMS notifications and reminders</CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="flex items-center justify-between p-4 border rounded-lg bg-muted/30">
                  <div className="flex items-center gap-3">
                    <div className="w-12 h-12 rounded-full bg-primary/10 flex items-center justify-center">
                      <MessageSquare className="w-6 h-6 text-primary" />
                    </div>
                    <div>
                      <p className="text-2xl font-bold">{smsCredits.toLocaleString()}</p>
                      <p className="text-sm text-muted-foreground">Credits remaining</p>
                    </div>
                  </div>
                  <Badge 
                    variant={smsCredits < 50 ? "destructive" : smsCredits < 100 ? "secondary" : "outline"}
                    className="gap-1"
                  >
                    {smsCredits < 50 ? "Low" : smsCredits < 100 ? "Running Low" : "Good"}
                  </Badge>
                </div>

                {smsCredits < 100 && (
                  <div className="flex items-center gap-2 p-3 rounded-lg bg-warning/10 border border-warning/30 text-warning-foreground">
                    <AlertTriangle className="w-4 h-4 text-warning flex-shrink-0" />
                    <p className="text-sm">Your SMS credits are running low. Top up to ensure uninterrupted service.</p>
                  </div>
                )}

                <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
                  {smsPricing.map((tier) => (
                    <div
                      key={tier.amount}
                      className="text-center p-3 rounded-lg border bg-muted/20"
                    >
                      <p className="font-bold text-lg">{tier.amount}</p>
                      <p className="text-sm text-muted-foreground">credits</p>
                      <p className="font-semibold text-primary mt-1">${tier.price}</p>
                      <p className="text-xs text-muted-foreground">${tier.perSms}/SMS</p>
                    </div>
                  ))}
                </div>

                <Button onClick={() => setShowSmsDialog(true)} className="w-full gap-2">
                  <Plus className="w-4 h-4" />
                  Purchase SMS Credits
                </Button>
              </CardContent>
            </Card>

            {/* SMS Purchase Dialog */}
            <Dialog open={showSmsDialog} onOpenChange={setShowSmsDialog}>
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
          </TabsContent>

          {/* Email Tab */}
          <TabsContent value="email" className="space-y-6">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Mail className="w-5 h-5" />
                  Email Notifications
                </CardTitle>
                <CardDescription>Choose what emails you receive</CardDescription>
              </CardHeader>
              <CardContent className="space-y-6">
                <div className="space-y-4">
                  <div>
                    <h4 className="font-medium text-sm text-muted-foreground uppercase tracking-wide">Alerts & Reminders</h4>
                    <p className="text-xs text-muted-foreground mt-1">Add up to 3 email recipients per alert type.</p>
                  </div>

                  {([
                    { key: "taskReminders", title: "Task Reminders", desc: "Get notified about upcoming and overdue tasks" },
                    { key: "checklistAlerts", title: "Checklist Alerts", desc: "Notifications for incomplete or overdue checklists" },
                    { key: "complianceExpiry", title: "Compliance Expiry", desc: "Alerts when compliance items are expiring" },
                    { key: "stockAlerts", title: "Stock Alerts", desc: "Low stock and expiring item notifications" },
                  ] as { key: AlertKey; title: string; desc: string }[]).map((item) => {
                    const enabled = emailPreferences[item.key];
                    const recipients = alertRecipients[item.key];
                    const atLimit = recipients.length >= 3;
                    return (
                      <div key={item.key} className="rounded-lg border border-border p-4 space-y-3">
                        <div className="flex items-center justify-between gap-4">
                          <div>
                            <p className="font-medium">{item.title}</p>
                            <p className="text-sm text-muted-foreground">{item.desc}</p>
                          </div>
                          <Switch
                            checked={enabled}
                            onCheckedChange={(checked) =>
                              setEmailPreferences({ ...emailPreferences, [item.key]: checked })
                            }
                          />
                        </div>

                        {enabled && (
                          <div className="space-y-2 pt-2 border-t border-border">
                            <div className="flex items-center justify-between">
                              <Label className="text-xs font-medium text-muted-foreground">
                                Recipients ({recipients.length}/3)
                              </Label>
                            </div>
                            <div className="flex flex-col gap-2">
                              {recipients.map((r) => (
                                <div
                                  key={r.email}
                                  className="flex items-center justify-between gap-2 rounded-lg border border-border bg-muted/30 px-3 py-2"
                                >
                                  <div className="flex items-center gap-2 min-w-0">
                                    <Mail className="w-3.5 h-3.5 text-muted-foreground shrink-0" />
                                    <span className="text-sm truncate">{r.email}</span>
                                    {r.status === "verified" ? (
                                      <Badge variant="secondary" className="gap-1 text-[10px] bg-success/10 text-success border-success/20">
                                        <Check className="w-3 h-3" /> Confirmed
                                      </Badge>
                                    ) : (
                                      <Badge variant="secondary" className="gap-1 text-[10px] bg-amber-500/10 text-amber-600 border-amber-500/20">
                                        <Clock className="w-3 h-3" /> Pending
                                      </Badge>
                                    )}
                                  </div>
                                  <div className="flex items-center gap-1 shrink-0">
                                    {r.status === "pending" && (
                                      <>
                                        <Button
                                          type="button"
                                          size="sm"
                                          variant="ghost"
                                          className="h-7 px-2 text-xs"
                                          onClick={() => openPreviewLink(item.key, r.email)}
                                        >
                                          View link
                                        </Button>
                                        <Button
                                          type="button"
                                          size="sm"
                                          variant="ghost"
                                          className="h-7 px-2 text-xs"
                                          onClick={() => resendConfirmation(item.key, r.email)}
                                        >
                                          Resend
                                        </Button>
                                      </>
                                    )}
                                    <button
                                      type="button"
                                      onClick={() => removeAlertEmail(item.key, r.email)}
                                      className="rounded hover:bg-muted-foreground/20 p-1"
                                      aria-label={`Remove ${r.email}`}
                                    >
                                      <X className="w-3.5 h-3.5" />
                                    </button>
                                  </div>
                                </div>
                              ))}
                              {recipients.length === 0 && (
                                <span className="text-xs text-muted-foreground italic">No recipients added</span>
                              )}
                            </div>
                            {!atLimit && (
                              <div className="flex gap-2">
                                <Input
                                  type="email"
                                  placeholder="name@example.com"
                                  value={newAlertEmail[item.key]}
                                  onChange={(e) =>
                                    setNewAlertEmail({ ...newAlertEmail, [item.key]: e.target.value })
                                  }
                                  onKeyDown={(e) => {
                                    if (e.key === "Enter") {
                                      e.preventDefault();
                                      addAlertEmail(item.key);
                                    }
                                  }}
                                  className="h-9 text-sm"
                                />
                                <Button
                                  type="button"
                                  size="sm"
                                  variant="outline"
                                  onClick={() => addAlertEmail(item.key)}
                                  className="gap-1 shrink-0"
                                >
                                  <Plus className="w-3.5 h-3.5" />
                                  Add
                                </Button>
                              </div>
                            )}
                            {atLimit && (
                              <p className="text-xs text-muted-foreground">Maximum of 3 emails reached.</p>
                            )}
                          </div>
                        )}
                      </div>
                    );
                  })}
                </div>

                <Separator />

                <div className="space-y-4">
                  <h4 className="font-medium text-sm text-muted-foreground uppercase tracking-wide">Reports & Updates</h4>

                  <div className="flex items-center justify-between">
                    <div>
                      <p className="font-medium">Weekly Digest</p>
                      <p className="text-sm text-muted-foreground">Summary of practice activity each week</p>
                    </div>
                    <Switch
                      checked={emailPreferences.weeklyDigest}
                      onCheckedChange={(checked) => setEmailPreferences({ ...emailPreferences, weeklyDigest: checked })}
                    />
                  </div>

                  <div className="flex items-center justify-between">
                    <div>
                      <p className="font-medium">Marketing Updates</p>
                      <p className="text-sm text-muted-foreground">Product news and feature announcements</p>
                    </div>
                    <Switch
                      checked={emailPreferences.marketingUpdates}
                      onCheckedChange={(checked) => setEmailPreferences({ ...emailPreferences, marketingUpdates: checked })}
                    />
                  </div>
                </div>

                <div className="flex justify-end">
                  <Button onClick={handleSaveEmail}>Save Preferences</Button>
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          {/* Invoices Tab */}
          <TabsContent value="invoices" className="space-y-6">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Receipt className="w-5 h-5" />
                  Past Invoices
                </CardTitle>
                <CardDescription>Download your billing history</CardDescription>
              </CardHeader>
              <CardContent>
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Invoice</TableHead>
                      <TableHead>Date</TableHead>
                      <TableHead>Amount</TableHead>
                      <TableHead>Status</TableHead>
                      <TableHead className="text-right">Actions</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {invoices.map((invoice) => (
                      <TableRow key={invoice.id}>
                        <TableCell className="font-medium">{invoice.id}</TableCell>
                        <TableCell>{invoice.date}</TableCell>
                        <TableCell>{invoice.amount}</TableCell>
                        <TableCell>
                          <Badge variant="secondary" className="capitalize">
                            {invoice.status}
                          </Badge>
                        </TableCell>
                        <TableCell className="text-right">
                          <Button variant="ghost" size="sm" className="gap-1">
                            <Download className="w-4 h-4" />
                            <span className="hidden sm:inline">Download</span>
                          </Button>
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>
      </div>

      <Dialog open={!!previewLink} onOpenChange={(o) => !o && setPreviewLink(null)}>
        <DialogContent className="sm:max-w-lg">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              <Mail className="w-5 h-5 text-primary" />
              Confirmation link sent
            </DialogTitle>
            <DialogDescription>
              A confirmation email was sent to{" "}
              <span className="font-medium text-foreground">{previewLink?.email}</span>.
              They must click the link in that email to start receiving notifications.
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-3 py-2">
            <div className="space-y-2">
              <Label className="text-xs font-medium text-muted-foreground">
                Confirmation link (preview)
              </Label>
              <div className="flex items-center gap-2 rounded-lg border border-border bg-muted/30 px-3 py-2">
                <ExternalLink className="w-3.5 h-3.5 text-muted-foreground shrink-0" />
                <span className="text-xs font-mono truncate flex-1">{previewLink?.url}</span>
                <Button
                  type="button"
                  size="sm"
                  variant="ghost"
                  className="h-7 px-2 text-xs shrink-0"
                  onClick={() => {
                    if (previewLink) {
                      navigator.clipboard.writeText(previewLink.url);
                      toast.success("Link copied");
                    }
                  }}
                >
                  Copy
                </Button>
              </div>
            </div>
            <div className="rounded-lg bg-amber-500/5 border border-amber-500/20 p-3 text-xs text-amber-700 dark:text-amber-400">
              The link expires in 24 hours. If the recipient didn't get the email, you can resend it.
            </div>
          </div>
          <div className="flex justify-between gap-2">
            <Button
              variant="ghost"
              onClick={() =>
                previewLink && resendConfirmation(previewLink.key, previewLink.email)
              }
            >
              Resend link
            </Button>
            <div className="flex gap-2">
              <Button variant="outline" onClick={() => setPreviewLink(null)}>
                Close
              </Button>
              <Button onClick={simulateConfirm}>
                Simulate click
              </Button>
            </div>
          </div>
        </DialogContent>
      </Dialog>
    </AdminLayout>
  );
};

export default Settings;
