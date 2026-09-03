import { useState } from "react";
import { APP_BRAND } from "@/config/branding";
import { AdminLayout } from "@/components/layout/AdminLayout";
import { MobileHeader } from "@/components/layout/MobileHeader";
import { PageIntro } from "@/components/layout/PageIntro";
import { ComponentType, ReactNode } from "react";

import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import {
  GraduationCap,
  Play,
  BookOpen,
  FileText,
  ExternalLink,
  Clock,
  CheckCircle2,
  Search,
} from "lucide-react";
import { Input } from "@/components/ui/input";
import { ExportDropdown } from "@/components/ui/ExportDropdown";
import { exportTrainingCSV, exportTrainingPDF } from "@/utils/moduleExports";

interface VideoItem {
  id: string;
  title: string;
  description: string;
  duration: string;
  category: string;
  watched: boolean;
}

interface GuideItem {
  id: string;
  title: string;
  description: string;
  category: string;
  type: "article" | "pdf";
}

const videos: VideoItem[] = [
  {
    id: "v1",
    title: `Getting Started with ${APP_BRAND.name}`,
    description: "A complete walkthrough of the platform — from login to your first task.",
    duration: "4:30",
    category: "Getting Started",
    watched: false,
  },
  {
    id: "v2",
    title: "Managing Your Team",
    description: "Learn how to add staff, assign roles, and configure permissions.",
    duration: "3:15",
    category: "Getting Started",
    watched: false,
  },
  {
    id: "v4",
    title: "Compliance Tracking",
    description: "Stay on top of expiring documents and compliance requirements.",
    duration: "3:45",
    category: "Features",
    watched: false,
  },
  {
    id: "v5",
    title: "Checklists & Tasks",
    description: "Build reusable checklists and assign tasks to your team.",
    duration: "4:10",
    category: "Features",
    watched: false,
  },
  {
    id: "v6",
    title: "Stock Management",
    description: "Track inventory, set reorder levels, and manage suppliers.",
    duration: "3:00",
    category: "Features",
    watched: false,
  },
];

const guides: GuideItem[] = [
  {
    id: "g1",
    title: "Quick Start Guide",
    description: "Everything you need to get your practice up and running in 15 minutes.",
    category: "Getting Started",
    type: "article",
  },
  {
    id: "g2",
    title: "Admin Permissions Reference",
    description: "A detailed breakdown of all permission levels and what they control.",
    category: "Administration",
    type: "pdf",
  },
  {
    id: "g3",
    title: "Compliance Best Practices",
    description: "Recommendations for staying audit-ready with automated tracking.",
    category: "Compliance",
    type: "article",
  },
];

const CATEGORIES = ["All", "Getting Started", "Features", "Administration", "Compliance"];

