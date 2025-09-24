export type ParsedFields = {
  carrier: string;
  address: string;
  referenceId: string;
  timeLength: string; // e.g., "6 hours" or "1 hour 30 minutes"
  reason: string;
  startTime: string; // formatted string
  endTime: string; // formatted string
  maintenanceType: string; // "scheduled" or "emergency"
  ticketNumber: string; // carrier's trouble ticket number
  confidence: {
    carrier: boolean;
    address: boolean;
    referenceId: boolean;
    reason: boolean;
    times: boolean;
    ticketNumber: boolean;
  };
};

function extractCarrier(text: string): string {
  // Enhanced carrier detection patterns from Python backend
  const dear = /Dear\s+(.+?)\s+(?:IP|Internet|Business|Network)?\s*Services?\s*Customer/i.exec(text);
  if (dear) return dear[1].trim();

  const networkEngineers = /(.*?)\s+(?:Network\s+Engineers|Engineers)\s+will\s+be\s+performing/i.exec(text);
  if (networkEngineers) return networkEngineers[1].trim();

  const accessProvider = /access provider['\s]*s?\s+engineers\s+will\s+be\s+performing/i.exec(text);
  if (accessProvider) return "AT&T"; // Common pattern in AT&T emails

  const willPerf = /(.*?)\s+will\s+be\s+performing\b/i.exec(text);
  if (willPerf) return willPerf[1].trim();

  // Look for carrier names in maintenance context
  const lines = text.split(/\r?\n/);
  for (const l of lines) {
    const m = /(from|by)\s+([A-Za-z][A-Za-z& .-]{1,50})\b.*maintenance/i.exec(l);
    if (m) return m[2].trim();
  }

  // Fallback: first capitalized word sequence that looks like a company
  const m = /\b([A-Z][A-Za-z& .-]{2,})\b/.exec(text);
  return m ? m[1].trim() : "";
}

function extractAddress(text: string): string {
  // Enhanced address extraction patterns from Python backend
  const addressPattern1 = /Address:\s*(.+?)(?:Please note|$)/is.exec(text);
  if (addressPattern1) return addressPattern1[1].trim();
  
  const addressPattern2 = /Service\s*Location:\s*(.+)/i.exec(text);
  if (addressPattern2) return addressPattern2[1].trim();
  
  const addressPattern3 = /Location:\s*(.+)/i.exec(text);
  if (addressPattern3) return addressPattern3[1].trim();
  
  // Look for address patterns with ZIP codes
  const zipPattern = /([^.\n]+\s+[A-Z]{2}\s+\d{5}(?:-\d{4})?)/i.exec(text);
  if (zipPattern) return zipPattern[1].trim();
  
  return "";
}

function extractReferenceId(text: string): string {
  // Enhanced circuit ID extraction patterns from Python backend
  const belowPattern = /Below\s+are\s+the\s+affected\s+circuit\(s\).*?\n\s*(\S+)/is.exec(text);
  if (belowPattern) return belowPattern[1].trim();

  const patterns = [
    /Circuit(?:\s*ID)?:\s*([A-Za-z0-9._-]+)/i,
    /CID:\s*([A-Za-z0-9._-]+)/i,
    /Reference(?:\s*ID)?:\s*([A-Za-z0-9._-]+)/i,
    /Service\s*ID:\s*([A-Za-z0-9._-]+)/i,
    /Account(?:\s*Number)?:\s*([A-Za-z0-9._-]+)/i,
    /Order(?:\s*Number)?:\s*([A-Za-z0-9._-]+)/i,
  ];
  
  for (const p of patterns) {
    const m = p.exec(text);
    if (m) return m[1].trim();
  }

  // Enhanced circuit ID patterns based on real-world examples
  const circuitPatterns = [
    /\b[A-Z]{2,4}\.\d{3,6}\.+[A-Z]{2,4}\b/g, // Format like IUEC.796938..ATI
    /\b[A-Z]{2,4}[0-9]{4,10}[A-Z]{0,4}\b/g,  // Format like ABC123456DEF
    /\b\d{8,12}[A-Z]{2,4}\b/g                 // Format like 12345678ABC
  ];
  
  for (const pattern of circuitPatterns) {
    const matches = text.match(pattern);
    if (matches && matches.length > 0) {
      return matches[0];
    }
  }

  // Heuristic fallback: find isolated alphanumeric tokens
  const tokenLine = text
    .split(/\r?\n/)
    .map((l) => l.trim())
    .find((l) => /[A-Za-z]/.test(l) && /[0-9]/.test(l) && /[._-]/.test(l) && l.length >= 5 && l.length <= 40);
  
  return tokenLine || "";
}

function extractReason(text: string): string {
  // Enhanced reason extraction patterns from Python backend
  const pattern1 = /performing\s+a\(n\)\s+(.+?)\./i.exec(text);
  if (pattern1) return pattern1[1].trim();
  
  const pattern2 = /performing\s+(?:a\(n\)\s*)?([^\n.]+)[\n.]/i.exec(text);
  if (pattern2) return pattern2[1].trim();
  
  const pattern3 = /maintenance\s+(?:is\s+)?for\s+([^\n.]+)[\n.]/i.exec(text);
  if (pattern3) return pattern3[1].trim();
  
  const pattern4 = /Reason:\s*(.+)/i.exec(text);
  if (pattern4) return pattern4[1].trim();
  
  // Look for maintenance activity descriptions
  const pattern5 = /will\s+be\s+performing\s+(.+?)(?:\.|on|at)/i.exec(text);
  if (pattern5) return pattern5[1].trim();
  
  return "";
}

function extractMaintenanceType(text: string): string {
  // Look for emergency keywords first
  if (/emergency|urgent|unplanned|immediate/i.test(text)) {
    return "emergency";
  }
  
  // Look for scheduled keywords
  if (/scheduled|planned|maintenance/i.test(text)) {
    return "scheduled";
  }
  
  return "scheduled"; // default
}

function extractTicketNumber(text: string): string {
  // Enhanced ticket number extraction patterns from Python backend
  const patterns = [
    /trouble ticket number is\s+(\d+)/i, // Primary pattern from Python
    /trouble ticket number is\s*([A-Za-z0-9-]+)/i,
    /ticket\s*(?:number|#):\s*([A-Za-z0-9-]+)/i,
    /reference\s*(?:number|#):\s*([A-Za-z0-9-]+)/i,
    /work\s*order\s*(?:number|#):\s*([A-Za-z0-9-]+)/i,
    /case\s*(?:number|#):\s*([A-Za-z0-9-]+)/i,
  ];
  
  for (const pattern of patterns) {
    const match = pattern.exec(text);
    if (match) return match[1].trim();
  }
  
  return "";
}

type DateWindow = { start: string; end: string; tz: string };

// Enhanced state to timezone mapping from Python backend
const STATE_TIMEZONES: Record<string, string> = {
  // Eastern Time
  'FL': 'EST', 'GA': 'EST', 'NC': 'EST', 'SC': 'EST', 'VA': 'EST', 'WV': 'EST',
  'MD': 'EST', 'DE': 'EST', 'PA': 'EST', 'NJ': 'EST', 'NY': 'EST', 'CT': 'EST',
  'RI': 'EST', 'MA': 'EST', 'VT': 'EST', 'NH': 'EST', 'ME': 'EST', 'OH': 'EST',
  'MI': 'EST', 'IN': 'EST', 'KY': 'EST', 'TN': 'EST',
  
  // Central Time  
  'TX': 'CST', 'OK': 'CST', 'AR': 'CST', 'LA': 'CST', 'MS': 'CST', 'AL': 'CST',
  'MO': 'CST', 'IA': 'CST', 'MN': 'CST', 'WI': 'CST', 'IL': 'CST', 'KS': 'CST',
  'NE': 'CST', 'SD': 'CST', 'ND': 'CST',
  
  // Mountain Time
  'CO': 'MST', 'NM': 'MST', 'WY': 'MST', 'MT': 'MST', 'UT': 'MST', 'AZ': 'MST',
  'ID': 'MST', 'NV': 'MST',
  
  // Pacific Time
  'CA': 'PST', 'OR': 'PST', 'WA': 'PST', 'AK': 'AKST', 'HI': 'HST'
};

// Python backend timezone mapping for enhanced accuracy
const PYTHON_STATE_TIMEZONE: Record<string, string> = {
  'CA': 'US/Pacific',
  'NY': 'US/Eastern', 
  'TX': 'US/Central',
  'FL': 'US/Eastern',
  'WA': 'US/Pacific',
  'IL': 'US/Central',
  'MA': 'US/Eastern'
};

function detectTimezoneFromAddress(address: string): string {
  const stateMatch = address.match(/\b([A-Z]{2})\b/);
  if (stateMatch) {
    const state = stateMatch[1];
    return STATE_TIMEZONES[state] || '';
  }
  return '';
}

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

function parseDateWindow(text: string, address: string = ""): DateWindow | null {
  // Enhanced date/time parsing patterns from Python backend
  const dateRegex = /performed on (\d{2}\/\d{2}\/\d{4})/i; // Primary pattern from Python
  const fallbackDateRegex = /(\b\d{1,2}[\/-]\d{1,2}[\/-]\d{2,4}\b|\b(?:Jan|Feb|Mar|Apr|May|Jun|Jul|Aug|Sep|Sept|Oct|Nov|Dec)[a-z]*\s+\d{1,2},?\s+\d{2,4}\b)/i;
  
  const timeWindowRegex = /maintenance window of (\d{1,2}:\d{2}[AP]M)-(\d{1,2}:\d{2}[AP]M)/i; // Primary pattern from Python
  const fallbackTimeRegex = /(\d{1,2}:?\d{0,2}\s*(?:AM|PM)?)[\s]*[-to]+[\s]*(\d{1,2}:?\d{0,2}\s*(?:AM|PM)?)/i;
  
  const tzRegex = /(local\s*time|\b[A-Z]{2,4}T\b|\bEST\b|\bCST\b|\bMST\b|\bPST\b|\bEDT\b|\bCDT\b|\bMDT\b|\bPDT\b|UTC)/i;

  const dateMatch = dateRegex.exec(text) || fallbackDateRegex.exec(text);
  const timeMatch = timeWindowRegex.exec(text) || fallbackTimeRegex.exec(text);
  const tzMatch = tzRegex.exec(text);

  let tz = tzMatch ? tzMatch[1].replace(/\s+/g, " ").trim() : "";
  
  // Enhanced timezone detection from address using Python patterns
  if (!tz && address) {
    const stateMatch = /,\s*([A-Z]{2})\s*\d{5}/.exec(address);
    if (stateMatch) {
      const state = stateMatch[1];
      const pythonTz = PYTHON_STATE_TIMEZONE[state];
      if (pythonTz) {
        // Convert Python timezone names to abbreviations
        if (pythonTz === 'US/Pacific') tz = 'PST';
        else if (pythonTz === 'US/Eastern') tz = 'EST';
        else if (pythonTz === 'US/Central') tz = 'CST';
        else if (pythonTz === 'US/Mountain') tz = 'MST';
      } else {
        tz = STATE_TIMEZONES[state] || '';
      }
    }
  }
  
  // Default to "Local Time" if still no timezone
  if (!tz) {
    tz = "Local Time";
  }
  
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
  
  // Enhanced duration calculation from Python backend
  if (window) {
    const s = new Date(window.start);
    const e = new Date(window.end);
    const diffMin = Math.round((e.getTime() - s.getTime()) / 60000);
    const hours = Math.floor(diffMin / 60);
    const mins = diffMin % 60;
    
    // Python backend format: "6 Hours" or "30 Minutes"
    if (mins === 0) {
      return hours === 1 ? "1 Hour" : `${hours} Hours`;
    }
    if (hours === 0) {
      return `${mins} Minutes`;
    }
    return `${hours} Hour${hours === 1 ? "" : "s"} ${mins} Minutes`;
  }
  return "";
}

export function parseMaintenanceEmail(text: string): ParsedFields {
  const carrier = extractCarrier(text) || "[Carrier Name]";
  const address = extractAddress(text) || "[Service Address]";
  const referenceId = extractReferenceId(text) || "[Circuit ID]";
  const reason = extractReason(text) || "[Maintenance Reason]";
  const maintenanceType = extractMaintenanceType(text);
  const ticketNumber = extractTicketNumber(text) || "[Ticket Number]";
  const window = parseDateWindow(text, address);
  const timeLength = extractDuration(text, window) || "[Duration]";
  const startTime = window?.start || "[Start Time]";
  const endTime = window?.end || "[End Time]";

  // Confidence scoring based on whether fields contain placeholder text
  const confidence = {
    carrier: !carrier.includes("[") && carrier.length > 2,
    address: !address.includes("[") && address.length > 5,
    referenceId: !referenceId.includes("[") && referenceId.length > 3,
    reason: !reason.includes("[") && reason.length > 3,
    times: window !== null,
    ticketNumber: !ticketNumber.includes("[") && ticketNumber.length > 0,
  };

  return { 
    carrier, 
    address, 
    referenceId, 
    timeLength, 
    reason, 
    startTime, 
    endTime, 
    maintenanceType,
    ticketNumber,
    confidence 
  };
}

export function buildNote(p: ParsedFields): string {
  const CARRIER = p.carrier || "";
  const ADDRESS = p.address || "";
  const REFERENCE = p.referenceId || "";
  const DURATION = p.timeLength || "";
  const REASON = p.reason || "";
  const START = p.startTime || "";
  const END = p.endTime || "";
  const TYPE = p.maintenanceType || "scheduled";

  return `Please be advised, **${CARRIER}** will be performing **${TYPE} maintenance** that will impact your service at location **${ADDRESS}**.

Your vCom provided circuit **${REFERENCE}** will be subject to an outage lasting **${DURATION}** during this maintenance window (Please note this is an estimate and no guarantee of actual impact). This maintenance is for **${REASON}**

Start time: **${START}**  
End time: **${END}**  

If you experience service issues after that window, you may need to reboot your equipment. If you continue to have any problems, call our toll-free Technical Support number 800-804-8266 opt 3, and refer to this ticket for further assistance.

Thank you.`;
}