export type FileStorageType = 'FileSystem' | 'OSS'
export type SplitJobRequest = {
  messageId: string
  taskId: string
  fileStorageType: FileStorageType
  filePath?: string
  fileUri?: string
}

export type SplitJobResponse = {
  fileStorageType: FileStorageType
  segmentFiles: string[]
}

export type SplitVideoParams = {
  videoFile: string
  segmentLength: number
  outputPattern: string
}
