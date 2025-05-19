
import * as React from "react"
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover"
import { Button } from "@/components/ui/button"
import { Checkbox } from "@/components/ui/checkbox"
import { Label } from "@/components/ui/label"
import { ScrollArea } from "@/components/ui/scroll-area"
import { ChevronDown } from "lucide-react"

interface MultiSelectPopoverProps {
  options: string[];
  selectedValues: string[];
  onValueChange: (selected: string[]) => void;
  triggerPlaceholder: string;
  className?: string;
  triggerClassName?: string;
}

export const MultiSelectPopover: React.FC<MultiSelectPopoverProps> = ({
  options,
  selectedValues,
  onValueChange,
  triggerPlaceholder,
  className,
  triggerClassName,
}) => {
  const [isOpen, setIsOpen] = React.useState(false);

  const handleSelect = (value: string) => {
    const newSelectedValues = selectedValues.includes(value)
      ? selectedValues.filter((v) => v !== value)
      : [...selectedValues, value];
    onValueChange(newSelectedValues);
  };

  const displayValue = selectedValues.length > 0 
    ? `${selectedValues.length} selected` 
    : triggerPlaceholder;

  return (
    <Popover open={isOpen} onOpenChange={setIsOpen}>
      <PopoverTrigger asChild className={triggerClassName}>
        <Button
          variant="outline"
          role="combobox"
          aria-expanded={isOpen}
          className="w-full justify-between"
        >
          {displayValue}
          <ChevronDown className="ml-2 h-4 w-4 shrink-0 opacity-50" />
        </Button>
      </PopoverTrigger>
      <PopoverContent className={`w-[--radix-popover-trigger-width] p-0 ${className}`}>
        <ScrollArea className="max-h-60">
          <div className="p-2 space-y-1">
            {options.length > 0 ? (
              options.map((option) => (
                <div key={option} className="flex items-center space-x-2 p-1.5 rounded-md hover:bg-accent">
                  <Checkbox
                    id={`multi-select-${option}`}
                    checked={selectedValues.includes(option)}
                    onCheckedChange={() => handleSelect(option)}
                  />
                  <Label
                    htmlFor={`multi-select-${option}`}
                    className="text-sm font-normal flex-1 cursor-pointer"
                    onClick={(e) => { // Allow clicking label to toggle
                      e.preventDefault(); // prevent label's default behavior if any
                      handleSelect(option);
                    }}
                  >
                    {option}
                  </Label>
                </div>
              ))
            ) : (
              <div className="p-2 text-sm text-muted-foreground text-center">
                No options available.
              </div>
            )}
          </div>
        </ScrollArea>
      </PopoverContent>
    </Popover>
  );
};
