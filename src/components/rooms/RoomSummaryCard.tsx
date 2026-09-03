import { Room } from "@/types/rooms";
import { DoorOpen, Package, ChevronRight, CheckCircle, AlertTriangle, Wrench } from "lucide-react";

interface RoomSummaryCardProps {
  room: Room;
  onClick: () => void;
}

export function RoomSummaryCard({ room, onClick }: RoomSummaryCardProps) {
  const activeCount = room.instruments.filter(i => i.status === "active").length;
  const maintenanceCount = room.instruments.filter(i => i.status === "maintenance").length;
  const inactiveCount = room.instruments.filter(i => i.status === "inactive").length;

  return (
    <div
      onClick={onClick}
      className="group rounded-xl border border-border/50 bg-card p-4 hover:border-border hover:shadow-sm transition-all cursor-pointer"
    >
      {/* Header */}
      <div className="flex items-start justify-between mb-3">
        <div className="flex items-center gap-2.5">
          <div className="w-9 h-9 rounded-lg bg-primary/10 flex items-center justify-center">
            <DoorOpen className="w-4 h-4 text-primary" />
          </div>
          <div>
            <div className="flex items-center gap-1.5">
              <span className="text-[10px] font-mono text-muted-foreground">#{room.roomNumber}</span>
            </div>
            <h3 className="text-[13px] font-semibold leading-tight">{room.roomName}</h3>
            {room.description && (
              <p className="text-[11px] text-muted-foreground mt-0.5 line-clamp-1">{room.description}</p>
            )}
          </div>
        </div>
      </div>

      {/* Stats */}
      <div className="flex items-center gap-3 mb-3">
        <div className="flex items-center gap-1 text-[12px] font-medium">
          <Package className="w-3 h-3 text-muted-foreground" />
          <span>{room.instruments.length}</span>
          <span className="text-muted-foreground">items</span>
        </div>
        {maintenanceCount > 0 && (
          <div className="flex items-center gap-1 text-[11px] text-amber-600 dark:text-amber-400">
            <AlertTriangle className="w-3 h-3" />
            <span>{maintenanceCount} maintenance</span>
          </div>
        )}
        {inactiveCount > 0 && (
          <div className="flex items-center gap-1 text-[11px] text-destructive">
            <Wrench className="w-3 h-3" />
            <span>{inactiveCount} inactive</span>
          </div>
        )}
      </div>

      {/* Footer */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          {room.instruments.length > 0 ? (
            activeCount > 0 && (
              <div className="flex items-center gap-1 text-[11px] text-emerald-600 dark:text-emerald-400">
                <CheckCircle className="w-3 h-3" />
                <span>{activeCount} active</span>
              </div>
            )
          ) : (
            <span className="text-[11px] text-muted-foreground">No items yet</span>
          )}
        </div>
        <span className="flex items-center gap-1 text-[12px] font-medium text-muted-foreground group-hover:text-foreground transition-colors">
          View
          <ChevronRight className="w-3.5 h-3.5" />
        </span>
      </div>
    </div>
  );
}
