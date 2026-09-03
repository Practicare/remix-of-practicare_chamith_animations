import { createContext, useContext, useEffect, useState, ReactNode } from "react";
import { StaffMember } from "@/types/staff";
import { mockStaffMembers } from "@/data/mockStaff";

export type UserRole = "admin" | "user";

interface UserContextType {
  currentUser: StaffMember | null;
  userRole: UserRole;
  setCurrentUser: (user: StaffMember | null) => void;
  setUserRole: (role: UserRole) => void;
  logout: () => void;
  isLoggedIn: boolean;
}

const UserContext = createContext<UserContextType | undefined>(undefined);

const USER_STORAGE_KEY = "practicare.current-user";
const ROLE_STORAGE_KEY = "practicare.user-role";

const loadStoredUser = (): StaffMember | null => {
  try {
    const storedUser = localStorage.getItem(USER_STORAGE_KEY);
    return storedUser ? JSON.parse(storedUser) : null;
  } catch {
    return null;
  }
};

const loadStoredRole = (): UserRole => {
  try {
    return localStorage.getItem(ROLE_STORAGE_KEY) === "admin" ? "admin" : "user";
  } catch {
    return "user";
  }
};

export function UserProvider({ children }: { children: ReactNode }) {
  const [currentUser, setCurrentUser] = useState<StaffMember | null>(loadStoredUser);
  const [userRole, setUserRole] = useState<UserRole>(loadStoredRole);

  useEffect(() => {
    try {
      if (currentUser) localStorage.setItem(USER_STORAGE_KEY, JSON.stringify(currentUser));
      else localStorage.removeItem(USER_STORAGE_KEY);
    } catch {
      // Storage may be unavailable in private browsing contexts.
    }
  }, [currentUser]);

  useEffect(() => {
    try {
      localStorage.setItem(ROLE_STORAGE_KEY, userRole);
    } catch {
      // Storage may be unavailable in private browsing contexts.
    }
  }, [userRole]);

  const logout = () => {
    setCurrentUser(null);
    setUserRole("user");
    try {
      localStorage.removeItem(USER_STORAGE_KEY);
      localStorage.removeItem(ROLE_STORAGE_KEY);
    } catch {
      // Storage may be unavailable in private browsing contexts.
    }
  };

  return (
    <UserContext.Provider
      value={{
        currentUser,
        userRole,
        setCurrentUser,
        setUserRole,
        logout,
        isLoggedIn: currentUser !== null,
      }}
    >
      {children}
    </UserContext.Provider>
  );
}

export function useUser() {
  const context = useContext(UserContext);
  if (context === undefined) {
    throw new Error("useUser must be used within a UserProvider");
  }
  return context;
}

// Helper to get staff member by ID
export function getStaffById(id: string): StaffMember | undefined {
  return mockStaffMembers.find((s) => s.id === id);
}
