import pino from "pino";


export function getLogger(name: string) {
  const logger = pino({
    level: 'debug',
    formatters: {
      level: (label) => {
        return { level: label.toUpperCase() };
      },
      bindings: (binding) => {
        return { name }
      }
    },
    timestamp: pino.stdTimeFunctions.isoTime,
    transport: {
      target: 'pino-pretty'
    }
  })
  return logger
}
