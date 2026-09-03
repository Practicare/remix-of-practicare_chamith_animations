import { useMemo, useState } from "react";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Switch } from "@/components/ui/switch";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Tooltip, TooltipContent, TooltipTrigger } from "@/components/ui/tooltip";
import { Lock, Search, Info } from "lucide-react";
import { toast } from "sonner";
import { cn } from "@/lib/utils";
import {
  MODULE_REGISTRY,
  MODULE_SECTIONS,
  MODULE_PRESETS,
  dependentsOf,
  withDependencies,
} from "@/config/modules";
import { useModules } from "@/contexts/ModulesContext";

export function ModulesTab() {
  const { enabledModules, isModuleEnabled, setModuleEnabled, setEnabledModules } = useModules();
  const [query, setQuery] = useState("");

  const filtered = useMemo(() => {
    const q = query.trim().toLowerCase();
    if (!q) return MODULE_REGISTRY;
    return MODULE_REGISTRY.filter(
      (m) => m.label.toLowerCase().includes(q) || m.description.toLowerCase().includes(q)
    );
  }, [query]);

  const activePreset = useMemo(() => {
    const current = [...enabledModules].sort().join("|");
    return MODULE_PRESETS.find((p) => withDependencies(p.modules).sort().join("|") === current)?.id;
  }, [enabledModules]);

  const handleToggle = (id: string, on: boolean) => {
    const mod = MODULE_REGISTRY.find((m) => m.id === id);
    if (!mod || mod.locked) return;

    if (!on) {
      const blocked = dependentsOf(id).filter((d) => isModuleEnabled(d.id));
      if (blocked.length) {
        toast.error(`Turn off ${blocked.map((b) => b.label).join(", ")} first`, {
          description: `${blocked.length === 1 ? "It relies" : "They rely"} on ${mod.label}.`,
        });
        return;
      }
    }

    setModuleEnabled(id, on);
    if (on) {
      const added = mod.dependsOn?.filter((d) => !isModuleEnabled(d)) ?? [];
      toast.success(`${mod.label} enabled`, {
        description: added.length
          ? `Also switched on: ${added
              .map((d) => MODULE_REGISTRY.find((m) => m.id === d)?.label)
              .join(", ")}.`
          : "It's now visible in your menu.",
      });
    } else {
      toast.success(`${mod.label} hidden`, { description: "Your data is kept — re-enable anytime." });
    }
  };

  const enabledCount = MODULE_REGISTRY.filter((m) => isModuleEnabled(m.id)).length;

  return (
    <div className="space-y-6">
      <Card>
        <CardHeader className="pb-4">
          <div className="flex flex-wrap items-start justify-between gap-3">
            <div>
              <CardTitle className="text-base">Modules</CardTitle>
              <CardDescription>
                Choose what appears in your menu. Switching a module off hides it everywhere — your
                data is kept and comes back the moment you switch it on again.
              </CardDescription>
            </div>
            <Badge variant="secondary" className="shrink-0">
              {enabledCount} of {MODULE_REGISTRY.length} active
            </Badge>
          </div>
        </CardHeader>
        <CardContent className="space-y-4">
          <div>
            <p className="text-xs font-semibold uppercase tracking-wide text-muted-foreground mb-2">
              Start from a preset
            </p>
            <div className="grid gap-2 sm:grid-cols-3">
              {MODULE_PRESETS.map((preset) => (
                <button
                  key={preset.id}
                  type="button"
                  onClick={() => {
                    setEnabledModules(preset.modules);
                    toast.success(`${preset.label} applied`);
                  }}
                  className={cn(
                    "text-left rounded-lg border p-3 transition-colors hover:border-primary/50 hover:bg-muted/40",
                    activePreset === preset.id && "border-primary bg-primary/[0.06]"
                  )}
                >
                  <div className="flex items-center gap-2">
                    <span className="text-sm font-semibold">{preset.label}</span>
                    {activePreset === preset.id && (
                      <Badge className="h-4 px-1.5 text-[10px]">Current</Badge>
                    )}
                  </div>
                  <p className="text-xs text-muted-foreground mt-1 leading-snug">
                    {preset.description}
                  </p>
                </button>
              ))}
            </div>
          </div>

          <div className="relative">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
            <Input
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              placeholder="Search modules"
              className="pl-9"
            />
          </div>
        </CardContent>
      </Card>

      {MODULE_SECTIONS.map((section) => {
        const items = filtered.filter((m) => m.section === section);
        if (!items.length) return null;
        return (
          <Card key={section}>
            <CardHeader className="pb-3">
              <CardTitle className="text-sm font-semibold uppercase tracking-wide text-muted-foreground">
                {section}
              </CardTitle>
            </CardHeader>
            <CardContent className="grid gap-2 sm:grid-cols-2">
              {items.map((mod) => {
                const on = isModuleEnabled(mod.id);
                return (
                  <div
                    key={mod.id}
                    className={cn(
                      "flex items-start gap-3 rounded-lg border p-3 transition-colors",
                      on ? "bg-primary/[0.05] border-primary/25" : "bg-card"
                    )}
                  >
                    <div
                      className={cn(
                        "mt-0.5 grid place-items-center h-8 w-8 rounded-lg shrink-0",
                        on ? "bg-primary/15 text-primary" : "bg-muted text-muted-foreground"
                      )}
                    >
                      <mod.icon className="h-4 w-4" />
                    </div>
                    <div className="min-w-0 flex-1">
                      <div className="flex items-center gap-1.5">
                        <span className="text-sm font-medium truncate">{mod.label}</span>
                        {mod.locked && (
                          <Tooltip>
                            <TooltipTrigger asChild>
                              <span className="text-muted-foreground">
                                <Lock className="h-3 w-3" />
                              </span>
                            </TooltipTrigger>
                            <TooltipContent>Core module — always available</TooltipContent>
                          </Tooltip>
                        )}
                      </div>
                      <p className="text-xs text-muted-foreground leading-snug mt-0.5">
                        {mod.description}
                      </p>
                      {!!mod.dependsOn?.length && (
                        <p className="text-[11px] text-muted-foreground/80 mt-1 flex items-center gap-1">
                          <Info className="h-3 w-3 shrink-0" />
                          Needs{" "}
                          {mod.dependsOn
                            .map((d) => MODULE_REGISTRY.find((m) => m.id === d)?.label)
                            .join(", ")}
                        </p>
                      )}
                    </div>
                    <Switch
                      checked={on}
                      disabled={mod.locked}
                      onCheckedChange={(v) => handleToggle(mod.id, v)}
                      aria-label={`Toggle ${mod.label}`}
                    />
                  </div>
                );
              })}
            </CardContent>
          </Card>
        );
      })}

      <div className="flex justify-end">
        <Button
          variant="outline"
          onClick={() => {
            setEnabledModules(MODULE_PRESETS.find((p) => p.id === "full")!.modules);
            toast.success("All modules enabled");
          }}
        >
          Enable everything
        </Button>
      </div>
    </div>
  );
}
