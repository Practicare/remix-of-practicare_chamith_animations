import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { ChevronDown, Newspaper } from "lucide-react";
import { cn } from "@/lib/utils";
import { NEWS, NewsItem, relTime } from "@/data/marketplaceNews";

interface Props {
  limit?: number;
  className?: string;
}

const MarketplaceNewsColumn = ({ limit = 5, className }: Props) => {
  const navigate = useNavigate();
  const [active, setActive] = useState<NewsItem | null>(null);
  const [expanded, setExpanded] = useState(false);

  const visible = expanded ? NEWS : NEWS.slice(0, limit);

  return (
    <aside className={cn("space-y-3", className)}>
      <div className="rounded-lg border border-border bg-card">
        <div className="px-4 pt-4 pb-1 flex items-start justify-between gap-2">
          <div>
            <h2 className="text-sm font-bold flex items-center gap-1.5">
              <Newspaper className="w-4 h-4 text-primary" />
              Practice News
            </h2>
            <p className="text-xs text-muted-foreground mt-0.5">Top stories</p>
          </div>
        </div>

        <ul className="px-4 pb-1">
          {visible.map((n) => (
            <li key={n.id}>
              <button onClick={() => setActive(n)} className="w-full text-left py-2.5 group">
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

        {NEWS.length > limit && (
          <button
            onClick={() => setExpanded((v) => !v)}
            className="w-full flex items-center gap-1.5 px-4 py-2.5 text-sm font-medium text-muted-foreground hover:bg-muted/50 rounded-b-lg transition-colors"
          >
            {expanded ? "Show less" : "Show more news"}
            <ChevronDown className={cn("w-4 h-4 transition-transform", expanded && "rotate-180")} />
          </button>
        )}
      </div>

      <Button
        variant="outline"
        size="sm"
        className="w-full"
        onClick={() => navigate("/marketplace/news")}
      >
        Go to all news
      </Button>

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
    </aside>
  );
};

export default MarketplaceNewsColumn;
