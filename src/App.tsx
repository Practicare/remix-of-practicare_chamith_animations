import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route } from "react-router-dom";
import { UserProvider } from "./contexts/UserContext";
import { OrgSiteProvider } from "./contexts/OrgSiteContext";
import { StockProvider } from "./contexts/StockContext";
import { RoomsProvider } from "./contexts/RoomsContext";
import { RequestsProvider } from "./contexts/RequestsContext";
import { IssuesProvider } from "./contexts/IssuesContext";
import { ModulesProvider } from "./contexts/ModulesContext";

import { UserLayout } from "./components/layout/UserLayout";
import Index from "./pages/Index";
import Dashboard from "./pages/Dashboard";
import Tasks from "./pages/Tasks";
import Compliance from "./pages/Compliance";
import ComplianceCategoryPage from "./pages/ComplianceCategory";
import Checklists from "./pages/Checklists";
import Memos from "./pages/Memos";
import Notes from "./pages/Notes";
import Roster from "./pages/Roster";
import Stock from "./pages/Stock";
import StockCategoryPage from "./pages/StockCategory";
import Staff from "./pages/Staff";
import KpiPage from "./pages/Kpi";
import StaffProfile from "./pages/StaffProfile";
import DepartmentDetail from "./pages/DepartmentDetail";
import RoomSetup from "./pages/RoomSetup";
import RoomDetail from "./pages/RoomDetail";
import ChecklistDetail from "./pages/ChecklistDetail";
import Settings from "./pages/Settings";
import Login from "./pages/Login";
import Signup from "./pages/Signup";
import UserDashboard from "./pages/UserDashboard";
import UserChecklists from "./pages/UserChecklists";
import UserRoster from "./pages/UserRoster";
import NotFound from "./pages/NotFound";
import Training from "./pages/Training";
import CommunicationBook from "./pages/CommunicationBook";
import Messaging from "./pages/Messaging";
import Reports from "./pages/Reports";
import Inventory from "./pages/Inventory";
import InventoryTrends from "./pages/InventoryTrends";
import InventoryPlanner from "./pages/InventoryPlanner";
import Install from "./pages/Install";
import TeamOnboarding from "./pages/TeamOnboarding";
import DocumentLibrary from "./pages/DocumentLibrary";
import DocumentFolderDetail from "./pages/DocumentFolderDetail";
import Requests from "./pages/Requests";
import Marketplace from "./pages/Marketplace";
import MarketplaceListing from "./pages/MarketplaceListing";
import MarketplaceAccount from "./pages/MarketplaceAccount";
import MarketplaceNews from "./pages/MarketplaceNews";

import FAQPage from "./pages/FAQ";
import EmailTemplates from "./pages/EmailTemplates";
import ExpiryCentre from "./pages/ExpiryCentre";
import Timesheets from "./pages/Timesheets";
import NewTimesheetTemplate from "./pages/NewTimesheetTemplate";
import UserTimesheets from "./pages/UserTimesheets";
import StaffActionGuide from "./pages/StaffActionGuide";
import TrainingArticle from "./pages/TrainingArticle";
import Noticeboards from "./pages/Noticeboards";
import MeetingSchedule from "./pages/MeetingSchedule";
import MeetingInvitePublic from "./pages/MeetingInvitePublic";
import Accreditation from "./pages/Accreditation";
import AccreditationProject from "./pages/AccreditationProject";
import AccreditationLibrary from "./pages/AccreditationLibrary";
import AccreditationReports from "./pages/AccreditationReports";

const queryClient = new QueryClient();

