/**
 * Security and Prompt Injection protection.
 * Refined patterns and multi-layered sanitization.
 */

const INJECTION_PATTERNS = [
  /ignore\s+(all\s+)?previous\s+instructions/gi,
  /disregard\s+(all\s+)?previous\s+instructions/gi,
  /forget\s+(everything|all)\s+(above|before)/gi,
  /system\s*prompt/gi,
  /you\s+are\s+now\s+a/gi,
  /your\s+new\s+task\s+is/gi,
  /\[INST\]/gi,
  /<\/?s>/gi,
  /<<\s*system\s*>>/gi,
  /assistant\s*:/gi,
  /user\s*:/gi,
];

/**
 * Checks if a string contains potential prompt injection patterns.
 */
export function detectPromptInjection(input: string): boolean {
  return INJECTION_PATTERNS.some(pattern => pattern.test(input));
}

/**
 * Deeply sanitizes input for AI consumption.
 * Removes dangerous patterns and normalizes structure.
 */
export function sanitizeForAI(input: string): string {
  if (!input) return "";

  let sanitized = input;

  // Remove control characters
  sanitized = sanitized.replace(/[\x00-\x1F\x7F-\x9F]/g, "");

  // Redact injection patterns
  for (const pattern of INJECTION_PATTERNS) {
    sanitized = sanitized.replace(pattern, "[REDACTED_POTENTIAL_INJECTION]");
  }

  return sanitized.trim();
}

/**
 * Validates that an ID is a valid UUID v4.
 */
export function isUUID(input: string): boolean {
  const uuidRegex = /^[0-9a-f]{8}-[0-9a-f]{4}-4[0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i;
  return uuidRegex.test(input);
}
