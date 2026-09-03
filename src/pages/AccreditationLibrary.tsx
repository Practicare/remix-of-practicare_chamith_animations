import { AdminLayout } from "@/components/layout/AdminLayout";
import { MobileHeader } from "@/components/layout/MobileHeader";
import { PageHeader } from "@/components/layout/PageHeader";
import { AnimatedPage } from "@/components/layout/AnimatedPage";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Library, ArrowLeft, Plus, Shield } from "lucide-react";
import { libraryStandards } from "@/data/mockAccreditation";
import { useNavigate } from "react-router-dom";

export default function AccreditationLibrary() {
  const navigate = useNavigate();
  return (
    <AdminLayout>
      <MobileHeader title="Standards Library" />
      <PageHeader
        title="Standards Library"
        subtitle="Choose an accreditation framework to start a new project"
        icon={Library}
        actions={
          <>
            <Button variant="ghost" size="sm" onClick={() => navigate("/accreditation")}>
              <ArrowLeft className="w-4 h-4 mr-1.5" /> Back
            </Button>
            <Button size="sm"><Plus className="w-4 h-4 mr-1.5" /> Import standard</Button>
          </>
        }
      />
      <AnimatedPage>
        <div className="max-w-4xl mx-auto px-4 md:px-8 py-6">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
            {libraryStandards.map((s) => (
              <Card key={s.id} className="border-border/60 hover:shadow-md hover:border-primary/40 transition-all cursor-pointer">
                <CardContent className="p-4">
                  <div className="flex items-start gap-3">
                    <div className="w-10 h-10 rounded-lg bg-primary/10 flex items-center justify-center shrink-0">
                      <Shield className="w-5 h-5 text-primary" />
                    </div>
                    <div className="min-w-0 flex-1">
                      <div className="flex items-center gap-2 flex-wrap">
                        <h3 className="text-[14px] font-semibold">{s.name}</h3>
                        <Badge variant="outline" className="text-[10px]">{s.version}</Badge>
                      </div>
                      <p className="text-[11px] text-muted-foreground mt-0.5">{s.authority} · {s.modules} modules</p>
                    </div>
                  </div>
                  <div className="flex justify-end gap-2 mt-3">
                    <Button size="sm" variant="outline" className="h-7 text-[11px]">Preview</Button>
                    <Button size="sm" className="h-7 text-[11px]">Start project</Button>
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
