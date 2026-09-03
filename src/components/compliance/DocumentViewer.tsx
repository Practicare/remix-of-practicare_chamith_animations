import { useEffect, useState } from "react";
import { Loader2, FileText } from "lucide-react";

interface DocumentViewerProps {
  url: string;
  name: string;
  type: string;
  className?: string;
}

// Minimal RTF → plain text (strips control words, groups, hex escapes)
function rtfToText(rtf: string): string {
  let out = rtf;
  // remove font tables, color tables, stylesheets, info groups
  out = out.replace(/\{\\(fonttbl|colortbl|stylesheet|info|\*[^}]*)[\s\S]*?\}/g, "");
  // hex escaped chars \'xx
  out = out.replace(/\\'([0-9a-fA-F]{2})/g, (_, h) => String.fromCharCode(parseInt(h, 16)));
  // unicode \uNNNN
  out = out.replace(/\\u(-?\d+)\??/g, (_, n) => String.fromCharCode(parseInt(n, 10)));
  // line breaks
  out = out.replace(/\\par[d]?\b/g, "\n").replace(/\\line\b/g, "\n").replace(/\\tab\b/g, "\t");
  // remove other control words
  out = out.replace(/\\[a-zA-Z]+-?\d*\s?/g, "");
  // remove braces and backslashes
  out = out.replace(/[{}]/g, "").replace(/\\\*/g, "");
  return out.trim();
}

const getKind = (type: string, name: string): 'image' | 'pdf' | 'docx' | 'rtf' | 'other' => {
  const lower = name.toLowerCase();
  if (type.startsWith('image/')) return 'image';
  if (type === 'application/pdf' || lower.endsWith('.pdf')) return 'pdf';
  if (type === 'application/vnd.openxmlformats-officedocument.wordprocessingml.document' || lower.endsWith('.docx')) return 'docx';
  if (type === 'application/rtf' || type === 'text/rtf' || lower.endsWith('.rtf')) return 'rtf';
  return 'other';
};

export function DocumentViewer({ url, name, type, className }: DocumentViewerProps) {
  const kind = getKind(type, name);
  const [content, setContent] = useState<string | null>(null);
  const [loading, setLoading] = useState(kind === 'docx' || kind === 'rtf');
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    let cancelled = false;
    if (kind === 'docx') {
      setLoading(true);
      (async () => {
        try {
          const [{ default: mammoth }, buf] = await Promise.all([
            import('mammoth/mammoth.browser'),
            fetch(url).then(r => r.arrayBuffer()),
          ]);
          const result = await mammoth.convertToHtml({ arrayBuffer: buf });
          if (!cancelled) { setContent(result.value); setLoading(false); }
        } catch (e: any) {
          if (!cancelled) { setError(e?.message || 'Failed to render document'); setLoading(false); }
        }
      })();
    } else if (kind === 'rtf') {
      setLoading(true);
      (async () => {
        try {
          const text = await fetch(url).then(r => r.text());
          if (!cancelled) { setContent(rtfToText(text)); setLoading(false); }
        } catch (e: any) {
          if (!cancelled) { setError(e?.message || 'Failed to read RTF'); setLoading(false); }
        }
      })();
    }
    return () => { cancelled = true; };
  }, [url, kind]);

  const wrap = (child: React.ReactNode) => (
    <div className={className ?? "rounded-lg border border-border overflow-hidden bg-muted/20"}>
      {child}
    </div>
  );

  if (kind === 'image') {
    return wrap(<img src={url} alt={name} className="w-full max-h-80 object-contain bg-black/5" />);
  }
  if (kind === 'pdf') {
    return wrap(
      <object data={url} type="application/pdf" className="w-full h-80">
        <div className="h-80 flex flex-col items-center justify-center gap-2 p-6 text-center bg-background">
          <FileText className="w-8 h-8 text-primary" />
          <p className="text-sm font-medium">{name}</p>
          <p className="text-xs text-muted-foreground">
            PDF preview isn't available inside this frame.
          </p>
          <a
            href={url}
            target="_blank"
            rel="noopener noreferrer"
            className="text-xs text-primary underline underline-offset-2"
          >
            Open PDF in a new tab
          </a>
        </div>
      </object>
    );
  }
  if (loading) {
    return wrap(
      <div className="h-40 flex items-center justify-center text-muted-foreground text-xs gap-2">
        <Loader2 className="w-4 h-4 animate-spin" /> Loading preview…
      </div>
    );
  }
  if (error) {
    return wrap(<div className="p-6 text-center text-xs text-destructive">{error}</div>);
  }
  if (kind === 'docx' && content) {
    return wrap(
      <div
        className="max-h-80 overflow-auto p-4 bg-background prose prose-sm max-w-none [&_p]:my-2 [&_h1]:text-lg [&_h1]:font-semibold [&_h2]:text-base [&_h2]:font-semibold [&_table]:border [&_table]:border-border [&_td]:border [&_td]:border-border [&_td]:px-2 [&_td]:py-1"
        dangerouslySetInnerHTML={{ __html: content }}
      />
    );
  }
  if (kind === 'rtf' && content !== null) {
    return wrap(
      <pre className="max-h-80 overflow-auto p-4 bg-background text-xs whitespace-pre-wrap font-sans">{content}</pre>
    );
  }
  return wrap(
    <div className="p-6 text-center text-xs text-muted-foreground flex flex-col items-center gap-2">
      <FileText className="w-6 h-6" />
      Preview not available for this file type.
    </div>
  );
}
