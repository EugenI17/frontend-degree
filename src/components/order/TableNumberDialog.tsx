
import { Button } from "@/components/ui/button";
import { Dialog, DialogContent, DialogFooter, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";

interface TableNumberDialogProps {
  isOpen: boolean;
  onOpenChange: (isOpen: boolean) => void;
  currentTableNumber: string; // Renamed from tableNumber to avoid confusion
  tempTableNumber: string;
  onTempTableNumberChange: (value: string) => void;
  onConfirm: () => void;
}

export const TableNumberDialog = ({
  isOpen,
  onOpenChange,
  currentTableNumber,
  tempTableNumber,
  onTempTableNumberChange,
  onConfirm,
}: TableNumberDialogProps) => {
  return (
    <Dialog open={isOpen} onOpenChange={onOpenChange}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>{currentTableNumber ? "Change Table Number" : "Set Table Number"}</DialogTitle>
        </DialogHeader>
        <div className="py-4">
          <Input
            type="text"
            placeholder="Enter Table Number"
            value={tempTableNumber}
            onChange={(e) => onTempTableNumberChange(e.target.value)}
            autoFocus
          />
        </div>
        <DialogFooter>
          <Button variant="outline" onClick={() => onOpenChange(false)}>
            Cancel
          </Button>
          <Button onClick={onConfirm}>
            Confirm
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
};
