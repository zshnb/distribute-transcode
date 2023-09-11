import { UnrecoverableError } from "bullmq";

export class NullError extends UnrecoverableError {
  constructor(value: any) {
    super(`${value} is null or undefined`)
  }
}

export class InvalidArgumentError extends UnrecoverableError {
  constructor(msg: string) {
    super(msg)
  }
}

export class ContextNotFoundError extends Error {
  constructor() {
    super('context not found')
  }
}

export class JobIdError extends Error {}

export class ChildProcessExecutionError extends Error {}