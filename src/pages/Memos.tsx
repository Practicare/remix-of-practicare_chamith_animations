import { useState, useMemo } from "react";
import { Button } from "@/components/ui/button";
import { SegmentedControl } from "@/components/ui/segmented-control";
import {
  Bell,
  Newspaper,
  Plus,
  Mail,
  MailOpen,
  AlertTriangle,
  List,
  LayoutGrid,
} from "lucide-react";
import { Link, useNavigate } from "react-router-dom";
import { AdminLayout } from "@/components/layout/AdminLayout";
import { MobileHeader } from "@/components/layout/MobileHeader";
import { PageHeader } from "@/components/layout/PageHeader";
import { Megaphone } from "lucide-react";
import { ComponentType, ReactNode } from "react";
import { SearchInput } from "@/components/ui/SearchInput";
import { mockMemos } from "@/data/mockMemos";
import { Memo, MemoCategory, DEFAULT_MEMO_CATEGORIES } from "@/types/memos";
import { MemoCard } from "@/components/memos/MemoCard";
import { MemoFilters } from "@/components/memos/MemoFilters";
import { MemoStats } from "@/components/memos/MemoStats";
import { CreateMemoDialog } from "@/components/memos/CreateMemoDialog";
import { EditMemoDialog } from "@/components/memos/EditMemoDialog";
import { DeleteMemoDialog } from "@/components/memos/DeleteMemoDialog";
import { MemoReadReportDialog } from "@/components/memos/MemoReadReportDialog";
import { PageIntro } from "@/components/layout/PageIntro";
import { MEMOS_PRACTICE_TIP } from "@/components/memos/memosPracticeTip";

import { toast } from "sonner";
import { useUser } from "@/contexts/UserContext";
import { ExportDropdown } from "@/components/ui/ExportDropdown";
import { exportMemosCSV, exportMemosPDF } from "@/utils/moduleExports";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Badge } from "@/components/ui/badge";

