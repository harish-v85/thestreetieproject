import type { Workbook } from "exceljs";

export const BULK_DOG_HEADERS = [
  "SNo",
  "Name",
  "Alias",
  "Gender",
  "Locality",
  "Neighbourhood",
  "Street",
  "Sterilisation Status",
  "Estimated Birth Year",
  "Age Estimated On",
  "Age Confidence",
  "Latitude",
  "Longitude",
] as const;

export type BulkDogRow = {
  sno: string;
  name: string;
  aliases: string[];
  gender: string;
  locality: string;
  neighbourhood: string;
  street: string | null;
  neutering_status: string;
  estimated_birth_year: number | null;
  age_estimated_on: string | null;
  age_confidence: string;
  map_lat: number | null;
  map_lng: number | null;
};

export type BulkDogPreviewRow = BulkDogRow & {
  resolveOk: boolean;
  resolveMessage: string | null;
};

function normHeader(s: string): string {
  return s.replace(/\uFEFF/g, "").trim().toLowerCase().replace(/\s+/g, " ");
}

type HeaderKey =
  | "sno"
  | "name"
  | "alias"
  | "gender"
  | "locality"
  | "neighbourhood"
  | "street"
  | "sterilisation"
  | "estimatedBirthYear"
  | "ageEstimatedOn"
  | "ageConfidence"
  | "latitude"
  | "longitude";

const HEADER_MAP: Record<string, HeaderKey> = {
  sno: "sno",
  "serial no": "sno",
  "serial number": "sno",
  name: "name",
  alias: "alias",
  aliases: "alias",
  gender: "gender",
  locality: "locality",
  neighbourhood: "neighbourhood",
  neighborhood: "neighbourhood",
  street: "street",
  "sterilisation status": "sterilisation",
  "sterilization status": "sterilisation",
  neutering: "sterilisation",
  "estimated birth year": "estimatedBirthYear",
  "age estimated on": "ageEstimatedOn",
  "age confidence": "ageConfidence",
  latitude: "latitude",
  lat: "latitude",
  longitude: "longitude",
  lng: "longitude",
  long: "longitude",
};

function mapHeaderRow(cells: string[]): Partial<Record<HeaderKey, number>> | null {
  const idx: Partial<Record<HeaderKey, number>> = {};
  for (let c = 0; c < cells.length; c++) {
    const raw = cells[c];
    if (raw == null || String(raw).trim() === "") continue;
    const key = HEADER_MAP[normHeader(String(raw))];
    if (key) idx[key] = c;
  }
  const required: HeaderKey[] = ["name", "gender", "locality", "neighbourhood", "sterilisation", "ageConfidence"];
  for (const k of required) {
    if (idx[k] === undefined) return null;
  }
  return idx;
}

function pad2(n: number): string {
  return String(n).padStart(2, "0");
}

/** Excel serial date (days since 1899-12-30) to local Date. */
export function excelSerialToDate(serial: number): Date {
  const utc_days = Math.floor(serial - 25569);
  const ms = utc_days * 86400 * 1000;
  return new Date(ms);
}

function toIsoDate(d: Date): string {
  const y = d.getFullYear();
  const m = pad2(d.getMonth() + 1);
  const day = pad2(d.getDate());
  return `${y}-${m}-${day}`;
}

export function parseDateCell(val: unknown): string | null {
  if (val == null || val === "") return null;
  if (val instanceof Date && !Number.isNaN(val.getTime())) {
    return toIsoDate(val);
  }
  if (typeof val === "number" && Number.isFinite(val)) {
    // Heuristic: Excel serials for dates are typically > 30000
    if (val > 20000 && val < 120000) {
      return toIsoDate(excelSerialToDate(val));
    }
  }
  const s = String(val).trim();
  if (!s) return null;
  if (/^\d{4}-\d{2}-\d{2}$/.test(s)) return s;
  const m = s.match(/^(\d{1,2})[/-](\d{1,2})[/-](\d{4})$/);
  if (m) {
    const a = parseInt(m[1], 10);
    const b = parseInt(m[2], 10);
    const y = m[3];
    if (a > 12) {
      return `${y}-${pad2(b)}-${pad2(a)}`;
    }
    if (b > 12) {
      return `${y}-${pad2(a)}-${pad2(b)}`;
    }
    return `${y}-${pad2(b)}-${pad2(a)}`;
  }
  const tryDate = new Date(s);
  if (!Number.isNaN(tryDate.getTime())) return toIsoDate(tryDate);
  return null;
}

function parseAliases(raw: string | null | undefined): string[] {
  if (raw == null || String(raw).trim() === "") return [];
  return String(raw)
    .split("/")
    .map((x) => x.trim().replace(/\s+/g, " "))
    .filter(Boolean);
}

export function normalizeGender(raw: string): string | null {
  const s = raw.trim().toLowerCase();
  if (!s) return "unknown";
  if (s === "male" || s === "m") return "male";
  if (s === "female" || s === "f") return "female";
  if (s === "unknown" || s === "unk") return "unknown";
  return null;
}

