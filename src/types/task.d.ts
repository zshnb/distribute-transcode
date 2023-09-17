import {JobState} from "bullmq"

export type TaskCache = {
  createdAt: string
  finishedAt: string
  split: SplitCache
  transcode: {
    [index: number]: TranscodeCache
  }
}

export type TranscodeCache = {
  state: JobState
  videoFile: string
  error?: string
}

export type SplitCache = {
  state: JobState
  segmentCount: number
  error?: string
}

export type ConcatCache = {
  state: JobState
  error?: string
}
