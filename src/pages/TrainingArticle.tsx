import { ComponentType, ReactNode } from "react";
import { useNavigate, useParams, useLocation, Link } from "react-router-dom";
import { AdminLayout } from "@/components/layout/AdminLayout";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { ArrowLeft, Play, BookOpen } from "lucide-react";
import { getTrainingArticle } from "@/data/trainingArticles";

interface BackState {
  from?: string;
  fromLabel?: string;
}

export default function TrainingArticle({
  Layout = AdminLayout,
}: {
  Layout?: ComponentType<{ children: ReactNode }>;
}) {
  const { articleId = "" } = useParams();
  const navigate = useNavigate();
  const location = useLocation();
  const state = (location.state ?? {}) as BackState;
  const topic = getTrainingArticle(articleId);

  const handleBack = () => {
    if (state.from) {
      navigate(state.from);
    } else {
      navigate(-1);
    }
  };

  const instructions = topic
    ? topic.steps
        .map((s) => `${s.step}. ${s.title}\n${s.description}`)
        .join("\n\n")
    : "";

  return (
    <Layout>
      <div className="max-w-4xl mx-auto px-8 py-6 space-y-6">
        <div className="flex items-center justify-between gap-3">
          <Button variant="ghost" size="sm" onClick={handleBack} className="gap-1.5 -ml-2">
            <ArrowLeft className="w-4 h-4" />
            Back{state.fromLabel ? ` to ${state.fromLabel}` : ""}
          </Button>
          <Button asChild variant="outline" size="sm" className="gap-1.5">
            <Link to="/training">
              <BookOpen className="w-3.5 h-3.5" />
              Training Centre
            </Link>
          </Button>
        </div>

        {!topic ? (
          <div className="text-center py-20 text-muted-foreground">
            <p className="text-sm">This training article could not be found.</p>
          </div>
        ) : (
          <article className="space-y-6">
            <header className="space-y-2">
              <div className="flex items-center gap-2">
                <Badge variant="secondary" className="text-[10px] uppercase">Training</Badge>
                {topic.videoDuration && (
                  <Badge variant="outline" className="text-[10px]">{topic.videoDuration}</Badge>
                )}
              </div>
              <h1 className="text-2xl font-semibold tracking-tight">{topic.title}</h1>
              <p className="text-[14px] text-muted-foreground">{topic.summary}</p>
            </header>

            <section>
              <div className="relative aspect-video rounded-lg overflow-hidden bg-muted border border-border flex items-center justify-center group cursor-pointer">
                <div className="absolute inset-0 bg-gradient-to-br from-primary/10 to-transparent" />
                <div className="relative w-16 h-16 rounded-full bg-primary/15 backdrop-blur flex items-center justify-center group-hover:bg-primary/25 transition-colors">
                  <Play className="w-7 h-7 text-primary ml-1" />
                </div>
                {topic.videoDuration && (
                  <div className="absolute bottom-3 right-3 bg-background/80 backdrop-blur-sm text-xs font-medium px-2 py-1 rounded">
                    {topic.videoDuration}
                  </div>
                )}
              </div>
              <p className="text-[12px] text-muted-foreground mt-2">
                Short walkthrough of {topic.title.toLowerCase()}.
              </p>
            </section>

            <section className="space-y-2">
              <h2 className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">
                Instructions
              </h2>
              <div className="rounded-lg border border-border bg-card p-4 whitespace-pre-wrap text-[13px] leading-relaxed text-foreground">
                {instructions}
              </div>
            </section>

            <div className="pt-2">
              <Button variant="outline" size="sm" onClick={handleBack} className="gap-1.5">
                <ArrowLeft className="w-4 h-4" />
                Back{state.fromLabel ? ` to ${state.fromLabel}` : ""}
              </Button>
            </div>
          </article>
        )}
      </div>
    </Layout>
  );
}
