import {FileStorageType} from "./splitter";

export type ConcatJobRequest = {
  taskId: string
  fileStorageType: FileStorageType
  segmentFiles: SegmentFile[]
}

export type SegmentFile = {
  [index: number]: string
}

export type ConcatJobResponse = {
  videoFile: string
}

