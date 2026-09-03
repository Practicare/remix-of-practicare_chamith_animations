import { useState, useMemo } from "react";
import { AdminLayout } from "@/components/layout/AdminLayout";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { SearchInput } from "@/components/ui/SearchInput";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
  DialogDescription,
} from "@/components/ui/dialog";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Textarea } from "@/components/ui/textarea";
import {
  Tooltip,
  TooltipContent,
  TooltipTrigger,
} from "@/components/ui/tooltip";
import {
  Mail,
  Eye,
  Copy,
  Edit,
  Trash2,
  Plus,
  PartyPopper,
  ClipboardList,
  UserPlus,
  Heart,
  Cake,
  TreePine,
  Star,
  Gift,
  Flower2,
  Award,
  Send,
  Sparkles,
  Calendar,
  CheckCircle2,
  FileEdit,
  MapPin,
  Phone,
} from "lucide-react";
import { toast } from "sonner";
import { motion, AnimatePresence } from "framer-motion";
import { APP_BRAND, APP_LOGOS, APP_COLORS, APP_FONTS, POWERED_BY, brandCopyright } from "@/config/branding";
import { useOrgSite } from "@/contexts/OrgSiteContext";

interface EmailTemplate {
  id: string;
  name: string;
  category: "celebrations" | "surveys" | "onboarding" | "wellbeing";
  subject: string;
  body: string;
  icon: string;
  status: "published" | "draft";
  lastModified: string;
}

const categoryConfig = {
  celebrations: { label: "Celebrations", icon: PartyPopper, gradient: "from-amber-400 to-orange-500", bg: "bg-amber-50", text: "text-amber-600", border: "border-amber-200", accent: "#f59e0b" },
  surveys: { label: "Surveys", icon: ClipboardList, gradient: "from-blue-400 to-indigo-500", bg: "bg-blue-50", text: "text-blue-600", border: "border-blue-200", accent: "#3b82f6" },
  onboarding: { label: "Staff Onboarding", icon: UserPlus, gradient: "from-emerald-400 to-teal-500", bg: "bg-emerald-50", text: "text-emerald-600", border: "border-emerald-200", accent: "#10b981" },
  wellbeing: { label: "Wellbeing Checks", icon: Heart, gradient: "from-rose-400 to-pink-500", bg: "bg-rose-50", text: "text-rose-600", border: "border-rose-200", accent: "#f43f5e" },
};

const getTemplateIcon = (icon: string): React.ComponentType<any> => {
  switch (icon) {
    case "cake": return Cake;
    case "tree": return TreePine;
    case "star": return Star;
    case "gift": return Gift;
    case "flower": return Flower2;
    case "award": return Award;
    case "clipboard": return ClipboardList;
    case "user": return UserPlus;
    case "heart": return Heart;
    default: return Mail;
  }
};

// Themed HTML helpers — beautiful, magazine-style email designs.
// Each category uses a tall gradient hero with scattered decorative dots,
// a top icon-in-circle, an ALL-CAPS topic eyebrow, and a massive serif headline.
// Below the hero sits a roomy cream/tinted content card with a floating
// circular icon badge.

// Decorative dot field — scattered translucent dots inside the hero.
const dots = (color = "rgba(255,255,255,0.55)") => `
  <div style="position:absolute;top:8%;left:10%;width:8px;height:8px;background:${color};border-radius:50%"></div>
  <div style="position:absolute;top:14%;right:18%;width:5px;height:5px;background:${color};border-radius:50%;opacity:0.7"></div>
  <div style="position:absolute;top:42%;left:6%;width:4px;height:4px;background:${color};border-radius:50%;opacity:0.6"></div>
  <div style="position:absolute;top:38%;right:8%;width:6px;height:6px;background:${color};border-radius:50%;opacity:0.65"></div>
  <div style="position:absolute;top:62%;left:14%;width:5px;height:5px;background:${color};border-radius:50%;opacity:0.55"></div>
  <div style="position:absolute;top:70%;right:22%;width:4px;height:4px;background:${color};border-radius:50%;opacity:0.5"></div>
  <div style="position:absolute;bottom:14%;left:30%;width:7px;height:7px;background:${color};border-radius:50%;opacity:0.7"></div>
  <div style="position:absolute;bottom:20%;right:12%;width:5px;height:5px;background:${color};border-radius:50%;opacity:0.6"></div>
  <div style="position:absolute;bottom:8%;left:55%;width:4px;height:4px;background:${color};border-radius:50%;opacity:0.5"></div>
  <div style="position:absolute;top:28%;left:50%;width:5px;height:5px;background:${color};border-radius:50%;opacity:0.45"></div>
`;

// Format paragraph content: split on double-newlines, wrap each in centered <p>.
const fmtBody = (content: string, color = "#3f3f46") => content
  .split(/\n\s*\n/)
  .map(p => `<p style="font-size:16px;color:${color};line-height:1.8;margin:0 0 18px;text-align:center">${p.trim().replace(/\n/g, "<br/>")}</p>`)
  .join("");

