/**
 * Generate a hash for job entry to determine uniqueness
 * Uses title, company, distribution, price, period, location, billing
 * Each field has newlines removed, then all fields are joined with newlines
 * Returns first 12 characters of base64 encoded hash (without padding)
 */
export function generateEntryHash(entry: {
  title?: string | null;
  company?: string | null;
  distribution?: string | null;
  price?: string | null;
  period?: string | null;
  location?: string | null;
  billing?: string | null;
}): string {
  const fields = [
    entry.title || '',
    entry.company || '',
    entry.distribution || '',
    entry.price || '',
    entry.period || '',
    entry.location || '',
    entry.billing || ''
  ];

  // Remove newlines from each field
  const cleanedFields = fields.map(field => field.replace(/\r?\n/g, ''));
  
  // Join with newlines
  const combined = cleanedFields.join('\n');
  
  // Simple hash function (since we don't have blake3 available)
  // This uses the built-in crypto.subtle.digest with SHA-256
  return hashString(combined);
}

async function hashString(input: string): Promise<string> {
  if (typeof window !== 'undefined' && window.crypto && window.crypto.subtle) {
    // Browser environment
    const encoder = new TextEncoder();
    const data = encoder.encode(input);
    const hashBuffer = await crypto.subtle.digest('SHA-256', data);
    const hashArray = new Uint8Array(hashBuffer);
    const base64 = btoa(String.fromCharCode(...hashArray));
    return base64.replace(/[=]/g, '').substring(0, 12);
  } else {
    // Node.js environment - fallback to simpler hash
    return simpleHash(input);
  }
}

function simpleHash(input: string): string {
  let hash = 0;
  for (let i = 0; i < input.length; i++) {
    const char = input.charCodeAt(i);
    hash = ((hash << 5) - hash) + char;
    hash = hash & hash; // Convert to 32-bit integer
  }
  // Convert to base64-like string
  const base64chars = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789+/';
  let result = '';
  let num = Math.abs(hash);
  for (let i = 0; i < 12; i++) {
    result = base64chars[num % 64] + result;
    num = Math.floor(num / 64);
    if (num === 0) break;
  }
  return result.padStart(12, 'A');
}

// Synchronous version for server-side use
export function generateEntryHashSync(entry: {
  title?: string | null;
  company?: string | null;
  distribution?: string | null;
  price?: string | null;
  period?: string | null;
  location?: string | null;
  billing?: string | null;
}): string {
  const fields = [
    entry.title || '',
    entry.company || '',
    entry.distribution || '',
    entry.price || '',
    entry.period || '',
    entry.location || '',
    entry.billing || ''
  ];

  // Remove newlines from each field
  const cleanedFields = fields.map(field => field.replace(/\r?\n/g, ''));
  
  // Join with newlines
  const combined = cleanedFields.join('\n');
  
  return simpleHash(combined);
}