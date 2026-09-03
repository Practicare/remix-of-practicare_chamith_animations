import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Download, Smartphone, Share, MoreVertical, Plus, Check, ArrowLeft } from "lucide-react";
import { useNavigate } from "react-router-dom";

interface BeforeInstallPromptEvent extends Event {
  prompt: () => Promise<void>;
  userChoice: Promise<{ outcome: "accepted" | "dismissed" }>;
}

export default function Install() {
  const navigate = useNavigate();
  const [deferredPrompt, setDeferredPrompt] = useState<BeforeInstallPromptEvent | null>(null);
  const [isInstalled, setIsInstalled] = useState(false);
  const [isIOS, setIsIOS] = useState(false);

  useEffect(() => {
    // Check if already installed
    if (window.matchMedia("(display-mode: standalone)").matches) {
      setIsInstalled(true);
    }

    // Detect iOS
    const ua = navigator.userAgent;
    setIsIOS(/iPad|iPhone|iPod/.test(ua) && !(window as any).MSStream);

    // Listen for install prompt
    const handler = (e: Event) => {
      e.preventDefault();
      setDeferredPrompt(e as BeforeInstallPromptEvent);
    };
    window.addEventListener("beforeinstallprompt", handler);

    return () => window.removeEventListener("beforeinstallprompt", handler);
  }, []);

  const handleInstall = async () => {
    if (!deferredPrompt) return;
    await deferredPrompt.prompt();
    const { outcome } = await deferredPrompt.userChoice;
    if (outcome === "accepted") {
      setIsInstalled(true);
    }
    setDeferredPrompt(null);
  };

  return (
    <div className="min-h-[100dvh] bg-background flex flex-col">
      {/* Header */}
      <header className="sticky top-0 z-10 bg-card border-b border-border px-4 py-3 flex items-center gap-3">
        <Button variant="ghost" size="icon" className="h-9 w-9" onClick={() => navigate(-1)}>
          <ArrowLeft className="w-4 h-4" />
        </Button>
        <h1 className="text-lg font-bold">Install App</h1>
      </header>

      <div className="flex-1 flex flex-col items-center justify-center p-6 max-w-md mx-auto text-center gap-6">
        {/* App Icon */}
        <div className="w-24 h-24 rounded-2xl overflow-hidden shadow-xl">
          <img src="/pwa-192x192.png" alt="MedOps" className="w-full h-full object-cover" />
        </div>

        <div>
          <h2 className="text-2xl font-bold">MedOps Navigator</h2>
          <p className="text-muted-foreground text-sm mt-1">Practice management for modern medical teams</p>
        </div>

        {isInstalled ? (
          <Card className="w-full border-emerald-500/30 bg-emerald-500/5">
            <CardContent className="flex items-center gap-3 p-4">
              <div className="w-10 h-10 rounded-full bg-emerald-500/10 flex items-center justify-center shrink-0">
                <Check className="w-5 h-5 text-emerald-600" />
              </div>
              <div className="text-left">
                <p className="font-medium text-sm">Already installed</p>
                <p className="text-xs text-muted-foreground">MedOps is installed on this device</p>
              </div>
            </CardContent>
          </Card>
        ) : deferredPrompt ? (
          /* Android / Chrome install */
          <Button onClick={handleInstall} size="lg" className="w-full h-14 text-base gap-3 active:scale-[0.97]">
            <Download className="w-5 h-5" />
            Install App
          </Button>
        ) : isIOS ? (
          /* iOS instructions */
          <Card className="w-full">
            <CardContent className="p-5 space-y-4">
              <p className="text-sm font-medium">Install on iPhone / iPad</p>
              <div className="space-y-3 text-left">
                <Step number={1} icon={<Share className="w-4 h-4" />} text='Tap the Share button in Safari' />
                <Step number={2} icon={<Plus className="w-4 h-4" />} text='"Add to Home Screen"' />
                <Step number={3} icon={<Check className="w-4 h-4" />} text='Tap "Add" to confirm' />
              </div>
            </CardContent>
          </Card>
        ) : (
          /* Generic browser instructions */
          <Card className="w-full">
            <CardContent className="p-5 space-y-4">
              <p className="text-sm font-medium">Install from your browser</p>
              <div className="space-y-3 text-left">
                <Step number={1} icon={<MoreVertical className="w-4 h-4" />} text="Open the browser menu (⋮)" />
                <Step number={2} icon={<Download className="w-4 h-4" />} text='"Install app" or "Add to Home Screen"' />
                <Step number={3} icon={<Check className="w-4 h-4" />} text="Confirm the installation" />
              </div>
            </CardContent>
          </Card>
        )}

        {/* Features */}
        <div className="flex flex-wrap justify-center gap-2 mt-2">
          <Badge variant="secondary" className="text-xs py-1">
            <Smartphone className="w-3 h-3 mr-1" />
            Works offline
          </Badge>
          <Badge variant="secondary" className="text-xs py-1">Fast & lightweight</Badge>
          <Badge variant="secondary" className="text-xs py-1">Home screen access</Badge>
        </div>
      </div>
    </div>
  );
}

function Step({ number, icon, text }: { number: number; icon: React.ReactNode; text: string }) {
  return (
    <div className="flex items-center gap-3">
      <div className="w-7 h-7 rounded-full bg-primary/10 text-primary flex items-center justify-center text-xs font-bold shrink-0">
        {number}
      </div>
      <div className="flex items-center gap-2 text-sm">
        {icon}
        <span>{text}</span>
      </div>
    </div>
  );
}