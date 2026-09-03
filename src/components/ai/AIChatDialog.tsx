import { useState, useRef, useEffect } from "react";
import { APP_BRAND } from "@/config/branding";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { Badge } from "@/components/ui/badge";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Sparkles, Send, Mic, MicOff, Paperclip, X, Bot, User, Loader2, MessageSquare, Lightbulb, Gift, Copy, Check, Star, Mail, Share2 } from "lucide-react";
import { useSpeechRecognition } from "@/hooks/useSpeechRecognition";
import { useToast } from "@/hooks/use-toast";
import { cn } from "@/lib/utils";

type TabKey = "chat" | "feature" | "feedback" | "refer";

const REFERRAL_CODE = "PRACTI-10OFF";
const REFERRAL_URL = `https://practicare.app/r/${REFERRAL_CODE}`;


interface Message {
  id: string;
  role: "user" | "assistant";
  content: string;
  attachments?: { name: string; type: string; url?: string }[];
  timestamp: Date;
}

interface AIChatDialogProps {
  pageContext: string;
  pageTitle: string;
  triggerClassName?: string;
  trigger?: React.ReactNode;
  open?: boolean;
  onOpenChange?: (open: boolean) => void;
}

export function AIChatDialog({
  pageContext,
  pageTitle,
  triggerClassName,
  trigger,
  open: controlledOpen,
  onOpenChange,
}: AIChatDialogProps) {
  const [internalOpen, setInternalOpen] = useState(false);
  const open = controlledOpen ?? internalOpen;
  const setOpen = (value: boolean) => {
    setInternalOpen(value);
    onOpenChange?.(value);
  };
  const [tab, setTab] = useState<TabKey>("chat");
  const [messages, setMessages] = useState<Message[]>([]);
  const [input, setInput] = useState("");
  const [isProcessing, setIsProcessing] = useState(false);
  const [attachments, setAttachments] = useState<File[]>([]);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const scrollRef = useRef<HTMLDivElement>(null);
  const textareaRef = useRef<HTMLTextAreaElement>(null);
  const { toast } = useToast();

  
  const {
    isListening,
    transcript,
    interimTranscript,
    startListening,
    stopListening,
    resetTranscript,
    isSupported: isSpeechSupported,
  } = useSpeechRecognition({ continuous: true });

  // Update input when transcript changes
  useEffect(() => {
    if (transcript) {
      setInput(prev => prev + transcript);
      resetTranscript();
    }
  }, [transcript, resetTranscript]);

  // Auto-scroll to bottom when new messages arrive
  useEffect(() => {
    if (scrollRef.current) {
      scrollRef.current.scrollTop = scrollRef.current.scrollHeight;
    }
  }, [messages]);

  // Auto-resize textarea
  useEffect(() => {
    if (textareaRef.current) {
      textareaRef.current.style.height = "auto";
      textareaRef.current.style.height = Math.min(textareaRef.current.scrollHeight, 120) + "px";
    }
  }, [input]);

  // Add welcome message when dialog opens
  useEffect(() => {
    if (open && messages.length === 0) {
      setMessages([
        {
          id: "welcome",
          role: "assistant",
          content: `Hi! I'm your AI assistant for ${pageTitle}. I can help you with tasks, answer questions, and provide guidance. How can I assist you today?`,
          timestamp: new Date(),
        },
      ]);
    }
  }, [open, pageTitle, messages.length]);

  const handleFileSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = Array.from(e.target.files || []);
    setAttachments(prev => [...prev, ...files].slice(0, 5)); // Max 5 files
  };

  const removeAttachment = (index: number) => {
    setAttachments(prev => prev.filter((_, i) => i !== index));
  };

  const handleSubmit = async () => {
    if (!input.trim() && attachments.length === 0) return;
    if (isProcessing) return;

    const userMessage: Message = {
      id: `user-${Date.now()}`,
      role: "user",
      content: input.trim(),
      attachments: attachments.map(f => ({ name: f.name, type: f.type })),
      timestamp: new Date(),
    };

    setMessages(prev => [...prev, userMessage]);
    setInput("");
    setAttachments([]);
    setIsProcessing(true);

    // Simulate AI response (since we don't have a backend)
    setTimeout(() => {
      const responses = getContextualResponse(input, pageContext);
      const assistantMessage: Message = {
        id: `assistant-${Date.now()}`,
        role: "assistant",
        content: responses,
        timestamp: new Date(),
      };
      setMessages(prev => [...prev, assistantMessage]);
      setIsProcessing(false);
    }, 1000 + Math.random() * 1000);
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault();
      handleSubmit();
    }
  };

  const toggleListening = () => {
    if (isListening) {
      stopListening();
    } else {
      startListening();
    }
  };

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        {trigger ?? (
          <Button
            className={cn(
              "gap-2 bg-primary hover:bg-primary/90 text-primary-foreground",
              triggerClassName
            )}
            size="sm"
          >
            <Sparkles className="w-4 h-4" />
            AI Assistant
          </Button>
        )}
      </DialogTrigger>
      <DialogContent className="max-w-2xl h-[80vh] flex flex-col p-0 overflow-hidden border-0 shadow-2xl animate-scale-in [&>button]:hidden">
        {/* Branded Header with Gradient */}
        <DialogHeader className="px-6 py-5 bg-gradient-to-r from-primary via-[hsl(190_65%_40%)] to-primary border-b-0 relative overflow-hidden">
          {/* Subtle pattern overlay */}
          <div className="absolute inset-0 opacity-10">
            <div className="absolute inset-0 bg-[radial-gradient(circle_at_30%_50%,white_1px,transparent_1px)] bg-[length:20px_20px]" />
          </div>
          
          {/* Custom Close Button */}
          <button
            onClick={() => setOpen(false)}
            className="absolute top-4 right-4 z-20 p-2 rounded-lg bg-white/20 hover:bg-white/30 backdrop-blur-sm transition-colors"
          >
            <X className="w-5 h-5 text-white" />
          </button>
          
          <DialogTitle className="flex items-center gap-3 relative z-10">
            <div className="p-2.5 rounded-xl bg-white/20 backdrop-blur-sm shadow-lg animate-bounce-subtle">
              <Sparkles className="w-6 h-6 text-white" />
            </div>
            <div className="text-white">
              <span className="text-lg font-semibold">AI Assistant</span>
              <p className="text-sm font-normal text-white/80">
                {pageTitle} Helper
              </p>
            </div>
          </DialogTitle>
        </DialogHeader>

        {/* Tabs */}
        <div className="flex border-b bg-card shrink-0">
          {([
            { id: "chat", label: "Chat", icon: Sparkles },
            { id: "feature", label: "Feature Request", icon: Lightbulb },
            { id: "feedback", label: "Feedback", icon: MessageSquare },
            { id: "refer", label: "Refer & Earn", icon: Gift },
          ] as { id: TabKey; label: string; icon: typeof Sparkles }[]).map((t) => {
            const Icon = t.icon;
            const active = tab === t.id;
            return (
              <button
                key={t.id}
                onClick={() => setTab(t.id)}
                className={cn(
                  "flex-1 flex items-center justify-center gap-1.5 px-3 py-2.5 text-xs font-medium border-b-2 transition-colors",
                  active
                    ? "border-primary text-primary bg-primary/5"
                    : "border-transparent text-muted-foreground hover:text-foreground hover:bg-muted/50"
                )}
              >
                <Icon className="w-3.5 h-3.5" />
                <span className="hidden sm:inline">{t.label}</span>
              </button>
            );
          })}
        </div>

        {tab === "chat" && (
        <>
        {/* Messages Area with gradient background */}
        <ScrollArea className="flex-1 bg-gradient-to-b from-background to-muted/30" ref={scrollRef}>
          <div className="px-6 py-6 space-y-4">
            {messages.map((message, index) => (
              <div
                key={message.id}
                className={cn(
                  "flex gap-3 animate-fade-up",
                  message.role === "user" ? "justify-end" : "justify-start"
                )}
                style={{ animationDelay: `${index * 50}ms` }}
              >
                {message.role === "assistant" && (
                  <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-primary/20 to-primary/10 flex items-center justify-center flex-shrink-0 shadow-sm border border-primary/10">
                    <Bot className="w-5 h-5 text-primary" />
                  </div>
                )}
                <div
                  className={cn(
                    "max-w-[80%] rounded-2xl px-4 py-3 shadow-sm",
                    message.role === "user"
                      ? "bg-gradient-to-r from-primary to-[hsl(190_65%_40%)] text-white rounded-tr-sm"
                      : "bg-card border border-border rounded-tl-sm"
                  )}
                >
                  <p className="text-sm whitespace-pre-wrap leading-relaxed">{message.content}</p>
                  {message.attachments && message.attachments.length > 0 && (
                    <div className="mt-2 flex flex-wrap gap-1">
                      {message.attachments.map((att, i) => (
                        <span
                          key={i}
                          className="text-xs px-2 py-1 rounded-lg bg-white/20 backdrop-blur-sm"
                        >
                          📎 {att.name}
                        </span>
                      ))}
                    </div>
                  )}
                </div>
                {message.role === "user" && (
                  <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-secondary to-muted flex items-center justify-center flex-shrink-0 shadow-sm border border-border">
                    <User className="w-5 h-5 text-muted-foreground" />
                  </div>
                )}
              </div>
            ))}
            {isProcessing && (
              <div className="flex gap-3 justify-start animate-fade-up">
                <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-primary/20 to-primary/10 flex items-center justify-center flex-shrink-0 shadow-sm border border-primary/10">
                  <Bot className="w-5 h-5 text-primary" />
                </div>
                <div className="bg-card border border-border rounded-2xl rounded-tl-sm px-5 py-4 shadow-sm">
                  <div className="flex items-center gap-1.5">
                    <div className="w-2 h-2 rounded-full bg-primary animate-bounce" style={{ animationDelay: '0ms' }} />
                    <div className="w-2 h-2 rounded-full bg-primary animate-bounce" style={{ animationDelay: '150ms' }} />
                    <div className="w-2 h-2 rounded-full bg-primary animate-bounce" style={{ animationDelay: '300ms' }} />
                  </div>
                </div>
              </div>
            )}
          </div>
        </ScrollArea>

        {/* Input Area with refined styling */}
        <div className="border-t bg-card p-4 space-y-3">
          {/* Attachments Preview */}
          {attachments.length > 0 && (
            <div className="flex flex-wrap gap-2 animate-fade-in">
              {attachments.map((file, index) => (
                <div
                  key={index}
                  className="flex items-center gap-2 px-3 py-2 bg-muted/80 rounded-xl text-sm border border-border/50"
                >
                  <Paperclip className="w-3.5 h-3.5 text-primary" />
                  <span className="truncate max-w-[150px] font-medium">{file.name}</span>
                  <button
                    onClick={() => removeAttachment(index)}
                    className="text-muted-foreground hover:text-destructive transition-colors"
                  >
                    <X className="w-3.5 h-3.5" />
                  </button>
                </div>
              ))}
            </div>
          )}

          {/* Listening indicator */}
          {isListening && (
            <div className="flex items-center gap-3 text-sm px-3 py-2 bg-primary/5 rounded-xl border border-primary/20 animate-fade-in">
              <div className="relative">
                <div className="w-3 h-3 rounded-full bg-primary" />
                <div className="absolute inset-0 w-3 h-3 rounded-full bg-primary animate-ping" />
              </div>
              <span className="text-primary font-medium">Listening...</span>
              {interimTranscript && <span className="text-muted-foreground italic">"{interimTranscript}"</span>}
            </div>
          )}

          {/* Input Row */}
          <div className="flex items-end gap-2">
            <input
              type="file"
              ref={fileInputRef}
              onChange={handleFileSelect}
              className="hidden"
              multiple
              accept="image/*,.pdf,.doc,.docx,.txt"
            />
            <Button
              variant="ghost"
              size="icon"
              onClick={() => fileInputRef.current?.click()}
              className="flex-shrink-0 rounded-xl hover:bg-primary/10 hover:text-primary transition-colors"
            >
              <Paperclip className="w-5 h-5" />
            </Button>
            
            {isSpeechSupported && (
              <Button
                variant={isListening ? "default" : "ghost"}
                size="icon"
                onClick={toggleListening}
                className={cn(
                  "flex-shrink-0 rounded-xl transition-all",
                  isListening 
                    ? "bg-primary text-white shadow-lg shadow-primary/30" 
                    : "hover:bg-primary/10 hover:text-primary"
                )}
              >
                {isListening ? <MicOff className="w-5 h-5" /> : <Mic className="w-5 h-5" />}
              </Button>
            )}

            <div className="flex-1 relative">
              <textarea
                ref={textareaRef}
                value={input}
                onChange={(e) => setInput(e.target.value)}
                onKeyDown={handleKeyDown}
                placeholder="Type your message or use voice..."
                className="w-full resize-none rounded-xl border border-border bg-background px-4 py-3 text-sm focus:outline-none focus:ring-2 focus:ring-primary/30 focus:border-primary/50 min-h-[48px] max-h-[120px] transition-all"
                rows={1}
              />
            </div>

            <Button
              onClick={handleSubmit}
              disabled={(!input.trim() && attachments.length === 0) || isProcessing}
              className="flex-shrink-0 rounded-xl bg-gradient-to-r from-primary to-[hsl(190_65%_40%)] hover:opacity-90 shadow-lg shadow-primary/20 transition-all disabled:opacity-50"
            >
              <Send className="w-5 h-5" />
            </Button>
          </div>
          
          {/* Powered by badge */}
          <div className="flex justify-center pt-1">
            <span className="text-xs text-muted-foreground/60">
              Powered by <span className="font-medium text-primary/60">{APP_BRAND.aiName}</span>
            </span>
          </div>
        </div>
        </>
        )}

        {tab === "feature" && (
          <FeatureRequestPanel onDone={() => { setTab("chat"); toast({ title: "Thanks!", description: "Your feature request has been submitted." }); }} />
        )}
        {tab === "feedback" && (
          <FeedbackPanel onDone={() => { setTab("chat"); toast({ title: "Thanks for your feedback!" }); }} />
        )}
        {tab === "refer" && (
          <ReferPanel toast={toast} />
        )}
      </DialogContent>
    </Dialog>
  );
}

