import { useState, useMemo } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { AdminLayout } from "@/components/layout/AdminLayout";
import { MobileHeader } from "@/components/layout/MobileHeader";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { SearchInput } from "@/components/ui/SearchInput";
import { ArrowLeft, DoorOpen, Package, Pencil, Trash2, MoreHorizontal, Monitor, Printer, ShoppingCart, Scale, Activity, HeartPulse, BedDouble, Zap, Wind, Sparkles, Thermometer, Box, AlertTriangle, Stethoscope, FileText, ClipboardCheck, Plus } from "lucide-react";
import { useRooms } from "@/contexts/RoomsContext";
import { useStock } from "@/contexts/StockContext";
import { useRequests } from "@/contexts/RequestsContext";
import { Room, Instrument, InstrumentCategory } from "@/types/rooms";
import { StockItem } from "@/types/stock";
import { differenceInDays } from "date-fns";

import { AddInstrumentDialog } from "@/components/rooms/AddInstrumentDialog";
import { RoomItemTable } from "@/components/rooms/RoomItemTable";
import { RoomChecklistsPanel } from "@/components/rooms/RoomChecklistsPanel";
import { RoomStockAddTable } from "@/components/rooms/RoomStockAddTable";
import { StockTable } from "@/components/stock/StockTable";
import { EditRoomDialog } from "@/components/rooms/EditRoomDialog";
import { EditInstrumentDialog } from "@/components/rooms/EditInstrumentDialog";
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuSeparator, DropdownMenuTrigger } from "@/components/ui/dropdown-menu";
import { Checkbox } from "@/components/ui/checkbox";
import { cn } from "@/lib/utils";
import { toast } from "sonner";
import { ExportDropdown } from "@/components/ui/ExportDropdown";
import { exportInstrumentsCSV, exportInstrumentsPDF } from "@/utils/moduleExports";
import { PaginationBar } from "@/components/ui/PaginationBar";
import { usePagination } from "@/hooks/usePagination";

const categoryIcons: Record<InstrumentCategory, React.ElementType> = {
  "Computer": Monitor, "Printer": Printer, "Trolley": ShoppingCart, "Sharps Bin": Trash2,
  "Clinical Waste": Package, "Scale": Scale, "BP Machine": Activity, "ECG Machine": HeartPulse,
  "Examination Couch": BedDouble, "Defibrillator": Zap, "Oxygen Equipment": Wind,
  "Sterilizer": Sparkles, "Refrigerator": Thermometer, "Other": Box,
};

const statusColors = {
  active: "bg-success/10 text-success border-success/20",
  maintenance: "bg-warning/10 text-warning border-warning/20",
  inactive: "bg-muted text-muted-foreground border-muted",
};

