/**
 * Generate a hash for job entry to determine uniqueness
 * Uses title, company, distribution, price, period, location, billing
 * Returns 16-character URL-safe base64 encoded hash
 */
export function generateEntryHash(entry: {
  title?: string | null;
  company?: string | null;
  distribution?: string | null;
  price?: string | null;
  period?: string | null;
  location?: string | null;
  billing?: string | null;
}): Promise<string> {
  return hashInput(entry);
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
  return hashInputSync(entry);
}

/**
 * Generate a hash for any input (object, array, or string)
 * Returns 16-character URL-safe base64 encoded string (uses SHA-256)
 */
export async function hashInput(input: object | any[] | string): Promise<string> {
  const serialized = serializeInput(input);
  return await hashStringToBase64(serialized);
}

/**
 * Synchronous version of hashInput
 */
export function hashInputSync(input: object | any[] | string): string {
  const serialized = serializeInput(input);
  return hashStringToBase64Sync(serialized);
}

function serializeInput(input: object | any[] | string): string {
  if (typeof input === 'string') {
    return input;
  }
  
  if (Array.isArray(input)) {
    return JSON.stringify(input.map(item => 
      typeof item === 'object' && item !== null ? sortObjectKeys(item) : item
    ));
  }
  
  if (typeof input === 'object' && input !== null) {
    return JSON.stringify(sortObjectKeys(input));
  }
  
  return String(input);
}

function sortObjectKeys(obj: any): any {
  if (obj === null || typeof obj !== 'object') {
    return obj;
  }
  
  if (Array.isArray(obj)) {
    return obj.map(sortObjectKeys);
  }
  
  const sorted: any = {};
  Object.keys(obj).sort().forEach(key => {
    sorted[key] = sortObjectKeys(obj[key]);
  });
  
  return sorted;
}

async function hashStringToBase64(input: string): Promise<string> {
  if (typeof window !== 'undefined' && window.crypto && window.crypto.subtle) {
    // Browser environment
    const encoder = new TextEncoder();
    const data = encoder.encode(input);
    const hashBuffer = await crypto.subtle.digest('SHA-256', data);
    const hashArray = new Uint8Array(hashBuffer);
    const base64 = btoa(String.fromCharCode(...hashArray));
    // Convert to URL-safe base64 and take first 16 characters
    return base64.replace(/\+/g, '-').replace(/\//g, '_').replace(/=/g, '').substring(0, 16);
  } else {
    // Node.js environment - fallback
    return hashStringToBase64Sync(input);
  }
}

function hashStringToBase64Sync(input: string): string {
  let hash = 0;
  for (let i = 0; i < input.length; i++) {
    const char = input.charCodeAt(i);
    hash = ((hash << 5) - hash) + char;
    hash = hash & hash; // Convert to 32-bit integer
  }
  
  // Convert to URL-safe base64 string
  const base64chars = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789-_';
  let result = '';
  let num = Math.abs(hash);
  
  // Generate exactly 16 characters
  for (let i = 0; i < 16; i++) {
    result = base64chars[num % 64] + result;
    num = Math.floor(num / 64);
    if (num === 0) {
      // Add more entropy by using character position
      num = Math.abs(input.charCodeAt(i % input.length) * (i + 1));
    }
  }
  
  return result.substring(0, 16);
}