export function normalizeNeutering(raw: string): string | null {
  const s = raw.trim().toLowerCase();
  if (!s) return "unknown";
  if (["neutered", "spayed", "castrated", "sterilised", "sterilized", "yes"].includes(s)) {
    return "neutered";
  }
  if (["not neutered", "not_neutered", "intact", "no"].includes(s)) return "not_neutered";
  if (["unknown", "unk", "unsure", "na", "n/a"].includes(s)) return "unknown";
  return null;
}

export function normalizeAgeConfidence(raw: string): string | null {
  const s = raw.trim().toLowerCase().replace(/\s+/g, "_");
  if (s === "vet_assessed" || s === "vetassessed") return "vet_assessed";
  if (s === "best_guess" || s === "bestguess") return "best_guess";
  if (s === "unknown" || s === "") return "unknown";
  return null;
}

function optNumber(val: unknown): number | null {
  if (val == null || val === "") return null;
  const n = typeof val === "number" ? val : Number(String(val).trim());
  if (!Number.isFinite(n)) return null;
  return n;
}

function optInt(val: unknown): number | null {
  const n = optNumber(val);
  if (n == null) return null;
  return Math.round(n);
}

function normalizeCellScalar(v: unknown): string {
  if (v == null) return "";
  if (typeof v === "string") return v;
  if (typeof v === "number" || typeof v === "boolean") return String(v);
  if (v instanceof Date) return v.toISOString();
  if (typeof v === "object" && v !== null && "result" in v) {
    const r = (v as { result?: unknown }).result;
    return r == null ? "" : normalizeCellScalar(r);
  }
  if (typeof v === "object" && v !== null && "richText" in v) {
    const rt = (v as { richText: { text: string }[] }).richText;
    return Array.isArray(rt) ? rt.map((x) => x.text).join("") : "";
  }
  return String(v);
}

function cellStr(row: (unknown | undefined)[], col: number | undefined): string {
  if (col === undefined) return "";
  return normalizeCellScalar(row[col]).trim();
}

function buildRowFromCells(
  row: (unknown | undefined)[],
  col: Partial<Record<HeaderKey, number>>,
): { row: BulkDogRow | null; error: string | null } {
  const name = cellStr(row, col.name).trim();
  if (!name) return { row: null, error: "Name is required." };

  const genderRaw = normalizeGender(cellStr(row, col.gender));
  if (genderRaw == null) return { row: null, error: "Invalid gender." };

  const neutRaw = normalizeNeutering(cellStr(row, col.sterilisation));
  if (neutRaw == null) return { row: null, error: "Invalid sterilisation status." };

  const ageConfRaw = normalizeAgeConfidence(cellStr(row, col.ageConfidence));
  if (ageConfRaw == null) return { row: null, error: "Invalid age confidence." };

  const locality = cellStr(row, col.locality).trim();
  const neighbourhood = cellStr(row, col.neighbourhood).trim();
  if (!locality) return { row: null, error: "Locality is required." };
  if (!neighbourhood) return { row: null, error: "Neighbourhood is required." };

  const estYear =
    col.estimatedBirthYear !== undefined ? optInt(row[col.estimatedBirthYear]) : null;
  const ageOn =
    col.ageEstimatedOn !== undefined ? parseDateCell(row[col.ageEstimatedOn]) : null;

  return {
    row: {
      sno: cellStr(row, col.sno).trim() || "—",
      name,
      aliases: parseAliases(col.alias !== undefined ? cellStr(row, col.alias) : ""),
      gender: genderRaw,
      locality,
      neighbourhood,
      street: (() => {
        const s = col.street !== undefined ? cellStr(row, col.street).trim() : "";
        return s || null;
      })(),
      neutering_status: neutRaw,
      estimated_birth_year: estYear,
      age_estimated_on: ageOn,
      age_confidence: ageConfRaw,
      map_lat: (() => {
        if (col.latitude === undefined) return null;
        const v = optNumber(row[col.latitude]);
        return v != null && v >= -90 && v <= 90 ? v : null;
      })(),
      map_lng: (() => {
        if (col.longitude === undefined) return null;
        const v = optNumber(row[col.longitude]);
        return v != null && v >= -180 && v <= 180 ? v : null;
      })(),
    },
    error: null,
  };
}

export type LocalityRow = { id: string; name: string };
export type NeighbourhoodRow = { id: string; locality_id: string; name: string };

export function resolveNeighbourhoodId(
  localityName: string,
  neighbourhoodName: string,
  localities: LocalityRow[],
  neighbourhoods: NeighbourhoodRow[],
): { id: string } | null {
  const loc = localities.find(
    (l) => l.name.trim().toLowerCase() === localityName.trim().toLowerCase(),
  );
  if (!loc) return null;
  const matches = neighbourhoods.filter(
    (n) =>
      n.locality_id === loc.id &&
      n.name.trim().toLowerCase() === neighbourhoodName.trim().toLowerCase(),
  );
  if (matches.length === 0) return null;
  return { id: matches[0].id };
}