// Helper function to generate contextual responses
function getContextualResponse(input: string, context: string): string {
  const lowerInput = input.toLowerCase();
  
  const responses: Record<string, string[]> = {
    staff: [
      "I can help you manage your team more effectively. You can add new staff members, organize them by department, and track invitation statuses.",
      "To add a new staff member, click the 'Add Staff' button. You can assign them to departments and set their roles.",
      "Would you like me to explain how to use the department filters or the different view modes (Grid, List, Board)?",
    ],
    tasks: [
      "Tasks are great for one-off work items. You can organize them by department and assign them to team members.",
      "I notice you're looking at tasks. Would you like to create a new task, or shall I explain how to use the filtering options?",
      "For recurring work, consider using Checklists instead. They're designed for repeated processes.",
    ],
    checklists: [
      "Checklists are perfect for recurring tasks that need to be completed regularly, like daily opening procedures or weekly audits.",
      "You can create checklists manually or use AI to generate them from a description. Would you like me to help you create one?",
      "Each checklist item can be a simple tick, a yes/no question, or require a number input. Which type would work best for you?",
    ],
    compliance: [
      "Compliance tracking helps you stay on top of certifications, licenses, and other regulatory requirements.",
      "I can help you set up reminders for expiring documents. Items expiring within 30 days are marked as 'Expiring'.",
      "Would you like to add a new compliance item or learn how to organize them by category?",
    ],
    stock: [
      "Stock management helps you track inventory, monitor expiry dates, and maintain optimal stock levels.",
      "You can add items using the AI scanner feature - just upload an image of your stock and I'll help detect the items.",
      "Items are automatically categorized by expiry status: Valid, Expiring (within 30 days), or Expired.",
    ],
    memos: [
      "Memos & News is your internal communication hub. Share updates, announcements, and important information with your team.",
      "You can mark memos as mandatory to ensure everyone reads them. The system tracks who has read each memo.",
      "Would you like to create a new memo or filter existing ones by category?",
    ],
  };

  const contextResponses = responses[context] || [
    "I'm here to help! Let me know what you'd like to accomplish.",
    "Feel free to ask me anything about this page or how to complete specific tasks.",
  ];

  // Check for common queries
  if (lowerInput.includes("how") || lowerInput.includes("what")) {
    return contextResponses[Math.floor(Math.random() * contextResponses.length)];
  }
  
  if (lowerInput.includes("help") || lowerInput.includes("assist")) {
    return `Of course! ${contextResponses[0]}`;
  }

  if (lowerInput.includes("create") || lowerInput.includes("add") || lowerInput.includes("new")) {
    return `To create something new, look for the primary action button in the top area of the page. ${contextResponses[1]}`;
  }

  // Default response
  return contextResponses[Math.floor(Math.random() * contextResponses.length)];
}

