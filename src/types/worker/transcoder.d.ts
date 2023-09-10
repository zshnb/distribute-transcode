export type TranscodeJobRequest = {
  taskId: string
  index: number
  fileStorageType: FileStorageType
  filePath?: string
  fileUri?: string
}

export type TranscodeJobResponse = {
  index: number
}

