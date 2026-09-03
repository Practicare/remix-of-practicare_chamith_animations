import MarketplaceNewsColumn from "@/components/marketplace/MarketplaceNewsColumn";
import { useEffect, useMemo, useState } from "react";
import { useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Sheet, SheetContent, SheetHeader, SheetTitle, SheetTrigger } from "@/components/ui/sheet";
import {
  Store,
  Star,
  MapPin,
  BadgeCheck,
  Clock,
  Sparkles,
  Building2,
  UserCog,
  ArrowLeft,
  Search,
  ThumbsUp,
  Phone,
  Globe,
  Plus,
  Bookmark,
  Newspaper,
  SlidersHorizontal,
  X,
  LayoutGrid,
  List as ListIcon,
  ChevronLeft,
  ChevronRight,
} from "lucide-react";
import { MarketplaceListing, MARKETPLACE_INDUSTRIES, industryForCategory } from "@/types/marketplace";
import { useMarketplaceListings, useMarketplaceVersion } from "@/hooks/useMarketplace";
import { marketplaceStore } from "@/data/marketplaceStore";

import { Checkbox } from "@/components/ui/checkbox";
import { Separator } from "@/components/ui/separator";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { cn } from "@/lib/utils";
import { usePagination } from "@/hooks/usePagination";

/** Deterministic recommendation count until real data exists. */
const recommendationsFor = (l: MarketplaceListing) =>
  l.reviewCount > 0 ? Math.max(1, Math.round(l.reviewCount * 0.6)) : 0;

type SortKey = "relevance" | "rating" | "recommended" | "name";

const PAGE_SIZE = 12;