const RoomDetail = () => {
  const { roomId } = useParams<{ roomId: string }>();
  const navigate = useNavigate();

  const { rooms, updateRoom, deleteRoom, addInstrument, updateInstrument, deleteInstrument } = useRooms();
  const { items: allStockItems, itemsByRoom, createItem, updateItem: updateStockItem, deleteItem: deleteStockItem } = useStock();
  const { getByStockId, createRefill, updateStatus: updateRefillStatus } = useRequests();
  const room = rooms.find(r => r.id === roomId);


  const [searchQuery, setSearchQuery] = useState("");
  const [stockMode, setStockMode] = useState<"expiring" | "calibrating" | "electrical" | "stationery" | "checklists">("expiring");
  const [showAddInstrument, setShowAddInstrument] = useState(false);
  const [showEditRoom, setShowEditRoom] = useState(false);
  const [showEditInstrument, setShowEditInstrument] = useState(false);
  const [selectedRoom, setSelectedRoom] = useState<Room | null>(null);
  const [selectedInstrument, setSelectedInstrument] = useState<(Instrument & { __source?: "stock"; __stockId?: string }) | null>(null);
  const [selectedStockIds, setSelectedStockIds] = useState<Set<string>>(new Set());
  const [expiringStatusFilter, setExpiringStatusFilter] = useState<"all" | "valid" | "expiring" | "expired">("all");
  const [showAddRow, setShowAddRow] = useState(false);
  const [addRowKey, setAddRowKey] = useState(0);

  type DisplayInstrument = Instrument & { __source?: "stock"; __stockId?: string; __stockItem?: StockItem };

  const stockInstruments: DisplayInstrument[] = useMemo(() => {
    if (!room) return [];
    return itemsByRoom(room.roomName).map((s) => ({
      id: `stock-${s.id}`,
      __source: "stock" as const,
      __stockId: s.id,
      __stockItem: s,
      category: "Other" as InstrumentCategory,
      name: s.name,
      instrumentNumber: s.batchNumber || s.electricalTagNumber || `STK-${s.id}`,
      notes: s.description,
      status: "active" as const,
      addedAt: (s.createdAt instanceof Date ? s.createdAt : new Date(s.createdAt as any)).toISOString(),
    }));
  }, [room, itemsByRoom]);

  const allItems: DisplayInstrument[] = useMemo(() => {
    if (!room) return [];
    return [...room.instruments, ...stockInstruments];
  }, [room, stockInstruments]);

  // Stock-mode classifiers (mirror Stock page)
  const isExpiringItem = (s?: StockItem) =>
    !!s && (s.status === "expiring" || s.status === "expired" || !!s.expiryDate);
  const isCalibratingItem = (s?: StockItem) =>
    !!s && (!!s.calibrationDate || !!s.nextCalibrationDate);
  const isElectricalItem = (s?: StockItem) =>
    !!s && (!!s.electricalTestDate || !!s.nextElectricalTestDate || !!s.electricalTagNumber);
  const STATIONERY_CATEGORY_IDS = new Set(["stationery", "office-supplies", "admin-supplies"]);
  const STATIONERY_KEYWORDS = ["pen", "paper", "stapler", "envelope", "notebook", "printer", "toner", "ink", "folder", "stationery", "stationary"];
  const isStationeryItem = (s?: StockItem) => {
    if (!s) return false;
    if (STATIONERY_CATEGORY_IDS.has(s.categoryId)) return true;
    const name = `${s.name} ${s.description || ""}`.toLowerCase();
    return STATIONERY_KEYWORDS.some((k) => name.includes(k));
  };

  const matchesMode = (inst: DisplayInstrument) => {
    if (inst.__source !== "stock") return false;
    if (stockMode === "expiring") return isExpiringItem(inst.__stockItem);
    if (stockMode === "calibrating") return isCalibratingItem(inst.__stockItem);
    if (stockMode === "electrical") return isElectricalItem(inst.__stockItem);
    if (stockMode === "stationery") return isStationeryItem(inst.__stockItem);
    return true;
  };

  const filteredInstruments = useMemo(() => {
    return allItems.filter(inst => {
      const q = searchQuery.toLowerCase();
      const matchesSearch = inst.name.toLowerCase().includes(q) || inst.instrumentNumber.toLowerCase().includes(q) || inst.category.toLowerCase().includes(q);
      return matchesSearch && matchesMode(inst);
    });
  }, [allItems, searchQuery, stockMode]);

  const itemsPag = usePagination(filteredInstruments, 15);

  const modeCounts = useMemo(() => {
    return {
      expiring: stockInstruments.filter(i => isExpiringItem(i.__stockItem)).length,
      calibrating: stockInstruments.filter(i => isCalibratingItem(i.__stockItem)).length,
      electrical: stockInstruments.filter(i => isElectricalItem(i.__stockItem)).length,
      stationery: stockInstruments.filter(i => isStationeryItem(i.__stockItem)).length,
    };
  }, [stockInstruments]);
  const checklistCount = useMemo(() => {
    if (!roomId) return 0;
    try {
      const raw = localStorage.getItem(`room-checklists-${roomId}`);
      return raw ? (JSON.parse(raw) as unknown[]).length : 0;
    } catch {
      return 0;
    }
  }, [roomId, stockMode]);



  const handleSaveRoom = (id: string, data: { roomNumber: string; roomName: string; description: string }) => {
    updateRoom(id, data);
    toast.success("Room updated successfully");
  };

  const handleDeleteRoom = (id: string) => {
    deleteRoom(id);
    toast.success("Room deleted");
    navigate("/room-setup");
  };

  const handleInstrumentAdd = (data: { category: InstrumentCategory; name: string; instrumentNumber: string; notes?: string }) => {
    if (!roomId) return;
    const newInstrument: Instrument = {
      id: `inst-${Date.now()}`, category: data.category, name: data.name,
      instrumentNumber: data.instrumentNumber, notes: data.notes, status: "active", addedAt: new Date().toISOString(),
    };
    addInstrument(roomId, newInstrument);
    toast.success(`"${data.name}" added`);
  };

  const handleSaveInstrument = (instrumentId: string, data: { category: InstrumentCategory; name: string; instrumentNumber: string; notes?: string; status: "active" | "maintenance" | "inactive" }) => {
    if (!roomId) return;
    if (selectedInstrument?.__source === "stock" && selectedInstrument.__stockId) {
      updateStockItem(selectedInstrument.__stockId, {
        name: data.name,
        description: data.notes || "",
        batchNumber: data.instrumentNumber,
      });
      toast.success("Stock item updated");
      return;
    }
    updateInstrument(roomId, instrumentId, data);
    toast.success("Instrument updated");
  };

  const handleDeleteInstrument = (instrumentId: string) => {
    if (!roomId) return;
    const target = allItems.find(i => i.id === instrumentId);
    if (target?.__source === "stock" && target.__stockId) {
      deleteStockItem(target.__stockId);
      toast.success("Stock item removed");
      return;
    }
    deleteInstrument(roomId, instrumentId);
    toast.success("Instrument removed");
  };

  // Stock items currently shown in expiring mode (used for bulk select/delete)
  const expiringStockItems = useMemo(
    () => stockInstruments.filter(i => isExpiringItem(i.__stockItem)),
    [stockInstruments]
  );
  const expiredOnlyIds = useMemo(
    () => new Set(expiringStockItems.filter(i => i.__stockItem?.status === "expired").map(i => i.__stockId!)),
    [expiringStockItems]
  );
  const expiringItemsByStatus = useMemo(() => {
    const items = expiringStockItems.map(i => i.__stockItem!).filter(Boolean);
    return {
      all: items,
      valid: items.filter(s => s.status === "valid"),
      expiring: items.filter(s => s.status === "expiring"),
      expired: items.filter(s => s.status === "expired"),
    };
  }, [expiringStockItems]);
  const filteredExpiringItems = expiringItemsByStatus[expiringStatusFilter].filter(s => s.name.toLowerCase().includes(searchQuery.toLowerCase()));

  const toggleStockSelection = (stockId: string) => {
    setSelectedStockIds(prev => {
      const next = new Set(prev);
      next.has(stockId) ? next.delete(stockId) : next.add(stockId);
      return next;
    });
  };
  const selectAllExpired = () => setSelectedStockIds(new Set(expiredOnlyIds));
  const clearSelection = () => setSelectedStockIds(new Set());
  const deleteSelectedStock = () => {
    if (selectedStockIds.size === 0) return;
    selectedStockIds.forEach(id => deleteStockItem(id));
    toast.success(`${selectedStockIds.size} stock item${selectedStockIds.size > 1 ? "s" : ""} deleted`);
    clearSelection();
  };

  const handleCreateRoomStock = (items: Omit<StockItem, "id" | "createdAt" | "updatedAt">[]) => {
    items.forEach((it, idx) => {
      const now = new Date();
      createItem({
        ...it,
        id: `stk-${Date.now()}-${idx}`,
        createdAt: now,
        updatedAt: now,
      } as StockItem);
    });
    toast.success(`${items.length} stock item${items.length > 1 ? "s" : ""} added to ${room?.roomName}`);
  };

  const existingStockNames = useMemo(
    () => Array.from(new Set(allStockItems.map(s => s.name))).sort(),
    [allStockItems]
  );


  if (!room) {
    return (
      <AdminLayout>
        <div className="flex flex-col items-center justify-center h-64 gap-3">
          <DoorOpen className="w-12 h-12 text-muted-foreground/50" />
          <p className="text-muted-foreground">Room not found</p>
          <Button variant="outline" onClick={() => navigate("/room-setup")}>
            <ArrowLeft className="w-4 h-4 mr-1.5" />
            Back to Rooms
          </Button>
        </div>
      </AdminLayout>
    );
  }

  return (
    <AdminLayout>
      {/* Mobile Header */}
      <MobileHeader
        title={room.roomName}
        subtitle={`Room #${room.roomNumber}`}
        actions={
          <Button variant="ghost" size="icon" onClick={() => navigate("/room-setup")}>
            <ArrowLeft className="w-5 h-5" />
          </Button>
        }
      />

      {/* Mobile Content */}
      <div className="md:hidden p-3 space-y-2">
        {itemsPag.paginated.map(instrument => {
          const Icon = categoryIcons[instrument.category] || Box;
          return (
            <div key={instrument.id} className="flex items-center justify-between p-3 bg-muted/30 rounded-lg">
              <div className="flex items-center gap-3 min-w-0 flex-1">
                <div className="p-2 rounded-lg bg-background border shrink-0">
                  <Icon className="w-4 h-4 text-muted-foreground" />
                </div>
                <div className="min-w-0">
                  <span className="font-medium text-sm">{instrument.name}</span>
                  <span className="text-xs text-muted-foreground block">{instrument.category}</span>
                </div>
              </div>
              <Badge variant="outline" className={cn("text-[10px] capitalize", statusColors[instrument.status])}>
                {instrument.status}
              </Badge>
            </div>
          );
        })}
        <PaginationBar
          page={itemsPag.page}
          totalPages={itemsPag.totalPages}
          total={itemsPag.total}
          pageSize={itemsPag.pageSize}
          onPageChange={itemsPag.setPage}
        />
      </div>

      {/* Desktop */}
      <div className="hidden md:block px-8 pt-8 pb-2 max-w-4xl mx-auto">
        {/* Back + Header */}
        <div className="flex items-center gap-3 mb-4">
          <Button variant="ghost" size="icon" className="h-8 w-8" onClick={() => navigate("/room-setup")}>
            <ArrowLeft className="w-4 h-4" />
          </Button>
          <div>
            <h2 className="text-xl font-semibold leading-tight">{room.roomName}</h2>
            <p className="text-[13px] text-muted-foreground">
              {room.description || `Room #${room.roomNumber}`}
            </p>
          </div>
          <Badge variant="outline" className="ml-auto font-mono text-xs">#{room.roomNumber}</Badge>

          <div className="ml-auto">
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button variant="outline" size="sm">
                  <MoreHorizontal className="w-4 h-4" />
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end">
                <DropdownMenuItem onClick={() => { setSelectedRoom(room); setShowEditRoom(true); }}>
                  <Pencil className="w-4 h-4 mr-2" /> Edit Room
                </DropdownMenuItem>
                <DropdownMenuSeparator />
                <DropdownMenuItem className="text-destructive" onClick={() => handleDeleteRoom(room.id)}>
                  <Trash2 className="w-4 h-4 mr-2" /> Delete Room
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
          </div>
        </div>
      </div>

      {/* Desktop Content */}
      <div className="hidden md:block px-8 py-4 max-w-4xl mx-auto space-y-4">
        {/* Stock mode tabs + search + add */}
        <div className="flex items-center gap-3 flex-wrap">
          <div className="flex items-center gap-1 flex-wrap">
            {([
              { key: "expiring" as const, label: "Medical Supplies", icon: AlertTriangle, count: modeCounts.expiring },
              { key: "calibrating" as const, label: "Calibrating", icon: Stethoscope, count: modeCounts.calibrating },
              { key: "electrical" as const, label: "Test & Tagging", icon: Zap, count: modeCounts.electrical },
              { key: "stationery" as const, label: "Other", icon: Box, count: modeCounts.stationery },
              { key: "checklists" as const, label: "Checklists", icon: ClipboardCheck, count: checklistCount },
            ]).map(({ key, label, icon: Icon, count }) => (
              <button
                key={key}
                onClick={() => setStockMode(key)}
                className={cn(
                  "px-3.5 py-1.5 rounded-lg text-[13px] font-medium transition-colors inline-flex items-center gap-1.5",
                  stockMode === key
                    ? "bg-foreground text-background"
                    : "text-muted-foreground hover:text-foreground hover:bg-muted",
                )}
              >
                <Icon className="w-3.5 h-3.5" />
                {label}
                <span className="ml-1 text-[11px] opacity-70">{count}</span>
              </button>
            ))}
          </div>

          <div className="ml-auto flex items-center gap-3">
            <SearchInput
              value={searchQuery}
              onChange={setSearchQuery}
              placeholder={stockMode === "checklists" ? "Search checklists..." : "Search items..."}
              className="w-56"
            />
            {stockMode !== "checklists" && (
              <>
                <Button size="sm" onClick={() => { setShowAddRow(true); setAddRowKey(k => k + 1); }}>
                  <Plus className="w-4 h-4 mr-1.5" />
                  Add Items
                </Button>
                <span className="text-[13px] text-muted-foreground whitespace-nowrap">
                  {filteredInstruments.length} items
                </span>
              </>
            )}
          </div>
        </div>

        {stockMode === "checklists" ? (
          <RoomChecklistsPanel roomId={room.id} roomName={room.roomName} searchQuery={searchQuery} />
        ) : stockMode === "expiring" ? (
          <>

            <StockTable
              key={`exp-${addRowKey}`}
              showAddRow={showAddRow}
              activeCategoryId="consumables"
              savedItems={filteredExpiringItems}
              onCreateItem={(item) => {
                const now = new Date();
                createItem({
                  ...item,
                  location: item.location || room.roomName,
                  status: item.expiryDate
                    ? (differenceInDays(item.expiryDate, now) < 0
                        ? "expired"
                        : differenceInDays(item.expiryDate, now) <= 30
                          ? "expiring"
                          : "valid")
                    : "valid",
                  id: `stk-${Date.now()}-${Math.random().toString(36).slice(2, 6)}`,
                  createdAt: now,
                  updatedAt: now,
                } as StockItem);
                toast.success(`"${item.name}" added to ${room.roomName}`);
              }}
              onUpdateItem={(id, patch) => updateStockItem(id, patch)}
              onDeleteItem={(id) => { deleteStockItem(id); toast.success("Stock item removed"); }}
              onEditItem={(item) => {
                const mapped = {
                  id: `stock-${item.id}`,
                  __source: "stock" as const,
                  __stockId: item.id,
                  __stockItem: item,
                  category: "Other" as InstrumentCategory,
                  name: item.name,
                  instrumentNumber: item.batchNumber || item.electricalTagNumber || `STK-${item.id}`,
                  notes: item.description,
                  status: "active" as const,
                  addedAt: (item.createdAt instanceof Date ? item.createdAt : new Date(item.createdAt as any)).toISOString(),
                };
                setSelectedInstrument(mapped);
                setShowEditInstrument(true);
              }}
              selectedIds={selectedStockIds}
              onToggleSelect={toggleStockSelection}
              onToggleSelectAll={() => {
                const allIds = filteredExpiringItems.map(i => i.id);
                const allSelected = allIds.length > 0 && allIds.every(id => selectedStockIds.has(id));
                setSelectedStockIds(allSelected ? new Set() : new Set(allIds));
              }}
              refillEnabled
              getRefillStatus={(item) => getByStockId(item.id)?.status as "order" | "pending" | "refilled" | undefined}
              onOrderRefill={(item) =>
                createRefill({
                  stockItemId: item.id,
                  itemName: item.name,
                  roomName: room.roomName,
                  categoryId: item.categoryId,
                  quantity: item.quantity ?? 1,
                })
              }
              onUpdateRefillStatus={(item, status) => {
                const req = getByStockId(item.id);
                if (req) {
                  updateRefillStatus(req.id, status);
                  toast.success(`"${item.name}" marked ${status}`);
                }
              }}
            />
          </>
        ) : (
          <StockTable
            key={`oth-${addRowKey}`}
            showAddRow={showAddRow}
            activeCategoryId={stockMode === "calibrating" ? "vital-signs" : stockMode === "electrical" ? "electrical-tagging" : "stationery"}
            savedItems={stockInstruments
              .filter(i =>
                stockMode === "calibrating" ? isCalibratingItem(i.__stockItem)
                : stockMode === "electrical" ? isElectricalItem(i.__stockItem)
                : isStationeryItem(i.__stockItem)
              )
              .map(i => i.__stockItem!)
              .filter(Boolean)}
            onCreateItem={(item) => {
              const now = new Date();
              createItem({
                ...item,
                location: item.location || room.roomName,
                status: item.expiryDate
                  ? (differenceInDays(item.expiryDate, now) < 0
                      ? "expired"
                      : differenceInDays(item.expiryDate, now) <= 30
                        ? "expiring"
                        : "valid")
                  : "valid",
                id: `stk-${Date.now()}-${Math.random().toString(36).slice(2, 6)}`,
                createdAt: now,
                updatedAt: now,
              } as StockItem);
              toast.success(`"${item.name}" added to ${room.roomName}`);
            }}
            onUpdateItem={(id, patch) => updateStockItem(id, patch)}
            onDeleteItem={(id) => { deleteStockItem(id); toast.success("Stock item removed"); }}
            onEditItem={(item) => {
              const mapped = {
                id: `stock-${item.id}`,
                __source: "stock" as const,
                __stockId: item.id,
                __stockItem: item,
                category: "Other" as InstrumentCategory,
                name: item.name,
                instrumentNumber: item.batchNumber || item.electricalTagNumber || `STK-${item.id}`,
                notes: item.description,
                status: "active" as const,
                addedAt: (item.createdAt instanceof Date ? item.createdAt : new Date(item.createdAt as any)).toISOString(),
              };
              setSelectedInstrument(mapped);
              setShowEditInstrument(true);
            }}
            selectedIds={selectedStockIds}
            onToggleSelect={toggleStockSelection}
            refillEnabled={stockMode === "stationery"}
            getRefillStatus={(item) => getByStockId(item.id)?.status as "order" | "pending" | "refilled" | undefined}
            onOrderRefill={(item) =>
              createRefill({
                stockItemId: item.id,
                itemName: item.name,
                roomName: room.roomName,
                categoryId: item.categoryId,
                quantity: item.quantity ?? 1,
              })
            }
            onUpdateRefillStatus={(item, status) => {
              const req = getByStockId(item.id);
              if (req) {
                updateRefillStatus(req.id, status);
                toast.success(`"${item.name}" marked ${status}`);
              }
            }}
          />
        )}
      </div>

      {/* Dialogs */}
      <AddInstrumentDialog open={showAddInstrument} onOpenChange={setShowAddInstrument} roomName={room.roomName} onAdd={handleInstrumentAdd} />
      <EditRoomDialog open={showEditRoom} onOpenChange={setShowEditRoom} room={selectedRoom} onSave={handleSaveRoom} />
      <EditInstrumentDialog open={showEditInstrument} onOpenChange={setShowEditInstrument} instrument={selectedInstrument} roomName={room.roomName} onSave={handleSaveInstrument} />
    </AdminLayout>
  );
};

export default RoomDetail;
