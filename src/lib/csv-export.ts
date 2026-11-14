export function exportToCSV<T extends Record<string, any>>(
  filename: string,
  rows: T[],
  columns: { key: keyof T | string; label: string; transform?: (val: any, row: T) => string }[]
) {
  if (!rows || rows.length === 0) return;

  const headerRow = columns.map((col) => `"${col.label.replace(/"/g, '""')}"`).join(",");

  const dataRows = rows.map((row) =>
    columns
      .map((col) => {
        let val = (row as any)[col.key];
        if (col.transform) {
          val = col.transform(val, row);
        } else if (val === null || val === undefined) {
          val = "";
        } else if (typeof val === "object") {
          val = JSON.stringify(val);
        }
        return `"${String(val).replace(/"/g, '""')}"`;
      })
      .join(",")
  );

  const csvContent = [headerRow, ...dataRows].join("\r\n");
  const blob = new Blob([csvContent], { type: "text/csv;charset=utf-8;" });
  const url = URL.createObjectURL(blob);

  const link = document.createElement("a");
  link.setAttribute("href", url);
  link.setAttribute("download", `${filename}_${new Date().toISOString().slice(0, 10)}.csv`);
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
  URL.revokeObjectURL(url);
}