const Marketplace = () => {
  const navigate = useNavigate();
  const listings = useMarketplaceListings();

  useMarketplaceVersion();

  const [search, setSearch] = useState("");
  const [categories, setCategories] = useState<string[]>([]);
  const [industries, setIndustries] = useState<string[]>([]);
  const [active, setActive] = useState<MarketplaceListing | null>(null);
  const [catSearch, setCatSearch] = useState("");
  const [newCategory, setNewCategory] = useState("");
  const [country, setCountry] = useState("all");
  const [state, setState] = useState("all");
  const [postcode, setPostcode] = useState("");
  const [verifiedOnly, setVerifiedOnly] = useState(false);
  const [premiumOnly, setPremiumOnly] = useState(false);
  const [minRating, setMinRating] = useState("any");
  const [sort, setSort] = useState<SortKey>("relevance");
  const [view, setView] = useState<"grid" | "list">("grid");

  const allCategories = marketplaceStore.getCategories();
  const bookmarked = marketplaceStore.getBookmarkedCategories();

  const published = useMemo(() => listings.filter((l) => l.published), [listings]);

  const results = useMemo(() => {
    const q = search.trim().toLowerCase();
    const terms = q ? q.split(/\s+/) : [];
    const out = published.filter((l) => {
      if (terms.length) {
        const haystack = [
          l.businessName,
          l.tagline,
          l.description,
          l.category,
          l.location,
          l.country,
          l.state,
          l.postcode,
          ...l.services,
        ]
          .filter(Boolean)
          .join(" ")
          .toLowerCase();
        if (!terms.every((t) => haystack.includes(t))) return false;
      }
      if (categories.length && !categories.includes(l.category)) return false;
      if (industries.length && !industries.includes(industryForCategory(l.category))) return false;
      if (country !== "all" && l.country !== country) return false;
      if (state !== "all" && l.state !== state) return false;
      if (postcode.trim() && !(l.postcode ?? "").startsWith(postcode.trim())) return false;
      if (verifiedOnly && !l.verified) return false;
      if (premiumOnly && l.plan !== "premium") return false;
      if (minRating !== "any" && l.rating < Number(minRating)) return false;
      return true;
    });
    return [...out].sort((a, b) => {
      if (sort === "name") return a.businessName.localeCompare(b.businessName);
      if (sort === "rating") return b.rating - a.rating;
      if (sort === "recommended") return recommendationsFor(b) - recommendationsFor(a);
      if (a.plan !== b.plan) return a.plan === "premium" ? -1 : 1;
      return recommendationsFor(b) - recommendationsFor(a) || b.rating - a.rating;
    });
  }, [
    published,
    search,
    categories,
    industries,
    country,
    state,
    postcode,
    verifiedOnly,
    premiumOnly,
    minRating,
    sort,
  ]);

  const { page, setPage, totalPages, paginated, total } = usePagination(results, PAGE_SIZE);

  // Reset to first page whenever the query changes
  useEffect(() => {
    setPage(1);
  }, [search, categories, industries, country, state, postcode, verifiedOnly, premiumOnly, minRating, sort, setPage]);

  const countries = useMemo(
    () => Array.from(new Set(published.map((l) => l.country).filter(Boolean) as string[])).sort(),
    [published]
  );
  const states = useMemo(
    () =>
      Array.from(
        new Set(
          published
            .filter((l) => country === "all" || l.country === country)
            .map((l) => l.state)
            .filter(Boolean) as string[]
        )
      ).sort(),
    [published, country]
  );

  const categoryCounts = useMemo(() => {
    const map = new Map<string, number>();
    published.forEach((l) => map.set(l.category, (map.get(l.category) ?? 0) + 1));
    return map;
  }, [published]);

  const industryCounts = useMemo(() => {
    const map = new Map<string, number>();
    published.forEach((l) => {
      const i = industryForCategory(l.category);
      map.set(i, (map.get(i) ?? 0) + 1);
    });
    return map;
  }, [published]);

  const toggle = (setter: (fn: (prev: string[]) => string[]) => void) => (value: string) =>
    setter((prev) => (prev.includes(value) ? prev.filter((c) => c !== value) : [...prev, value]));

  const toggleCategory = toggle(setCategories);
  const toggleIndustry = toggle(setIndustries);

  const activeFilters: { label: string; clear: () => void }[] = [
    ...industries.map((i) => ({ label: i, clear: () => toggleIndustry(i) })),
    ...categories.map((c) => ({ label: c, clear: () => toggleCategory(c) })),
    ...(country !== "all" ? [{ label: country, clear: () => setCountry("all") }] : []),
    ...(state !== "all" ? [{ label: state, clear: () => setState("all") }] : []),
    ...(postcode.trim() ? [{ label: `Postcode ${postcode}`, clear: () => setPostcode("") }] : []),
    ...(verifiedOnly ? [{ label: "Verified", clear: () => setVerifiedOnly(false) }] : []),
    ...(premiumOnly ? [{ label: "Premium", clear: () => setPremiumOnly(false) }] : []),
    ...(minRating !== "any" ? [{ label: `${minRating}+ rating`, clear: () => setMinRating("any") }] : []),
  ];

  const clearAll = () => {
    setCategories([]);
    setIndustries([]);
    setCountry("all");
    setState("all");
    setPostcode("");
    setVerifiedOnly(false);
    setPremiumOnly(false);
    setMinRating("any");
  };

  const filterPanel = (
    <div className="space-y-5">
      {/* Industry */}
      <section className="space-y-2">
        <h3 className="text-xs font-semibold uppercase tracking-wide text-muted-foreground">Industry</h3>
        <div className="space-y-1">
          {Object.keys(MARKETPLACE_INDUSTRIES).concat("Other industries").map((ind) => (
            <label key={ind} className="flex items-center gap-2 text-sm py-1 cursor-pointer">
              <Checkbox checked={industries.includes(ind)} onCheckedChange={() => toggleIndustry(ind)} />
              <span className="flex-1 leading-tight">{ind}</span>
              <span className="text-[11px] text-muted-foreground">{industryCounts.get(ind) ?? 0}</span>
            </label>
          ))}
        </div>
      </section>

      <Separator />

      {/* Category */}
      <section className="space-y-2">
        <div className="flex items-center justify-between">
          <h3 className="text-xs font-semibold uppercase tracking-wide text-muted-foreground">Category</h3>
          {categories.length > 0 && (
            <button className="text-[11px] text-primary" onClick={() => setCategories([])}>
              Clear
            </button>
          )}
        </div>
        <Input
          value={catSearch}
          onChange={(e) => setCatSearch(e.target.value)}
          placeholder="Search categories..."
          className="h-9"
        />
        <div className="max-h-64 overflow-y-auto space-y-1 pr-1">
          {allCategories
            .filter((c) => c.toLowerCase().includes(catSearch.trim().toLowerCase()))
            .map((cat) => (
              <div key={cat} className="flex items-center gap-2 text-sm py-0.5">
                <Checkbox checked={categories.includes(cat)} onCheckedChange={() => toggleCategory(cat)} />
                <span className="flex-1 leading-tight">{cat}</span>
                <span className="text-[11px] text-muted-foreground">{categoryCounts.get(cat) ?? 0}</span>
                <button
                  onClick={() => marketplaceStore.toggleBookmarkCategory(cat)}
                  title={bookmarked.includes(cat) ? "Remove from quick filters" : "Pin as quick filter"}
                >
                  <Bookmark
                    className={cn(
                      "w-3.5 h-3.5",
                      bookmarked.includes(cat) ? "fill-primary text-primary" : "text-muted-foreground"
                    )}
                  />
                </button>
              </div>
            ))}
        </div>
        <div className="flex gap-2 pt-1">
          <Input
            value={newCategory}
            onChange={(e) => setNewCategory(e.target.value)}
            placeholder="Add new category"
            className="h-9"
          />
          <Button
            size="sm"
            className="h-9"
            onClick={() => {
              marketplaceStore.addCategory(newCategory);
              setNewCategory("");
            }}
          >
            <Plus className="w-4 h-4" />
          </Button>
        </div>
      </section>

      <Separator />

      {/* Location */}
      <section className="space-y-2">
        <h3 className="text-xs font-semibold uppercase tracking-wide text-muted-foreground">Location</h3>
        <Select value={country} onValueChange={(v) => { setCountry(v); setState("all"); }}>
          <SelectTrigger className="h-9">
            <SelectValue placeholder="Country" />
          </SelectTrigger>
          <SelectContent className="bg-popover z-50">
            <SelectItem value="all">All countries</SelectItem>
            {countries.map((c) => (
              <SelectItem key={c} value={c}>{c}</SelectItem>
            ))}
          </SelectContent>
        </Select>
        <Select value={state} onValueChange={setState}>
          <SelectTrigger className="h-9">
            <SelectValue placeholder="State / region" />
          </SelectTrigger>
          <SelectContent className="bg-popover z-50">
            <SelectItem value="all">All states / regions</SelectItem>
            {states.map((c) => (
              <SelectItem key={c} value={c}>{c}</SelectItem>
            ))}
          </SelectContent>
        </Select>
        <Input
          value={postcode}
          onChange={(e) => setPostcode(e.target.value)}
          placeholder="Postcode / ZIP"
          className="h-9"
        />
      </section>

      <Separator />

      {/* Quality */}
      <section className="space-y-2">
        <h3 className="text-xs font-semibold uppercase tracking-wide text-muted-foreground">Trust & quality</h3>
        <label className="flex items-center gap-2 text-sm py-1 cursor-pointer">
          <Checkbox checked={verifiedOnly} onCheckedChange={(v) => setVerifiedOnly(!!v)} />
          Verified providers only
        </label>
        <label className="flex items-center gap-2 text-sm py-1 cursor-pointer">
          <Checkbox checked={premiumOnly} onCheckedChange={(v) => setPremiumOnly(!!v)} />
          Premium members only
        </label>
        <Select value={minRating} onValueChange={setMinRating}>
          <SelectTrigger className="h-9">
            <SelectValue placeholder="Minimum rating" />
          </SelectTrigger>
          <SelectContent className="bg-popover z-50">
            <SelectItem value="any">Any rating</SelectItem>
            <SelectItem value="4.5">4.5+</SelectItem>
            <SelectItem value="4">4.0+</SelectItem>
            <SelectItem value="3">3.0+</SelectItem>
          </SelectContent>
        </Select>
      </section>
    </div>
  );

  const ListingTile = ({ l }: { l: MarketplaceListing }) => {
    const recs = recommendationsFor(l);
    return (
      <button
        onClick={() => setActive(l)}
        className={cn(
          "text-left rounded-lg border bg-card p-4 space-y-3 transition-colors hover:border-primary/50",
          l.plan === "premium" ? "border-primary/30 bg-primary/[0.04]" : "border-border"
        )}
      >
        <div className="flex items-start gap-3">
          <div className="w-12 h-12 shrink-0 rounded-lg border border-border bg-muted overflow-hidden flex items-center justify-center">
            {l.logo ? (
              <img src={l.logo} alt={`${l.businessName} logo`} className="w-full h-full object-cover" />
            ) : (
              <Building2 className="w-5 h-5 text-muted-foreground" />
            )}
          </div>
          <div className="min-w-0 flex-1">
            <div className="flex items-center gap-1.5">
              <h3 className="text-sm font-semibold truncate">{l.businessName}</h3>
              {l.verified && <BadgeCheck className="w-4 h-4 text-primary shrink-0" />}
            </div>
            <p className="text-[11px] text-muted-foreground truncate">
              {l.category} • {industryForCategory(l.category)}
            </p>
          </div>
          {l.plan === "premium" && (
            <Sparkles className="w-4 h-4 text-primary shrink-0" aria-label="Premium member" />
          )}
        </div>

        <p className="text-sm text-foreground/80 line-clamp-2">
          {l.tagline || l.description || "No description yet."}
        </p>

        {recs > 0 && (
          <div className="inline-flex items-center gap-1.5 rounded-lg bg-primary/10 px-2 py-1 text-[11px] font-medium text-primary">
            <ThumbsUp className="w-3 h-3" />
            Recommended by {recs} practice manager{recs === 1 ? "" : "s"}
          </div>
        )}

        <div className="flex items-center gap-3 flex-wrap text-[11px] text-muted-foreground">
          {l.plan === "premium" && (
            <Badge className="gap-1 bg-primary text-primary-foreground text-[10px] py-0">
              <Sparkles className="w-3 h-3" /> Premium
            </Badge>
          )}
          <span className="flex items-center gap-1">
            <Star className="w-3 h-3 fill-warning text-warning" />
            {l.rating ? l.rating.toFixed(1) : "New"}
          </span>
          {l.location && (
            <span className="flex items-center gap-1">
              <MapPin className="w-3 h-3" /> {l.location}
              {l.country ? `, ${l.country}` : ""}
            </span>
          )}
        </div>
      </button>
    );
  };

  const ListingRow = ({ l }: { l: MarketplaceListing }) => {
    const recs = recommendationsFor(l);
    return (
      <button
        onClick={() => setActive(l)}
        className={cn(
          "w-full text-left rounded-lg border bg-card p-3 flex items-center gap-4 transition-colors hover:border-primary/50",
          l.plan === "premium" ? "border-primary/30 bg-primary/[0.04]" : "border-border"
        )}
      >
        <div className="w-10 h-10 shrink-0 rounded-lg border border-border bg-muted overflow-hidden flex items-center justify-center">
          {l.logo ? (
            <img src={l.logo} alt={`${l.businessName} logo`} className="w-full h-full object-cover" />
          ) : (
            <Building2 className="w-4 h-4 text-muted-foreground" />
          )}
        </div>
        <div className="min-w-0 flex-1">
          <div className="flex items-center gap-1.5">
            <span className="text-sm font-semibold truncate">{l.businessName}</span>
            {l.verified && <BadgeCheck className="w-4 h-4 text-primary shrink-0" />}
            {l.plan === "premium" && (
              <Badge className="gap-1 bg-primary text-primary-foreground shrink-0 text-[10px] py-0">
                <Sparkles className="w-3 h-3" /> Premium
              </Badge>
            )}
          </div>
          <p className="text-xs text-muted-foreground truncate">
            {l.tagline || l.description || l.category}
          </p>
        </div>
        <div className="hidden md:block w-40 shrink-0 text-[11px] text-muted-foreground truncate">
          {l.category}
        </div>
        <div className="hidden lg:block w-40 shrink-0 text-[11px] text-muted-foreground truncate">
          {[l.location, l.country].filter(Boolean).join(", ")}
        </div>
        <div className="w-24 shrink-0 text-right text-[11px] text-muted-foreground">
          <span className="inline-flex items-center gap-1">
            <Star className="w-3 h-3 fill-warning text-warning" />
            {l.rating ? l.rating.toFixed(1) : "New"}
          </span>
          {recs > 0 && <div className="text-primary">{recs} recs</div>}
        </div>
      </button>
    );
  };

  return (
    <div className="min-h-[100dvh] overflow-y-auto flex flex-col bg-background">
      {/* Top bar */}
      <header className="sticky top-0 z-30 shrink-0 border-b border-border bg-card">
        <div className="mx-auto w-full max-w-[1600px] px-4 md:px-6 lg:px-10 h-14 flex items-center gap-3">
          <Button
            variant="ghost"
            size="sm"
            className="gap-2 -ml-2"
            onClick={() => {
              if (window.history.state?.idx > 0) navigate(-1);
              else navigate("/dashboard");
            }}
          >
            <ArrowLeft className="w-4 h-4" />
            <span className="hidden sm:inline">Back</span>
          </Button>
          <div className="flex items-center gap-2 text-sm font-semibold shrink-0">
            <Store className="w-4 h-4 text-primary" />
            <span className="hidden sm:inline">Marketplace</span>
          </div>

          {/* Persistent search in the header — always reachable at any scroll depth */}
          <div className="relative flex-1 max-w-xl mx-auto">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
            <Input
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              placeholder="Search businesses, services, locations..."
              className="h-9 pl-9 pr-8 rounded-lg"
            />
            {search && (
              <button
                onClick={() => setSearch("")}
                className="absolute right-2 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground"
              >
                <X className="w-4 h-4" />
              </button>
            )}
          </div>

          <div className="flex items-center gap-2 shrink-0">
            <Button variant="ghost" size="sm" className="gap-2" onClick={() => navigate("/marketplace/news")}>
              <Newspaper className="w-4 h-4" />
              <span className="hidden lg:inline">News</span>
            </Button>
            <Button variant="outline" size="sm" className="gap-2" onClick={() => navigate("/marketplace/account")}>
              <UserCog className="w-4 h-4" />
              <span className="hidden lg:inline">List your business</span>
            </Button>
          </div>
        </div>
      </header>

      <div className="flex-1">
        <div className="mx-auto w-full max-w-[1600px] px-4 md:px-6 lg:px-10 py-6">
          <div className="grid grid-cols-1 lg:grid-cols-[228px_minmax(0,1fr)] xl:grid-cols-[228px_minmax(0,1fr)_288px] gap-6 xl:gap-8 items-start">

            {/* Filter rail */}
            <aside className="hidden lg:block rounded-lg border border-border bg-card p-4">
              <div className="flex items-center justify-between mb-3">
                <h2 className="text-sm font-semibold flex items-center gap-1.5">
                  <SlidersHorizontal className="w-4 h-4 text-primary" /> Filters
                </h2>
                {activeFilters.length > 0 && (
                  <button className="text-[11px] text-primary" onClick={clearAll}>
                    Clear all
                  </button>
                )}
              </div>
              {filterPanel}
            </aside>

            {/* Results */}
            <div className="space-y-4 min-w-0 lg:px-2">
              {/* Quick category chips */}
              <div className="flex flex-wrap gap-2">
                <button
                  onClick={() => { setCategories([]); setIndustries([]); }}
                  className={cn(
                    "rounded-lg border px-3 py-1.5 text-xs font-medium transition-colors",
                    categories.length === 0 && industries.length === 0
                      ? "border-primary bg-primary text-primary-foreground"
                      : "border-border bg-card hover:border-primary/50"
                  )}
                >
                  All
                </button>
                {bookmarked.map((cat) => (
                  <button
                    key={cat}
                    onClick={() => toggleCategory(cat)}
                    className={cn(
                      "rounded-lg border px-3 py-1.5 text-xs font-medium transition-colors",
                      categories.includes(cat)
                        ? "border-primary bg-primary text-primary-foreground"
                        : "border-border bg-card hover:border-primary/50"
                    )}
                  >
                    {cat}
                    <span className="ml-1.5 opacity-60">{categoryCounts.get(cat) ?? 0}</span>
                  </button>
                ))}

                {/* Mobile filters */}
                <Sheet>
                  <SheetTrigger asChild>
                    <button className="lg:hidden rounded-lg border border-dashed border-border bg-card px-3 py-1.5 text-xs font-medium inline-flex items-center gap-1.5">
                      <SlidersHorizontal className="w-3.5 h-3.5" /> Filters
                      {activeFilters.length > 0 && (
                        <span className="rounded-full bg-primary text-primary-foreground px-1.5">
                          {activeFilters.length}
                        </span>
                      )}
                    </button>
                  </SheetTrigger>
                  <SheetContent side="left" className="w-[320px] overflow-y-auto">
                    <SheetHeader>
                      <SheetTitle>Filters</SheetTitle>
                    </SheetHeader>
                    <div className="mt-4">{filterPanel}</div>
                  </SheetContent>
                </Sheet>
              </div>

              {/* Toolbar */}
              <div className="flex flex-wrap items-center gap-2 justify-between rounded-lg border border-border bg-card px-3 py-2">
                <p className="text-xs text-muted-foreground">
                  <span className="font-semibold text-foreground">{total.toLocaleString()}</span> provider
                  {total === 1 ? "" : "s"}
                  {totalPages > 1 && ` • page ${page} of ${totalPages}`}
                </p>
                <div className="flex items-center gap-2">
                  <Select value={sort} onValueChange={(v) => setSort(v as SortKey)}>
                    <SelectTrigger className="h-8 w-[170px] text-xs">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent className="bg-popover z-50">
                      <SelectItem value="relevance">Best match</SelectItem>
                      <SelectItem value="recommended">Most recommended</SelectItem>
                      <SelectItem value="rating">Highest rated</SelectItem>
                      <SelectItem value="name">Name A–Z</SelectItem>
                    </SelectContent>
                  </Select>
                  <div className="flex rounded-lg border border-border overflow-hidden">
                    <button
                      onClick={() => setView("grid")}
                      className={cn("px-2 py-1.5", view === "grid" ? "bg-primary text-primary-foreground" : "bg-card")}
                      title="Grid view"
                    >
                      <LayoutGrid className="w-4 h-4" />
                    </button>
                    <button
                      onClick={() => setView("list")}
                      className={cn("px-2 py-1.5", view === "list" ? "bg-primary text-primary-foreground" : "bg-card")}
                      title="List view"
                    >
                      <ListIcon className="w-4 h-4" />
                    </button>
                  </div>
                </div>
              </div>

              {/* Active filter chips */}
              {activeFilters.length > 0 && (
                <div className="flex flex-wrap gap-1.5">
                  {activeFilters.map((f) => (
                    <button
                      key={f.label}
                      onClick={f.clear}
                      className="inline-flex items-center gap-1 rounded-lg bg-muted px-2 py-1 text-[11px] text-muted-foreground hover:text-foreground"
                    >
                      {f.label}
                      <X className="w-3 h-3" />
                    </button>
                  ))}
                  <button onClick={clearAll} className="text-[11px] text-primary px-1">
                    Clear all
                  </button>
                </div>
              )}

              {/* Results */}
              {view === "grid" ? (
                <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-3 gap-4">
                  {paginated.map((l) => (
                    <ListingTile key={l.id} l={l} />
                  ))}
                </div>
              ) : (
                <div className="space-y-2">
                  {paginated.map((l) => (
                    <ListingRow key={l.id} l={l} />
                  ))}
                </div>
              )}

              {results.length === 0 && (
                <div className="rounded-lg border border-dashed border-border p-10 text-center">
                  <Store className="w-8 h-8 mx-auto text-muted-foreground mb-3" />
                  <p className="text-sm font-medium">No providers match your search</p>
                  <p className="text-xs text-muted-foreground mt-1">
                    Try a broader keyword, or clear some filters.
                  </p>
                  {activeFilters.length > 0 && (
                    <Button variant="outline" size="sm" className="mt-4" onClick={clearAll}>
                      Clear all filters
                    </Button>
                  )}
                </div>
              )}

              {/* Pagination */}
              {totalPages > 1 && (
                <div className="flex items-center justify-center gap-2 pt-2">
                  <Button
                    variant="outline"
                    size="sm"
                    disabled={page === 1}
                    onClick={() => setPage(page - 1)}
                    className="gap-1"
                  >
                    <ChevronLeft className="w-4 h-4" /> Previous
                  </Button>
                  <span className="text-xs text-muted-foreground px-2">
                    {page} / {totalPages}
                  </span>
                  <Button
                    variant="outline"
                    size="sm"
                    disabled={page === totalPages}
                    onClick={() => setPage(page + 1)}
                    className="gap-1"
                  >
                    Next <ChevronRight className="w-4 h-4" />
                  </Button>
                </div>
              )}
            </div>

            <MarketplaceNewsColumn className="hidden xl:block" />
          </div>
        </div>
      </div>

      {/* Details popover */}
      <Dialog open={!!active} onOpenChange={(o) => !o && setActive(null)}>
        <DialogContent className="max-w-lg">
          {active && (
            <>
              <DialogHeader>
                <DialogTitle className="flex items-center gap-2">
                  {active.businessName}
                  {active.verified && <BadgeCheck className="w-4 h-4 text-primary" />}
                </DialogTitle>
              </DialogHeader>

              <div className="space-y-4">
                <div className="flex items-center gap-3">
                  <div className="w-14 h-14 shrink-0 rounded-lg border border-border bg-muted overflow-hidden flex items-center justify-center">
                    {active.logo ? (
                      <img src={active.logo} alt={`${active.businessName} logo`} className="w-full h-full object-cover" />
                    ) : (
                      <Building2 className="w-6 h-6 text-muted-foreground" />
                    )}
                  </div>
                  <div className="space-y-1">
                    <p className="text-xs text-muted-foreground">
                      {active.category} • {industryForCategory(active.category)}
                    </p>
                    {recommendationsFor(active) > 0 && (
                      <div className="inline-flex items-center gap-1.5 rounded-lg bg-primary/10 px-2 py-1 text-[11px] font-medium text-primary">
                        <ThumbsUp className="w-3 h-3" />
                        Recommended by {recommendationsFor(active)} practice managers
                      </div>
                    )}
                  </div>
                </div>

                <p className="text-sm text-foreground/80">
                  {active.description || active.tagline || "No description yet."}
                </p>

                {active.services.length > 0 && (
                  <div className="flex flex-wrap gap-1.5">
                    {active.services.map((s) => (
                      <span key={s} className="rounded-lg bg-muted px-2 py-0.5 text-[11px] text-muted-foreground">
                        {s}
                      </span>
                    ))}
                  </div>
                )}

                <div className="grid grid-cols-1 gap-1.5 text-xs text-muted-foreground">
                  {active.location && (
                    <span className="flex items-center gap-2">
                      <MapPin className="w-3.5 h-3.5" /> {[active.location, active.country].filter(Boolean).join(", ")}
                    </span>
                  )}
                  <span className="flex items-center gap-2">
                    <Clock className="w-3.5 h-3.5" /> {active.responseTime}
                  </span>
                  {active.phone && (
                    <span className="flex items-center gap-2">
                      <Phone className="w-3.5 h-3.5" /> {active.phone}
                    </span>
                  )}
                  {active.website && (
                    <span className="flex items-center gap-2">
                      <Globe className="w-3.5 h-3.5" /> {active.website}
                    </span>
                  )}
                </div>

                <div className="flex gap-2 pt-1">
                  <Button variant="outline" className="flex-1" onClick={() => setActive(null)}>
                    Close
                  </Button>
                  <Button className="flex-1" onClick={() => navigate(`/marketplace/${active.id}`)}>
                    View full profile
                  </Button>
                </div>
              </div>
            </>
          )}
        </DialogContent>
      </Dialog>
    </div>
  );
};

export default Marketplace;