// ---------- Tab panels ----------

function FeatureRequestPanel({ onDone }: { onDone: () => void }) {
  const [title, setTitle] = useState("");
  const [category, setCategory] = useState("");
  const [priority, setPriority] = useState("");
  const [description, setDescription] = useState("");

  const canSubmit = title.trim() && description.trim();

  return (
    <div className="flex-1 overflow-y-auto p-6 space-y-4 bg-gradient-to-b from-background to-muted/30">
      <div className="flex items-start gap-3 p-3 rounded-lg bg-primary/5 border border-primary/15">
        <Lightbulb className="w-5 h-5 text-primary shrink-0 mt-0.5" />
        <div>
          <p className="text-sm font-medium">Suggest a new feature</p>
          <p className="text-xs text-muted-foreground">Help shape the product roadmap.</p>
        </div>
      </div>

      <div className="space-y-2">
        <Label htmlFor="fr-title">Title *</Label>
        <Input id="fr-title" placeholder="Brief summary" value={title} onChange={(e) => setTitle(e.target.value)} />
      </div>

      <div className="grid grid-cols-2 gap-3">
        <div className="space-y-2">
          <Label>Category</Label>
          <Select value={category} onValueChange={setCategory}>
            <SelectTrigger><SelectValue placeholder="Select" /></SelectTrigger>
            <SelectContent>
              <SelectItem value="new-feature">New Feature</SelectItem>
              <SelectItem value="improvement">Improvement</SelectItem>
              <SelectItem value="bug-fix">Bug Fix</SelectItem>
              <SelectItem value="integration">Integration</SelectItem>
              <SelectItem value="other">Other</SelectItem>
            </SelectContent>
          </Select>
        </div>
        <div className="space-y-2">
          <Label>Priority</Label>
          <Select value={priority} onValueChange={setPriority}>
            <SelectTrigger><SelectValue placeholder="Select" /></SelectTrigger>
            <SelectContent>
              <SelectItem value="low">Low</SelectItem>
              <SelectItem value="medium">Medium</SelectItem>
              <SelectItem value="high">High</SelectItem>
            </SelectContent>
          </Select>
        </div>
      </div>

      <div className="space-y-2">
        <Label htmlFor="fr-desc">Description *</Label>
        <Textarea id="fr-desc" rows={5} placeholder="Describe the problem it solves and how it should work..." value={description} onChange={(e) => setDescription(e.target.value)} />
      </div>

      <div className="flex justify-end pt-2">
        <Button onClick={onDone} disabled={!canSubmit} className="gap-2">
          <Send className="w-4 h-4" />
          Submit Request
        </Button>
      </div>
    </div>
  );
}

