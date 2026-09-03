import { useState, ComponentType, ReactNode } from "react";
import { useNavigate, useParams } from "react-router-dom";
import { AdminLayout } from "@/components/layout/AdminLayout";
import { MobileHeader } from "@/components/layout/MobileHeader";
import { PageHeader } from "@/components/layout/PageHeader";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import {
  Store,
  ArrowLeft,
  Star,
  MapPin,
  BadgeCheck,
  Clock,
  Sparkles,
  Building2,
  Phone,
  Globe,
  Mail,
  Check,
  Send,
} from "lucide-react";
import { toast } from "sonner";
import { marketplaceStore } from "@/data/marketplaceStore";
import { useMarketplaceListings } from "@/hooks/useMarketplace";
import { useUser } from "@/contexts/UserContext";

const MarketplaceListing = ({
  Layout = AdminLayout,
}: {
  Layout?: ComponentType<{ children: ReactNode }>;
}) => {
  const { listingId } = useParams();
  const navigate = useNavigate();
  const listings = useMarketplaceListings();
  const { currentUser } = useUser();
  const listing = listings.find((l) => l.id === listingId);

  const [name, setName] = useState(
    currentUser ? `${currentUser.firstName ?? ""} ${currentUser.lastName ?? ""}`.trim() : ""
  );
  const [email, setEmail] = useState(currentUser?.email ?? "");
  const [phone, setPhone] = useState("");
  const [message, setMessage] = useState("");
  const [sent, setSent] = useState(false);

  if (!listing) {
    return (
      <Layout>
        <PageHeader title="Marketplace" icon={Store} />
        <div className="flex-1 overflow-y-auto">
          <div className="mx-auto w-full max-w-4xl px-4 md:px-8 py-10 text-center">
            <p className="text-sm text-muted-foreground">This listing is no longer available.</p>
            <Button className="mt-4" onClick={() => navigate("/marketplace")}>
              Back to marketplace
            </Button>
          </div>
        </div>
      </Layout>
    );
  }

  const submitEnquiry = () => {
    if (!name.trim() || !email.trim() || !message.trim()) {
      toast.error("Please add your name, email and a message.");
      return;
    }
    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email.trim())) {
      toast.error("Please enter a valid email address.");
      return;
    }
    marketplaceStore.addEnquiry({
      listingId: listing.id,
      name: name.trim().slice(0, 100),
      email: email.trim().slice(0, 255),
      phone: phone.trim().slice(0, 40) || undefined,
      message: message.trim().slice(0, 1000),
    });
    setSent(true);
    setMessage("");
    toast.success(`Enquiry sent to ${listing.businessName}`);
  };

  const back = (
    <Button variant="outline" className="gap-2" onClick={() => navigate("/marketplace")}>
      <ArrowLeft className="w-4 h-4" />
      Back
    </Button>
  );

  return (
    <Layout>
      <MobileHeader title={listing.businessName} subtitle={listing.category} actions={back} />
      <PageHeader title={listing.businessName} subtitle={listing.category} icon={Store} actions={back} />

      <div className="flex-1 overflow-y-auto">
        <div className="mx-auto w-full max-w-4xl px-4 md:px-8 py-6 space-y-5">
          {/* Hero */}
          <div className="rounded-lg border border-border bg-card p-5">
            <div className="flex gap-4">
              <div className="w-20 h-20 shrink-0 rounded-lg border border-border bg-muted overflow-hidden flex items-center justify-center">
                {listing.logo ? (
                  <img src={listing.logo} alt={`${listing.businessName} logo`} className="w-full h-full object-cover" />
                ) : (
                  <Building2 className="w-8 h-8 text-muted-foreground" />
                )}
              </div>
              <div className="flex-1 min-w-0 space-y-2">
                <div className="flex items-center gap-2 flex-wrap">
                  <h1 className="text-lg font-semibold">{listing.businessName}</h1>
                  {listing.plan === "premium" && (
                    <Badge className="gap-1 bg-primary text-primary-foreground">
                      <Sparkles className="w-3 h-3" /> Premium
                    </Badge>
                  )}
                  {listing.verified && <BadgeCheck className="w-4 h-4 text-primary" />}
                </div>
                {listing.tagline && (
                  <p className="text-sm text-foreground/80">{listing.tagline}</p>
                )}
                <div className="flex items-center gap-4 flex-wrap text-xs text-muted-foreground">
                  <span className="flex items-center gap-1">
                    <Star className="w-3.5 h-3.5 fill-warning text-warning" />
                    <span className="font-semibold text-foreground">
                      {listing.rating ? listing.rating.toFixed(1) : "New"}
                    </span>
                    {listing.reviewCount > 0 && <>({listing.reviewCount})</>}
                  </span>
                  {listing.location && (
                    <span className="flex items-center gap-1">
                      <MapPin className="w-3.5 h-3.5" /> {listing.location}
                    </span>
                  )}
                  <span className="flex items-center gap-1">
                    <Clock className="w-3.5 h-3.5" /> {listing.responseTime}
                  </span>
                </div>
              </div>
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-[1fr_320px] gap-5 items-start">
            <div className="space-y-5">
              {/* About */}
              <section className="rounded-lg border border-border bg-card p-5 space-y-2">
                <h2 className="text-sm font-semibold">About</h2>
                <p className="text-sm leading-relaxed text-foreground/80">
                  {listing.description || "This provider hasn't added a description yet."}
                </p>
              </section>

              {/* Services */}
              {listing.services.length > 0 && (
                <section className="rounded-lg border border-border bg-card p-5 space-y-3">
                  <h2 className="text-sm font-semibold">Services provided</h2>
                  <ul className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                    {listing.services.map((s) => (
                      <li key={s} className="flex items-start gap-2 text-sm">
                        <Check className="w-4 h-4 text-primary shrink-0 mt-0.5" />
                        <span>{s}</span>
                      </li>
                    ))}
                  </ul>
                </section>
              )}

              {/* Flyer */}
              {listing.flyer && (
                <section className="rounded-lg border border-border bg-card p-5 space-y-3">
                  <h2 className="text-sm font-semibold">Flyer</h2>
                  <img
                    src={listing.flyer}
                    alt={`${listing.businessName} flyer`}
                    className="w-full rounded-lg border border-border"
                    loading="lazy"
                  />
                </section>
              )}
            </div>

            {/* Contact card */}
            <aside className="rounded-lg border border-border bg-card p-5 space-y-4 md:sticky md:top-4">
              <div className="space-y-2 text-sm">
                <h2 className="text-sm font-semibold">Contact {listing.businessName}</h2>
                {listing.phone && (
                  <p className="flex items-center gap-2 text-muted-foreground">
                    <Phone className="w-3.5 h-3.5" /> {listing.phone}
                  </p>
                )}
                <p className="flex items-center gap-2 text-muted-foreground break-all">
                  <Mail className="w-3.5 h-3.5 shrink-0" /> {listing.email}
                </p>
                {listing.website && (
                  <a
                    href={listing.website}
                    target="_blank"
                    rel="noreferrer noopener"
                    className="flex items-center gap-2 text-primary hover:underline break-all"
                  >
                    <Globe className="w-3.5 h-3.5 shrink-0" /> Visit website
                  </a>
                )}
              </div>

              <div className="border-t border-border pt-4 space-y-3">
                {sent ? (
                  <div className="text-center space-y-2 py-2">
                    <Check className="w-6 h-6 text-success mx-auto" />
                    <p className="text-sm font-medium">Enquiry sent</p>
                    <p className="text-xs text-muted-foreground">
                      {listing.businessName} will get back to you directly.
                    </p>
                    <Button variant="outline" size="sm" onClick={() => setSent(false)}>
                      Send another
                    </Button>
                  </div>
                ) : (
                  <>
                    <div className="space-y-1.5">
                      <Label htmlFor="mp-name" className="text-xs">Your name</Label>
                      <Input id="mp-name" value={name} maxLength={100} onChange={(e) => setName(e.target.value)} />
                    </div>
                    <div className="space-y-1.5">
                      <Label htmlFor="mp-email" className="text-xs">Email</Label>
                      <Input id="mp-email" type="email" value={email} maxLength={255} onChange={(e) => setEmail(e.target.value)} />
                    </div>
                    <div className="space-y-1.5">
                      <Label htmlFor="mp-phone" className="text-xs">Phone (optional)</Label>
                      <Input id="mp-phone" value={phone} maxLength={40} onChange={(e) => setPhone(e.target.value)} />
                    </div>
                    <div className="space-y-1.5">
                      <Label htmlFor="mp-msg" className="text-xs">Message</Label>
                      <Textarea
                        id="mp-msg"
                        rows={4}
                        maxLength={1000}
                        placeholder="Tell them what you need..."
                        value={message}
                        onChange={(e) => setMessage(e.target.value)}
                      />
                    </div>
                    <Button className="w-full gap-2" onClick={submitEnquiry}>
                      <Send className="w-4 h-4" />
                      Send enquiry
                    </Button>
                  </>
                )}
              </div>
            </aside>
          </div>
        </div>
      </div>
    </Layout>
  );
};

export default MarketplaceListing;
