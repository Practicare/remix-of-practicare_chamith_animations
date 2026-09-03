import { createContext, useContext, useState, ReactNode, useMemo } from "react";
import { Organization, Site } from "@/types/organization";
import { mockOrganization, mockSites } from "@/data/mockOrganization";

interface OrgSiteContextType {
  organization: Organization;
  sites: Site[];
  currentSite: Site;
  setCurrentSiteId: (siteId: string) => void;
  allSitesMode: boolean;
  setAllSitesMode: (enabled: boolean) => void;
}

const OrgSiteContext = createContext<OrgSiteContextType | undefined>(undefined);

export function OrgSiteProvider({ children }: { children: ReactNode }) {
  const [currentSiteId, setCurrentSiteId] = useState<string>(
    mockSites.find((s) => s.isDefault)?.id || mockSites[0].id
  );
  const [allSitesMode, setAllSitesMode] = useState(false);

  const currentSite = useMemo(
    () => mockSites.find((s) => s.id === currentSiteId) || mockSites[0],
    [currentSiteId]
  );

  return (
    <OrgSiteContext.Provider
      value={{
        organization: mockOrganization,
        sites: mockSites,
        currentSite,
        setCurrentSiteId,
        allSitesMode,
        setAllSitesMode,
      }}
    >
      {children}
    </OrgSiteContext.Provider>
  );
}

export function useOrgSite() {
  const context = useContext(OrgSiteContext);
  if (!context) {
    throw new Error("useOrgSite must be used within an OrgSiteProvider");
  }
  return context;
}