const App = () => (
  <QueryClientProvider client={queryClient}>
    <OrgSiteProvider>
    <UserProvider>
      <StockProvider>
      <RoomsProvider>
      <RequestsProvider>
      <IssuesProvider>
      <ModulesProvider>
      <TooltipProvider>
        <Toaster />
        <Sonner />

        <BrowserRouter>
          <Routes>
            <Route path="/" element={<Index />} />
            <Route path="/login" element={<Login />} />
            <Route path="/signup" element={<Signup />} />
            <Route path="/dashboard" element={<Dashboard />} />
            <Route path="/expiry-centre" element={<ExpiryCentre />} />
            <Route path="/user" element={<UserDashboard />} />
            <Route path="/user/checklists" element={<UserChecklists />} />
            <Route path="/user/roster" element={<UserRoster />} />
            <Route path="/user/tasks" element={<Tasks Layout={UserLayout} />} />
            <Route path="/user/stock" element={<Stock Layout={UserLayout} />} />
            <Route path="/user/memos" element={<Memos Layout={UserLayout} />} />
            <Route path="/user/communication-book" element={<CommunicationBook Layout={UserLayout} />} />
            <Route path="/user/messaging" element={<Messaging Layout={UserLayout} />} />
            <Route path="/user/rooms" element={<RoomSetup Layout={UserLayout} />} />
            <Route path="/user/training" element={<Training Layout={UserLayout} />} />
            <Route path="/user/timesheets" element={<UserTimesheets />} />
            <Route path="/timesheets" element={<Timesheets />} />
            <Route path="/timesheets/new" element={<NewTimesheetTemplate />} />
            <Route path="/staff-action-guide" element={<StaffActionGuide />} />
            <Route path="/user/staff-action-guide" element={<StaffActionGuide Layout={UserLayout} />} />
            <Route path="/tasks" element={<Tasks />} />
            <Route path="/notes" element={<Notes />} />
            <Route path="/user/notes" element={<Notes Layout={UserLayout} />} />
            <Route path="/compliance" element={<Compliance />} />
            <Route path="/compliance/category/:categoryId" element={<ComplianceCategoryPage />} />
            <Route path="/checklists" element={<Checklists />} />
            <Route path="/memos" element={<Memos />} />
            <Route path="/noticeboards" element={<Noticeboards />} />
            <Route path="/roster" element={<Roster />} />
            <Route path="/stock" element={<Stock />} />
            <Route path="/stock/category/:categoryId" element={<StockCategoryPage />} />
            <Route path="/staff" element={<Staff />} />
            <Route path="/kpi" element={<KpiPage />} />
            <Route path="/staff/profile/:staffId" element={<StaffProfile />} />
            <Route path="/staff/department/:departmentId" element={<DepartmentDetail />} />
            <Route path="/room-setup" element={<RoomSetup />} />
            <Route path="/room-setup/:roomId" element={<RoomDetail />} />
            <Route path="/checklists/:checklistId" element={<ChecklistDetail />} />
            <Route path="/settings" element={<Settings />} />
            <Route path="/training" element={<Training />} />
            <Route path="/training/article/:articleId" element={<TrainingArticle />} />
            <Route path="/user/training/article/:articleId" element={<TrainingArticle Layout={UserLayout} />} />
            <Route path="/communication-book" element={<CommunicationBook />} />
            <Route path="/messaging" element={<Messaging />} />
            <Route path="/meeting-schedule" element={<MeetingSchedule />} />
            <Route path="/user/meeting-schedule" element={<MeetingSchedule Layout={UserLayout} />} />
            <Route path="/meeting-invite/:token" element={<MeetingInvitePublic />} />
            <Route path="/reports" element={<Reports />} />
            <Route path="/inventory" element={<Inventory />} />
            <Route path="/inventory/*" element={<Inventory />} />
            <Route path="/inventory/trends" element={<InventoryTrends />} />
            <Route path="/inventory/trends/*" element={<InventoryTrends />} />
            <Route path="/inventory/planner" element={<InventoryPlanner />} />
            <Route path="/inventory/planner/*" element={<InventoryPlanner />} />
            <Route path="/documents" element={<DocumentLibrary />} />
            <Route path="/documents/folder/:folderId" element={<DocumentFolderDetail />} />
            <Route path="/requests" element={<Requests />} />
            <Route path="/marketplace" element={<Marketplace />} />
            <Route path="/marketplace/news" element={<MarketplaceNews />} />
            <Route path="/marketplace/account" element={<MarketplaceAccount />} />
            <Route path="/marketplace/:listingId" element={<MarketplaceListing />} />
            <Route path="/user/marketplace" element={<Marketplace />} />
            
            <Route path="/faq" element={<FAQPage />} />
            <Route path="/email-templates" element={<EmailTemplates />} />
            <Route path="/install" element={<Install />} />
            <Route path="/onboarding/team" element={<TeamOnboarding />} />
            <Route path="/accreditation" element={<Accreditation />} />
            <Route path="/accreditation/library" element={<AccreditationLibrary />} />
            <Route path="/accreditation/reports" element={<AccreditationReports />} />
            <Route path="/accreditation/:projectId" element={<AccreditationProject />} />
            {/* ADD ALL CUSTOM ROUTES ABOVE THE CATCH-ALL "*" ROUTE */}
            <Route path="*" element={<NotFound />} />
          </Routes>
        </BrowserRouter>
      </TooltipProvider>
      </ModulesProvider>
      </IssuesProvider>
      </RequestsProvider>
      </RoomsProvider>
      </StockProvider>
    </UserProvider>
    </OrgSiteProvider>
  </QueryClientProvider>

);

export default App;
