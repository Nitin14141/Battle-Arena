/**
 * Structured logger.
 * Logs JSON to stdout so it can be captured by any log aggregator.
 * Never logs secrets, API keys, or user PII.
 */

type LogLevel = "debug" | "info" | "warn" | "error";

const LOG_LEVELS: Record<LogLevel, number> = {
  debug: 10,
  info: 20,
  warn: 30,
  error: 40,
};

const CURRENT_LEVEL = (process.env.LOG_LEVEL as LogLevel) || "info";

function shouldLog(level: LogLevel): boolean {
  return LOG_LEVELS[level] >= LOG_LEVELS[CURRENT_LEVEL];
}

function formatMessage(
  level: LogLevel,
  message: string,
  context?: Record<string, unknown>
): string {
  const entry = {
    timestamp: new Date().toISOString(),
    level,
    message,
    ...(context && Object.keys(context).length > 0 ? { context } : {}),
  };
  return JSON.stringify(entry);
}

export const logger = {
  debug: (message: string, context?: Record<string, unknown>) => {
    if (shouldLog("debug")) console.log(formatMessage("debug", message, context));
  },
  info: (message: string, context?: Record<string, unknown>) => {
    if (shouldLog("info")) console.log(formatMessage("info", message, context));
  },
  warn: (message: string, context?: Record<string, unknown>) => {
    if (shouldLog("warn")) console.warn(formatMessage("warn", message, context));
  },
  error: (message: string, context?: Record<string, unknown>) => {
    if (shouldLog("error")) console.error(formatMessage("error", message, context));
  },
};

export default logger;