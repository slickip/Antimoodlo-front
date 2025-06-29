export function parseMoscow(iso) {
  if (iso instanceof Date || typeof iso === "number") return new Date(iso);
  if (typeof iso !== "string") iso = String(iso);
  if (/[+\-]\d{2}:\d{2}$|Z$/.test(iso)) return new Date(iso);
  const [date, time] = iso.split("T");
  const [Y, M, D] = date.split("-").map(Number);
  const [h, m, s = 0] = time.split(":").map(Number);
  return new Date(Date.UTC(Y, M - 1, D, h - 3, m, s));
}
