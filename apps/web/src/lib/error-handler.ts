import { NextResponse } from "next/server";
import { logger } from "@battle-arena/shared";

/**
 * Global API Error Handler wrapper.
 * Catches unhandled exceptions and returns a consistent error response.
 */
export function withErrorHandler(handler: Function) {
  return async (...args: any[]) => {
    try {
      return await handler(...args);
    } catch (error: any) {
      const errorId = Math.random().toString(36).substring(7);

      logger.error(`Unhandled API Error [${errorId}]:`, {
        message: error.message,
        stack: error.stack,
        url: args[0]?.url,
      });

      return NextResponse.json(
        {
          success: false,
          error: {
            code: "INTERNAL_SERVER_ERROR",
            message: "An unexpected error occurred. Please try again later.",
            id: errorId,
          },
        },
        { status: 500 }
      );
    }
  };
}
