import { NullError } from "../error"

export function notNull(string?: string) {
  if (string) {
    return string
  } else {
    throw new NullError(string)
  }
}