function FeedbackPanel({ onDone }: { onDone: () => void }) {
  const [rating, setRating] = useState(0);
  const [hover, setHover] = useState(0);
  const [feedback, setFeedback] = useState("");

  return (
    <div className="flex-1 overflow-y-auto p-6 space-y-4 bg-gradient-to-b from-background to-muted/30">
      <div className="flex items-start gap-3 p-3 rounded-lg bg-blue-500/5 border border-blue-500/15">
        <MessageSquare className="w-5 h-5 text-blue-500 shrink-0 mt-0.5" />
        <div>
          <p className="text-sm font-medium">Share your experience</p>
          <p className="text-xs text-muted-foreground">Help us improve Practicare for everyone.</p>
        </div>
      </div>

      <div className="space-y-2">
        <Label>How would you rate your experience?</Label>
        <div className="flex items-center gap-1">
          {[1, 2, 3, 4, 5].map((s) => (
            <button
              key={s}
              type="button"
              onClick={() => setRating(s)}
              onMouseEnter={() => setHover(s)}
              onMouseLeave={() => setHover(0)}
              className="p-1 transition-transform hover:scale-110"
            >
              <Star className={cn("w-8 h-8 transition-colors", s <= (hover || rating) ? "fill-amber-400 text-amber-400" : "text-muted-foreground/30")} />
            </button>
          ))}
        </div>
      </div>

      <div className="space-y-2">
        <Label htmlFor="fb-text">Your feedback</Label>
        <Textarea id="fb-text" rows={5} placeholder="Tell us what's working, what's not, or what you'd love to see..." value={feedback} onChange={(e) => setFeedback(e.target.value)} />
      </div>

      <div className="flex justify-end pt-2">
        <Button onClick={onDone} disabled={rating === 0 && !feedback.trim()} className="gap-2">
          <Send className="w-4 h-4" />
          Send Feedback
        </Button>
      </div>
    </div>
  );
}

