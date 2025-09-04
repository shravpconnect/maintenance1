export type ParsedFields = {
  carrier: string;
  address: string;
  referenceId: string;
  timeLength: string; // e.g., "6 hours" or "1 hour 30 minutes"
  reason: string;
  startTime: string; // formatted string
  endTime: string; // formatted string
};

function extractCarrier(text: string): string {
  const lines = text.split(/\r?\n/);
  const dear = /Dear\s+(.+?)\s+(?:IP|Internet|Business|Network)?\s*Services?\s*Customer/i.exec(text);
  if (dear) return dear[1].trim();

  const willPerf = /(.*?)\s+(?:Network\s+Engineers|Engineers)\s+will\s+be\s+performing/i.exec(text);
  if (willPerf) return willPerf[1].trim();

  const willPerf2 = /(.*?)\s+will\s+be\s+performing\b/i.exec(text);
  if (willPerf2) return willPerf2[1].trim();

  for (const l of lines) {
    const m = /(from|by)\s+([A-Za-z][A-Za-z& .-]{1,50})\b.*maintenance/i.exec(l);
    if (m) return m[2].trim();
  }

  // Fallback: first capitalized word sequence that looks like a company
  const m = /\b([A-Z][A-Za-z& .-]{2,})\b/.exec(text);
  return m ? m[1].trim() : "";
}

function extractAddress(text: string): string {
  const m1 = /Address:\s*(.+)/i.exec(text);
  if (m1) return m1[1].trim();
  const m2 = /Service\s*Location:\s*(.+)/i.exec(text);
  if (m2) return m2[1].trim();
  const m3 = /Location:\s*(.+)/i.exec(text);
  if (m3) return m3[1].trim();
  return "";
}

function extractReferenceId(text: string): string {
  const patterns = [
    /Circuit(?:\s*ID)?:\s*([A-Za-z0-9._-]+)/i,
    /CID:\s*([A-Za-z0-9._-]+)/i,
    /Reference(?:\s*ID)?:\s*([A-Za-z0-9._-]+)/i,
    /Service\s*ID:\s*([A-Za-z0-9._-]+)/i,
  ];
  for (const p of patterns) {
    const m = p.exec(text);
    if (m) return m[1].trim();
  }
  const mBelow = /Below\s+are\s+the\s+affected\s+circuit\(s\)?.*\n\s*(.+)/i.exec(text);
  if (mBelow) return mBelow[1].trim();

  // Heuristic: choose an isolated token-like line that looks like a circuit id
  const tokenLine = text
    .split(/\r?\n/)
    .map((l) => l.trim())
    .find((l) => /[A-Za-z]/.test(l) && /[0-9]/.test(l) && /[._-]/.test(l) && l.length >= 5 && l.length <= 40);
  return tokenLine || "";
}

function extractReason(text: string): string {
  const m1 = /performing\s+(?:a\(n\)\s*)?([^\n.]+)[\n.]/i.exec(text);
  if (m1) return m1[1].trim();
  const m2 = /maintenance\s+(?:is\s+)?for\s+([^\n.]+)[\n.]/i.exec(text);
  if (m2) return m2[1].trim();
  const m3 = /Reason:\s*(.+)/i.exec(text);
  if (m3) return m3[1].trim();
  return "";
}

type DateWindow = { start: string; end: string; tz: string };

function normalizeDate(d: Date) {
  const mm = String(d.getMonth() + 1).padStart(2, "0");
  const dd = String(d.getDate()).padStart(2, "0");
  const yyyy = d.getFullYear();
  let hr = d.getHours();
  const min = String(d.getMinutes()).padStart(2, "0");
  const ampm = hr >= 12 ? "PM" : "AM";
  hr = hr % 12; if (hr === 0) hr = 12;
  const hh = String(hr).padStart(2, "0");
  return `${mm}/${dd}/${yyyy} ${hh}:${min} ${ampm}`;
}

