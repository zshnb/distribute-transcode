import pino, { LogFn } from "pino";
import { getCtx } from "./context";

function buildRootLogger() {
  const logger = pino({
    level: 'debug',
    formatters: {
      level: (label) => {
        return { level: label.toUpperCase() };
      },
      bindings: (binding) => {
        return {}
      }
    },
    timestamp: pino.stdTimeFunctions.isoTime,
    transport: {
      target: 'pino-pretty'
    }
  })
  return logger
}

const rootLogger = buildRootLogger()
export function getLogger(name: string) {
  function appendContext(): pino.Logger {
  const ctx = getCtx()
    const childLogger = rootLogger.child({
      name,
      taskId: ctx.taskId,
      jobId: ctx.jobId
    })
    return childLogger
  }
  return {
    error: <T extends Parameters<LogFn>>(...args: T): ReturnType<LogFn> => {
      return appendContext().info(...(args as Parameters<LogFn>))
    },
    errorObj: <T extends Parameters<LogFn>>(obj: unknown, ...args: T): ReturnType<LogFn> => {
      return appendContext().error(obj, ...(args as Parameters<LogFn>))
    },
    info: <T extends Parameters<LogFn>>(...args: T): ReturnType<LogFn> => {
      return appendContext().info(...(args as Parameters<LogFn>))
    },
    debug: <T extends Parameters<LogFn>>(...args: T): ReturnType<LogFn> => {
      return appendContext().debug(...(args as Parameters<LogFn>))
    },
  }
}