function ReferPanel({ toast }: { toast: ReturnType<typeof useToast>["toast"] }) {
  const [copied, setCopied] = useState(false);
  const [emails, setEmails] = useState("");

  const copy = async () => {
    await navigator.clipboard.writeText(REFERRAL_URL);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
    toast({ title: "Link copied" });
  };

  const share = async () => {
    if (navigator.share) {
      try { await navigator.share({ title: "Try Practicare", url: REFERRAL_URL }); } catch {}
    } else {
      copy();
    }
  };

  const send = () => {
    const list = emails.split(/[,\s\n]+/).map((e) => e.trim()).filter(Boolean);
    if (!list.length) {
      toast({ title: "Add at least one email", variant: "destructive" });
      return;
    }
    toast({ title: `Invites sent to ${list.length}`, description: "You'll get 10% off for each one that subscribes." });
    setEmails("");
  };

  return (
    <div className="flex-1 overflow-y-auto p-6 space-y-4 bg-gradient-to-b from-background to-muted/30">
      <div className="flex items-center gap-3 p-3 rounded-lg bg-primary/5 border border-primary/15">
        <div className="w-9 h-9 rounded-lg bg-primary/15 flex items-center justify-center shrink-0">
          <Gift className="w-4 h-4 text-primary" />
        </div>
        <div className="flex-1 min-w-0">
          <p className="text-sm font-medium">Invite a friend, get 10% off</p>
          <p className="text-xs text-muted-foreground">Stackable — invite 10 → get a free month.</p>
        </div>
        <Badge variant="secondary" className="text-[10px]">0 credited</Badge>
      </div>

      <div className="space-y-2">
        <Label className="text-xs">Your referral link</Label>
        <div className="flex gap-2">
          <Input value={REFERRAL_URL} readOnly className="text-xs font-mono" />
          <Button type="button" variant="outline" size="icon" onClick={copy} className="shrink-0" aria-label="Copy">
            {copied ? <Check className="w-4 h-4 text-primary" /> : <Copy className="w-4 h-4" />}
          </Button>
          <Button type="button" variant="outline" size="icon" onClick={share} className="shrink-0" aria-label="Share">
            <Share2 className="w-4 h-4" />
          </Button>
        </div>
      </div>

      <div className="space-y-2">
        <Label htmlFor="ref-emails" className="text-xs">Or send by email</Label>
        <Input id="ref-emails" placeholder="friend@practice.com, colleague@practice.com" value={emails} onChange={(e) => setEmails(e.target.value)} />
      </div>

      <div className="flex justify-end pt-2">
        <Button onClick={send} className="gap-2">
          <Mail className="w-4 h-4" />
          Send Invites
        </Button>
      </div>
    </div>
  );
}