function parseDateWindow(text: string): DateWindow | null {
  // Date formats: 09/11/2025 or Sep 11, 2025
  const dateRegex = /(\b\d{1,2}[\/-]\d{1,2}[\/-]\d{2,4}\b|\b(?:Jan|Feb|Mar|Apr|May|Jun|Jul|Aug|Sep|Sept|Oct|Nov|Dec)[a-z]*\s+\d{1,2},?\s+\d{2,4}\b)/i;
  const timeWindowRegex = /(\d{1,2}:?\d{0,2}\s*(?:AM|PM)?)[\s]*[-to]+[\s]*(\d{1,2}:?\d{0,2}\s*(?:AM|PM)?)/i;
  const tzRegex = /(local\s*time|\b[A-Z]{2,4}\b|UTC)/i;

  const dateMatch = dateRegex.exec(text);
  const timeMatch = timeWindowRegex.exec(text);
  const tzMatch = tzRegex.exec(text);

  const tz = tzMatch ? tzMatch[1].replace(/\s+/g, " ").trim() : "";
  if (!timeMatch && !dateMatch) return null;

  const dateStr = dateMatch ? dateMatch[1] : new Date().toLocaleDateString("en-US");
  const [t1, t2] = timeMatch ? [timeMatch[1], timeMatch[2]] : ["12:00 AM", "12:00 AM"];

  function toDate(ds: string, ts: string): Date {
    let normalized = ts.toUpperCase().replace(/\s+/g, "");
    // Insert colon for hhmm formats
    if (/^\d{3,4}(AM|PM)$/.test(normalized)) {
      const raw = normalized.replace(/(AM|PM)$/, "");
      const ampm = normalized.slice(-2);
      const hh = raw.length === 3 ? raw.slice(0,1) : raw.slice(0,2);
      const mm = raw.slice(-2);
      normalized = `${hh}:${mm}${ampm}`;
    }
    if (!/(AM|PM)/.test(normalized)) {
      // assume 24h
      const m = /^(\d{1,2})(?::(\d{2}))?$/.exec(normalized);
      if (m) {
        const h = parseInt(m[1], 10);
        const min = m[2] ? parseInt(m[2], 10) : 0;
        const d = new Date(ds);
        d.setHours(h, min, 0, 0);
        return d;
      }
    }
    const d = new Date(ds);
    // parse 12h
    const m12 = /(\d{1,2})(?::(\d{2}))?(AM|PM)/.exec(normalized);
    if (m12) {
      let h = parseInt(m12[1], 10);
      const min = m12[2] ? parseInt(m12[2], 10) : 0;
      if (m12[3] === "PM" && h !== 12) h += 12;
      if (m12[3] === "AM" && h === 12) h = 0;
      d.setHours(h, min, 0, 0);
      return d;
    }
    return new Date(ds);
  }

  const start = toDate(dateStr, t1);
  let end = toDate(dateStr, t2);
  if (end.getTime() <= start.getTime()) {
    // assume next day
    end.setDate(end.getDate() + 1);
  }

  return { start: `${normalizeDate(start)} ${tz || ""}`.trim(), end: `${normalizeDate(end)} ${tz || ""}`.trim(), tz: tz || "" };
}

function extractDuration(text: string, window: DateWindow | null): string {
  const upTo = /up to\s+(\d+(?:\.\d+)?)\s*hours?/i.exec(text);
  if (upTo) {
    const val = parseFloat(upTo[1]);
    return val === 1 ? "1 hour" : `${val} hours`;
  }
  const minutesPattern = /(\d{1,3})\s*minutes?/i.exec(text);
  if (minutesPattern && !/hours?/i.test(text)) {
    const mins = parseInt(minutesPattern[1], 10);
    return `${mins} minutes`;
  }
  if (window) {
    const s = new Date(window.start);
    const e = new Date(window.end);
    const diffMin = Math.round((e.getTime() - s.getTime()) / 60000);
    const hours = Math.floor(diffMin / 60);
    const mins = diffMin % 60;
    if (mins === 0) return hours === 1 ? "1 hour" : `${hours} hours`;
    if (hours === 0) return `${mins} minutes`;
    return `${hours} hour${hours === 1 ? "" : "s"} ${mins} minutes`;
  }
  return "";
}

export function parseMaintenanceEmail(text: string): ParsedFields {
  const carrier = extractCarrier(text) || "";
  const address = extractAddress(text) || "";
  const referenceId = extractReferenceId(text) || "";
  const reason = extractReason(text) || "";
  const window = parseDateWindow(text);
  const timeLength = extractDuration(text, window) || "";
  const startTime = window?.start || "";
  const endTime = window?.end || "";

  return { carrier, address, referenceId, timeLength, reason, startTime, endTime };
}

export function buildNote(p: ParsedFields): string {
  const CARRIER = p.carrier || "";
  const ADDRESS = p.address || "";
  const REFERENCE = p.referenceId || "";
  const DURATION = p.timeLength || "";
  const REASON = p.reason || "";
  const START = p.startTime || "";
  const END = p.endTime || "";

  return `Hello Team,
Please be advised, ${CARRIER} will be performing scheduled/emergency maintenance that will impact your service at location ${ADDRESS}.

Your vCom provided circuit ${REFERENCE} will be subject to an outage lasting ${DURATION} during this maintenance window (Please note this is an estimate and no guarantee of actual impact). This maintenance is for ${REASON}

Start time: ${START}
End time: ${END}

If you experience service issues after that window, you may need to reboot your equipment. If you continue to have any problems, call our toll-free Technical Support number 800-804-8266 opt 3, and refer to this ticket for further assistance.

Thank you.`;
}
