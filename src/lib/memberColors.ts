/** Deterministic per-team-member colour badges (semantic-safe HSL tokens). */
const PALETTE = [
  { bg: "hsl(174 62% 34%)", soft: "hsl(174 62% 34% / 0.14)", border: "hsl(174 62% 34% / 0.45)" },
  { bg: "hsl(258 48% 55%)", soft: "hsl(258 48% 55% / 0.14)", border: "hsl(258 48% 55% / 0.45)" },
  { bg: "hsl(12 76% 60%)", soft: "hsl(12 76% 60% / 0.14)", border: "hsl(12 76% 60% / 0.45)" },
  { bg: "hsl(210 70% 48%)", soft: "hsl(210 70% 48% / 0.14)", border: "hsl(210 70% 48% / 0.45)" },
  { bg: "hsl(38 82% 48%)", soft: "hsl(38 82% 48% / 0.14)", border: "hsl(38 82% 48% / 0.45)" },
  { bg: "hsl(150 52% 36%)", soft: "hsl(150 52% 36% / 0.14)", border: "hsl(150 52% 36% / 0.45)" },
  { bg: "hsl(330 58% 52%)", soft: "hsl(330 58% 52% / 0.14)", border: "hsl(330 58% 52% / 0.45)" },
  { bg: "hsl(196 66% 42%)", soft: "hsl(196 66% 42% / 0.14)", border: "hsl(196 66% 42% / 0.45)" },
];

export function memberColor(key: string) {
  let hash = 0;
  for (let i = 0; i < key.length; i++) hash = (hash * 31 + key.charCodeAt(i)) >>> 0;
  return PALETTE[hash % PALETTE.length];
}

export function memberInitials(name: string) {
  return name
    .replace(/^Dr\.?\s+/i, "")
    .split(" ")
    .map((p) => p[0])
    .filter(Boolean)
    .slice(0, 2)
    .join("")
    .toUpperCase();
}
