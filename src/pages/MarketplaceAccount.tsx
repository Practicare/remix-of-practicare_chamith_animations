import { useEffect, useRef, useState, ComponentType, ReactNode } from "react";
import { useNavigate } from "react-router-dom";
import { AdminLayout } from "@/components/layout/AdminLayout";
import { MobileHeader } from "@/components/layout/MobileHeader";
import { PageHeader } from "@/components/layout/PageHeader";
import { PageIntro } from "@/components/layout/PageIntro";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Switch } from "@/components/ui/switch";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  Store,
  UserCog,
  Building2,
  ImagePlus,
  X,
  Plus,
  Sparkles,
  Check,
  LogOut,
  Mail,
  Eye,
} from "lucide-react";
import { toast } from "sonner";
import { marketplaceStore } from "@/data/marketplaceStore";
import { readFileAsDataUrl, useMarketplaceSession } from "@/hooks/useMarketplace";
import { MARKETPLACE_CATEGORIES, PLAN_FEATURES } from "@/types/marketplace";
import { format } from "date-fns";

const FREE_SERVICE_LIMIT = 5;

const MarketplaceAccount = ({
  Layout = AdminLayout,
}: {
  Layout?: ComponentType<{ children: ReactNode }>;
}) => {
  const navigate = useNavigate();
  const listing = useMarketplaceSession();

  // auth form state
  const [mode, setMode] = useState<"login" | "register">("login");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [businessName, setBusinessName] = useState("");
  const [category, setCategory] = useState<string>(MARKETPLACE_CATEGORIES[0]);
  const [location, setLocation] = useState("");

  // profile editor state
  const [form, setForm] = useState(listing);
  const [newService, setNewService] = useState("");
  const logoRef = useRef<HTMLInputElement>(null);
  const flyerRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    setForm(listing);
  }, [listing]);

  const handleLogin = () => {
    const res = marketplaceStore.login(email, password);
    if (!res.ok || !res.listing) {
      toast.error(res.error ?? "Unable to sign in.");
      return;
    }
    marketplaceStore.setSession(res.listing.id);
    toast.success(`Welcome back, ${res.listing.businessName}`);
  };

  const handleRegister = () => {
    if (!businessName.trim() || !email.trim() || password.length < 6 || !location.trim()) {
      toast.error("Fill in every field. Password must be at least 6 characters.");
      return;
    }
    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email.trim())) {
      toast.error("Please enter a valid email address.");
      return;
    }
    const res = marketplaceStore.register({
      email,
      password,
      businessName,
      category,
      location,
    });
    if (!res.ok || !res.listing) {
      toast.error(res.error ?? "Unable to create account.");
      return;
    }
    marketplaceStore.setSession(res.listing.id);
    toast.success("Free account created — complete your profile to go live.");
  };

  const saveProfile = () => {
    if (!form) return;
    marketplaceStore.update(form.id, {
      businessName: form.businessName.trim(),
      category: form.category,
      tagline: form.tagline.trim().slice(0, 120),
      description: form.description.trim().slice(0, 1000),
      services: form.services,
      location: form.location.trim(),
      phone: form.phone?.trim(),
      website: form.website?.trim(),
      logo: form.logo,
      flyer: form.flyer,
      published: form.published,
    });
    toast.success("Listing saved");
  };

  const upload = async (kind: "logo" | "flyer", file?: File) => {
    if (!file || !form) return;
    if (file.size > 4 * 1024 * 1024) {
      toast.error("Please use an image under 4MB.");
      return;
    }
    const dataUrl = await readFileAsDataUrl(file);
    setForm({ ...form, [kind]: dataUrl });
  };

  const addService = () => {
    if (!form || !newService.trim()) return;
    if (form.plan === "free" && form.services.length >= FREE_SERVICE_LIMIT) {
      toast.error(`Free accounts can list ${FREE_SERVICE_LIMIT} services. Upgrade for unlimited.`);
      return;
    }
    setForm({ ...form, services: [...form.services, newService.trim().slice(0, 60)] });
    setNewService("");
  };

  const enquiries = form ? marketplaceStore.getEnquiries(form.id) : [];

  const headerActions = listing ? (
    <div className="flex items-center gap-2">
      <Button variant="outline" className="gap-2" onClick={() => navigate(`/marketplace/${listing.id}`)}>
        <Eye className="w-4 h-4" /> View listing
      </Button>
      <Button
        variant="outline"
        className="gap-2"
        onClick={() => {
          marketplaceStore.setSession(null);
          toast.success("Signed out of your marketplace account");
        }}
      >
        <LogOut className="w-4 h-4" /> Sign out
      </Button>
    </div>
  ) : (
    <Button variant="outline" className="gap-2" onClick={() => navigate("/marketplace")}>
      <Store className="w-4 h-4" /> Browse directory
    </Button>
  );

  return (
    <Layout>
      <MobileHeader title="Provider account" subtitle="Manage your marketplace listing" actions={headerActions} />
      <PageHeader
        title="Provider account"
        subtitle="Register your business and manage your marketplace listing"
        icon={UserCog}
        actions={headerActions}
      />

      <div className="flex-1 overflow-y-auto">
        <div className="mx-auto w-full max-w-4xl px-4 md:px-8 py-6 space-y-5">
          {!listing || !form ? (
            <>
              <PageIntro
                highlight="Get listed in front of practices."
                description="Create a free provider account, add your logo, description, services and one flyer — then start receiving enquiries. Upgrade to Premium any time for featured placement."
              />

              <div className="grid grid-cols-1 md:grid-cols-[1fr_300px] gap-5 items-start">
                <div className="rounded-lg border border-border bg-card p-5">
                  <Tabs value={mode} onValueChange={(v) => setMode(v as "login" | "register")}>
                    <TabsList className="grid grid-cols-2 w-full">
                      <TabsTrigger value="login">Sign in</TabsTrigger>
                      <TabsTrigger value="register">Create free account</TabsTrigger>
                    </TabsList>

                    <TabsContent value="login" className="space-y-4 pt-4">
                      <div className="space-y-1.5">
                        <Label htmlFor="li-email">Email</Label>
                        <Input id="li-email" type="email" value={email} onChange={(e) => setEmail(e.target.value)} />
                      </div>
                      <div className="space-y-1.5">
                        <Label htmlFor="li-pass">Password</Label>
                        <Input id="li-pass" type="password" value={password} onChange={(e) => setPassword(e.target.value)} />
                      </div>
                      <Button className="w-full" onClick={handleLogin}>Sign in</Button>
                      <p className="text-xs text-muted-foreground text-center">
                        Demo account: hello@meditech.io / password
                      </p>
                    </TabsContent>

                    <TabsContent value="register" className="space-y-4 pt-4">
                      <div className="space-y-1.5">
                        <Label htmlFor="rg-name">Business name</Label>
                        <Input id="rg-name" maxLength={100} value={businessName} onChange={(e) => setBusinessName(e.target.value)} />
                      </div>
                      <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                        <div className="space-y-1.5">
                          <Label>Category</Label>
                          <Select value={category} onValueChange={setCategory}>
                            <SelectTrigger><SelectValue /></SelectTrigger>
                            <SelectContent className="bg-popover z-50">
                              {MARKETPLACE_CATEGORIES.map((c) => (
                                <SelectItem key={c} value={c}>{c}</SelectItem>
                              ))}
                            </SelectContent>
                          </Select>
                        </div>
                        <div className="space-y-1.5">
                          <Label htmlFor="rg-loc">Location</Label>
                          <Input id="rg-loc" placeholder="Sydney, NSW" maxLength={80} value={location} onChange={(e) => setLocation(e.target.value)} />
                        </div>
                      </div>
                      <div className="space-y-1.5">
                        <Label htmlFor="rg-email">Email</Label>
                        <Input id="rg-email" type="email" maxLength={255} value={email} onChange={(e) => setEmail(e.target.value)} />
                      </div>
                      <div className="space-y-1.5">
                        <Label htmlFor="rg-pass">Password</Label>
                        <Input id="rg-pass" type="password" value={password} onChange={(e) => setPassword(e.target.value)} />
                      </div>
                      <Button className="w-full" onClick={handleRegister}>Create free account</Button>
                    </TabsContent>
                  </Tabs>
                </div>

                <aside className="rounded-lg border border-border bg-card p-5 space-y-4">
                  <div>
                    <h3 className="text-sm font-semibold">Free</h3>
                    <p className="text-xs text-muted-foreground">$0 — always</p>
                    <ul className="mt-2 space-y-1.5">
                      {PLAN_FEATURES.free.map((f) => (
                        <li key={f} className="flex items-start gap-2 text-xs">
                          <Check className="w-3.5 h-3.5 text-primary shrink-0 mt-0.5" /> {f}
                        </li>
                      ))}
                    </ul>
                  </div>
                  <div className="border-t border-border pt-4">
                    <h3 className="text-sm font-semibold flex items-center gap-1.5">
                      <Sparkles className="w-4 h-4 text-primary" /> Premium
                    </h3>
                    <p className="text-xs text-muted-foreground">Upgrade any time</p>
                    <ul className="mt-2 space-y-1.5">
                      {PLAN_FEATURES.premium.map((f) => (
                        <li key={f} className="flex items-start gap-2 text-xs">
                          <Check className="w-3.5 h-3.5 text-primary shrink-0 mt-0.5" /> {f}
                        </li>
                      ))}
                    </ul>
                  </div>
                </aside>
              </div>
            </>
          ) : (
            <>
              {/* Plan strip */}
              <div className="rounded-lg border border-border bg-card p-4 flex flex-wrap items-center justify-between gap-3">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-lg border border-border bg-muted overflow-hidden flex items-center justify-center">
                    {form.logo ? (
                      <img src={form.logo} alt="Your logo" className="w-full h-full object-cover" />
                    ) : (
                      <Building2 className="w-4 h-4 text-muted-foreground" />
                    )}
                  </div>
                  <div>
                    <p className="text-sm font-semibold">{form.businessName}</p>
                    <div className="flex items-center gap-2">
                      <Badge variant={form.plan === "premium" ? "default" : "secondary"} className="gap-1">
                        {form.plan === "premium" && <Sparkles className="w-3 h-3" />}
                        {form.plan === "premium" ? "Premium member" : "Free member"}
                      </Badge>
                      <span className="text-xs text-muted-foreground">
                        {form.published ? "Live in directory" : "Not published"}
                      </span>
                    </div>
                  </div>
                </div>
                {form.plan === "free" ? (
                  <Button
                    className="gap-2"
                    onClick={() => {
                      marketplaceStore.setPlan(form.id, "premium");
                      toast.success("Upgraded to Premium — your listing is now featured.");
                    }}
                  >
                    <Sparkles className="w-4 h-4" /> Upgrade to Premium
                  </Button>
                ) : (
                  <Button
                    variant="outline"
                    onClick={() => {
                      marketplaceStore.setPlan(form.id, "free");
                      toast.success("Switched back to the Free plan.");
                    }}
                  >
                    Switch to Free
                  </Button>
                )}
              </div>

              <Tabs defaultValue="profile">
                <TabsList>
                  <TabsTrigger value="profile">Listing</TabsTrigger>
                  <TabsTrigger value="enquiries">
                    Enquiries {enquiries.length > 0 && `(${enquiries.length})`}
                  </TabsTrigger>
                  <TabsTrigger value="plan">Plan</TabsTrigger>
                </TabsList>

                <TabsContent value="profile" className="pt-4 space-y-5">
                  <section className="rounded-lg border border-border bg-card p-5 space-y-4">
                    <h2 className="text-sm font-semibold">Business profile</h2>
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                      <div className="space-y-1.5">
                        <Label>Business name</Label>
                        <Input
                          maxLength={100}
                          value={form.businessName}
                          onChange={(e) => setForm({ ...form, businessName: e.target.value })}
                        />
                      </div>
                      <div className="space-y-1.5">
                        <Label>Category</Label>
                        <Select value={form.category} onValueChange={(v) => setForm({ ...form, category: v })}>
                          <SelectTrigger><SelectValue /></SelectTrigger>
                          <SelectContent className="bg-popover z-50">
                            {MARKETPLACE_CATEGORIES.map((c) => (
                              <SelectItem key={c} value={c}>{c}</SelectItem>
                            ))}
                          </SelectContent>
                        </Select>
                      </div>
                      <div className="space-y-1.5">
                        <Label>Location</Label>
                        <Input
                          maxLength={80}
                          value={form.location}
                          onChange={(e) => setForm({ ...form, location: e.target.value })}
                        />
                      </div>
                      <div className="space-y-1.5">
                        <Label>Phone</Label>
                        <Input
                          maxLength={40}
                          value={form.phone ?? ""}
                          onChange={(e) => setForm({ ...form, phone: e.target.value })}
                        />
                      </div>
                      <div className="space-y-1.5 sm:col-span-2">
                        <Label>Website</Label>
                        <Input
                          maxLength={255}
                          placeholder="https://"
                          value={form.website ?? ""}
                          onChange={(e) => setForm({ ...form, website: e.target.value })}
                        />
                      </div>
                      <div className="space-y-1.5 sm:col-span-2">
                        <Label>Tagline</Label>
                        <Input
                          maxLength={120}
                          placeholder="One line that sums up what you do"
                          value={form.tagline}
                          onChange={(e) => setForm({ ...form, tagline: e.target.value })}
                        />
                      </div>
                      <div className="space-y-1.5 sm:col-span-2">
                        <Label>Brief description</Label>
                        <Textarea
                          rows={4}
                          maxLength={1000}
                          value={form.description}
                          onChange={(e) => setForm({ ...form, description: e.target.value })}
                        />
                        <p className="text-[11px] text-muted-foreground">
                          {form.description.length}/1000
                        </p>
                      </div>
                    </div>
                  </section>

                  <section className="rounded-lg border border-border bg-card p-5 space-y-3">
                    <div className="flex items-center justify-between">
                      <h2 className="text-sm font-semibold">Services</h2>
                      {form.plan === "free" && (
                        <span className="text-xs text-muted-foreground">
                          {form.services.length}/{FREE_SERVICE_LIMIT} on Free
                        </span>
                      )}
                    </div>
                    <div className="flex flex-wrap gap-2">
                      {form.services.map((s, i) => (
                        <span
                          key={`${s}-${i}`}
                          className="inline-flex items-center gap-1.5 rounded-lg bg-muted px-2.5 py-1 text-xs"
                        >
                          {s}
                          <button
                            onClick={() =>
                              setForm({ ...form, services: form.services.filter((_, idx) => idx !== i) })
                            }
                            aria-label={`Remove ${s}`}
                          >
                            <X className="w-3 h-3 text-muted-foreground hover:text-destructive" />
                          </button>
                        </span>
                      ))}
                      {form.services.length === 0 && (
                        <p className="text-xs text-muted-foreground">No services added yet.</p>
                      )}
                    </div>
                    <div className="flex gap-2">
                      <Input
                        placeholder="Add a service"
                        maxLength={60}
                        value={newService}
                        onChange={(e) => setNewService(e.target.value)}
                        onKeyDown={(e) => e.key === "Enter" && (e.preventDefault(), addService())}
                      />
                      <Button variant="outline" className="gap-1.5 shrink-0" onClick={addService}>
                        <Plus className="w-4 h-4" /> Add
                      </Button>
                    </div>
                  </section>

                  <section className="rounded-lg border border-border bg-card p-5 space-y-4">
                    <h2 className="text-sm font-semibold">Logo & flyer</h2>
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                      <div className="space-y-2">
                        <Label className="text-xs">Logo</Label>
                        <div className="rounded-lg border border-dashed border-border p-4 flex flex-col items-center gap-3">
                          <div className="w-20 h-20 rounded-lg border border-border bg-muted overflow-hidden flex items-center justify-center">
                            {form.logo ? (
                              <img src={form.logo} alt="Logo preview" className="w-full h-full object-cover" />
                            ) : (
                              <Building2 className="w-6 h-6 text-muted-foreground" />
                            )}
                          </div>
                          <div className="flex gap-2">
                            <Button variant="outline" size="sm" className="gap-1.5" onClick={() => logoRef.current?.click()}>
                              <ImagePlus className="w-3.5 h-3.5" /> Upload
                            </Button>
                            {form.logo && (
                              <Button variant="ghost" size="sm" onClick={() => setForm({ ...form, logo: undefined })}>
                                Remove
                              </Button>
                            )}
                          </div>
                          <input
                            ref={logoRef}
                            type="file"
                            accept="image/*"
                            className="hidden"
                            onChange={(e) => upload("logo", e.target.files?.[0])}
                          />
                        </div>
                      </div>

                      <div className="space-y-2">
                        <Label className="text-xs">Flyer (one per member)</Label>
                        <div className="rounded-lg border border-dashed border-border p-4 flex flex-col items-center gap-3">
                          {form.flyer ? (
                            <img src={form.flyer} alt="Flyer preview" className="w-full max-h-32 object-contain rounded-lg" />
                          ) : (
                            <div className="h-20 flex items-center text-xs text-muted-foreground">
                              No flyer uploaded
                            </div>
                          )}
                          <div className="flex gap-2">
                            <Button variant="outline" size="sm" className="gap-1.5" onClick={() => flyerRef.current?.click()}>
                              <ImagePlus className="w-3.5 h-3.5" /> Upload
                            </Button>
                            {form.flyer && (
                              <Button variant="ghost" size="sm" onClick={() => setForm({ ...form, flyer: undefined })}>
                                Remove
                              </Button>
                            )}
                          </div>
                          <input
                            ref={flyerRef}
                            type="file"
                            accept="image/*"
                            className="hidden"
                            onChange={(e) => upload("flyer", e.target.files?.[0])}
                          />
                        </div>
                      </div>
                    </div>
                  </section>

                  <section className="rounded-lg border border-border bg-card p-5 flex flex-wrap items-center justify-between gap-3">
                    <div className="flex items-center gap-3">
                      <Switch
                        checked={form.published}
                        onCheckedChange={(v) => setForm({ ...form, published: v })}
                      />
                      <div>
                        <p className="text-sm font-medium">Publish to directory</p>
                        <p className="text-xs text-muted-foreground">
                          Practices can only find you when this is on.
                        </p>
                      </div>
                    </div>
                    <Button onClick={saveProfile}>Save</Button>
                  </section>
                </TabsContent>

                <TabsContent value="enquiries" className="pt-4 space-y-3">
                  {enquiries.length === 0 && (
                    <div className="rounded-lg border border-dashed border-border p-10 text-center">
                      <Mail className="w-8 h-8 mx-auto text-muted-foreground mb-3" />
                      <p className="text-sm font-medium">No enquiries yet</p>
                      <p className="text-xs text-muted-foreground mt-1">
                        Complete and publish your listing to start receiving them.
                      </p>
                    </div>
                  )}
                  {enquiries.map((e) => (
                    <div key={e.id} className="rounded-lg border border-border bg-card p-4 space-y-2">
                      <div className="flex items-start justify-between gap-3">
                        <div>
                          <p className="text-sm font-semibold">{e.name}</p>
                          <p className="text-xs text-muted-foreground break-all">
                            {e.email}{e.phone ? ` · ${e.phone}` : ""}
                          </p>
                        </div>
                        <span className="text-[11px] text-muted-foreground shrink-0">
                          {format(new Date(e.createdAt), "d MMM yyyy, h:mm a")}
                        </span>
                      </div>
                      <p className="text-sm text-foreground/80 whitespace-pre-wrap">{e.message}</p>
                    </div>
                  ))}
                </TabsContent>

                <TabsContent value="plan" className="pt-4">
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    {(["free", "premium"] as const).map((plan) => (
                      <div
                        key={plan}
                        className={`rounded-lg border p-5 space-y-3 ${
                          form.plan === plan ? "border-primary bg-primary/[0.04]" : "border-border bg-card"
                        }`}
                      >
                        <div className="flex items-center justify-between">
                          <h3 className="text-sm font-semibold capitalize flex items-center gap-1.5">
                            {plan === "premium" && <Sparkles className="w-4 h-4 text-primary" />}
                            {plan}
                          </h3>
                          {form.plan === plan && <Badge>Current</Badge>}
                        </div>
                        <ul className="space-y-1.5">
                          {PLAN_FEATURES[plan].map((f) => (
                            <li key={f} className="flex items-start gap-2 text-xs">
                              <Check className="w-3.5 h-3.5 text-primary shrink-0 mt-0.5" /> {f}
                            </li>
                          ))}
                        </ul>
                        {form.plan !== plan && (
                          <Button
                            variant={plan === "premium" ? "default" : "outline"}
                            className="w-full"
                            onClick={() => {
                              marketplaceStore.setPlan(form.id, plan);
                              toast.success(plan === "premium" ? "Upgraded to Premium" : "Switched to Free");
                            }}
                          >
                            {plan === "premium" ? "Upgrade" : "Switch to Free"}
                          </Button>
                        )}
                      </div>
                    ))}
                  </div>
                </TabsContent>
              </Tabs>
            </>
          )}
        </div>
      </div>
    </Layout>
  );
};

export default MarketplaceAccount;
