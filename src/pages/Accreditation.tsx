import { useState } from "react";
import { AdminLayout } from "@/components/layout/AdminLayout";
import { MobileHeader } from "@/components/layout/MobileHeader";
import { PageHeader } from "@/components/layout/PageHeader";
import { PageIntro } from "@/components/layout/PageIntro";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { AnimatedPage } from "@/components/layout/AnimatedPage";
import { mockProjects, STAGE_LABELS } from "@/data/mockAccreditation";
import { useNavigate } from "react-router-dom";
import {
  Shield, Sparkles, Plus, Library, FolderKanban, FileBarChart,
  PlayCircle, GraduationCap, Calendar, ArrowRight,
} from "lucide-react";
import { FloatingAIButton, AIAssistantSheet } from "@/components/accreditation/AIAssistantSheet";
import { cn } from "@/lib/utils";

const statusTone: Record<string, string> = {
  "draft": "bg-muted text-muted-foreground",
  "in-progress": "bg-primary/10 text-primary",
  "review": "bg-amber-500/10 text-amber-600",
  "ready": "bg-emerald-500/10 text-emerald-600",
};

export default function Accreditation() {
  const navigate = useNavigate();
  const [aiOpen, setAiOpen] = useState(false);

  return (
    <AdminLayout>
      <MobileHeader title="Accreditation" subtitle="AI-assisted accreditation prep" />
      <PageHeader
        title="Accreditation Intelligence"
        subtitle="Prepare, manage and maintain accreditation with AI assistance"
        icon={Shield}
        actions={
          <>
            <Button variant="outline" size="sm" onClick={() => navigate("/accreditation/library")}>
              <Library className="w-4 h-4 mr-1.5" /> Library
            </Button>
            <Button variant="outline" size="sm" onClick={() => navigate("/accreditation/reports")}>
              <FileBarChart className="w-4 h-4 mr-1.5" /> Reports
            </Button>
            <Button size="sm">
              <Plus className="w-4 h-4 mr-1.5" /> New Accreditation
            </Button>
          </>
        }
      />

      <AnimatedPage>
        <div className="max-w-4xl mx-auto px-4 md:px-8 py-6 space-y-6 pb-24">
          <PageIntro
            highlight="Accreditation, minus the last-minute panic."
            description="Plan every stage of your accreditation with AI-guided prep, evidence libraries and progress tracking — stay ready long before your surveyor arrives."
          />
          {/* Welcome card */}
          <div className="rounded-lg border border-primary/30 bg-gradient-to-br from-primary/10 via-primary/5 to-transparent p-5 md:p-6">
            <div className="flex items-start gap-4">
              <div className="w-12 h-12 rounded-xl bg-primary/15 flex items-center justify-center shrink-0">
                <Sparkles className="w-6 h-6 text-primary" />
              </div>
              <div className="flex-1 min-w-0">
                <div className="flex items-center gap-2 flex-wrap">
                  <h3 className="text-base md:text-lg font-semibold">AI Accreditation Assistant</h3>
                  <Badge className="bg-primary/15 text-primary hover:bg-primary/15 border-0">NEW</Badge>
                </div>
                <p className="text-[13px] text-muted-foreground mt-1 leading-relaxed">
                  Upload your standards, let AI extract requirements, run a readiness assessment,
                  auto-generate gap tasks and evidence prompts, and be surveyor-ready in weeks — not months.
                </p>
                <div className="flex flex-wrap gap-2 mt-4">
                  <Button size="sm" onClick={() => setAiOpen(true)}>
                    <Sparkles className="w-4 h-4 mr-1.5" /> Start with AI
                  </Button>
                  <Button variant="outline" size="sm">
                    <PlayCircle className="w-4 h-4 mr-1.5" /> Watch Overview
                  </Button>
                  <Button variant="outline" size="sm">
                    <GraduationCap className="w-4 h-4 mr-1.5" /> Training
                  </Button>
                </div>
              </div>
            </div>
          </div>

          {/* Projects grid */}
          <div>
            <div className="flex items-center justify-between mb-3">
              <h2 className="text-sm font-semibold flex items-center gap-2">
                <FolderKanban className="w-4 h-4 text-primary" /> Your Accreditation Projects
              </h2>
              <span className="text-[11px] text-muted-foreground">{mockProjects.length} projects</span>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
              {mockProjects.map((p) => (
                <Card
                  key={p.id}
                  className="cursor-pointer border-border/60 hover:shadow-md hover:border-primary/40 transition-all"
                  onClick={() => navigate(`/accreditation/${p.id}`)}
                >
                  <CardContent className="p-4">
                    <div className="flex items-start justify-between gap-2">
                      <div className="min-w-0">
                        <p className="text-[11px] text-muted-foreground uppercase tracking-wider">{p.standard}</p>
                        <h3 className="text-[15px] font-semibold leading-tight mt-0.5 truncate">{p.name}</h3>
                      </div>
                      <span className={cn("text-[10px] px-2 py-0.5 rounded-full font-semibold uppercase tracking-wider", statusTone[p.status])}>
                        {p.status.replace("-", " ")}
                      </span>
                    </div>

                    <div className="mt-4">
                      <div className="flex items-center justify-between text-[11px] mb-1">
                        <span className="text-muted-foreground">Readiness</span>
                        <span className="font-semibold tabular-nums">{p.readiness}%</span>
                      </div>
                      <div className="h-1.5 rounded-full bg-muted overflow-hidden">
                        <div className="h-full bg-primary" style={{ width: `${p.readiness}%` }} />
                      </div>
                    </div>

                    <div className="flex items-center justify-between mt-4 pt-3 border-t border-border/60">
                      <div className="flex items-center gap-2">
                        <div className="w-6 h-6 rounded-full bg-primary/15 text-primary flex items-center justify-center text-[10px] font-semibold">
                          {p.ownerInitials}
                        </div>
                        <span className="text-[11px] text-muted-foreground truncate">{p.ownerName}</span>
                      </div>
                      <div className="flex items-center gap-1 text-[11px] text-muted-foreground">
                        <Calendar className="w-3 h-3" />
                        {new Date(p.auditDate).toLocaleDateString("en-AU", { day: "numeric", month: "short", year: "numeric" })}
                      </div>
                    </div>

                    <div className="mt-3 flex items-center justify-between">
                      <span className="text-[10px] px-2 py-0.5 rounded-md bg-muted text-muted-foreground font-medium">
                        Stage: {STAGE_LABELS[p.stage]}
                      </span>
                      <ArrowRight className="w-4 h-4 text-muted-foreground" />
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          </div>
        </div>

        <FloatingAIButton onClick={() => setAiOpen(true)} />
        <AIAssistantSheet open={aiOpen} onOpenChange={setAiOpen} />
      </AnimatedPage>
    </AdminLayout>
  );
}
