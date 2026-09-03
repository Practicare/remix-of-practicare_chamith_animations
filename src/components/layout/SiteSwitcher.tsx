import { useOrgSite } from "@/contexts/OrgSiteContext";
import { Building2, ChevronDown, Globe } from "lucide-react";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Badge } from "@/components/ui/badge";
import { cn } from "@/lib/utils";

export function SiteSwitcher({ compact = false }: { compact?: boolean }) {
  const { organization, sites, currentSite, setCurrentSiteId, allSitesMode, setAllSitesMode } = useOrgSite();

  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <button
          className={cn(
            "w-full flex items-center gap-2 rounded-lg border border-border/40 bg-muted/20 hover:bg-muted/50 transition-colors text-left",
            compact ? "px-2.5 py-1.5" : "px-3 py-2"
          )}
        >
          <div className="w-6 h-6 rounded-md bg-primary/10 flex items-center justify-center shrink-0">
            {allSitesMode ? (
              <Globe className="w-3 h-3 text-primary" />
            ) : (
              <Building2 className="w-3 h-3 text-primary" />
            )}
          </div>
          <div className="flex-1 min-w-0">
            <p className="mb-0 truncate text-[10px] leading-[1.2] text-muted-foreground">
              {organization.name}
            </p>
            <p className="truncate text-[12px] font-semibold leading-[1.2] tracking-[-0.01em] text-foreground">
              {allSitesMode ? "All Sites" : currentSite.name}
            </p>
          </div>
          <ChevronDown className="w-3.5 h-3.5 text-muted-foreground shrink-0" />
        </button>
      </DropdownMenuTrigger>
      <DropdownMenuContent align="start" className="w-56 bg-popover">
        <DropdownMenuItem
          onClick={() => setAllSitesMode(true)}
          className={cn(allSitesMode && "bg-accent")}
        >
          <Globe className="w-4 h-4 mr-2 text-muted-foreground" />
          <span className="flex-1">All Sites</span>
          {allSitesMode && (
            <Badge variant="secondary" className="text-[10px] px-1.5 py-0 ml-1">Active</Badge>
          )}
        </DropdownMenuItem>
        <DropdownMenuSeparator />
        {sites.filter(s => s.isActive).map((site) => (
          <DropdownMenuItem
            key={site.id}
            onClick={() => {
              setCurrentSiteId(site.id);
              setAllSitesMode(false);
            }}
            className={cn(!allSitesMode && currentSite.id === site.id && "bg-accent")}
          >
            <Building2 className="w-4 h-4 mr-2 text-muted-foreground" />
            <span className="flex-1">{site.name}</span>
            {site.isDefault && (
              <Badge variant="outline" className="text-[10px] px-1.5 py-0 ml-1">HQ</Badge>
            )}
          </DropdownMenuItem>
        ))}
      </DropdownMenuContent>
    </DropdownMenu>
  );
}
