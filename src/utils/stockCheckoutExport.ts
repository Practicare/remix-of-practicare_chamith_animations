import { format } from "date-fns";
import { StockCheckout } from "@/data/stockCheckoutStore";
import { downloadCSV, openPrintPDF, wrapPDFPage, exportSubtitleDate } from "./exportUtils";

const fmt = (iso?: string) => (iso ? format(new Date(iso), "MMM d, yyyy") : "—");

export function exportStockCheckoutCSV(checkout: StockCheckout) {
  const headers = ["Item", "Batch", "Barcode", "Quantity", "Expiry date"];
  const rows = checkout.lines.map((l) => [
    l.itemName,
    l.batchNumber || "",
    l.barcode || "",
    String(l.quantity),
    l.expiryDate ? format(new Date(l.expiryDate), "yyyy-MM-dd") : "",
  ]);
  downloadCSV(headers, rows, `stock-checkout-${checkout.reference}`);
}

export function exportStockCheckoutPDF(checkout: StockCheckout) {
  const totalUnits = checkout.lines.reduce((s, l) => s + l.quantity, 0);

  const tableRows = checkout.lines
    .map(
      (l) => `<tr>
        <td>${l.itemName}</td>
        <td>${l.batchNumber || "—"}</td>
        <td>${l.barcode || "—"}</td>
        <td>${l.quantity}</td>
        <td>${fmt(l.expiryDate)}</td>
      </tr>`,
    )
    .join("");

  const bodyHtml = `
    <div class="stats">
      <div class="stat"><strong>${checkout.lines.length}</strong>Line items</div>
      <div class="stat"><strong>${totalUnits}</strong>Units checked out</div>
    </div>
    <div class="meta">
      Reference: <strong>${checkout.reference}</strong> · Completed ${fmt(checkout.completedAt)}
    </div>
    <table>
      <thead><tr><th>Item</th><th>Batch</th><th>Barcode</th><th>Qty</th><th>Expiry</th></tr></thead>
      <tbody>${tableRows}</tbody>
    </table>`;

  openPrintPDF(
    wrapPDFPage({
      title: `Stock Checkout ${checkout.reference}`,
      subtitle: `Generated ${exportSubtitleDate()}`,
      bodyHtml,
    }),
  );
}
