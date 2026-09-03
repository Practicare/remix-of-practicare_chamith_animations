import { AdminLayout } from "@/components/layout/AdminLayout";
import { MobileHeader } from "@/components/layout/MobileHeader";
import { PageIntro } from "@/components/layout/PageIntro";
import { IssuesPanel } from "@/components/requests/IssuesPanel";
import { AlertTriangle } from "lucide-react";

export default function Requests() {
  return (
    <AdminLayout>
      <MobileHeader title="Issues" subtitle="Track and resolve issues" />

      <div className="hidden md:block px-8 pt-8 pb-2 max-w-4xl mx-auto">
        <div className="flex items-center gap-3 mb-4">
          <div className="w-10 h-10 rounded-lg bg-primary/10 flex items-center justify-center">
            <AlertTriangle className="w-5 h-5 text-primary" />
          </div>
          <div>
            <h2 className="text-xl font-semibold">Issues</h2>
            <p className="text-[13px] text-muted-foreground">
              Report and resolve issues across departments, rooms, and stock.
            </p>
          </div>
        </div>
      </div>

      <div className="px-4 md:px-8 py-4 max-w-4xl mx-auto space-y-4">
        <PageIntro
          highlight="Nothing gets forgotten."
          description="One place to raise issues across the practice — so every problem reaches the right person and gets closed."
        />
        <IssuesPanel />
      </div>
    </AdminLayout>
  );
}
