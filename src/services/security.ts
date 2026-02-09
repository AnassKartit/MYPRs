/**
 * Security utilities for the PR Tracker extension.
 * Implements enterprise-grade security best practices.
 */

/**
 * Sanitize user-provided text to prevent XSS attacks.
 * Escapes HTML entities in untrusted content before rendering.
 */
export function sanitizeHtml(input: string): string {
  const div = document.createElement("div");
  div.appendChild(document.createTextNode(input));
  return div.innerHTML;
}

/**
 * Validate and sanitize a URL to prevent open redirect and javascript: protocol attacks.
 * Only allows https: URLs pointing to dev.azure.com or visualstudio.com.
 */
export function sanitizeUrl(url: string): string {
  try {
    const parsed = new URL(url);
    const allowedHosts = [
      "dev.azure.com",
      "visualstudio.com",
      ".visualstudio.com",
    ];

    const isAllowed = allowedHosts.some(
      (host) => parsed.hostname === host || parsed.hostname.endsWith(host)
    );

    if (parsed.protocol !== "https:" || !isAllowed) {
      return "#";
    }

    return parsed.toString();
  } catch {
    return "#";
  }
}

/**
 * Content Security Policy meta tag value for the extension.
 * Restricts resource loading to trusted sources only.
 */
export const CSP_POLICY = [
  "default-src 'none'",
  "script-src 'self'",
  "style-src 'self' 'unsafe-inline'",
  "img-src 'self' https://dev.azure.com https://*.visualstudio.com data:",
  "connect-src https://dev.azure.com https://*.visualstudio.com https://vssps.dev.azure.com",
  "font-src 'self'",
  "frame-ancestors https://dev.azure.com https://*.visualstudio.com",
].join("; ");

/**
 * Rate limiter to prevent excessive API calls.
 * Implements a token bucket algorithm.
 */
export class RateLimiter {
  private tokens: number;
  private lastRefill: number;
  private readonly maxTokens: number;
  private readonly refillRate: number; // tokens per second

  constructor(maxTokens: number = 50, refillRate: number = 10) {
    this.maxTokens = maxTokens;
    this.tokens = maxTokens;
    this.refillRate = refillRate;
    this.lastRefill = Date.now();
  }

  canProceed(): boolean {
    this.refill();
    if (this.tokens > 0) {
      this.tokens--;
      return true;
    }
    return false;
  }

  private refill(): void {
    const now = Date.now();
    const elapsed = (now - this.lastRefill) / 1000;
    this.tokens = Math.min(this.maxTokens, this.tokens + elapsed * this.refillRate);
    this.lastRefill = now;
  }
}

/**
 * Validate that a string is a safe project/repository name.
 * Prevents path traversal and injection attacks.
 */
export function validateResourceName(name: string): boolean {
  // Allow alphanumeric, dashes, underscores, dots, spaces
  const safePattern = /^[a-zA-Z0-9\-_.\s]+$/;
  return safePattern.test(name) && name.length <= 256 && !name.includes("..");
}

/**
 * Validate a pull request ID.
 */
export function validatePullRequestId(id: number): boolean {
  return Number.isInteger(id) && id > 0 && id < Number.MAX_SAFE_INTEGER;
}

/**
 * Mask sensitive data in error messages before logging.
 */
export function sanitizeErrorMessage(error: unknown): string {
  const message = error instanceof Error ? error.message : String(error);
  // Remove potential tokens, keys, or sensitive URL parameters
  return message
    .replace(/Bearer\s+[A-Za-z0-9\-._~+/]+=*/g, "Bearer [REDACTED]")
    .replace(/access_token=[^&\s]*/g, "access_token=[REDACTED]")
    .replace(/api-key=[^&\s]*/g, "api-key=[REDACTED]")
    .replace(/password=[^&\s]*/g, "password=[REDACTED]");
}

/**
 * Secure logger that sanitizes output.
 */
export const secureLog = {
  info: (message: string, ...args: unknown[]) => {
    if (process.env.NODE_ENV !== "production") {
      console.info(`[PR-Tracker] ${message}`, ...args);
    }
  },
  warn: (message: string, ...args: unknown[]) => {
    console.warn(`[PR-Tracker] ${message}`, ...args);
  },
  error: (message: string, error?: unknown) => {
    console.error(`[PR-Tracker] ${message}`, error ? sanitizeErrorMessage(error) : "");
  },
};

/**
 * Freeze an object deeply to prevent prototype pollution.
 */
export function deepFreeze<T extends object>(obj: T): Readonly<T> {
  Object.getOwnPropertyNames(obj).forEach((name) => {
    const value = (obj as any)[name];
    if (typeof value === "object" && value !== null) {
      deepFreeze(value);
    }
  });
  return Object.freeze(obj);
}
