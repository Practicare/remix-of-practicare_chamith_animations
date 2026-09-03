import { useEffect, useRef, useState } from "react";
import { Button } from "@/components/ui/button";
import { Camera, Check, Loader2, SwitchCamera } from "lucide-react";

interface CameraCaptureProps {
  /** Called each time the shutter fires with the captured photo. */
  onCapture: (file: File) => void;
  /** Called when the user finishes taking photos. */
  onDone: () => void;
  /** Number of photos captured so far (shown on the Done button). */
  count: number;
  /** Called when the live camera isn't available — parent falls back to the native picker. */
  onFallback: () => void;
}

/**
 * Phone-style live camera: opens the device camera in a viewfinder and lets the
 * user keep snapping photos one after another. Each shot is handed to the parent
 * immediately so the photo list grows as they shoot.
 */
export function CameraCapture({ onCapture, onDone, count, onFallback }: CameraCaptureProps) {
  const videoRef = useRef<HTMLVideoElement>(null);
  const streamRef = useRef<MediaStream | null>(null);
  const fallbackRef = useRef(onFallback);
  fallbackRef.current = onFallback;

  const [ready, setReady] = useState(false);
  const [facing, setFacing] = useState<"environment" | "user">("environment");
  const [flash, setFlash] = useState(false);

  useEffect(() => {
    let cancelled = false;
    setReady(false);

    const start = async () => {
      try {
        if (!navigator.mediaDevices?.getUserMedia) throw new Error("unsupported");
        const stream = await navigator.mediaDevices.getUserMedia({
          video: { facingMode: facing },
          audio: false,
        });
        if (cancelled) {
          stream.getTracks().forEach((t) => t.stop());
          return;
        }
        streamRef.current = stream;
        if (videoRef.current) {
          videoRef.current.srcObject = stream;
          await videoRef.current.play().catch(() => undefined);
        }
        setReady(true);
      } catch {
        if (!cancelled) fallbackRef.current();
      }
    };

    start();
    return () => {
      cancelled = true;
      streamRef.current?.getTracks().forEach((t) => t.stop());
      streamRef.current = null;
    };
  }, [facing]);

  const snap = () => {
    const video = videoRef.current;
    if (!video || !video.videoWidth) return;
    const canvas = document.createElement("canvas");
    canvas.width = video.videoWidth;
    canvas.height = video.videoHeight;
    canvas.getContext("2d")?.drawImage(video, 0, 0);
    canvas.toBlob(
      (blob) => {
        if (!blob) return;
        onCapture(new File([blob], `photo-${Date.now()}.jpg`, { type: "image/jpeg" }));
        setFlash(true);
        window.setTimeout(() => setFlash(false), 160);
      },
      "image/jpeg",
      0.92,
    );
  };

  return (
    <div className="rounded-lg border border-border overflow-hidden bg-card">
      {/* Viewfinder */}
      <div className="relative bg-muted aspect-[4/3]">
        <video ref={videoRef} playsInline muted className="absolute inset-0 h-full w-full object-cover" />
        {flash && <div className="absolute inset-0 bg-background" />}
        {!ready && (
          <div className="absolute inset-0 flex flex-col items-center justify-center gap-2 text-muted-foreground">
            <Loader2 className="h-5 w-5 animate-spin" />
            <span className="text-xs">Starting camera…</span>
          </div>
        )}
        {count > 0 && (
          <div className="absolute top-2.5 left-2.5 rounded-lg bg-background/90 border border-border px-2.5 py-1 text-[11px] font-medium">
            {count} photo{count === 1 ? "" : "s"} added
          </div>
        )}
      </div>

      {/* Controls */}
      <div className="flex items-center justify-between gap-2.5 p-3">
        <Button
          type="button"
          variant="outline"
          size="icon"
          className="h-11 w-11 rounded-lg shrink-0"
          onClick={() => setFacing((f) => (f === "environment" ? "user" : "environment"))}
          aria-label="Switch camera"
        >
          <SwitchCamera className="h-4 w-4" />
        </Button>

        <Button
          type="button"
          className="h-12 flex-1 max-w-[220px] rounded-lg gap-2 text-sm font-semibold"
          onClick={snap}
          disabled={!ready}
        >
          <Camera className="h-5 w-5" /> Take photo
        </Button>

        <Button
          type="button"
          variant="outline"
          className="h-11 rounded-lg gap-1.5 shrink-0"
          onClick={onDone}
        >
          <Check className="h-4 w-4" /> Done
        </Button>
      </div>
    </div>
  );
}
