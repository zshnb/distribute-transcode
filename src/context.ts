import { ContextNotFoundError } from "./error"
import {AsyncLocalStorage} from 'async_hooks'

export type Context = {
  taskId: string
  jobId?: string
}

const asyncStorage = new AsyncLocalStorage<Context>()
export async function runWithContext<ReturnType, T>(context: Context, fn: (args: T) => Promise<ReturnType>, args: T) {
  return asyncStorage.run(context, fn, args)
}

export function getCtx(): Context {
  const context = asyncStorage.getStore()
  if (!context) {
    return {} as Context
  }
  return context
}
