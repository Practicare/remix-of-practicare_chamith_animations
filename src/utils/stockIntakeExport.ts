import { format } from "date-fns";
import { StockIntake } from "@/data/stockIntakeStore";
import { downloadCSV, openPrintPDF, wrapPDFPage, exportSubtitleDate } from "./exportUtils";

const fmt = (iso?: string) => (iso ? format(new Date(iso), "MMM d, yyyy") : "—");

export function exportStockIntakeCSV(intake: StockIntake) {
  const headers = ["Item", "Barcode", "Quantity", "Expiry date", "New item"];
  const rows = intake.lines.map((l) => [
    l.itemName,
    l.barcode || "",
    String(l.quantity),
    l.expiryDate ? format(new Date(l.expiryDate), "yyyy-MM-dd") : "",
    l.isNewItem ? "Yes" : "No",
  ]);
  downloadCSV(headers, rows, `stock-intake-${intake.reference}`);
}

export function exportStockIntakePDF(intake: StockIntake) {
  const totalUnits = intake.lines.reduce((s, l) => s + l.quantity, 0);
  const newItems = intake.lines.filter((l) => l.isNewItem).length;

  const tableRows = intake.lines
    .map(
      (l) => `<tr>
        <td>${l.itemName}${l.isNewItem ? ' <span style="color:#229186;font-size:11px;font-weight:600;">● New</span>' : ""}</td>
        <td>${l.barcode || "—"}</td>
        <td>${l.quantity}</td>
        <td>${fmt(l.expiryDate)}</td>
      </tr>`,
    )
    .join("");

  const bodyHtml = `
    <div class="stats">
      <div class="stat"><strong>${intake.lines.length}</strong>Line items</div>
      <div class="stat"><strong>${totalUnits}</strong>Units received</div>
      <div class="stat"><strong>${newItems}</strong>New items</div>
    </div>
    <div class="meta">
      Reference: <strong>${intake.reference}</strong>${intake.supplier ? ` · Supplier: <strong>${intake.supplier}</strong>` : ""} · Completed ${fmt(intake.completedAt)}
    </div>
    ${intake.notes ? `<div class="field"><div class="field-label">Notes</div><div class="field-value">${intake.notes}</div></div>` : ""}
    <table>
      <thead><tr><th>Item</th><th>Barcode</th><th>Qty</th><th>Expiry</th></tr></thead>
      <tbody>${tableRows}</tbody>
    </table>`;

  openPrintPDF(
    wrapPDFPage({
      title: `Stock Intake ${intake.reference}`,
      subtitle: `Generated ${exportSubtitleDate()}`,
      bodyHtml,
    }),
  );
}
