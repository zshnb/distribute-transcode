import {JobState} from "bullmq"

export type TaskCache = {
  messageId: string // redis stream's message id
  createdAt: string
  finishedAt: string
  split: SplitCache
  transcode: {
    [index: string]: TranscodeCache
  }
  concat: ConcatCache
}

export type TranscodeProgressData = {
  totalFrames: number
  frames: number
  speed: number
}

export type TranscodeCache = {
  state: JobState
  videoFile: string
  progress: TranscodeProgressData,
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
