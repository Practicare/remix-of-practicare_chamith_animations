/**
 * Centralized Practicare branding configuration.
 * Import from here instead of hardcoding brand values in components.
 */

export const APP_BRAND = {
  /** Full app name */
  name: "Practicare",
  /** Short display name for tight spaces */
  shortName: "Practicare",
  /** AI feature name */
  aiName: "PractiCare AI",
  /** Tagline */
  tagline: "Your trusted practice management partner",
  /** Legal / copyright entity */
  legalEntity: "Practicare",
  /** Contact emails */
  emails: {
    legal: "legal@practicare.com",
    privacy: "privacy@practicare.com",
    support: "support@practicare.com",
  },
  /** Domain shown in UI */
  domain: "practicare.io",
  dashboardUrl: "dashboard.practicare.io",
} as const;

export const APP_COLORS = {
  /** Primary brand color (teal) */
  primary: "#229186",
  /** Primary HSL for CSS usage */
  primaryHsl: "174, 62%, 35%",
  /** Dark variant */
  primaryDark: "#1b756c",
  /** Light variant for backgrounds */
  primaryLight: "#e6f5f3",
  /** Secondary / black */
  black: "#000000",
  /** White */
  white: "#FFFFFF",
} as const;

export const APP_FONTS = {
  /** Brand heading font */
  heading: "'Aileron', 'Segoe UI', Arial, sans-serif",
  /** Body font */
  body: "'Segoe UI', Arial, sans-serif",
} as const;

export const APP_LOGOS = {
  /** Full logo with wordmark (transparent PNG) */
  full: "/__l5e/assets-v1/e763c437-bf3b-4023-964e-2d046e3509ab/practicare-logo.png",
  /** Icon only */
  icon: "/__l5e/assets-v1/3621c635-c969-48e3-8df5-c4fd1ebab40e/practicare-mark.jpg",
} as const;

/** Copyright line generator */
export function brandCopyright(year?: number): string {
  return `© ${year ?? new Date().getFullYear()} ${APP_BRAND.legalEntity}. All rights reserved.`;
}

/** "Powered by" line */
export const POWERED_BY = `Powered by ${APP_BRAND.name}`;