const themed = {
  // CELEBRATIONS — pink → orange → peach gradient, serif hero, cream content card.
  celebration: (opts: { hero: string; topic: string; content: string; cta?: { label: string; url: string }; emoji?: string; signOff?: string }) => {
    const { hero, topic, content, cta, emoji = "🎂", signOff = "With warm wishes," } = opts;
    return `
<table width="100%" cellpadding="0" cellspacing="0" border="0"><tr><td>
<div style="background:linear-gradient(135deg,#f5a3b8 0%,#f5b78c 55%,#f9d28a 100%);padding:64px 36px 72px;text-align:center;border-radius:18px;position:relative;overflow:hidden;min-height:380px">
  ${dots()}
  <div style="position:relative;display:inline-block;width:78px;height:78px;border-radius:50%;background:rgba(255,255,255,0.28);line-height:78px;font-size:36px;margin:0 auto 28px;backdrop-filter:blur(4px)">${emoji}</div>
  <p style="position:relative;font-size:12px;letter-spacing:3px;color:rgba(255,255,255,0.95);margin:0 0 22px;font-weight:600;text-transform:uppercase">${topic}</p>
  <h1 style="position:relative;font-family:Georgia,'Times New Roman',serif;font-size:46px;font-weight:700;color:#fff;margin:0;line-height:1.1;letter-spacing:-1px;padding:0 12px">${hero}</h1>
</div>

<div style="background:#fdf3ea;border-radius:18px;padding:54px 32px 44px;margin-top:18px;position:relative;text-align:center">
  <div style="position:absolute;top:-26px;left:50%;transform:translateX(-50%);width:52px;height:52px;border-radius:50%;background:#fff;line-height:52px;font-size:22px;box-shadow:0 4px 14px rgba(0,0,0,0.08)">❤️</div>
  <div style="max-width:480px;margin:0 auto">${fmtBody(content)}</div>
  ${cta ? `<div style="margin-top:28px"><a href="${cta.url}" style="background:#be185d;color:#fff;padding:14px 32px;border-radius:10px;text-decoration:none;font-weight:600;font-size:14px;display:inline-block">${cta.label} →</a></div>` : ""}
  <div style="margin-top:36px;padding-top:24px;border-top:1px solid rgba(190,24,93,0.15)">
    <p style="font-size:14px;color:#6b7280;margin:0">${signOff}</p>
    <p style="font-family:Georgia,'Times New Roman',serif;font-size:22px;color:#be185d;margin:8px 0 18px;font-weight:600">The [PracticeName] team</p>
    <p style="font-size:22px;margin:0;letter-spacing:8px">${emoji} 🥂 🌸</p>
  </div>
</div>
</td></tr></table>`;
  },

  // SURVEYS — blue → indigo gradient with subtle dot grid, serif hero, soft slate panel + CTA card.
  survey: (opts: { hero: string; topic: string; content: string; cta: { label: string; url: string }; emoji?: string; signOff?: string }) => {
    const { hero, topic, content, cta, emoji = "📋", signOff = "Thank you," } = opts;
    return `
<table width="100%" cellpadding="0" cellspacing="0" border="0"><tr><td>
<div style="background:linear-gradient(135deg,#60a5fa 0%,#6366f1 60%,#8b5cf6 100%);padding:64px 36px 72px;text-align:center;border-radius:18px;position:relative;overflow:hidden;min-height:380px">
  ${dots("rgba(255,255,255,0.5)")}
  <div style="position:relative;display:inline-block;width:78px;height:78px;border-radius:18px;background:rgba(255,255,255,0.22);line-height:78px;font-size:34px;margin:0 auto 28px">${emoji}</div>
  <p style="position:relative;font-size:12px;letter-spacing:3px;color:rgba(255,255,255,0.92);margin:0 0 22px;font-weight:600;text-transform:uppercase">${topic}</p>
  <h1 style="position:relative;font-family:Georgia,'Times New Roman',serif;font-size:44px;font-weight:700;color:#fff;margin:0;line-height:1.12;letter-spacing:-1px;padding:0 12px">${hero}</h1>
</div>

<div style="background:#f1f5f9;border-radius:18px;padding:54px 32px 44px;margin-top:18px;position:relative;text-align:center">
  <div style="position:absolute;top:-26px;left:50%;transform:translateX(-50%);width:52px;height:52px;border-radius:50%;background:#fff;line-height:52px;font-size:22px;box-shadow:0 4px 14px rgba(0,0,0,0.08)">💬</div>
  <div style="max-width:480px;margin:0 auto">${fmtBody(content, "#334155")}</div>
  <div style="margin-top:32px;padding:28px 24px;background:#fff;border-radius:14px;text-align:center;box-shadow:0 2px 12px rgba(99,102,241,0.08)">
    <p style="font-size:13px;color:#64748b;margin:0 0 16px">It takes just a few minutes — your input shapes what we do next.</p>
    <a href="${cta.url}" style="background:linear-gradient(135deg,#6366f1,#8b5cf6);color:#fff;padding:14px 36px;border-radius:10px;text-decoration:none;font-weight:600;font-size:14px;display:inline-block;box-shadow:0 4px 14px rgba(99,102,241,0.3)">${cta.label} →</a>
    <p style="font-size:11px;color:#94a3b8;margin:14px 0 0">🔒 Responses are confidential</p>
  </div>
  <div style="margin-top:32px;padding-top:24px;border-top:1px solid rgba(99,102,241,0.15)">
    <p style="font-size:14px;color:#64748b;margin:0">${signOff}</p>
    <p style="font-family:Georgia,'Times New Roman',serif;font-size:22px;color:#4f46e5;margin:8px 0 0;font-weight:600">The [PracticeName] team</p>
  </div>
</div>
</td></tr></table>`;
  },

  // ONBOARDING — emerald → teal gradient with soft circles, serif hero, mint content panel + pillars.
  onboarding: (opts: { hero: string; topic: string; content: string; cta?: { label: string; url: string }; pillars?: string[]; emoji?: string; signOff?: string }) => {
    const { hero, topic, content, cta, pillars, emoji = "🌱", signOff = "Welcome aboard," } = opts;
    return `
<table width="100%" cellpadding="0" cellspacing="0" border="0"><tr><td>
<div style="background:linear-gradient(135deg,#34d399 0%,#10b981 50%,#0d9488 100%);padding:64px 36px 72px;text-align:center;border-radius:18px;position:relative;overflow:hidden;min-height:380px">
  ${dots("rgba(255,255,255,0.5)")}
  <div style="position:absolute;top:-50px;right:-50px;width:180px;height:180px;border-radius:50%;background:rgba(255,255,255,0.08)"></div>
  <div style="position:absolute;bottom:-60px;left:-40px;width:160px;height:160px;border-radius:50%;background:rgba(255,255,255,0.06)"></div>
  <div style="position:relative;display:inline-block;width:78px;height:78px;border-radius:50%;background:rgba(255,255,255,0.25);line-height:78px;font-size:34px;margin:0 auto 28px">${emoji}</div>
  <p style="position:relative;font-size:12px;letter-spacing:3px;color:rgba(255,255,255,0.95);margin:0 0 22px;font-weight:600;text-transform:uppercase">${topic}</p>
  <h1 style="position:relative;font-family:Georgia,'Times New Roman',serif;font-size:44px;font-weight:700;color:#fff;margin:0;line-height:1.12;letter-spacing:-1px;padding:0 12px">${hero}</h1>
</div>

<div style="background:#ecfdf5;border-radius:18px;padding:54px 32px 44px;margin-top:18px;position:relative;text-align:center">
  <div style="position:absolute;top:-26px;left:50%;transform:translateX(-50%);width:52px;height:52px;border-radius:50%;background:#fff;line-height:52px;font-size:22px;box-shadow:0 4px 14px rgba(0,0,0,0.08)">✨</div>
  <div style="max-width:480px;margin:0 auto">${fmtBody(content, "#1f2937")}</div>
  ${pillars && pillars.length ? `<div style="margin-top:24px;display:grid;gap:10px;text-align:left;max-width:480px;margin-left:auto;margin-right:auto">${pillars.map(p => `<div style="display:flex;align-items:flex-start;gap:14px;padding:14px 18px;background:#fff;border-radius:12px;border-left:3px solid #10b981"><span style="color:#10b981;font-size:18px;line-height:1;flex-shrink:0">✓</span><span style="font-size:14px;color:#374151;line-height:1.55">${p}</span></div>`).join("")}</div>` : ""}
  ${cta ? `<div style="margin-top:28px"><a href="${cta.url}" style="background:#059669;color:#fff;padding:14px 32px;border-radius:10px;text-decoration:none;font-weight:600;font-size:14px;display:inline-block">${cta.label} →</a></div>` : ""}
  <div style="margin-top:36px;padding-top:24px;border-top:1px solid rgba(5,150,105,0.15)">
    <p style="font-size:14px;color:#6b7280;margin:0">${signOff}</p>
    <p style="font-family:Georgia,'Times New Roman',serif;font-size:22px;color:#047857;margin:8px 0 0;font-weight:600">The [PracticeName] team</p>
  </div>
</div>
</td></tr></table>`;
  },

  // WELLBEING — rose → pink → lavender gradient with sparkles, serif hero, blush content panel + resources.
  wellbeing: (opts: { hero: string; topic: string; content: string; cta?: { label: string; url: string }; resources?: string[]; emoji?: string; signOff?: string }) => {
    const { hero, topic, content, cta, resources, emoji = "💗", signOff = "With care," } = opts;
    return `
<table width="100%" cellpadding="0" cellspacing="0" border="0"><tr><td>
<div style="background:linear-gradient(135deg,#fda4af 0%,#f9a8d4 50%,#c4b5fd 100%);padding:64px 36px 72px;text-align:center;border-radius:18px;position:relative;overflow:hidden;min-height:380px">
  ${dots()}
  <div style="position:absolute;top:18%;left:14%;font-size:16px;opacity:0.6;color:#fff">✦</div>
  <div style="position:absolute;top:36%;right:16%;font-size:12px;opacity:0.7;color:#fff">✦</div>
  <div style="position:absolute;bottom:24%;left:24%;font-size:14px;opacity:0.6;color:#fff">✦</div>
  <div style="position:absolute;bottom:18%;right:30%;font-size:10px;opacity:0.55;color:#fff">✦</div>
  <div style="position:relative;display:inline-block;width:78px;height:78px;border-radius:50%;background:rgba(255,255,255,0.32);line-height:78px;font-size:36px;margin:0 auto 28px">${emoji}</div>
  <p style="position:relative;font-size:12px;letter-spacing:3px;color:rgba(255,255,255,0.95);margin:0 0 22px;font-weight:600;text-transform:uppercase">${topic}</p>
  <h1 style="position:relative;font-family:Georgia,'Times New Roman',serif;font-size:44px;font-weight:700;color:#fff;margin:0;line-height:1.12;letter-spacing:-1px;padding:0 12px">${hero}</h1>
</div>

<div style="background:#fdf2f8;border-radius:18px;padding:54px 32px 44px;margin-top:18px;position:relative;text-align:center">
  <div style="position:absolute;top:-26px;left:50%;transform:translateX(-50%);width:52px;height:52px;border-radius:50%;background:#fff;line-height:52px;font-size:22px;box-shadow:0 4px 14px rgba(0,0,0,0.08)">💗</div>
  <div style="max-width:480px;margin:0 auto">${fmtBody(content)}</div>
  ${resources && resources.length ? `<div style="margin-top:24px;padding:22px 24px;background:#fff;border-radius:14px;border:1px dashed #f9a8d4;text-align:left;max-width:480px;margin-left:auto;margin-right:auto"><p style="font-size:11px;font-weight:700;color:#be185d;margin:0 0 12px;letter-spacing:1.5px;text-transform:uppercase;text-align:center">Support available</p><div style="display:grid;gap:10px">${resources.map(r => `<div style="display:flex;align-items:center;gap:12px;font-size:14px;color:#4b5563;line-height:1.5"><span style="color:#ec4899;font-size:14px">♥</span><span>${r}</span></div>`).join("")}</div></div>` : ""}
  ${cta ? `<div style="margin-top:28px"><a href="${cta.url}" style="background:#db2777;color:#fff;padding:14px 32px;border-radius:10px;text-decoration:none;font-weight:600;font-size:14px;display:inline-block">${cta.label} →</a></div>` : ""}
  <div style="margin-top:36px;padding-top:24px;border-top:1px solid rgba(219,39,119,0.15)">
    <p style="font-size:14px;color:#6b7280;margin:0">${signOff}</p>
    <p style="font-family:Georgia,'Times New Roman',serif;font-size:22px;color:#be185d;margin:8px 0 0;font-weight:600">The [PracticeName] team</p>
  </div>
</div>
</td></tr></table>`;
  },
};


