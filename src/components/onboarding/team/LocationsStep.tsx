import { useState } from "react";
import { DoorOpen, Wand2, Plus, Trash2, Loader2 } from "lucide-react";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Button } from "@/components/ui/button";
import { toast } from "sonner";
import { cn } from "@/lib/utils";
import { defaultsFor } from "@/data/onboardingDefaults";
import type { TeamOnboardingState, TeamRoom } from "@/types/onboardingTeam";

interface Props {
  state: TeamOnboardingState;
  update: (patch: Partial<TeamOnboardingState>) => void;
}

export function LocationsStep({ state, update }: Props) {
  const [aiGenerating, setAiGenerating] = useState(false);
  const [draft, setDraft] = useState({ number: "", name: "" });

  const suggested = defaultsFor(state.industry).suggestedRooms;

  const generateRooms = async () => {
    setAiGenerating(true);
    await new Promise((r) => setTimeout(r, 900));
    const existing = new Set(state.rooms.map((r) => r.name.toLowerCase()));
    const created: TeamRoom[] = suggested
      .filter((name) => !existing.has(name.toLowerCase()))
      .map((name, i) => ({
        id: crypto.randomUUID(),
        number: String(state.rooms.length + i + 1).padStart(2, "0"),
        name,
      }));
    update({ rooms: [...state.rooms, ...created] });
    setAiGenerating(false);
    toast.success(`Added ${created.length} rooms for ${state.industry}.`);
  };

  const addManual = () => {
    if (!draft.name.trim()) {
      toast.error("Give the room a name.");
      return;
    }
    update({
      rooms: [
        ...state.rooms,
        {
          id: crypto.randomUUID(),
          number: draft.number.trim() || String(state.rooms.length + 1).padStart(2, "0"),
          name: draft.name.trim(),
        },
      ],
    });
    setDraft({ number: "", name: "" });
  };

  const updateRoom = (id: string, patch: Partial<TeamRoom>) =>
    update({ rooms: state.rooms.map((r) => (r.id === id ? { ...r, ...patch } : r)) });

  const removeRoom = (id: string) => update({ rooms: state.rooms.filter((r) => r.id !== id) });

  return (
    <div className="p-6 md:p-8 space-y-6">
      <div className="flex items-start gap-4">
        <div className="w-11 h-11 rounded-lg bg-primary/10 text-primary flex items-center justify-center shrink-0">
          <DoorOpen className="w-5 h-5" />
        </div>
        <div>
          <h2 className="text-xl font-semibold tracking-tight">Locations & rooms</h2>
          <p className="text-sm text-muted-foreground mt-0.5">
            Rooms unlock inventory allocation and room-specific checklists.
          </p>
        </div>
      </div>

      <div className="rounded-lg border bg-muted/30 p-4 flex flex-col sm:flex-row sm:items-center gap-3">
        <div className="flex-1">
          <div className="text-sm font-medium flex items-center gap-2">
            <Wand2 className="w-4 h-4 text-primary" /> Generate rooms for{" "}
            {state.industry ?? "your practice"}
          </div>
          <p className="text-xs text-muted-foreground mt-0.5">
            Suggested: {suggested.slice(0, 4).join(", ")}…
          </p>
        </div>
        <Button
          type="button"
          onClick={generateRooms}
          disabled={aiGenerating}
          className="h-9 shrink-0"
        >
          {aiGenerating ? (
            <>
              <Loader2 className="w-4 h-4 mr-1.5 animate-spin" /> Generating…
            </>
          ) : (
            <>
              <Wand2 className="w-4 h-4 mr-1.5" /> Generate rooms
            </>
          )}
        </Button>
      </div>

      {/* Manual add draft row */}
      <div className="rounded-lg border bg-card overflow-hidden">
        <div className="px-4 py-3 border-b bg-muted/30 flex items-center justify-between">
          <span className="text-sm font-medium">Your rooms</span>
          <span className="text-xs text-muted-foreground">
            {state.rooms.length} room{state.rooms.length === 1 ? "" : "s"}
          </span>
        </div>
        <div className="p-3 space-y-2">
          <div className="flex gap-2">
            <Input
              placeholder="No."
              value={draft.number}
              onChange={(e) => setDraft({ ...draft, number: e.target.value })}
              className="w-16 h-9"
            />
            <Input
              placeholder="Room name (e.g. Consulting Room 1)"
              value={draft.name}
              onChange={(e) => setDraft({ ...draft, name: e.target.value })}
              className="h-9 flex-1"
              onKeyDown={(e) => e.key === "Enter" && addManual()}
            />
            <Button type="button" size="sm" className="h-9 shrink-0" onClick={addManual}>
              <Plus className="w-4 h-4 mr-1" /> Add
            </Button>
          </div>

          {state.rooms.map((room) => (
            <div
              key={room.id}
              className={cn(
                "flex items-center gap-2 rounded-lg border bg-background px-3 py-2"
              )}
            >
              <Input
                value={room.number}
                onChange={(e) => updateRoom(room.id, { number: e.target.value })}
                className="w-14 h-8 text-center text-sm"
                aria-label="Room number"
              />
              <Input
                value={room.name}
                onChange={(e) => updateRoom(room.id, { name: e.target.value })}
                className="h-8 flex-1 text-sm"
                aria-label="Room name"
              />
              <Button
                type="button"
                variant="ghost"
                size="icon"
                className="h-8 w-8 shrink-0 text-muted-foreground"
                onClick={() => removeRoom(room.id)}
                aria-label={`Delete ${room.name}`}
              >
                <Trash2 className="w-4 h-4" />
              </Button>
            </div>
          ))}

          {state.rooms.length === 0 && (
            <p className="text-xs text-muted-foreground text-center py-3">
              No rooms yet — generate them above or add manually.
            </p>
          )}
        </div>
      </div>

      <div className="rounded-lg bg-primary/5 border border-primary/20 px-4 py-3 text-xs text-muted-foreground">
        <Label className="text-xs text-primary mb-1 block">Tip</Label>
        Add a Sterilisation room if you reprocess instruments — it unlocks sterilisation log
        checklists.
      </div>
    </div>
  );
}
