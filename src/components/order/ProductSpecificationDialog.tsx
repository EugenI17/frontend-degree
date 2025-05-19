
import { Button } from "@/components/ui/button";
import { Dialog, DialogContent, DialogFooter, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";

interface ProductSpecificationDialogProps {
  isOpen: boolean;
  onOpenChange: (isOpen: boolean) => void;
  extra: string;
  onExtraChange: (value: string) => void;
  fara: string;
  onFaraChange: (value: string) => void;
  specification: string;
  onSpecificationChange: (value: string) => void;
  onConfirm: () => void;
}

export const ProductSpecificationDialog = ({
  isOpen,
  onOpenChange,
  extra,
  onExtraChange,
  fara,
  onFaraChange,
  specification,
  onSpecificationChange,
  onConfirm,
}: ProductSpecificationDialogProps) => {
  return (
    <Dialog open={isOpen} onOpenChange={onOpenChange}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Add Item to Order</DialogTitle>
        </DialogHeader>
        <div className="space-y-4 py-4">
          <div className="space-y-2">
            <label className="text-sm font-medium">Extra</label>
            <Input 
              placeholder="Extra ingredients or modifications" 
              value={extra}
              onChange={(e) => onExtraChange(e.target.value)}
            />
          </div>
          <div className="space-y-2">
            <label className="text-sm font-medium">Without</label>
            <Input 
              placeholder="Items to exclude" 
              value={fara}
              onChange={(e) => onFaraChange(e.target.value)}
            />
          </div>
          <div className="space-y-2">
            <label className="text-sm font-medium">Special Instructions</label>
            <Textarea 
              placeholder="Any specific instructions" 
              value={specification}
              onChange={(e) => onSpecificationChange(e.target.value)}
            />
          </div>
        </div>
        <DialogFooter>
          <Button variant="outline" onClick={() => onOpenChange(false)}>
            Cancel
          </Button>
          <Button onClick={onConfirm}>
            Add to Order
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
};
