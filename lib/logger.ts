function serializeError(error: unknown): Record<string, unknown> {
  if (error instanceof Error) {
    return {
      message: error.message,
      name: error.name,
      stack: error.stack,
      cause: error.cause instanceof Error ? serializeError(error.cause) : error.cause,
    };
  }
  return { value: error };
}

export const logger = {
  info: (message: string, context?: Record<string, unknown>) => {
    console.log(JSON.stringify({ level: 'info', message, timestamp: new Date().toISOString(), ...context }));
  },
  warn: (message: string, context?: Record<string, unknown>) => {
    console.warn(JSON.stringify({ level: 'warn', message, timestamp: new Date().toISOString(), ...context }));
  },
  error: (message: string, context?: Record<string, unknown>) => {
    const serialized = context
      ? Object.fromEntries(
          Object.entries(context).map(([key, value]) => [
            key,
            value instanceof Error ? serializeError(value) : value,
          ]),
        )
      : context;
    console.error(
      JSON.stringify({ level: 'error', message, timestamp: new Date().toISOString(), ...serialized }),
    );
  },
};
