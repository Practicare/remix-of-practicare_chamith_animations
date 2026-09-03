import { useMemo, useState } from "react";
import { useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { ArrowLeft, Newspaper, Search, Store, ChevronDown } from "lucide-react";
import { cn } from "@/lib/utils";
import { NEWS, NEWS_TOPICS, NewsItem, relTime } from "@/data/marketplaceNews";

const TOPICS = NEWS_TOPICS;

const MarketplaceNews = () => {
  const navigate = useNavigate();
  const [search, setSearch] = useState("");
  const [topic, setTopic] = useState("All");
  const [active, setActive] = useState<NewsItem | null>(null);
  const [expanded, setExpanded] = useState(false);

  const results = useMemo(() => {
    const q = search.trim().toLowerCase();
    return NEWS.filter((n) => {
      if (topic !== "All" && n.topic !== topic) return false;
      if (q && !`${n.title} ${n.summary} ${n.topic} ${n.source}`.toLowerCase().includes(q))
        return false;
      return true;
    });
  }, [search, topic]);

  const visible = expanded ? results : results.slice(0, 5);

  return (
    <div className="min-h-[100dvh] overflow-y-auto flex flex-col bg-background">
      <header className="sticky top-0 z-30 shrink-0 border-b border-border bg-card">
        <div className="mx-auto w-full max-w-5xl px-4 md:px-8 h-14 flex items-center justify-between gap-3">
          <Button
            variant="ghost"
            size="sm"
            className="gap-2 -ml-2"
            onClick={() => {
              if (window.history.state?.idx > 0) navigate(-1);
              else navigate("/marketplace");
            }}
          >
            <ArrowLeft className="w-4 h-4" />
            Back
          </Button>
          <div className="flex items-center gap-2 text-sm font-semibold">
            <Newspaper className="w-4 h-4 text-primary" />
            Marketplace News
          </div>
          <Button variant="outline" size="sm" className="gap-2" onClick={() => navigate("/marketplace")}>
            <Store className="w-4 h-4" />
            <span className="hidden sm:inline">Directory</span>
          </Button>
        </div>
      </header>

      <div className="flex-1">
        <div className="mx-auto w-full max-w-5xl px-4 md:px-8 py-8 space-y-6">
          <div className="text-center space-y-4">
            <h1 className="text-2xl md:text-3xl font-bold tracking-tight">
              News for practice managers
            </h1>
            <p className="text-sm text-muted-foreground">
              Industry updates, compliance changes and insights from marketplace providers.
            </p>
            <div className="relative max-w-2xl mx-auto">
              <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-muted-foreground" />
              <Input
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                placeholder="Search news and updates..."
                className="h-12 pl-12 pr-4 rounded-lg text-base shadow-sm"
              />
            </div>
          </div>

          <div className="flex flex-wrap justify-center gap-2">
            {TOPICS.map((t) => (
              <button
                key={t}
                onClick={() => setTopic(t)}
                className={cn(
                  "rounded-lg border px-3 py-1.5 text-xs font-medium transition-colors",
                  topic === t
                    ? "border-primary bg-primary text-primary-foreground"
                    : "border-border bg-card hover:border-primary/50"
                )}
              >
                {t}
              </button>
            ))}
          </div>

          <div className="mx-auto w-full max-w-2xl rounded-lg border border-border bg-card">
            <div className="px-5 pt-4 pb-1">
              <h2 className="text-base font-bold">Practice News</h2>
              <p className="text-xs text-muted-foreground mt-0.5">Top stories</p>
            </div>

            <ul className="px-5 pb-1">
              {visible.map((n) => (
                <li key={n.id}>
                  <button
                    onClick={() => setActive(n)}
                    className="w-full text-left py-2.5 group"
                  >
                    <p className="text-sm font-semibold leading-snug group-hover:underline">
                      {n.title}
                    </p>
                    <p className="text-[11px] text-muted-foreground mt-0.5">
                      {relTime(n.date)}
                      {n.readers ? ` • ${n.readers.toLocaleString()} readers` : ""}
                      {` • ${n.topic}`}
                    </p>
                  </button>
                </li>
              ))}
            </ul>

            {results.length > 5 && (
              <button
                onClick={() => setExpanded((v) => !v)}
                className="w-full flex items-center gap-1.5 px-5 py-3 text-sm font-medium text-muted-foreground hover:bg-muted/50 rounded-b-lg transition-colors"
              >
                {expanded ? "Show less" : "Show more news"}
                <ChevronDown
                  className={cn("w-4 h-4 transition-transform", expanded && "rotate-180")}
                />
              </button>
            )}
          </div>

          {results.length === 0 && (
            <div className="rounded-lg border border-dashed border-border p-10 text-center">
              <Newspaper className="w-8 h-8 mx-auto text-muted-foreground mb-3" />
              <p className="text-sm font-medium">No articles match your search</p>
            </div>
          )}
        </div>
      </div>

      <Dialog open={!!active} onOpenChange={(o) => !o && setActive(null)}>
        <DialogContent className="max-w-lg">
          {active && (
            <>
              <DialogHeader>
                <DialogTitle className="leading-snug">{active.title}</DialogTitle>
              </DialogHeader>
              <div className="space-y-3">
                <div className="flex items-center gap-3 text-[11px] text-muted-foreground">
                  <Badge variant="secondary" className="text-[11px]">{active.topic}</Badge>
                  <span>{relTime(active.date)}</span>
                  <span>{active.source}</span>
                </div>
                <p className="text-sm font-medium">{active.summary}</p>
                <p className="text-sm text-foreground/80">{active.body}</p>
                <Button variant="outline" className="w-full" onClick={() => setActive(null)}>
                  Close
                </Button>
              </div>
            </>
          )}
        </DialogContent>
      </Dialog>
    </div>
  );
};

export default MarketplaceNews;
