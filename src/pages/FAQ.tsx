import { useState } from "react";
import { AdminLayout } from "@/components/layout/AdminLayout";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { SearchInput } from "@/components/ui/SearchInput";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Plus, Edit2, Trash2, Globe, FileText, HelpCircle } from "lucide-react";
import { FAQ, FAQStatus } from "@/types/faq";
import { mockFaqs } from "@/data/mockFaqs";
import { mockDepartments } from "@/data/mockDepartments";
import { PageIntro } from "@/components/layout/PageIntro";
import { FAQ_PRACTICE_TIP } from "@/components/faq/faqPracticeTip";
import { toast } from "sonner";

const FAQPage = () => {
  // FAQ Manager page
  const [faqs, setFaqs] = useState<FAQ[]>(mockFaqs);
  const [searchQuery, setSearchQuery] = useState("");
  const [activeTab, setActiveTab] = useState("all");
  const [dialogOpen, setDialogOpen] = useState(false);
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
  const [editingFaq, setEditingFaq] = useState<FAQ | null>(null);
  const [deletingFaq, setDeletingFaq] = useState<FAQ | null>(null);
  const [form, setForm] = useState({ question: "", answer: "", department: "all", status: "draft" as FAQStatus });

  const departmentTabs = [
    { id: "all", label: "All" },
    ...mockDepartments.map(d => ({ id: d.id, label: d.name })),
  ];

  const filteredFaqs = faqs.filter(faq => {
    const matchesSearch = faq.question.toLowerCase().includes(searchQuery.toLowerCase()) || faq.answer.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesTab = activeTab === "all" || faq.department === activeTab;
    return matchesSearch && matchesTab;
  });

  const publishedCount = faqs.filter(f => f.status === "published").length;
  const draftCount = faqs.filter(f => f.status === "draft").length;

  const openCreate = () => {
    setEditingFaq(null);
    setForm({ question: "", answer: "", department: "all", status: "draft" });
    setDialogOpen(true);
  };

  const openEdit = (faq: FAQ) => {
    setEditingFaq(faq);
    setForm({ question: faq.question, answer: faq.answer, department: faq.department, status: faq.status });
    setDialogOpen(true);
  };

  const handleSave = () => {
    if (!form.question.trim() || !form.answer.trim()) {
      toast.error("Question and answer are required");
      return;
    }
    if (editingFaq) {
      setFaqs(prev => prev.map(f => f.id === editingFaq.id ? { ...f, ...form, updatedAt: new Date().toISOString().split("T")[0] } : f));
      toast.success("FAQ updated successfully");
    } else {
      const newFaq: FAQ = {
        id: `faq-${Date.now()}`,
        ...form,
        createdAt: new Date().toISOString().split("T")[0],
        updatedAt: new Date().toISOString().split("T")[0],
        createdBy: "Admin",
      };
      setFaqs(prev => [newFaq, ...prev]);
      toast.success("FAQ created successfully");
    }
    setDialogOpen(false);
  };

  const handlePublishToggle = (faq: FAQ) => {
    const newStatus: FAQStatus = faq.status === "published" ? "draft" : "published";
    setFaqs(prev => prev.map(f => f.id === faq.id ? { ...f, status: newStatus, updatedAt: new Date().toISOString().split("T")[0] } : f));
    toast.success(newStatus === "published" ? "FAQ published" : "FAQ unpublished");
  };

  const handleDelete = () => {
    if (!deletingFaq) return;
    setFaqs(prev => prev.filter(f => f.id !== deletingFaq.id));
    setDeleteDialogOpen(false);
    setDeletingFaq(null);
    toast.success("FAQ deleted");
  };

  const getDeptLabel = (id: string) => {
    if (id === "all") return "All Departments";
    return mockDepartments.find(d => d.id === id)?.name || id;
  };

  return (
    <AdminLayout>
      <div className="px-8 pt-8 pb-4 max-w-4xl mx-auto space-y-4">
        <div>
          <h1 className="text-xl font-semibold text-foreground">FAQ Manager</h1>
          <p className="text-sm text-muted-foreground">Create, publish, and manage frequently asked questions</p>
        </div>

        <PageIntro
          highlight="Answer questions once, help everyone forever."
          description="Publish clear, categorised FAQs so your team and patients find trusted answers instantly — without another repeat email or phone call."
        />

        {/* Summary */}
        <div className="grid grid-cols-3 gap-3">
          <Card className="border-border/40">
            <CardContent className="p-4 flex items-center gap-3">
              <div className="w-9 h-9 rounded-lg bg-primary/10 flex items-center justify-center">
                <HelpCircle className="w-4 h-4 text-primary" />
              </div>
              <div>
                <p className="text-xs text-muted-foreground">Total FAQs</p>
                <p className="text-lg font-semibold text-foreground">{faqs.length}</p>
              </div>
            </CardContent>
          </Card>
          <Card className="border-border/40">
            <CardContent className="p-4 flex items-center gap-3">
              <div className="w-9 h-9 rounded-lg bg-emerald-500/10 flex items-center justify-center">
                <Globe className="w-4 h-4 text-emerald-500" />
              </div>
              <div>
                <p className="text-xs text-muted-foreground">Published</p>
                <p className="text-lg font-semibold text-foreground">{publishedCount}</p>
              </div>
            </CardContent>
          </Card>
          <Card className="border-border/40">
            <CardContent className="p-4 flex items-center gap-3">
              <div className="w-9 h-9 rounded-lg bg-amber-500/10 flex items-center justify-center">
                <FileText className="w-4 h-4 text-amber-500" />
              </div>
              <div>
                <p className="text-xs text-muted-foreground">Drafts</p>
                <p className="text-lg font-semibold text-foreground">{draftCount}</p>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Search */}
        <SearchInput value={searchQuery} onChange={setSearchQuery} placeholder="Search FAQs..." className="max-w-sm" />

        {/* Tabs */}
        <Tabs value={activeTab} onValueChange={setActiveTab}>
          <TabsList className="flex flex-wrap h-auto gap-1 bg-muted/30 p-1">
            {departmentTabs.map(tab => (
              <TabsTrigger key={tab.id} value={tab.id} className="text-xs px-3 py-1.5">{tab.label}</TabsTrigger>
            ))}
          </TabsList>

          <TabsContent value={activeTab} className="mt-3">
            <Card className="border-border/40">
              <CardHeader className="pb-2 flex flex-row items-center justify-between">
                <CardTitle className="text-sm font-medium text-muted-foreground">{filteredFaqs.length} FAQ{filteredFaqs.length !== 1 ? "s" : ""}</CardTitle>
              </CardHeader>
              <CardContent className="p-0">
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Question</TableHead>
                      <TableHead className="w-[120px]">Department</TableHead>
                      <TableHead className="w-[90px]">Status</TableHead>
                      <TableHead className="w-[100px] text-right">Actions</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {filteredFaqs.length === 0 ? (
                      <TableRow>
                        <TableCell colSpan={4} className="text-center text-muted-foreground py-8">No FAQs found</TableCell>
                      </TableRow>
                    ) : (
                      filteredFaqs.map(faq => (
                        <TableRow key={faq.id}>
                          <TableCell>
                            <p className="font-medium text-sm text-foreground">{faq.question}</p>
                            <p className="text-xs text-muted-foreground line-clamp-1 mt-0.5">{faq.answer}</p>
                          </TableCell>
                          <TableCell>
                            <Badge variant="outline" className="text-[11px]">{getDeptLabel(faq.department)}</Badge>
                          </TableCell>
                          <TableCell>
                            <Badge
                              variant={faq.status === "published" ? "default" : "secondary"}
                              className="text-[11px] cursor-pointer"
                              onClick={() => handlePublishToggle(faq)}
                            >
                              {faq.status === "published" ? "Published" : "Draft"}
                            </Badge>
                          </TableCell>
                          <TableCell className="text-right">
                            <div className="flex items-center justify-end gap-1">
                              <Button variant="ghost" size="icon" className="h-7 w-7" onClick={() => openEdit(faq)}>
                                <Edit2 className="w-3.5 h-3.5" />
                              </Button>
                              <Button variant="ghost" size="icon" className="h-7 w-7 text-destructive hover:text-destructive" onClick={() => { setDeletingFaq(faq); setDeleteDialogOpen(true); }}>
                                <Trash2 className="w-3.5 h-3.5" />
                              </Button>
                            </div>
                          </TableCell>
                        </TableRow>
                      ))
                    )}
                  </TableBody>
                </Table>
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>

        {/* Add button */}
        <Button onClick={openCreate} className="w-full">
          <Plus className="w-4 h-4 mr-1" /> Add FAQ
        </Button>
      </div>

      {/* Create/Edit Dialog */}
      <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
        <DialogContent className="max-w-lg">
          <DialogHeader>
            <DialogTitle>{editingFaq ? "Edit FAQ" : "Create FAQ"}</DialogTitle>
          </DialogHeader>
          <div className="space-y-4">
            <div className="space-y-1.5">
              <Label>Question</Label>
              <Input value={form.question} onChange={e => setForm(f => ({ ...f, question: e.target.value }))} placeholder="Enter question..." />
            </div>
            <div className="space-y-1.5">
              <Label>Answer</Label>
              <Textarea value={form.answer} onChange={e => setForm(f => ({ ...f, answer: e.target.value }))} placeholder="Enter answer..." rows={4} />
            </div>
            <div className="grid grid-cols-2 gap-3">
              <div className="space-y-1.5">
                <Label>Department</Label>
                <Select value={form.department} onValueChange={v => setForm(f => ({ ...f, department: v }))}>
                  <SelectTrigger><SelectValue /></SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">All Departments</SelectItem>
                    {mockDepartments.map(d => (
                      <SelectItem key={d.id} value={d.id}>{d.name}</SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
              <div className="space-y-1.5">
                <Label>Status</Label>
                <Select value={form.status} onValueChange={v => setForm(f => ({ ...f, status: v as FAQStatus }))}>
                  <SelectTrigger><SelectValue /></SelectTrigger>
                  <SelectContent>
                    <SelectItem value="draft">Draft</SelectItem>
                    <SelectItem value="published">Published</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setDialogOpen(false)}>Cancel</Button>
            <Button onClick={handleSave}>{editingFaq ? "Save Changes" : "Create FAQ"}</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Delete Dialog */}
      <Dialog open={deleteDialogOpen} onOpenChange={setDeleteDialogOpen}>
        <DialogContent className="max-w-sm">
          <DialogHeader>
            <DialogTitle>Delete FAQ</DialogTitle>
          </DialogHeader>
          <p className="text-sm text-muted-foreground">Are you sure you want to delete this FAQ? This action cannot be undone.</p>
          <DialogFooter>
            <Button variant="outline" onClick={() => setDeleteDialogOpen(false)}>Cancel</Button>
            <Button variant="destructive" onClick={handleDelete}>Delete</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </AdminLayout>
  );
};

export default FAQPage;
