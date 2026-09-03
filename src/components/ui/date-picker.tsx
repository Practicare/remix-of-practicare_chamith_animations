import * as React from "react";
import { format, isValid, parse } from "date-fns";
import { CalendarIcon } from "lucide-react";
import { cn } from "@/lib/utils";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Calendar } from "@/components/ui/calendar";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";

const ISO = "yyyy-MM-dd";
const DISPLAY = "dd/MM/yyyy";
const ACCEPTED = ["dd/MM/yyyy", "d/M/yyyy", "yyyy-MM-dd", "d-M-yyyy", "d MMM yyyy"];

function toDate(value?: string): Date | undefined {
  if (!value) return undefined;
  const d = new Date(value);
  return isValid(d) ? d : undefined;
}

function parseText(text: string): Date | undefined {
  const t = text.trim();
  if (!t) return undefined;
  for (const f of ACCEPTED) {
    const d = parse(t, f, new Date());
    if (isValid(d)) return d;
  }
  return undefined;
}

interface DatePickerInputProps {
  /** ISO date string (yyyy-MM-dd) or empty/undefined */
  value?: string;
  onChange: (value: string | undefined) => void;
  placeholder?: string;
  className?: string;
  disabled?: boolean;
}

/**
 * App-standard date field: typeable input (dd/MM/yyyy) with a calendar
 * popover. Value is stored as an ISO yyyy-MM-dd string.
 */
export function DatePickerInput({ value, onChange, placeholder = "dd/mm/yyyy", className, disabled }: DatePickerInputProps) {
  const selected = toDate(value);
  const [open, setOpen] = React.useState(false);
  const [text, setText] = React.useState(selected ? format(selected, DISPLAY) : "");

  // Keep text in sync when the value changes externally (or from calendar)
  React.useEffect(() => {
    const d = toDate(value);
    setText(d ? format(d, DISPLAY) : "");
  }, [value]);

  const commitText = () => {
    const t = text.trim();
    if (!t) {
      onChange(undefined);
      return;
    }
    const d = parseText(t);
    if (d) {
      onChange(format(d, ISO));
    } else {
      // Revert to the last valid value
      const cur = toDate(value);
      setText(cur ? format(cur, DISPLAY) : "");
    }
  };

  return (
    <div className={cn("relative", className)}>
      <Input
        value={text}
        disabled={disabled}
        placeholder={placeholder}
        className="h-8 rounded-lg pr-8 text-sm"
        onChange={(e) => setText(e.target.value)}
        onBlur={commitText}
        onKeyDown={(e) => {
          if (e.key === "Enter") {
            e.preventDefault();
            commitText();
          }
        }}
      />
      <Popover open={open} onOpenChange={setOpen}>
        <PopoverTrigger asChild>
          <Button
            type="button"
            variant="ghost"
            size="icon"
            disabled={disabled}
            className="absolute right-0.5 top-1/2 h-7 w-7 -translate-y-1/2 rounded-lg text-muted-foreground"
            title="Pick a date"
          >
            <CalendarIcon className="h-3.5 w-3.5" />
          </Button>
        </PopoverTrigger>
        <PopoverContent className="w-auto p-0" align="end">
          <Calendar
            mode="single"
            selected={selected}
            onSelect={(d) => {
              onChange(d ? format(d, ISO) : undefined);
              setOpen(false);
            }}
            initialFocus
            className={cn("pointer-events-auto p-3")}
          />
        </PopoverContent>
      </Popover>
    </div>
  );
}
