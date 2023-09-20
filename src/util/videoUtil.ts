import path from "path"
import { InvalidArgumentError } from "../error"
import { FileStorageType } from "../types/worker/splitter"
import { notNull } from "./stringUtil"
import { FfProbeStream } from "../types/ffmpeg"

function getVideoFile({
  fileStorageType,
  filePath,
  fileUri
}: {
  fileStorageType: FileStorageType
  filePath?: string
  fileUri?: string
}): string {
  if (fileStorageType === 'FileSystem') {
    return path.resolve(notNull(filePath))
  } else if (fileStorageType === 'OSS') {
    // todo download from oss
    return ''
  } else {
    throw new InvalidArgumentError(`Unsupported fileStorageType ${fileStorageType}`)
  }
}

function getVideoFps(videoStream: FfProbeStream): number {
  const frameRate = videoStream.r_frame_rate
  const array = frameRate.split('/') // 60 / 1
  return parseInt(array[0])
}

function getVideoDuration(videoStream: FfProbeStream): number {
  const duration = videoStream.duration
  return duration === 'N/A' ? 0 : duration
}

export {
  getVideoFile,
  getVideoFps,
  getVideoDuration
}