const Memos = ({ Layout = AdminLayout }: { Layout?: ComponentType<{ children: ReactNode }> }) => {
  const navigate = useNavigate();
  const { currentUser } = useUser();
  const CURRENT_USER_ID = currentUser?.id || "current-user";
  const CURRENT_USER_NAME = currentUser 
    ? `${currentUser.firstName} ${currentUser.lastName}` 
    : "Admin User";

  const [memos, setMemos] = useState<Memo[]>(mockMemos);
  const [categories] = useState<MemoCategory[]>(DEFAULT_MEMO_CATEGORIES);
  const [activeCategory, setActiveCategory] = useState("all");
  const [searchQuery, setSearchQuery] = useState("");
  const [showMandatoryOnly, setShowMandatoryOnly] = useState(false);
  const [showUnreadOnly, setShowUnreadOnly] = useState(false);
  const [activeTab, setActiveTab] = useState("all");
  const [displayMode, setDisplayMode] = useState<"list" | "cards">("list");
  const [editingMemo, setEditingMemo] = useState<Memo | null>(null);
  const [deletingMemo, setDeletingMemo] = useState<Memo | null>(null);
  const [viewingReadReport, setViewingReadReport] = useState<Memo | null>(null);

  const filteredMemos = useMemo(() => {
    return memos.filter((memo) => {
      // Category filter
      if (activeCategory !== "all" && memo.categoryId !== activeCategory) {
        return false;
      }

      // Mandatory filter
      if (showMandatoryOnly && !memo.mandatoryRead) {
        return false;
      }

      // Unread filter
      if (showUnreadOnly) {
        const hasRead = memo.readBy.some((r) => r.userId === CURRENT_USER_ID);
        if (hasRead) return false;
      }

      // Search filter
      if (searchQuery) {
        const query = searchQuery.toLowerCase();
        if (
          !memo.title.toLowerCase().includes(query) &&
          !memo.content.toLowerCase().includes(query) &&
          !memo.author.toLowerCase().includes(query)
        ) {
          return false;
        }
      }

      return true;
    });
  }, [memos, activeCategory, showMandatoryOnly, showUnreadOnly, searchQuery, CURRENT_USER_ID]);

  const handleMarkAsRead = (memoId: string) => {
    setMemos((prev) =>
      prev.map((memo) => {
        if (memo.id !== memoId) return memo;
        const alreadyRead = memo.readBy.some((r) => r.userId === CURRENT_USER_ID);
        if (alreadyRead) return memo;
        return {
          ...memo,
          readBy: [
            ...memo.readBy,
            {
              userId: CURRENT_USER_ID,
              userName: CURRENT_USER_NAME,
              readAt: new Date(),
            },
          ],
        };
      })
    );
    toast.success("Marked as read");
  };

  const handleCreateMemo = (newMemo: Omit<Memo, "id" | "createdAt" | "readBy">) => {
    const memo: Memo = {
      ...newMemo,
      id: `memo-${Date.now()}`,
      createdAt: new Date(),
      readBy: [],
    };
    setMemos((prev) => [memo, ...prev]);
    toast.success("Memo created successfully");
  };

  const handleEditMemo = (updatedMemo: Memo) => {
    setMemos((prev) =>
      prev.map((memo) => (memo.id === updatedMemo.id ? updatedMemo : memo))
    );
    toast.success("Memo updated successfully");
  };

  const handleDeleteMemo = (memoId: string) => {
    setMemos((prev) => prev.filter((memo) => memo.id !== memoId));
    toast.success("Memo deleted successfully");
  };

  // Count memos per category
  const getCategoryCount = (categoryId: string) => {
    if (categoryId === "all") return memos.length;
    return memos.filter((m) => m.categoryId === categoryId).length;
  };

  // Group memos by read status
  const memosByStatus = {
    all: filteredMemos,
    unread: filteredMemos.filter((m) => !m.readBy.some((r) => r.userId === CURRENT_USER_ID)),
    mandatory: filteredMemos.filter((m) => m.mandatoryRead),
    read: filteredMemos.filter((m) => m.readBy.some((r) => r.userId === CURRENT_USER_ID)),
  };

  // Count unread mandatory
  const unreadMandatoryCount = memos.filter(
    (m) => m.mandatoryRead && !m.readBy.some((r) => r.userId === CURRENT_USER_ID)
  ).length;

  return (
    <Layout>
      {/* Mobile Header */}
      <MobileHeader
        title="Memos & News"
        subtitle="Announcements & policies"
        actions={
          <Button variant="outline" size="icon" className="relative h-9 w-9 border-primary/30 bg-primary/5 hover:bg-primary/10">
            <Bell className="w-4 h-4 text-primary" />
            {unreadMandatoryCount > 0 && (
              <span className="absolute -top-1 -right-1 w-4 h-4 bg-destructive text-destructive-foreground text-xs rounded-full flex items-center justify-center">
                {unreadMandatoryCount}
              </span>
            )}
          </Button>
        }
      />

      {/* Mobile Sticky Controls */}
      <div className="md:hidden sticky top-[56px] z-10 bg-background border-b border-border">
        {/* Search and Add Row */}
        <div className="px-4 pt-3 pb-2 flex items-center gap-2">
          <div className="flex-1">
            <SearchInput
              value={searchQuery}
              onChange={setSearchQuery}
              placeholder="Search memos..."
              className="h-9 text-sm"
            />
          </div>
          <CreateMemoDialog categories={categories} onCreateMemo={handleCreateMemo}>
            <Button size="icon" className="h-9 w-9 shrink-0">
              <Plus className="w-4 h-4" />
            </Button>
          </CreateMemoDialog>
        </div>

        {/* Status Tabs */}
        <div className="px-4 pb-2">
          <SegmentedControl
            options={[
              { id: "all" as const, label: "All", badge: memosByStatus.all.length },
              { id: "unread" as const, label: "Unread", icon: Mail, badge: memosByStatus.unread.length },
              { id: "mandatory" as const, label: "Required", icon: AlertTriangle, badge: memosByStatus.mandatory.length },
            ]}
            value={activeTab}
            onChange={(val) => setActiveTab(val)}
            size="sm"
            fullWidth
          />
        </div>

        {/* Category Filter Row */}
        <div className="px-4 py-2 flex items-center gap-2">
          <Select value={activeCategory} onValueChange={setActiveCategory}>
            <SelectTrigger className="h-8 text-xs flex-1">
              <SelectValue placeholder="All Categories" />
            </SelectTrigger>
            <SelectContent>
              {categories.map((category) => (
                <SelectItem key={category.id} value={category.id} className="text-xs">
                  {category.name} ({getCategoryCount(category.id)})
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
          {unreadMandatoryCount > 0 && (
            <Badge variant="destructive" className="text-[10px] px-1.5 shrink-0">
              {unreadMandatoryCount} urgent
            </Badge>
          )}
        </div>
      </div>

      {/* Desktop Header */}
      <PageHeader
        title="Memos & News"
        subtitle="Stay updated with important announcements and policies"
        icon={Megaphone}
      />

      {/* Mobile Intro */}
      <div className="md:hidden px-4 pt-3">
        <PageIntro
          highlight="Keep the whole team in the loop."
          description="Publish memos, updates and announcements so every staff member sees what matters and when."
        />
      </div>

      {/* Desktop Content */}
      <div className="hidden md:block px-8 py-4 max-w-4xl mx-auto space-y-6">
        <PageIntro
          highlight="Keep the whole team in the loop."
          description="Publish memos, updates and announcements so every staff member sees what matters and when."
        />


        {/* Search + View toggle + Actions */}
        <div className="flex items-center justify-between gap-4">
          <SearchInput
            value={searchQuery}
            onChange={setSearchQuery}
            placeholder="Search memos..."
            className="flex-1 max-w-sm"
          />
          <div className="flex items-center gap-3">
            <SegmentedControl
              options={[
                { id: "list", label: "List", icon: List },
                { id: "cards", label: "Cards", icon: LayoutGrid },
              ]}
              value={displayMode}
              onChange={(mode) => setDisplayMode(mode as "list" | "cards")}
              size="sm"
            />
            <ExportDropdown
              onExportCSV={() => { exportMemosCSV(filteredMemos); toast.success("CSV exported"); }}
              onExportPDF={() => exportMemosPDF(filteredMemos)}
            />
          </div>
        </div>

        {/* Section label + Create */}
        <div className="flex items-center justify-between">
          <h3 className="text-[13px] font-semibold text-muted-foreground uppercase tracking-wide">
            Memos
            <span className="ml-2 text-[12px] font-normal">{filteredMemos.length} items</span>
          </h3>
          <CreateMemoDialog categories={categories} onCreateMemo={handleCreateMemo} />
        </div>

        {/* Status Tabs */}
        <SegmentedControl
          options={[
            { id: "all" as const, label: "All", badge: memosByStatus.all.length },
            { id: "unread" as const, label: "Unread", icon: Mail, badge: memosByStatus.unread.length },
            { id: "mandatory" as const, label: "Mandatory", icon: AlertTriangle, badge: memosByStatus.mandatory.length },
            { id: "read" as const, label: "Read", icon: MailOpen, badge: memosByStatus.read.length },
          ]}
          value={activeTab}
          onChange={(val) => setActiveTab(val)}
        />

        {/* Content */}
        {memosByStatus[activeTab as keyof typeof memosByStatus]?.length === 0 ? (
          <div className="text-center py-12 text-muted-foreground">
            <Newspaper className="w-12 h-12 mx-auto mb-4 opacity-50" />
            <p>No memos found</p>
          </div>
        ) : displayMode === "list" ? (
          <div className="space-y-3">
            {memosByStatus[activeTab as keyof typeof memosByStatus]?.map((memo) => (
              <MemoCard
                key={memo.id}
                memo={memo}
                currentUserId={CURRENT_USER_ID}
                onMarkAsRead={handleMarkAsRead}
                onEdit={setEditingMemo}
                onDelete={setDeletingMemo}
                onViewReadReport={setViewingReadReport}
              />
            ))}
          </div>
        ) : (
          <div className="grid gap-3 md:grid-cols-2 xl:grid-cols-3">
            {memosByStatus[activeTab as keyof typeof memosByStatus]?.map((memo) => (
              <MemoCard
                key={memo.id}
                memo={memo}
                currentUserId={CURRENT_USER_ID}
                onMarkAsRead={handleMarkAsRead}
                onEdit={setEditingMemo}
                onDelete={setDeletingMemo}
                onViewReadReport={setViewingReadReport}
              />
            ))}
          </div>
        )}
      </div>

      {/* Edit Dialog */}
      <EditMemoDialog
        memo={editingMemo}
        categories={categories}
        open={!!editingMemo}
        onOpenChange={(open) => !open && setEditingMemo(null)}
        onSave={handleEditMemo}
      />

      {/* Delete Dialog */}
      <DeleteMemoDialog
        memo={deletingMemo}
        open={!!deletingMemo}
        onOpenChange={(open) => !open && setDeletingMemo(null)}
        onConfirm={handleDeleteMemo}
      />

      {/* Read Report Dialog */}
      <MemoReadReportDialog
        memo={viewingReadReport}
        open={!!viewingReadReport}
        onOpenChange={(open) => !open && setViewingReadReport(null)}
      />
    </Layout>
  );
};

export default Memos;
