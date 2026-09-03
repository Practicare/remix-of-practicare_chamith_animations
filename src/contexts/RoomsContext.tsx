import { createContext, useContext, useEffect, useMemo, useState, ReactNode } from "react";
import { Room, Instrument } from "@/types/rooms";
import { mockRooms } from "@/data/mockRooms";

const STORAGE_KEY = "practicare.rooms.v1";

function loadInitial(): Room[] {
  if (typeof window === "undefined") return mockRooms;
  try {
    const raw = window.localStorage.getItem(STORAGE_KEY);
    if (raw) return JSON.parse(raw) as Room[];
  } catch {}
  return mockRooms;
}

interface RoomsContextValue {
  rooms: Room[];
  setRooms: React.Dispatch<React.SetStateAction<Room[]>>;
  addRoom: (room: Room) => void;
  updateRoom: (id: string, patch: Partial<Room>) => void;
  deleteRoom: (id: string) => void;
  addInstrument: (roomId: string, instrument: Instrument) => void;
  updateInstrument: (roomId: string, instrumentId: string, patch: Partial<Instrument>) => void;
  deleteInstrument: (roomId: string, instrumentId: string) => void;
}

const RoomsContext = createContext<RoomsContextValue | null>(null);

export function RoomsProvider({ children }: { children: ReactNode }) {
  const [rooms, setRooms] = useState<Room[]>(() => loadInitial());

  useEffect(() => {
    try {
      window.localStorage.setItem(STORAGE_KEY, JSON.stringify(rooms));
    } catch {}
  }, [rooms]);

  const value = useMemo<RoomsContextValue>(
    () => ({
      rooms,
      setRooms,
      addRoom: (room) => setRooms((prev) => [...prev, room]),
      updateRoom: (id, patch) =>
        setRooms((prev) =>
          prev.map((r) => (r.id === id ? { ...r, ...patch, updatedAt: new Date().toISOString() } : r))
        ),
      deleteRoom: (id) => setRooms((prev) => prev.filter((r) => r.id !== id)),
      addInstrument: (roomId, instrument) =>
        setRooms((prev) =>
          prev.map((r) =>
            r.id === roomId
              ? { ...r, instruments: [...r.instruments, instrument], updatedAt: new Date().toISOString() }
              : r
          )
        ),
      updateInstrument: (roomId, instrumentId, patch) =>
        setRooms((prev) =>
          prev.map((r) =>
            r.id === roomId
              ? {
                  ...r,
                  instruments: r.instruments.map((i) => (i.id === instrumentId ? { ...i, ...patch } : i)),
                  updatedAt: new Date().toISOString(),
                }
              : r
          )
        ),
      deleteInstrument: (roomId, instrumentId) =>
        setRooms((prev) =>
          prev.map((r) =>
            r.id === roomId
              ? {
                  ...r,
                  instruments: r.instruments.filter((i) => i.id !== instrumentId),
                  updatedAt: new Date().toISOString(),
                }
              : r
          )
        ),
    }),
    [rooms]
  );

  return <RoomsContext.Provider value={value}>{children}</RoomsContext.Provider>;
}

export function useRooms() {
  const ctx = useContext(RoomsContext);
  if (!ctx) throw new Error("useRooms must be used within RoomsProvider");
  return ctx;
}
