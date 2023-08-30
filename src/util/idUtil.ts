import { format } from "date-fns"
import { nanoid } from "nanoid"

export function newTaskId() {
  const now = new Date()
  return `${format(now, 'yyMMdd')}${nanoid(4)}`
}
