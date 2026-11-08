/**
 * Input sanitization helpers.
 * Research content is untrusted input — these functions strip
 * instruction-like content and control characters.
 */

// Characters that could be used for prompt injection or log forging
const DANGEROUS_PATTERNS = [
  /ignore\s+(all\s+)?previous\s+instructions/gi,
  /disregard\s+(all\s+)?previous\s+instructions/gi,
  /forget\s+(everything|all)\s+(above|before)/gi,
  /system\s*prompt/gi,
  /\[INST\]/gi,
  /<\/?s>/gi,
  /<<\s*system\s*>>/gi,
];

/**
 * Strip control characters and normalize whitespace.
 * Preserves newlines but removes null bytes and other control chars.
 */
export function sanitizeText(input: string): string {
  if (typeof input !== "string") return "";
  return input
    .replace(/\u0000/g, "") // null bytes
    .replace(/[\u0001-\u0008\u000B\u000C\u000E-\u001F\u007F-\u009F]/g, "") // control chars
    .replace(/﻿/g, "") // BOM
    .trim();
}

/**
 * Strip known prompt-injection patterns from retrieved content.
 * Returns the cleaned text.
 */
export function stripInjectionPatterns(input: string): string {
  if (typeof input !== "string") return "";
  let cleaned = sanitizeText(input);
  for (const pattern of DANGEROUS_PATTERNS) {
    cleaned = cleaned.replace(pattern, "[redacted]");
  }
  return cleaned;
}

/**
 * Truncate a string to a maximum length with an ellipsis.
 */
export function truncate(input: string, maxLength: number): string {
  if (input.length <= maxLength) return input;
  return input.slice(0, maxLength - 1) + "…";
}

/**
 * Validate that a string is a safe identifier (alphanumeric + underscores).
 */
export function isSafeIdentifier(input: string): boolean {
  return /^[a-zA-Z0-9_-]+$/.test(input);
}

/**
 * Escape HTML special characters to prevent XSS.
 */
export function escapeHtml(input: string): string {
  return input
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;")
    .replace(/'/g, "&#039;");
}