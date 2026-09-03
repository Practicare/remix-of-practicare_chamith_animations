import { AdminLayout } from "@/components/layout/AdminLayout";
import { MobileHeader } from "@/components/layout/MobileHeader";
import { PageHeader } from "@/components/layout/PageHeader";
import { AnimatedPage } from "@/components/layout/AnimatedPage";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { FileBarChart, ArrowLeft, Sparkles, Eye, Download } from "lucide-react";
import { reportTemplates } from "@/data/mockAccreditation";
import { useNavigate } from "react-router-dom";

export default function AccreditationReports() {
  const navigate = useNavigate();
  return (
    <AdminLayout>
      <MobileHeader title="Accreditation Reports" />
      <PageHeader
        title="Accreditation Reports"
        subtitle="Generate surveyor-ready reports across all projects"
        icon={FileBarChart}
        actions={
          <Button variant="ghost" size="sm" onClick={() => navigate("/accreditation")}>
            <ArrowLeft className="w-4 h-4 mr-1.5" /> Back
          </Button>
        }
      />
      <AnimatedPage>
        <div className="max-w-4xl mx-auto px-4 md:px-8 py-6">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
            {reportTemplates.map((r) => (
              <Card key={r.id} className="border-border/60">
                <CardContent className="p-4 flex items-start gap-3">
                  <div className="w-10 h-10 rounded-lg bg-primary/10 flex items-center justify-center shrink-0">
                    <FileBarChart className="w-5 h-5 text-primary" />
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="text-[13.5px] font-semibold">{r.name}</p>
                    <p className="text-[11px] text-muted-foreground mt-0.5">{r.desc} · ~{r.pages}pp</p>
                    <div className="flex gap-1.5 mt-3">
                      <Button size="sm" className="h-7 text-[11px]"><Sparkles className="w-3 h-3 mr-1" /> Generate</Button>
                      <Button size="sm" variant="outline" className="h-7 text-[11px]"><Eye className="w-3 h-3 mr-1" /> Preview</Button>
                      <Button size="sm" variant="outline" className="h-7 text-[11px]"><Download className="w-3 h-3 mr-1" /> PDF</Button>
                      <Button size="sm" variant="outline" className="h-7 text-[11px]"><Download className="w-3 h-3 mr-1" /> Word</Button>
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>
      </AnimatedPage>
    </AdminLayout>
  );
}
