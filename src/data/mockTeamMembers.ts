import { TeamMember } from "@/types/teamMembers";

export const mockTeamMembers: TeamMember[] = [
  // Reception
  { id: "tm-1", name: "Sarah Johnson", email: "sarah.j@practice.com", status: "confirmed", categoryId: "reception" },
  { id: "tm-2", name: "Mike Chen", email: "mike.c@practice.com", status: "accepted", categoryId: "reception" },
  { id: "tm-3", name: "Emily Brown", email: "emily.b@practice.com", status: "pending", categoryId: "reception" },
  
  // Nursing
  { id: "tm-4", name: "Jessica Williams", email: "jessica.w@practice.com", status: "confirmed", categoryId: "nursing" },
  { id: "tm-5", name: "David Lee", email: "david.l@practice.com", status: "confirmed", categoryId: "nursing" },
  { id: "tm-6", name: "Amanda Davis", email: "amanda.d@practice.com", status: "invited", categoryId: "nursing" },
  
  // Doctors
  { id: "tm-7", name: "Dr. Robert Smith", email: "r.smith@practice.com", status: "confirmed", categoryId: "doctors" },
  { id: "tm-8", name: "Dr. Lisa Anderson", email: "l.anderson@practice.com", status: "confirmed", categoryId: "doctors" },
  { id: "tm-9", name: "Dr. James Wilson", email: "j.wilson@practice.com", status: "accepted", categoryId: "doctors" },
  
  // Manager
  { id: "tm-10", name: "Patricia Moore", email: "p.moore@practice.com", status: "confirmed", categoryId: "manager" },
  
  // Owners
  { id: "tm-11", name: "Thomas Clark", email: "t.clark@practice.com", status: "confirmed", categoryId: "owners" },
  
  // Cleaners (External)
  { id: "tm-12", name: "Carlos Garcia", email: "carlos@cleaningco.com", status: "confirmed", categoryId: "cleaners" },
  { id: "tm-13", name: "Maria Santos", email: "maria@cleaningco.com", status: "pending", categoryId: "cleaners" },
  
  // Accountant (External)
  { id: "tm-14", name: "Jennifer Taylor", email: "j.taylor@accounts.com", status: "confirmed", categoryId: "accountant" },
  
  // IT Team
  { id: "tm-15", name: "Kevin White", email: "kevin@techsupport.com", status: "confirmed", categoryId: "it-team" },
  { id: "tm-16", name: "Rachel Green", email: "rachel@techsupport.com", status: "invited", categoryId: "it-team" },
];
