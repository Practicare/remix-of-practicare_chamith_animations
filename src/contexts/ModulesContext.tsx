import { createContext, useContext, useState, useEffect, useMemo, ReactNode, useCallback } from "react";
import {
  ALL_MODULE_IDS,
  LOCKED_MODULE_IDS,
  withDependencies,
  moduleForPath,
} from "@/config/modules";
import { useOrgSite } from "@/contexts/OrgSiteContext";

interface ModulesContextType {
  enabledModules: string[];
  isModuleEnabled: (id: string) => boolean;
  isPathEnabled: (pathname: string) => boolean;
  setModuleEnabled: (id: string, enabled: boolean) => void;
  setEnabledModules: (ids: string[]) => void;
  resetToAll: () => void;
}

const ModulesContext = createContext<ModulesContextType | undefined>(undefined);

const storageKey = (siteId: string) => `practicare.modules.${siteId}`;

export function ModulesProvider({ children }: { children: ReactNode }) {
  const { currentSite } = useOrgSite();
  const siteId = currentSite?.id ?? "default";

  // Default: everything on, so nothing disappears until the user opts out.
  const [enabled, setEnabled] = useState<string[]>(ALL_MODULE_IDS);

  useEffect(() => {
    try {
      const raw = localStorage.getItem(storageKey(siteId));
      if (raw) {
        const parsed = JSON.parse(raw) as string[];
        if (Array.isArray(parsed)) {
          setEnabled(withDependencies(parsed.filter((id) => ALL_MODULE_IDS.includes(id))));
          return;
        }
      }
    } catch {
      /* ignore malformed storage */
    }
    setEnabled(ALL_MODULE_IDS);
  }, [siteId]);

  const persist = useCallback(
    (ids: string[]) => {
      const resolved = withDependencies(ids);
      setEnabled(resolved);
      try {
        localStorage.setItem(storageKey(siteId), JSON.stringify(resolved));
      } catch {
        /* storage unavailable */
      }
    },
    [siteId]
  );

  const value = useMemo<ModulesContextType>(() => {
    const enabledSet = new Set(enabled);
    return {
      enabledModules: enabled,
      isModuleEnabled: (id: string) => enabledSet.has(id) || LOCKED_MODULE_IDS.includes(id),
      isPathEnabled: (pathname: string) => {
        const mod = moduleForPath(pathname);
        if (!mod) return true; // unmapped routes (settings, onboarding, user area) always available
        return enabledSet.has(mod.id) || !!mod.locked;
      },
      setModuleEnabled: (id: string, on: boolean) =>
        persist(on ? [...enabled, id] : enabled.filter((m) => m !== id)),
      setEnabledModules: persist,
      resetToAll: () => persist(ALL_MODULE_IDS),
    };
  }, [enabled, persist]);

  return <ModulesContext.Provider value={value}>{children}</ModulesContext.Provider>;
}

export function useModules() {
  const ctx = useContext(ModulesContext);
  if (!ctx) throw new Error("useModules must be used within a ModulesProvider");
  return ctx;
}
