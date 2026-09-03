import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";
import { Memo } from "@/types/memos";

interface DeleteMemoDialogProps {
  memo: Memo | null;
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onConfirm: (memoId: string) => void;
}

export const DeleteMemoDialog = ({
  memo,
  open,
  onOpenChange,
  onConfirm,
}: DeleteMemoDialogProps) => {
  const handleConfirm = () => {
    if (memo) {
      onConfirm(memo.id);
      onOpenChange(false);
    }
  };

  return (
    <AlertDialog open={open} onOpenChange={onOpenChange}>
      <AlertDialogContent>
        <AlertDialogHeader>
          <AlertDialogTitle>Delete Memo</AlertDialogTitle>
          <AlertDialogDescription>
            Are you sure you want to delete "{memo?.title}"? This action cannot be undone.
          </AlertDialogDescription>
        </AlertDialogHeader>
        <AlertDialogFooter>
          <AlertDialogCancel>Cancel</AlertDialogCancel>
          <AlertDialogAction
            onClick={handleConfirm}
            className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
          >
            Delete
          </AlertDialogAction>
        </AlertDialogFooter>
      </AlertDialogContent>
    </AlertDialog>
  );
};