function buildTemplates(practiceName: string): EmailTemplate[] {
  const pn = practiceName;
  return [
    { id: "1", name: "Birthday Wishes", category: "celebrations", subject: `Happy Birthday from ${pn}! 🎂`,
      body: themed.celebration({ hero: "Wishing You a Very Happy Birthday", topic: `A birthday note from ${pn}`, emoji: "🎂",
        content: `Dear <strong>[Name]</strong>,<br/><br/>The whole team would like to wish you a very happy birthday! 🎂<br/><br/>We hope your day is filled with laughter, loved ones, and a moment to look after the most important person — you.<br/><br/>Thank you for being part of our ${pn} family.` }),
      icon: "cake", status: "published", lastModified: "2026-03-28" },

    { id: "2", name: "New Year Greeting", category: "celebrations", subject: `Happy New Year from ${pn}! 🎆`,
      body: themed.celebration({ hero: "Cheers to the Year Ahead", topic: `A new year message from ${pn}`, emoji: "✨",
        content: `Dear <strong>[Name]</strong>,<br/><br/>Happy New Year! 🎊 Wishing you and your family a prosperous and healthy year ahead.<br/><br/>Thank you for being an invaluable part of <strong>${pn}</strong>. Let's make this year our best one yet — together.` }),
      icon: "star", status: "published", lastModified: "2026-03-20" },

    { id: "3", name: "Mother's Day", category: "celebrations", subject: `Happy Mother's Day from ${pn} 💐`,
      body: themed.celebration({ hero: "Celebrating the Mothers Among Us", topic: `A note for Mother's Day`, emoji: "💐",
        content: `Dear <strong>[Name]</strong>,<br/><br/>Happy Mother's Day! 💐<br/><br/>We celebrate all the incredible mothers in our team who balance so much with grace and strength. Thank you for everything you do — both at work and at home.` }),
      icon: "flower", status: "published", lastModified: "2026-03-15" },

    { id: "4", name: "Father's Day", category: "celebrations", subject: `Happy Father's Day from ${pn} 👔`,
      body: themed.celebration({ hero: "Here's to All the Wonderful Dads", topic: `A note for Father's Day`, emoji: "👔",
        content: `Dear <strong>[Name]</strong>,<br/><br/>Happy Father's Day! 👨‍👧‍👦<br/><br/>We appreciate all the dedicated fathers in our team who inspire us every day. Enjoy your day — you've earned it.` }),
      icon: "award", status: "published", lastModified: "2026-03-15" },

    { id: "5", name: "Anzac Day", category: "celebrations", subject: `Anzac Day – Lest We Forget | ${pn}`,
      body: themed.celebration({ hero: "Lest We Forget", topic: `Honouring Anzac Day`, emoji: "🌺", signOff: "With deepest respect,",
        content: `Dear <strong>[Name]</strong>,<br/><br/>On this Anzac Day, we pause to honour the courage, sacrifice and mateship of all who have served and continue to serve our nation.<br/><br/><em>"They shall grow not old, as we that are left grow old."</em><br/><br/><strong>Lest we forget.</strong>` }),
      icon: "award", status: "published", lastModified: "2026-03-10" },

    { id: "6", name: "Christmas Greeting", category: "celebrations", subject: `Merry Christmas from ${pn}! 🎄`,
      body: themed.celebration({ hero: "Merry Christmas to You and Yours", topic: `A festive note from ${pn}`, emoji: "🎄",
        content: `Dear <strong>[Name]</strong>,<br/><br/>Merry Christmas! 🎄✨<br/><br/>Wishing you a joyful holiday season filled with warmth, laughter and quality time with loved ones. Thank you for a wonderful year at <strong>${pn}</strong>.` }),
      icon: "tree", status: "published", lastModified: "2026-03-05" },

    { id: "7", name: "Religious Celebrations", category: "celebrations", subject: `Warm Wishes from ${pn}`,
      body: themed.celebration({ hero: "Sending You Our Warmest Wishes", topic: `A note from ${pn}`, emoji: "🌟",
        content: `Dear <strong>[Name]</strong>,<br/><br/>Wishing you a blessed and joyful <strong>[Celebration Name]</strong>.<br/><br/>May this special time bring you peace, happiness and togetherness with family and friends.` }),
      icon: "star", status: "draft", lastModified: "2026-03-01" },

    { id: "8", name: "Thank You Card", category: "celebrations", subject: `Thank You from ${pn} 💚`,
      body: themed.celebration({ hero: "Thank You — Truly", topic: `A note of appreciation`, emoji: "💚",
        content: `Dear <strong>[Name]</strong>,<br/><br/>We wanted to take a moment to say <strong>thank you</strong> for your outstanding contribution. 💚<br/><br/>Your dedication, hard work and positive attitude make <strong>${pn}</strong> a better place for everyone.` }),
      icon: "gift", status: "published", lastModified: "2026-02-28" },

    { id: "9", name: "Staff Satisfaction Survey", category: "surveys", subject: `Your Voice Matters – ${pn} Survey`,
      body: themed.survey({ hero: "Your Voice Shapes Our Workplace", topic: `Annual staff survey`, emoji: "📋",
        content: `Dear <strong>[Name]</strong>,<br/><br/>We value your feedback. Please take a few minutes to complete our annual staff satisfaction survey.<br/><br/>Your honest responses help us create a better workplace for everyone at <strong>${pn}</strong>.`,
        cta: { label: "Take the Survey", url: "[Survey Link]" } }),
      icon: "clipboard", status: "published", lastModified: "2026-03-25" },

    { id: "10", name: "Patient Experience Survey", category: "surveys", subject: `Help Us Improve – ${pn} Feedback`,
      body: themed.survey({ hero: "How Was Your Visit?", topic: `Patient experience survey`, emoji: "💬",
        content: `Dear <strong>[Name]</strong>,<br/><br/>We'd love to hear about your recent experience at <strong>${pn}</strong>.<br/><br/>Your feedback helps us provide even better care for you and your family.`,
        cta: { label: "Share Your Feedback", url: "[Survey Link]" } }),
      icon: "clipboard", status: "published", lastModified: "2026-03-20" },

    { id: "11", name: "Training Feedback Survey", category: "surveys", subject: `Training Feedback – ${pn}`,
      body: themed.survey({ hero: "Tell Us About the Training", topic: `Training feedback`, emoji: "🎓",
        content: `Dear <strong>[Name]</strong>,<br/><br/>Thank you for attending <strong>[Training Name]</strong>.<br/><br/>Your feedback helps us improve future training sessions for the whole team.`,
        cta: { label: "Give Feedback", url: "[Survey Link]" } }),
      icon: "clipboard", status: "draft", lastModified: "2026-03-15" },

    { id: "12", name: "Welcome to the Team", category: "onboarding", subject: `Welcome to ${pn}! 🎉`,
      body: themed.onboarding({ hero: "Welcome to the Team", topic: `A warm welcome from ${pn}`, emoji: "🎉",
        content: `Dear <strong>[Name]</strong>,<br/><br/>Welcome to the <strong>${pn}</strong> family! We're absolutely thrilled to have you join our team.<br/><br/>Here's everything you need for day one:`,
        pillars: [
          "First day: <strong>[Date]</strong> at <strong>[Time]</strong>",
          "Ask for <strong>[Contact Person]</strong> on arrival",
          "Wear smart casual — uniform will be provided",
          "Bring photo ID and your bank details for payroll",
        ],
        cta: { label: "View Onboarding Pack", url: "[Onboarding Link]" } }),
      icon: "user", status: "published", lastModified: "2026-03-28" },

    { id: "13", name: "First Week Check-in", category: "onboarding", subject: `How's Your First Week? – ${pn}`,
      body: themed.onboarding({ hero: "How's Your First Week Going?", topic: `Settling in at ${pn}`, emoji: "👋",
        content: `Dear <strong>[Name]</strong>,<br/><br/>We hope your first week at <strong>${pn}</strong> has been wonderful! We'd love to check in and see how you're settling in.<br/><br/>Remember, your team is here to support you — don't hesitate to reach out.`,
        pillars: [
          "Book a 1:1 with your manager any time",
          "Buddy contact: <strong>[Buddy Name]</strong>",
          "Find shift info and policies in the staff portal",
        ] }),
      icon: "user", status: "published", lastModified: "2026-03-20" },

    { id: "14", name: "Probation Completion", category: "onboarding", subject: `Congratulations! – ${pn}`,
      body: themed.onboarding({ hero: "Congratulations on Passing Probation", topic: `A milestone at ${pn}`, emoji: "🎊",
        content: `Dear <strong>[Name]</strong>,<br/><br/>🎊 <strong>Congratulations</strong> on successfully completing your probation period!<br/><br/>We're delighted to confirm your ongoing role at <strong>${pn}</strong>. Your contributions have been outstanding and we look forward to your continued growth with us.` }),
      icon: "user", status: "published", lastModified: "2026-03-10" },

    { id: "15", name: "Wellbeing Check-in", category: "wellbeing", subject: `How Are You Going? – ${pn}`,
      body: themed.wellbeing({ hero: "How Are You, Really?", topic: `A wellbeing check-in`, emoji: "💗",
        content: `Dear <strong>[Name]</strong>,<br/><br/>At <strong>${pn}</strong>, your wellbeing is our priority.<br/><br/>We'd like to check in and see how you're doing — at work and outside of it.`,
        resources: [
          "EAP Contact: <strong>[EAP Number]</strong>",
          "Your manager is always here to listen",
          "Flexible working arrangements available",
        ] }),
      icon: "heart", status: "published", lastModified: "2026-03-25" },

    { id: "16", name: "Mental Health Day Reminder", category: "wellbeing", subject: `Take Care of You | ${pn}`,
      body: themed.wellbeing({ hero: "Take a Moment for Yourself", topic: `World Mental Health Day`, emoji: "🧠",
        content: `Dear <strong>[Name]</strong>,<br/><br/>It's <strong>World Mental Health Day</strong>. At <strong>${pn}</strong>, we encourage you to prioritise your mental health — because you matter.<br/><br/>Remember: it's okay to take a break. It's okay to ask for help. And it's okay to not be okay.`,
        resources: [
          "Lifeline: <strong>13 11 14</strong> (24/7)",
          "Beyond Blue: <strong>1300 22 4636</strong>",
          "Talk to your GP or our practice EAP",
        ] }),
      icon: "heart", status: "published", lastModified: "2026-03-15" },

    { id: "17", name: "Return to Work Support", category: "wellbeing", subject: `Welcome Back – ${pn}`,
      body: themed.wellbeing({ hero: "Welcome Back — We're Glad You're Here", topic: `Return to work support`, emoji: "🌷",
        content: `Dear <strong>[Name]</strong>,<br/><br/>Welcome back! We're so glad to have you returning to the <strong>${pn}</strong> team.<br/><br/>We understand transitions can take time. Please let us know if there's anything we can do to support you.`,
        resources: [
          "Adjusted hours or phased return",
          "Quiet workspace if needed",
          "A coffee chat with your manager any time",
        ] }),
      icon: "heart", status: "draft", lastModified: "2026-03-05" },
  ];
}