export default function Training({ Layout = AdminLayout }: { Layout?: ComponentType<{ children: ReactNode }> }) {
  const [search, setSearch] = useState("");
  const [activeCategory, setActiveCategory] = useState("All");
  const [watchedVideos, setWatchedVideos] = useState<string[]>([]);

  const filteredVideos = videos.filter((v) => {
    const matchSearch =
      v.title.toLowerCase().includes(search.toLowerCase()) ||
      v.description.toLowerCase().includes(search.toLowerCase());
    const matchCategory = activeCategory === "All" || v.category === activeCategory;
    return matchSearch && matchCategory;
  });

  const filteredGuides = guides.filter((g) => {
    const matchSearch =
      g.title.toLowerCase().includes(search.toLowerCase()) ||
      g.description.toLowerCase().includes(search.toLowerCase());
    const matchCategory = activeCategory === "All" || g.category === activeCategory;
    return matchSearch && matchCategory;
  });

  const toggleWatched = (id: string) => {
    setWatchedVideos((prev) =>
      prev.includes(id) ? prev.filter((v) => v !== id) : [...prev, id]
    );
  };

  return (
    <Layout>
      <MobileHeader
        title="Training & Resources"
        subtitle="Videos, guides, and help"
      />

      {/* Desktop Header */}
      <header className="hidden md:flex min-h-[72px] bg-card border-b border-border px-8 items-center justify-between sticky top-0 z-10">
        <div className="flex-1 min-w-0">
          <h2 className="text-xl font-semibold leading-tight">Training & Resources</h2>
          <p className="text-[13px] text-muted-foreground mt-0.5">
            Orientation videos, guides, and documentation
          </p>
        </div>
        
      </header>

      <div className="p-4 md:p-8 max-w-4xl mx-auto space-y-6">
        <PageIntro
          highlight="Level up your team without leaving the practice."
          description="Watch bite-sized videos and guides on Practicare, compliance and clinical workflows — training is always on and always ready when your staff need it."
        />
        {/* Search & Filter */}
        <div className="flex flex-col sm:flex-row gap-3">
          <div className="relative flex-1">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
            <Input
              placeholder="Search videos and guides..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="pl-10"
            />
          </div>
          <ExportDropdown
            onExportCSV={() => exportTrainingCSV(filteredVideos, filteredGuides)}
            onExportPDF={() => exportTrainingPDF(filteredVideos, filteredGuides)}
          />
        </div>

        <div className="flex gap-2 flex-wrap">
          {CATEGORIES.map((cat) => (
            <Button
              key={cat}
              variant={activeCategory === cat ? "default" : "outline"}
              size="sm"
              onClick={() => setActiveCategory(cat)}
              className="text-xs"
            >
              {cat}
            </Button>
          ))}
        </div>

        {/* Videos Section */}
        <section className="space-y-4">
          <div className="flex items-center gap-2">
            <Play className="w-5 h-5 text-primary" />
            <h3 className="text-lg font-semibold">Orientation Videos</h3>
            <Badge variant="secondary" className="text-xs">
              {filteredVideos.length}
            </Badge>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {filteredVideos.map((video) => {
              const isWatched = watchedVideos.includes(video.id);
              return (
                <div
                  key={video.id}
                  className="bg-card border border-border rounded-xl overflow-hidden hover:shadow-card transition-shadow"
                >
                  {/* Video Thumbnail Placeholder */}
                  <div className="aspect-video bg-muted flex items-center justify-center relative group cursor-pointer">
                    <div className="w-14 h-14 rounded-full bg-primary/10 flex items-center justify-center group-hover:bg-primary/20 transition-colors">
                      <Play className="w-6 h-6 text-primary ml-0.5" />
                    </div>
                    <div className="absolute bottom-2 right-2 bg-background/80 backdrop-blur-sm text-xs font-medium px-2 py-0.5 rounded">
                      {video.duration}
                    </div>
                    {isWatched && (
                      <div className="absolute top-2 right-2">
                        <Badge className="bg-success text-success-foreground text-[10px] gap-1">
                          <CheckCircle2 className="w-3 h-3" />
                          Watched
                        </Badge>
                      </div>
                    )}
                  </div>
                  <div className="p-4 space-y-2">
                    <div className="flex items-start justify-between gap-2">
                      <h4 className="text-sm font-semibold text-foreground leading-tight">
                        {video.title}
                      </h4>
                    </div>
                    <p className="text-xs text-muted-foreground line-clamp-2">
                      {video.description}
                    </p>
                    <div className="flex items-center justify-between pt-1">
                      <Badge variant="outline" className="text-[10px]">
                        {video.category}
                      </Badge>
                      <Button
                        variant="ghost"
                        size="sm"
                        className="text-xs h-7 gap-1"
                        onClick={() => toggleWatched(video.id)}
                      >
                        {isWatched ? (
                          <>
                            <CheckCircle2 className="w-3.5 h-3.5 text-success" />
                            Watched
                          </>
                        ) : (
                          <>
                            <Clock className="w-3.5 h-3.5" />
                            Mark watched
                          </>
                        )}
                      </Button>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>

          {filteredVideos.length === 0 && (
            <div className="text-center py-12 text-muted-foreground">
              <Play className="w-10 h-10 mx-auto mb-3 opacity-30" />
              <p className="text-sm">No videos match your search.</p>
            </div>
          )}
        </section>

        {/* Guides Section */}
        <section className="space-y-4">
          <div className="flex items-center gap-2">
            <BookOpen className="w-5 h-5 text-primary" />
            <h3 className="text-lg font-semibold">Help Guides</h3>
            <Badge variant="secondary" className="text-xs">
              {filteredGuides.length}
            </Badge>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
            {filteredGuides.map((guide) => (
              <div
                key={guide.id}
                className="bg-card border border-border rounded-xl p-4 hover:shadow-card transition-shadow flex items-start gap-4 cursor-pointer"
              >
                <div className="w-10 h-10 rounded-lg bg-primary/10 flex items-center justify-center shrink-0">
                  {guide.type === "pdf" ? (
                    <FileText className="w-5 h-5 text-primary" />
                  ) : (
                    <BookOpen className="w-5 h-5 text-primary" />
                  )}
                </div>
                <div className="flex-1 min-w-0 space-y-1">
                  <h4 className="text-sm font-semibold text-foreground">{guide.title}</h4>
                  <p className="text-xs text-muted-foreground line-clamp-2">
                    {guide.description}
                  </p>
                  <div className="flex items-center gap-2 pt-1">
                    <Badge variant="outline" className="text-[10px]">
                      {guide.category}
                    </Badge>
                    <Badge variant="outline" className="text-[10px] uppercase">
                      {guide.type}
                    </Badge>
                  </div>
                </div>
                <ExternalLink className="w-4 h-4 text-muted-foreground shrink-0 mt-1" />
              </div>
            ))}
          </div>

          {filteredGuides.length === 0 && (
            <div className="text-center py-12 text-muted-foreground">
              <BookOpen className="w-10 h-10 mx-auto mb-3 opacity-30" />
              <p className="text-sm">No guides match your search.</p>
            </div>
          )}
        </section>
      </div>
    </Layout>
  );
}
