import { JobState } from "bullmq"

export type TaskCache = {
  createdAt: string
  finishedAt: string
  split: SplitCache
  segments: SegmentCache[]
}

export type SegmentCache = {
  index: number
  state: JobState
  error?: string
}

export type SplitCache = {
    state: JobState
    segmentCount: number
    error?: string
}
