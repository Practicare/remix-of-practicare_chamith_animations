import { useState } from "react";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { SegmentedControl } from "@/components/ui/segmented-control";
import { Eye, Smartphone, Tablet, Monitor } from "lucide-react";
import { Checklist } from "@/types/checklists";
import { cn } from "@/lib/utils";
import { ChecklistContent } from "./ChecklistContent";

interface ChecklistPreviewDialogProps {
  checklist: Checklist;
  categoryName?: string;
}

type DeviceView = "mobile" | "tablet" | "desktop";

export const ChecklistPreviewDialog = ({
  checklist,
  categoryName,
}: ChecklistPreviewDialogProps) => {
  const [open, setOpen] = useState(false);
  const [deviceView, setDeviceView] = useState<DeviceView>("mobile");

  const getContainerWidth = () => {
    switch (deviceView) {
      case "mobile":
        return "max-w-[375px]";
      case "tablet":
        return "max-w-[768px]";
      case "desktop":
        return "max-w-[1024px]";
    }
  };

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <Button
          variant="outline"
          size="sm"
          className="gap-1.5"
          onClick={(e) => e.stopPropagation()}
        >
          <Eye className="w-4 h-4" />
          Preview
        </Button>
      </DialogTrigger>
      <DialogContent className="max-w-4xl max-h-[90vh] overflow-hidden flex flex-col">
        <DialogHeader className="flex-shrink-0">
          <div className="flex items-center justify-between">
            <DialogTitle className="text-xl">Checklist Preview</DialogTitle>
            {/* Device Toggle */}
            <SegmentedControl
              options={[
                { id: "mobile", label: "", icon: Smartphone },
                { id: "tablet", label: "", icon: Tablet },
                { id: "desktop", label: "", icon: Monitor },
              ]}
              value={deviceView}
              onChange={(view) => setDeviceView(view as DeviceView)}
              size="sm"
            />
          </div>
        </DialogHeader>

        {/* Preview Container */}
        <div className="flex-1 overflow-auto bg-muted/30 rounded-lg p-4">
          <div
            className={cn(
              "mx-auto transition-all duration-300",
              getContainerWidth()
            )}
          >
            <ChecklistContent
              checklist={checklist}
              categoryName={categoryName}
              deviceView={deviceView}
              showSubmitButton={false}
            />
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
};