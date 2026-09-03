import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from "@/components/ui/dialog";
import { AlertTriangle, Package, Users, Shield, CheckCircle2 } from "lucide-react";
import { StockCategory } from "@/types/stock";

interface DeleteStockCategoryDialogProps {
  category: StockCategory | null;
  itemCount: number;
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onConfirm: (id: string) => void;
}

export function DeleteStockCategoryDialog({
  category,
  itemCount,
  open,
  onOpenChange,
  onConfirm,
}: DeleteStockCategoryDialogProps) {
  const [step, setStep] = useState<"warning" | "approval" | "approved">("warning");
  const [approverEmail, setApproverEmail] = useState("");
  const [approvalSent, setApprovalSent] = useState(false);

  const hasItems = itemCount > 0;

  const handleClose = () => {
    setStep("warning");
    setApproverEmail("");
    setApprovalSent(false);
    onOpenChange(false);
  };

  const handleRequestApproval = () => {
    if (!approverEmail.trim()) return;
    // Simulate sending approval request
    setApprovalSent(true);
    // In real implementation, this would send a notification to the approver
  };

  const handleSimulateApproval = () => {
    // For UI demo - simulate the other user approving
    setStep("approved");
  };

  const handleDelete = () => {
    if (!category) return;
    onConfirm(category.id);
    handleClose();
  };

  const handleProceedToApproval = () => {
    setStep("approval");
  };

  if (!category) return null;

  return (
    <Dialog open={open} onOpenChange={handleClose}>
      <DialogContent className="sm:max-w-[480px]">
        {step === "warning" && (
          <>
            <DialogHeader>
              <div className="flex items-center gap-3">
                <div className={`p-3 rounded-full ${hasItems ? "bg-destructive/10" : "bg-amber-100 dark:bg-amber-900/30"}`}>
                  <AlertTriangle className={`w-6 h-6 ${hasItems ? "text-destructive" : "text-amber-600 dark:text-amber-400"}`} />
                </div>
                <div>
                  <DialogTitle>Delete Category</DialogTitle>
                  <DialogDescription>
                    {hasItems 
                      ? "This category contains items that will be affected."
                      : "Are you sure you want to delete this category?"
                    }
                  </DialogDescription>
                </div>
              </div>
            </DialogHeader>

            <div className="py-4 space-y-4">
              {/* Category Info */}
              <div className="flex items-center gap-3 p-4 bg-muted/50 rounded-lg border border-border">
                <div className="p-2 rounded-lg bg-background">
                  <Package className="w-5 h-5 text-muted-foreground" />
                </div>
                <div className="flex-1">
                  <p className="font-medium">{category.name}</p>
                  <p className="text-sm text-muted-foreground">{category.description}</p>
                </div>
              </div>

              {/* Warning for items */}
              {hasItems && (
                <div className="p-4 bg-destructive/5 border border-destructive/20 rounded-lg">
                  <div className="flex items-start gap-3">
                    <AlertTriangle className="w-5 h-5 text-destructive mt-0.5" />
                    <div>
                      <p className="font-medium text-destructive">
                        {itemCount} item{itemCount !== 1 ? 's' : ''} in this category
                      </p>
                      <p className="text-sm text-muted-foreground mt-1">
                        Deleting this category will move all items to "Uncategorized" or they will need to be reassigned.
                      </p>
                    </div>
                  </div>
                </div>
              )}

              {/* Approval requirement notice */}
              <div className="p-4 bg-primary/5 border border-primary/20 rounded-lg">
                <div className="flex items-start gap-3">
                  <Shield className="w-5 h-5 text-primary mt-0.5" />
                  <div>
                    <p className="font-medium text-foreground">Approval Required</p>
                    <p className="text-sm text-muted-foreground mt-1">
                      Deleting a category requires confirmation from another authorized user for security purposes.
                    </p>
                  </div>
                </div>
              </div>
            </div>

            <DialogFooter>
              <Button variant="outline" onClick={handleClose}>
                Cancel
              </Button>
              <Button 
                variant="destructive" 
                onClick={handleProceedToApproval}
              >
                Continue to Approval
              </Button>
            </DialogFooter>
          </>
        )}

        {step === "approval" && (
          <>
            <DialogHeader>
              <div className="flex items-center gap-3">
                <div className="p-3 rounded-full bg-primary/10">
                  <Users className="w-6 h-6 text-primary" />
                </div>
                <div>
                  <DialogTitle>Request Approval</DialogTitle>
                  <DialogDescription>
                    Send a deletion request to another user for confirmation.
                  </DialogDescription>
                </div>
              </div>
            </DialogHeader>

            <div className="py-4 space-y-4">
              {/* Category being deleted */}
              <div className="flex items-center gap-3 p-3 bg-muted/50 rounded-lg border border-border">
                <Package className="w-4 h-4 text-muted-foreground" />
                <span className="text-sm">
                  Requesting to delete: <strong>{category.name}</strong>
                  {hasItems && (
                    <span className="text-destructive ml-2">({itemCount} items)</span>
                  )}
                </span>
              </div>

              {!approvalSent ? (
                <div className="space-y-3">
                  <div className="space-y-2">
                    <Label htmlFor="approverEmail">Approver's Email *</Label>
                    <Input
                      id="approverEmail"
                      type="email"
                      placeholder="Enter approver's email address"
                      value={approverEmail}
                      onChange={(e) => setApproverEmail(e.target.value)}
                    />
                    <p className="text-xs text-muted-foreground">
                      The approver will receive a notification to confirm this deletion.
                    </p>
                  </div>
                </div>
              ) : (
                <div className="space-y-4">
                  <div className="p-4 bg-emerald-50 dark:bg-emerald-900/20 border border-emerald-200 dark:border-emerald-800 rounded-lg">
                    <div className="flex items-center gap-3">
                      <CheckCircle2 className="w-5 h-5 text-emerald-600 dark:text-emerald-400" />
                      <div>
                        <p className="font-medium text-emerald-700 dark:text-emerald-300">
                          Approval Request Sent
                        </p>
                        <p className="text-sm text-emerald-600 dark:text-emerald-400">
                          Waiting for {approverEmail} to confirm...
                        </p>
                      </div>
                    </div>
                  </div>

                  {/* Pending approval UI */}
                  <div className="p-4 border border-dashed border-border rounded-lg">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-3">
                        <div className="w-8 h-8 rounded-full bg-muted flex items-center justify-center">
                          <Users className="w-4 h-4 text-muted-foreground" />
                        </div>
                        <div>
                          <p className="text-sm font-medium">{approverEmail}</p>
                          <p className="text-xs text-muted-foreground">Pending approval</p>
                        </div>
                      </div>
                      <div className="flex items-center gap-2">
                        <span className="inline-flex items-center px-2 py-1 rounded-full text-xs font-medium bg-amber-100 text-amber-800 dark:bg-amber-900/30 dark:text-amber-300">
                          <span className="w-1.5 h-1.5 rounded-full bg-amber-500 mr-1.5 animate-pulse"></span>
                          Pending
                        </span>
                      </div>
                    </div>
                  </div>

                  {/* Demo button to simulate approval */}
                  <div className="pt-2 border-t border-border">
                    <p className="text-xs text-muted-foreground mb-2">
                      For demo purposes:
                    </p>
                    <Button 
                      variant="outline" 
                      size="sm" 
                      className="w-full"
                      onClick={handleSimulateApproval}
                    >
                      Simulate Approver Confirmation
                    </Button>
                  </div>
                </div>
              )}
            </div>

            <DialogFooter>
              <Button variant="outline" onClick={handleClose}>
                Cancel
              </Button>
              {!approvalSent && (
                <Button 
                  onClick={handleRequestApproval}
                  disabled={!approverEmail.trim()}
                >
                  Send Approval Request
                </Button>
              )}
            </DialogFooter>
          </>
        )}

        {step === "approved" && (
          <>
            <DialogHeader>
              <div className="flex items-center gap-3">
                <div className="p-3 rounded-full bg-emerald-100 dark:bg-emerald-900/30">
                  <CheckCircle2 className="w-6 h-6 text-emerald-600 dark:text-emerald-400" />
                </div>
                <div>
                  <DialogTitle>Deletion Approved</DialogTitle>
                  <DialogDescription>
                    The deletion has been approved. You can now proceed.
                  </DialogDescription>
                </div>
              </div>
            </DialogHeader>

            <div className="py-4 space-y-4">
              {/* Approval confirmation */}
              <div className="p-4 bg-emerald-50 dark:bg-emerald-900/20 border border-emerald-200 dark:border-emerald-800 rounded-lg">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <div className="w-8 h-8 rounded-full bg-emerald-100 dark:bg-emerald-800 flex items-center justify-center">
                      <CheckCircle2 className="w-4 h-4 text-emerald-600 dark:text-emerald-400" />
                    </div>
                    <div>
                      <p className="text-sm font-medium text-emerald-700 dark:text-emerald-300">
                        {approverEmail}
                      </p>
                      <p className="text-xs text-emerald-600 dark:text-emerald-400">
                        Approved just now
                      </p>
                    </div>
                  </div>
                  <span className="inline-flex items-center px-2 py-1 rounded-full text-xs font-medium bg-emerald-100 text-emerald-800 dark:bg-emerald-900/50 dark:text-emerald-300">
                    Approved
                  </span>
                </div>
              </div>

              {/* Final warning */}
              <div className="p-4 bg-destructive/5 border border-destructive/20 rounded-lg">
                <p className="text-sm text-muted-foreground">
                  Clicking "Delete Category" will permanently remove <strong>{category.name}</strong>
                  {hasItems && ` and affect ${itemCount} item${itemCount !== 1 ? 's' : ''}`}.
                  This action cannot be undone.
                </p>
              </div>
            </div>

            <DialogFooter>
              <Button variant="outline" onClick={handleClose}>
                Cancel
              </Button>
              <Button variant="destructive" onClick={handleDelete}>
                Delete Category
              </Button>
            </DialogFooter>
          </>
        )}
      </DialogContent>
    </Dialog>
  );
}
