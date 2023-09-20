import {FileStorageType} from "./splitter";

export type TranscodeJobRequest = {
  taskId: string
  index: number
  fileStorageType: FileStorageType
  filePath?: string
  fileUri?: string
}

export type TranscodeJobProgress = {
  frames: number
  speed: number
}

export type TranscodeJobResponse = {
  index: number
  videoFile: string
  fileStorageType: FileStorageType
}

