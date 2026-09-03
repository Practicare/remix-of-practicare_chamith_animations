import { useState, useRef, KeyboardEvent } from "react";
import { Button } from "@/components/ui/button";
import { Sparkles, ArrowUp, Paperclip, X, Image as ImageIcon } from "lucide-react";
import { cn } from "@/lib/utils";

interface AIPromptInputProps {
  placeholder?: string;
  onSubmit: (prompt: string, files?: File[]) => void;
  isProcessing?: boolean;
  showAttachments?: boolean;
  acceptedFileTypes?: string;
  maxFiles?: number;
  className?: string;
  minHeight?: number;
  maxHeight?: number;
}

export function AIPromptInput({
  placeholder = "Describe what you want to do...",
  onSubmit,
  isProcessing = false,
  showAttachments = false,
  acceptedFileTypes = "image/*",
  maxFiles = 5,
  className,
  minHeight = 56,
  maxHeight = 200,
}: AIPromptInputProps) {
  const [prompt, setPrompt] = useState("");
  const [files, setFiles] = useState<File[]>([]);
  const [previews, setPreviews] = useState<string[]>([]);
  const [isFocused, setIsFocused] = useState(false);
  const textareaRef = useRef<HTMLTextAreaElement>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleSubmit = () => {
    if ((!prompt.trim() && files.length === 0) || isProcessing) return;
    onSubmit(prompt.trim(), files.length > 0 ? files : undefined);
    setPrompt("");
    setFiles([]);
    setPreviews([]);
    if (textareaRef.current) {
      textareaRef.current.style.height = `${minHeight}px`;
    }
  };

  const handleKeyDown = (e: KeyboardEvent<HTMLTextAreaElement>) => {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault();
      handleSubmit();
    }
  };

  const handleTextareaChange = (e: React.ChangeEvent<HTMLTextAreaElement>) => {
    setPrompt(e.target.value);
    
    // Auto-resize
    const textarea = e.target;
    textarea.style.height = `${minHeight}px`;
    const scrollHeight = textarea.scrollHeight;
    textarea.style.height = `${Math.min(scrollHeight, maxHeight)}px`;
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const selectedFiles = Array.from(e.target.files || []);
    if (selectedFiles.length === 0) return;
    
    const newFiles = [...files, ...selectedFiles].slice(0, maxFiles);
    setFiles(newFiles);
    
    // Generate previews for images
    const newPreviews: string[] = [];
    newFiles.forEach((file) => {
      if (file.type.startsWith("image/")) {
        const reader = new FileReader();
        reader.onload = (event) => {
          newPreviews.push(event.target?.result as string);
          if (newPreviews.length === newFiles.filter(f => f.type.startsWith("image/")).length) {
            setPreviews([...newPreviews]);
          }
        };
        reader.readAsDataURL(file);
      }
    });
    
    // Reset input
    e.target.value = "";
  };

  const removeFile = (index: number) => {
    const newFiles = files.filter((_, i) => i !== index);
    const newPreviews = previews.filter((_, i) => i !== index);
    setFiles(newFiles);
    setPreviews(newPreviews);
  };

  const canSubmit = (prompt.trim() || files.length > 0) && !isProcessing;

  return (
    <div className={cn("w-full", className)}>
      {/* File Previews */}
      {previews.length > 0 && (
        <div className="flex flex-wrap gap-2 mb-3">
          {previews.map((preview, index) => (
            <div
              key={index}
              className="relative w-16 h-16 rounded-lg overflow-hidden border border-border group"
            >
              <img
                src={preview}
                alt={`Preview ${index + 1}`}
                className="w-full h-full object-cover"
              />
              <button
                type="button"
                onClick={() => removeFile(index)}
                className="absolute inset-0 bg-background/80 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center"
              >
                <X className="w-4 h-4 text-muted-foreground" />
              </button>
            </div>
          ))}
        </div>
      )}

      {/* Input Container */}
      <div
        className={cn(
          "relative flex items-end gap-2 rounded-2xl border-2 bg-card transition-all duration-200",
          isFocused
            ? "border-primary shadow-lg shadow-primary/10"
            : "border-border hover:border-primary/50",
          isProcessing && "opacity-80"
        )}
      >
        {/* AI Sparkle Icon */}
        <div className="absolute left-4 top-4 pointer-events-none">
          <Sparkles className={cn(
            "w-5 h-5 transition-colors",
            isFocused ? "text-primary" : "text-muted-foreground"
          )} />
        </div>

        {/* Textarea */}
        <textarea
          ref={textareaRef}
          value={prompt}
          onChange={handleTextareaChange}
          onKeyDown={handleKeyDown}
          onFocus={() => setIsFocused(true)}
          onBlur={() => setIsFocused(false)}
          placeholder={placeholder}
          disabled={isProcessing}
          className={cn(
            "flex-1 resize-none bg-transparent py-4 pl-12 pr-4 text-foreground placeholder:text-muted-foreground focus:outline-none disabled:cursor-not-allowed",
            showAttachments ? "pr-24" : "pr-16"
          )}
          style={{ minHeight: `${minHeight}px`, maxHeight: `${maxHeight}px` }}
          rows={1}
        />

        {/* Action Buttons */}
        <div className="flex items-center gap-1 pr-2 pb-2">
          {showAttachments && (
            <>
              <input
                ref={fileInputRef}
                type="file"
                accept={acceptedFileTypes}
                multiple={maxFiles > 1}
                onChange={handleFileChange}
                className="hidden"
              />
              <Button
                type="button"
                variant="ghost"
                size="icon"
                className="h-10 w-10 rounded-xl text-muted-foreground hover:text-foreground"
                onClick={() => fileInputRef.current?.click()}
                disabled={isProcessing || files.length >= maxFiles}
              >
                <Paperclip className="w-5 h-5" />
              </Button>
            </>
          )}

          <Button
            type="button"
            size="icon"
            className={cn(
              "h-10 w-10 rounded-xl transition-all",
              canSubmit
                ? "bg-primary hover:bg-primary/90 text-primary-foreground"
                : "bg-muted text-muted-foreground"
            )}
            onClick={handleSubmit}
            disabled={!canSubmit}
          >
            {isProcessing ? (
              <div className="w-5 h-5 border-2 border-current border-t-transparent rounded-full animate-spin" />
            ) : (
              <ArrowUp className="w-5 h-5" />
            )}
          </Button>
        </div>
      </div>

      {/* Helper Text */}
      <p className="mt-2 text-xs text-muted-foreground text-center">
        Press Enter to submit, Shift + Enter for new line
      </p>
    </div>
  );
}
