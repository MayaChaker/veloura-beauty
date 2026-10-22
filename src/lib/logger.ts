/**
 * Server logs as one line of JSON each, e.g.
 *   {"level":"error","msg":"Placing an order failed","time":"…","errorId":"7f3a9c2e","error":{…}}
 * Vercel's log viewer can search and filter on any of these fields, which plain text cannot do.
 *
 * Context is for ids and states, never for secrets or a shopper's details: a log is read by
 * more people, and kept longer, than the database.
 */

type Level = "info" | "warn" | "error";
type Context = Record<string, unknown>;

/** An Error as plain fields (JSON.stringify would turn it into {}). */
function serialize(error: unknown): unknown {
  if (!(error instanceof Error)) return error;
  return {
    name: error.name,
    message: error.message,
    stack: error.stack,
    ...(error.cause !== undefined ? { cause: serialize(error.cause) } : {}),
  };
}

function write(level: Level, msg: string, context: Context = {}) {
  const { error, ...rest } = context;
  const line = JSON.stringify({
    level,
    msg,
    time: new Date().toISOString(),
    ...rest,
    ...(error !== undefined ? { error: serialize(error) } : {}),
  });
  if (level === "error") console.error(line);
  else if (level === "warn") console.warn(line);
  else console.info(line);
}

export const logger = {
  info: (msg: string, context?: Context) => write("info", msg, context),
  warn: (msg: string, context?: Context) => write("warn", msg, context),
  error: (msg: string, context?: Context) => write("error", msg, context),
};

/**
 * A short id for one failure, shown to the person who hit it and written in the log, so a
 * message from a shopper ("reference 7f3a9c2e") leads straight to the log line.
 */
export const newErrorId = () => crypto.randomUUID().slice(0, 8);