const EmailTemplates = () => {
  const { organization, currentSite } = useOrgSite();
  const practiceName = organization.name;
  const practiceAddress = currentSite.address || "";
  const practicePhone = currentSite.phone || "";
  const practiceEmail = currentSite.email || "";

  const initialTemplates = useMemo(() => buildTemplates(practiceName), [practiceName]);
  const [templates, setTemplates] = useState<EmailTemplate[]>(initialTemplates);
  const [search, setSearch] = useState("");
  const [activeTab, setActiveTab] = useState("all");
  const [previewOpen, setPreviewOpen] = useState(false);
  const [editOpen, setEditOpen] = useState(false);
  const [createOpen, setCreateOpen] = useState(false);
  const [selectedTemplate, setSelectedTemplate] = useState<EmailTemplate | null>(null);
  const [editForm, setEditForm] = useState({ name: "", subject: "", body: "", category: "celebrations" as EmailTemplate["category"], status: "draft" as "published" | "draft" });

  const filteredTemplates = templates.filter((t) => {
    const matchesSearch = t.name.toLowerCase().includes(search.toLowerCase()) || t.subject.toLowerCase().includes(search.toLowerCase());
    const matchesTab = activeTab === "all" || t.category === activeTab;
    return matchesSearch && matchesTab;
  });

  const categoryCounts = {
    all: templates.length,
    celebrations: templates.filter(t => t.category === "celebrations").length,
    surveys: templates.filter(t => t.category === "surveys").length,
    onboarding: templates.filter(t => t.category === "onboarding").length,
    wellbeing: templates.filter(t => t.category === "wellbeing").length,
  };

  const handlePreview = (template: EmailTemplate) => {
    setSelectedTemplate(template);
    setPreviewOpen(true);
  };

  const handleEdit = (template: EmailTemplate) => {
    setSelectedTemplate(template);
    setEditForm({ name: template.name, subject: template.subject, body: template.body, category: template.category, status: template.status });
    setEditOpen(true);
  };

  const handleSaveEdit = () => {
    if (!selectedTemplate) return;
    setTemplates((prev) => prev.map((t) => t.id === selectedTemplate.id ? { ...t, ...editForm, lastModified: new Date().toISOString().split("T")[0] } : t));
    setEditOpen(false);
    toast.success("Template updated successfully");
  };

  const handleCreate = () => {
    setEditForm({ name: "", subject: "", body: "", category: "celebrations", status: "draft" });
    setCreateOpen(true);
  };

  const handleSaveCreate = () => {
    if (!editForm.name || !editForm.subject) { toast.error("Name and subject are required"); return; }
    const newTemplate: EmailTemplate = {
      id: Date.now().toString(),
      name: editForm.name,
      category: editForm.category,
      subject: editForm.subject,
      body: editForm.body,
      icon: editForm.category === "celebrations" ? "star" : editForm.category === "surveys" ? "clipboard" : editForm.category === "onboarding" ? "user" : "heart",
      status: editForm.status,
      lastModified: new Date().toISOString().split("T")[0],
    };
    setTemplates((prev) => [...prev, newTemplate]);
    setCreateOpen(false);
    toast.success("Template created successfully");
  };

  const handleDelete = (id: string) => {
    setTemplates((prev) => prev.filter((t) => t.id !== id));
    toast.success("Template deleted");
  };

  const handleDuplicate = (template: EmailTemplate) => {
    const dup: EmailTemplate = { ...template, id: Date.now().toString(), name: `${template.name} (Copy)`, status: "draft", lastModified: new Date().toISOString().split("T")[0] };
    setTemplates((prev) => [...prev, dup]);
    toast.success("Template duplicated");
  };

  const handleToggleStatus = (id: string) => {
    setTemplates((prev) => prev.map((t) => t.id === id ? { ...t, status: t.status === "published" ? "draft" : "published" } : t));
    toast.success("Status updated");
  };

  const renderEmailPreview = (template: EmailTemplate) => {
    // Substitute live placeholders into the themed HTML body
    const htmlBody = template.body.replace(/\[PracticeName\]/g, practiceName);
    return (
      <div className="rounded-xl overflow-hidden shadow-lg border border-border/30" style={{ backgroundColor: "#f3f4f6", fontFamily: APP_FONTS.heading }}>
        {/* Practicare branded header */}
        <div style={{ background: APP_COLORS.primary, padding: "14px 24px", display: "flex", alignItems: "center", justifyContent: "space-between" }}>
          <img src={APP_LOGOS.full} alt={APP_BRAND.name} style={{ height: 24, objectFit: "contain", filter: "brightness(0) invert(1)" }} />
          <div style={{ display: "flex", alignItems: "center", gap: 12, fontSize: 11, color: "rgba(255,255,255,0.75)" }}>
            {practicePhone && <span>📞 {practicePhone}</span>}
            {practiceEmail && <span>✉ {practiceEmail}</span>}
          </div>
        </div>

        {/* Subject line strip */}
        <div style={{ padding: "10px 24px", backgroundColor: "#ffffff", borderBottom: "1px solid #e8ecef" }}>
          <div style={{ display: "flex", alignItems: "center", gap: 8, fontSize: 12, color: "#6b7280" }}>
            <Mail className="h-3.5 w-3.5 text-muted-foreground" />
            <span style={{ fontWeight: 600 }}>Subject:</span>
            <span style={{ color: "#1a1a1a", fontWeight: 500 }}>{template.subject}</span>
          </div>
        </div>

        {/* Themed body */}
        <div style={{ padding: "20px 18px 28px", backgroundColor: "#f3f4f6" }}>
          <div dangerouslySetInnerHTML={{ __html: htmlBody }} />
        </div>
        
        {/* Practicare branded footer */}
        <div style={{ padding: "20px 32px", backgroundColor: APP_COLORS.primary }}>
          <div style={{ textAlign: "center", marginBottom: 8 }}>
            <img src={APP_LOGOS.icon} alt={APP_BRAND.name} style={{ height: 24, objectFit: "contain", filter: "brightness(0) invert(1)", margin: "0 auto" }} />
          </div>
          <p style={{ fontSize: 13, color: "rgba(255,255,255,0.9)", textAlign: "center", margin: 0, fontWeight: 600 }}>
            {practiceName}
          </p>
          {practiceAddress && (
            <p style={{ fontSize: 11, color: "rgba(255,255,255,0.6)", textAlign: "center", margin: "4px 0 0" }}>
              {practiceAddress}
            </p>
          )}
          <p style={{ fontSize: 10, color: "rgba(255,255,255,0.45)", textAlign: "center", margin: "8px 0 0" }}>
            {brandCopyright()}
          </p>
          <p style={{ fontSize: 10, color: "rgba(255,255,255,0.35)", textAlign: "center", margin: "4px 0 0" }}>
            {POWERED_BY}
          </p>
        </div>
      </div>
    );
  };

  const TemplateCard = ({ template, index }: { template: EmailTemplate; index: number }) => {
    const Icon = getTemplateIcon(template.icon);
    const catConfig = categoryConfig[template.category];
    return (
      <motion.div
        initial={{ opacity: 0, y: 12 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.3, delay: index * 0.04 }}
      >
        <Card className={`group relative overflow-hidden hover:shadow-lg transition-all duration-300 border ${catConfig.border}/40 hover:${catConfig.border}`}>
          <div className={`absolute top-0 left-0 right-0 h-1 bg-gradient-to-r ${catConfig.gradient} opacity-60 group-hover:opacity-100 transition-opacity`} />
          <CardContent className="p-4 pt-5">
            <div className="flex items-start gap-3">
              <div className={`p-2.5 rounded-xl ${catConfig.bg} ${catConfig.text} shrink-0 ring-1 ring-inset ring-current/10`}>
                <Icon className="h-4.5 w-4.5" />
              </div>
              <div className="flex-1 min-w-0">
                <div className="flex items-center gap-2 mb-1">
                  <h4 className="font-semibold text-[13px] text-foreground truncate">{template.name}</h4>
                  <Badge
                    variant={template.status === "published" ? "default" : "secondary"}
                    className={`text-[10px] px-1.5 py-0 shrink-0 ${
                      template.status === "published"
                        ? "bg-emerald-100 text-emerald-700 border-emerald-200 hover:bg-emerald-100"
                        : "bg-muted text-muted-foreground"
                    }`}
                  >
                    {template.status === "published" ? (
                      <span className="flex items-center gap-0.5"><CheckCircle2 className="h-2.5 w-2.5" /> Live</span>
                    ) : (
                      <span className="flex items-center gap-0.5"><FileEdit className="h-2.5 w-2.5" /> Draft</span>
                    )}
                  </Badge>
                </div>
                <p className="text-xs text-muted-foreground truncate leading-relaxed">{template.subject}</p>
                <div className="flex items-center gap-1.5 mt-1.5">
                  <Calendar className="h-3 w-3 text-muted-foreground/50" />
                  <span className="text-[10px] text-muted-foreground/60">{template.lastModified}</span>
                </div>
              </div>
            </div>
            <div className="flex items-center gap-0.5 mt-3 pt-3 border-t border-border/30">
              <Tooltip>
                <TooltipTrigger asChild>
                  <Button variant="ghost" size="sm" className="h-8 w-8 p-0 rounded-lg hover:bg-primary/10 hover:text-primary" onClick={() => handlePreview(template)}>
                    <Eye className="h-3.5 w-3.5" />
                  </Button>
                </TooltipTrigger>
                <TooltipContent side="bottom" className="text-xs">Preview</TooltipContent>
              </Tooltip>
              <Tooltip>
                <TooltipTrigger asChild>
                  <Button variant="ghost" size="sm" className="h-8 w-8 p-0 rounded-lg hover:bg-primary/10 hover:text-primary" onClick={() => handleEdit(template)}>
                    <Edit className="h-3.5 w-3.5" />
                  </Button>
                </TooltipTrigger>
                <TooltipContent side="bottom" className="text-xs">Edit</TooltipContent>
              </Tooltip>
              <Tooltip>
                <TooltipTrigger asChild>
                  <Button variant="ghost" size="sm" className="h-8 w-8 p-0 rounded-lg hover:bg-primary/10 hover:text-primary" onClick={() => handleDuplicate(template)}>
                    <Copy className="h-3.5 w-3.5" />
                  </Button>
                </TooltipTrigger>
                <TooltipContent side="bottom" className="text-xs">Duplicate</TooltipContent>
              </Tooltip>
              <Tooltip>
                <TooltipTrigger asChild>
                  <Button variant="ghost" size="sm" className="h-8 w-8 p-0 rounded-lg hover:bg-primary/10 hover:text-primary" onClick={() => handleToggleStatus(template.id)}>
                    <Send className="h-3.5 w-3.5" />
                  </Button>
                </TooltipTrigger>
                <TooltipContent side="bottom" className="text-xs">{template.status === "published" ? "Unpublish" : "Publish"}</TooltipContent>
              </Tooltip>
              <div className="flex-1" />
              <Tooltip>
                <TooltipTrigger asChild>
                  <Button variant="ghost" size="sm" className="h-8 w-8 p-0 rounded-lg hover:bg-destructive/10 hover:text-destructive" onClick={() => handleDelete(template.id)}>
                    <Trash2 className="h-3.5 w-3.5" />
                  </Button>
                </TooltipTrigger>
                <TooltipContent side="bottom" className="text-xs">Delete</TooltipContent>
              </Tooltip>
            </div>
          </CardContent>
        </Card>
      </motion.div>
    );
  };

  const formDialog = (open: boolean, setOpen: (v: boolean) => void, title: string, onSave: () => void) => (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogContent className="max-w-lg">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <div className="p-1.5 rounded-lg bg-primary/10">
              <Mail className="h-4 w-4 text-primary" />
            </div>
            {title}
          </DialogTitle>
          <DialogDescription>Configure your email template details below.</DialogDescription>
        </DialogHeader>
        <div className="space-y-4">
          <div>
            <label className="text-xs font-medium text-muted-foreground mb-1.5 block">Template Name</label>
            <Input placeholder="e.g. Birthday Wishes" value={editForm.name} onChange={(e) => setEditForm((f) => ({ ...f, name: e.target.value }))} />
          </div>
          <div>
            <label className="text-xs font-medium text-muted-foreground mb-1.5 block">Subject Line</label>
            <Input placeholder={`e.g. Happy Birthday from ${practiceName}!`} value={editForm.subject} onChange={(e) => setEditForm((f) => ({ ...f, subject: e.target.value }))} />
          </div>
          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="text-xs font-medium text-muted-foreground mb-1.5 block">Category</label>
              <Select value={editForm.category} onValueChange={(v) => setEditForm((f) => ({ ...f, category: v as EmailTemplate["category"] }))}>
                <SelectTrigger><SelectValue /></SelectTrigger>
                <SelectContent>
                  {Object.entries(categoryConfig).map(([key, cfg]) => (
                    <SelectItem key={key} value={key}>
                      <span className="flex items-center gap-2">
                        <cfg.icon className={`h-3.5 w-3.5 ${cfg.text}`} />
                        {cfg.label}
                      </span>
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            <div>
              <label className="text-xs font-medium text-muted-foreground mb-1.5 block">Status</label>
              <Select value={editForm.status} onValueChange={(v) => setEditForm((f) => ({ ...f, status: v as "published" | "draft" }))}>
                <SelectTrigger><SelectValue /></SelectTrigger>
                <SelectContent>
                  <SelectItem value="draft">Draft</SelectItem>
                  <SelectItem value="published">Published</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>
          <div>
            <label className="text-xs font-medium text-muted-foreground mb-1.5 block">Email Body</label>
            <Textarea placeholder="Write your email content here (HTML supported)..." rows={8} value={editForm.body} onChange={(e) => setEditForm((f) => ({ ...f, body: e.target.value }))} className="font-mono text-xs" />
          </div>
        </div>
        <DialogFooter className="gap-2">
          <Button variant="outline" onClick={() => setOpen(false)}>Cancel</Button>
          <Button onClick={onSave} className="gap-1.5">
            <CheckCircle2 className="h-3.5 w-3.5" /> Save Template
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );

  return (
    <AdminLayout>
      <div className="px-8 pt-8 pb-4 max-w-4xl mx-auto space-y-5">
        {/* Header */}
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
          <div>
            <div className="flex items-center gap-2.5">
              <div className="p-2 rounded-xl bg-gradient-to-br from-primary/20 to-primary/5">
                <Mail className="h-5 w-5 text-primary" />
              </div>
              <div>
                <h1 className="text-xl font-semibold tracking-tight text-foreground">Email Templates</h1>
                <p className="text-[13px] text-muted-foreground mt-0.5">Branded email templates for <strong>{practiceName}</strong></p>
              </div>
            </div>
          </div>
          <Button onClick={handleCreate} size="sm" className="gap-1.5 shadow-sm">
            <Plus className="h-3.5 w-3.5" /> New Template
          </Button>
        </div>

        {/* Category summary cards */}
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-3">
          {Object.entries(categoryConfig).map(([key, cfg]) => (
            <motion.button
              key={key}
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ duration: 0.3 }}
              onClick={() => setActiveTab(key)}
              className={`relative overflow-hidden rounded-xl border p-3.5 text-left transition-all duration-200 hover:shadow-md ${
                activeTab === key ? `${cfg.border} ${cfg.bg} shadow-sm` : "border-border/40 bg-card hover:border-border"
              }`}
            >
              <div className={`absolute top-0 right-0 w-16 h-16 bg-gradient-to-br ${cfg.gradient} opacity-5 rounded-bl-full`} />
              <div className="flex items-center gap-2.5">
                <div className={`p-1.5 rounded-lg ${cfg.bg} ${cfg.text}`}>
                  <cfg.icon className="h-3.5 w-3.5" />
                </div>
                <div>
                  <p className="text-[11px] text-muted-foreground font-medium">{cfg.label}</p>
                  <p className="text-lg font-bold text-foreground leading-tight">{categoryCounts[key as keyof typeof categoryCounts]}</p>
                </div>
              </div>
            </motion.button>
          ))}
        </div>

        {/* Search */}
        <SearchInput value={search} onChange={setSearch} placeholder="Search templates by name or subject..." />

        {/* Tabs */}
        <Tabs value={activeTab} onValueChange={setActiveTab}>
          <TabsList className="w-full sm:w-auto">
            <TabsTrigger value="all" className="gap-1">
              <Mail className="h-3 w-3" />
              All ({categoryCounts.all})
            </TabsTrigger>
            {Object.entries(categoryConfig).map(([key, cfg]) => (
              <TabsTrigger key={key} value={key} className="gap-1">
                <cfg.icon className="h-3 w-3" />
                <span className="hidden sm:inline">{cfg.label}</span>
                <span className="sm:hidden">{cfg.label.split(" ")[0]}</span>
              </TabsTrigger>
            ))}
          </TabsList>

          <TabsContent value={activeTab} className="mt-4">
            <AnimatePresence mode="wait">
              {filteredTemplates.length === 0 ? (
                <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}>
                  <Card className="p-12 text-center border-dashed">
                    <div className="p-3 rounded-2xl bg-muted/50 w-fit mx-auto mb-4">
                      <Mail className="h-8 w-8 text-muted-foreground/40" />
                    </div>
                    <p className="text-sm font-medium text-muted-foreground">No templates found</p>
                    <p className="text-xs text-muted-foreground/60 mt-1">Try adjusting your search or create a new template</p>
                  </Card>
                </motion.div>
              ) : (
                <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
                  {filteredTemplates.map((t, i) => (
                    <TemplateCard key={t.id} template={t} index={i} />
                  ))}
                </div>
              )}
            </AnimatePresence>
          </TabsContent>
        </Tabs>
      </div>

      {/* Preview Dialog */}
      <Dialog open={previewOpen} onOpenChange={setPreviewOpen}>
        <DialogContent className="max-w-2xl max-h-[88vh] overflow-y-auto p-0">
          <DialogHeader className="px-6 pt-5 pb-0">
            <DialogTitle className="flex items-center gap-2 text-base">
              <Eye className="h-4 w-4 text-primary" />
              Email Preview
            </DialogTitle>
            <DialogDescription className="text-xs">{selectedTemplate?.name}</DialogDescription>
          </DialogHeader>
          <div className="px-4 pb-4">
            {selectedTemplate && renderEmailPreview(selectedTemplate)}
          </div>
        </DialogContent>
      </Dialog>

      {/* Edit Dialog */}
      {formDialog(editOpen, setEditOpen, "Edit Template", handleSaveEdit)}

      {/* Create Dialog */}
      {formDialog(createOpen, setCreateOpen, "New Template", handleSaveCreate)}
    </AdminLayout>
  );
};

export default EmailTemplates;