export function previewBulkRows(
  rows: BulkDogRow[],
  localities: LocalityRow[],
  neighbourhoods: NeighbourhoodRow[],
): BulkDogPreviewRow[] {
  return rows.map((r) => {
    const res = resolveNeighbourhoodId(r.locality, r.neighbourhood, localities, neighbourhoods);
    if (!res) {
      return {
        ...r,
        resolveOk: false,
        resolveMessage: "No matching locality and neighbourhood (check spelling; both must be approved).",
      };
    }
    return { ...r, resolveOk: true, resolveMessage: null };
  });
}

/** Parse Excel workbook (first sheet) or throw. */
export async function parseBulkWorkbook(
  workbook: Workbook,
): Promise<{ rows: BulkDogRow[]; errors: { line: string }[] }> {
  const ws = workbook.worksheets[0];
  if (!ws) return { rows: [], errors: [{ line: "No worksheet found." }] };

  const headerRow = ws.getRow(1);
  const maxCol = Math.max(headerRow.cellCount, BULK_DOG_HEADERS.length);
  const cells: string[] = [];
  for (let c = 1; c <= maxCol; c++) {
    cells[c - 1] = normalizeCellScalar(headerRow.getCell(c).value);
  }

  const colMap = mapHeaderRow(cells);
  if (!colMap) {
    return {
      rows: [],
      errors: [
        {
          line: `Missing required columns. First row must include: ${BULK_DOG_HEADERS.join(", ")}.`,
        },
      ],
    };
  }

  const rows: BulkDogRow[] = [];
  const errors: { line: string }[] = [];

  ws.eachRow((row, rowNumber) => {
    if (rowNumber === 1) return;
    const mc = Math.max(row.cellCount, maxCol);
    const arr: unknown[] = [];
    for (let c = 1; c <= mc; c++) {
      arr[c - 1] = row.getCell(c).value;
    }

    const built = buildRowFromCells(arr, colMap);
    if (built.error) {
      errors.push({ line: `Row ${rowNumber}: ${built.error}` });
      return;
    }
    if (!built.row) return;
    const allEmpty =
      !built.row.name.trim() &&
      !built.row.locality &&
      !built.row.neighbourhood &&
      built.row.aliases.length === 0;
    if (allEmpty) return;

    rows.push(built.row);
  });

  return { rows, errors };
}

/** Parse CSV text (header row + data rows). */
export function parseBulkCsv(text: string): { rows: BulkDogRow[]; errors: { line: string }[] } {
  const lines = splitCsvLines(text);
  if (lines.length < 2) {
    return { rows: [], errors: [{ line: "CSV must have a header row and at least one data row." }] };
  }
  const headerCells = parseCsvLine(lines[0]);
  const colMap = mapHeaderRow(headerCells);
  if (!colMap) {
    return {
      rows: [],
      errors: [
        {
          line: `Missing required columns. First row must include: ${BULK_DOG_HEADERS.join(", ")}.`,
        },
      ],
    };
  }

  const rows: BulkDogRow[] = [];
  const errors: { line: string }[] = [];

  for (let i = 1; i < lines.length; i++) {
    const lineNo = i + 1;
    const cells = parseCsvLine(lines[i]);
    const arr: unknown[] = cells.map((c) => c);
    const built = buildRowFromCells(arr, colMap);
    if (built.error) {
      errors.push({ line: `Row ${lineNo}: ${built.error}` });
      continue;
    }
    if (!built.row) continue;
    const allEmpty =
      !built.row.name.trim() &&
      !built.row.locality &&
      !built.row.neighbourhood &&
      built.row.aliases.length === 0;
    if (allEmpty) continue;
    rows.push(built.row);
  }

  return { rows, errors };
}

function splitCsvLines(text: string): string[] {
  const lines: string[] = [];
  let cur = "";
  let inQuotes = false;
  for (let i = 0; i < text.length; i++) {
    const c = text[i];
    if (c === '"') {
      inQuotes = !inQuotes;
      cur += c;
      continue;
    }
    if ((c === "\n" || c === "\r") && !inQuotes) {
      if (c === "\r" && text[i + 1] === "\n") i++;
      if (cur.trim() !== "") lines.push(cur);
      cur = "";
      continue;
    }
    cur += c;
  }
  if (cur.trim() !== "") lines.push(cur);
  return lines;
}

function parseCsvLine(line: string): string[] {
  const result: string[] = [];
  let cur = "";
  let inQuotes = false;
  for (let i = 0; i < line.length; i++) {
    const c = line[i];
    if (c === '"') {
      if (inQuotes && line[i + 1] === '"') {
        cur += '"';
        i++;
        continue;
      }
      inQuotes = !inQuotes;
      continue;
    }
    if (c === "," && !inQuotes) {
      result.push(cur.trim());
      cur = "";
      continue;
    }
    cur += c;
  }
  result.push(cur.trim());
  return result;
}
