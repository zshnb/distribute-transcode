export type FileStorageType = 'FileSystem' | 'OSS'
export type SplitJobRequest = {
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
  videoPath: string
  segmentLength: number
  outputPattern: string
}
