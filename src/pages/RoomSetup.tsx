import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { AdminLayout } from "@/components/layout/AdminLayout";
import { MobileHeader } from "@/components/layout/MobileHeader";
import { PageHeader } from "@/components/layout/PageHeader";
import { ComponentType, ReactNode, Fragment } from "react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { DoorOpen, Plus } from "lucide-react";
import { SearchInput } from "@/components/ui/SearchInput";
import { Room } from "@/types/rooms";
import { useRooms } from "@/contexts/RoomsContext";

import { RoomSummaryCard } from "@/components/rooms/RoomSummaryCard";
import { AddRoomDialog } from "@/components/rooms/AddRoomDialog";
import { PageIntro } from "@/components/layout/PageIntro";
import { ROOMS_PRACTICE_TIP } from "@/components/rooms/roomsPracticeTip";
import { toast } from "sonner";

const RoomSetup = ({ Layout = AdminLayout, embedded = false }: { Layout?: ComponentType<{ children: ReactNode }>; embedded?: boolean }) => {
  const Wrapper = embedded ? Fragment : Layout;
  const navigate = useNavigate();
  const { rooms, addRoom } = useRooms();
  const [searchQuery, setSearchQuery] = useState("");
  const [showAddRoom, setShowAddRoom] = useState(false);

  const filteredRooms = rooms.filter(room => {
    const query = searchQuery.toLowerCase();
    return (
      room.roomNumber.toLowerCase().includes(query) ||
      room.roomName.toLowerCase().includes(query) ||
      room.description?.toLowerCase().includes(query)
    );
  });

  const totalInstruments = rooms.reduce((sum, room) => sum + room.instruments.length, 0);

  const handleAddRoom = (roomData: { roomNumber: string; roomName: string; description: string }) => {
    const newRoom: Room = {
      id: `room-${Date.now()}`,
      roomNumber: roomData.roomNumber,
      roomName: roomData.roomName,
      description: roomData.description,
      instruments: [],
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    };
    addRoom(newRoom);
    toast.success(`Room "${roomData.roomName}" added successfully`);
  };

  return (
    <Wrapper>
      {/* Mobile Header */}
      {!embedded && <MobileHeader
        title="Room Setup"
        subtitle="Manage rooms & equipment"
        actions={
          <Badge variant="outline" className="text-[10px] px-1.5">
            {rooms.length} rooms
          </Badge>
        }
      />}

      {/* Mobile Sticky Controls */}
      <div className="md:hidden sticky top-[56px] z-10 bg-background border-b border-border">
        <div className="px-4 pt-3 pb-3 flex items-center gap-2">
          <div className="flex-1">
            <SearchInput
              value={searchQuery}
              onChange={setSearchQuery}
              placeholder="Search rooms..."
              className="h-9 text-sm"
            />
          </div>
          <Button size="icon" className="h-9 w-9 shrink-0" onClick={() => setShowAddRoom(true)}>
            <Plus className="w-4 h-4" />
          </Button>
        </div>
      </div>

      {/* Mobile Content */}
      <div className="md:hidden p-4 space-y-3">
        {filteredRooms.length > 0 ? (
          <div className="grid grid-cols-2 gap-2">
            {filteredRooms.map((room) => (
              <RoomSummaryCard
                key={room.id}
                room={room}
                onClick={() => navigate(`/room-setup/${room.id}`)}
              />
            ))}
          </div>
        ) : (
          <div className="text-center py-8 bg-muted/30 rounded-xl border border-dashed">
            <DoorOpen className="w-10 h-10 mx-auto mb-2 text-muted-foreground/50" />
            <h3 className="text-sm font-semibold mb-1">No rooms found</h3>
            <p className="text-xs text-muted-foreground mb-3">
              {searchQuery ? "Try adjusting your search" : "Add your first room"}
            </p>
            {!searchQuery && (
              <Button size="sm" onClick={() => setShowAddRoom(true)}>
                <Plus className="w-3 h-3 mr-1" />
                Add Room
              </Button>
            )}
          </div>
        )}
      </div>

      {/* Desktop Header */}
      {!embedded && <PageHeader
        title="Rooms"
        subtitle="Manage rooms and equipment"
        icon={DoorOpen}
      />}

      {/* Desktop Content */}
      <div className={embedded ? "hidden md:block space-y-6" : "hidden md:block px-8 py-4 max-w-4xl mx-auto space-y-6"}>
        {!embedded && <PageIntro
          highlight="Your practice, mapped room by room."
          description="Set up every consult, treatment and utility room, then link stock, equipment and checklists so the right resources always live where your team works."
        />}


        {/* Search */}
        <SearchInput
          value={searchQuery}
          onChange={setSearchQuery}
          placeholder="Search rooms..."
          className="max-w-sm"
        />

        {/* Section label */}
        <div className="flex items-center justify-between">
          <h3 className="text-[13px] font-semibold text-muted-foreground uppercase tracking-wide">Rooms</h3>
          <span className="text-[12px] text-muted-foreground">{rooms.length} rooms · {totalInstruments} total items</span>
        </div>

        {/* Rooms Grid */}
        {filteredRooms.length > 0 ? (
          <div className="grid grid-cols-2 lg:grid-cols-3 gap-3">
            {filteredRooms.map((room) => (
              <RoomSummaryCard
                key={room.id}
                room={room}
                onClick={() => navigate(`/room-setup/${room.id}`)}
              />
            ))}
          </div>
        ) : (
          <div className="text-center py-16 bg-muted/30 rounded-2xl border border-dashed">
            <DoorOpen className="w-12 h-12 mx-auto mb-4 text-muted-foreground/50" />
            <h3 className="text-lg font-semibold mb-2">No rooms found</h3>
            <p className="text-muted-foreground mb-4">
              {searchQuery ? "Try adjusting your search" : "Get started by adding your first room"}
            </p>
            {!searchQuery && (
              <Button onClick={() => setShowAddRoom(true)}>
                <Plus className="w-4 h-4 mr-2" />
                Add Your First Room
              </Button>
            )}
          </div>
        )}

        {/* Add Room button */}
        <div className="flex items-center gap-2 mt-2">
          <Button variant="outline" className="gap-2" onClick={() => setShowAddRoom(true)}>
            <Plus className="w-4 h-4" />
            Add Room
          </Button>
        </div>
      </div>

      {/* Dialogs */}
      <AddRoomDialog
        open={showAddRoom}
        onOpenChange={setShowAddRoom}
        onAdd={handleAddRoom}
      />
    </Wrapper>
  );
};

export default RoomSetup;
