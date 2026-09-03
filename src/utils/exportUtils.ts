import { format } from "date-fns";

/**
 * Generic CSV export: takes headers + rows of strings, triggers download.
 */
export function downloadCSV(
  headers: string[],
  rows: string[][],
  filename: string
) {
  const csv = [
    headers.map((h) => `"${h}"`).join(","),
    ...rows.map((row) => row.map((cell) => `"${String(cell).replace(/"/g, '""')}"`).join(",")),
  ].join("\n");

  const blob = new Blob([csv], { type: "text/csv;charset=utf-8;" });
  const url = URL.createObjectURL(blob);
  const link = document.createElement("a");
  link.href = url;
  link.download = `${filename}.csv`;
  link.click();
  URL.revokeObjectURL(url);
}

/**
 * Generic PDF export: takes an HTML string and opens a print window.
 */
export function openPrintPDF(html: string) {
  const printWindow = window.open("", "_blank");
  if (printWindow) {
    printWindow.document.write(html);
    printWindow.document.close();
    printWindow.print();
  }
}

/**
 * Shared PDF page wrapper with consistent styling.
 */
export function wrapPDFPage({
  title,
  subtitle,
  bodyHtml,
  extraStyles = "",
}: {
  title: string;
  subtitle: string;
  bodyHtml: string;
  extraStyles?: string;
}): string {
  return `<!DOCTYPE html>
<html>
<head>
  <title>${title}</title>
  <style>
    body { font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', sans-serif; margin: 40px; color: #1a1a1a; }
    h1 { font-size: 22px; margin-bottom: 4px; }
    .subtitle { color: #6b7280; font-size: 13px; margin-bottom: 24px; }
    .stats { display: flex; gap: 24px; margin-bottom: 24px; }
    .stat { font-size: 13px; }
    .stat strong { font-size: 18px; display: block; }
    table { width: 100%; border-collapse: collapse; }
    th { text-align: left; padding: 10px 12px; background: #f9fafb; border-bottom: 2px solid #e5e7eb; font-size: 12px; text-transform: uppercase; color: #6b7280; letter-spacing: 0.5px; }
    td { padding: 8px 12px; border-bottom: 1px solid #e5e7eb; font-size: 13px; }
    .field { margin-bottom: 16px; }
    .field-label { font-size: 11px; text-transform: uppercase; color: #6b7280; letter-spacing: 0.5px; margin-bottom: 4px; }
    .field-value { font-size: 14px; }
    .grid { display: grid; grid-template-columns: 1fr 1fr; gap: 16px; }
    .meta { color: #6b7280; font-size: 13px; margin-bottom: 16px; }
    @media print { body { padding: 20px; margin: 20px; } }
    ${extraStyles}
  </style>
</head>
<body>
  <h1>${title}</h1>
  <div class="subtitle">${subtitle}</div>
  ${bodyHtml}
</body>
</html>`;
}

/**
 * Format current date/time for export filenames and subtitles.
 */
export function exportTimestamp(): string {
  return format(new Date(), "yyyy-MM-dd");
}

export function exportSubtitleDate(): string {
  return format(new Date(), "MMMM d, yyyy 'at' h:mm a");
}
