import { exit } from "process"
import { InvalidArgumentError } from "../error"
import { FileStorageType } from "../types/worker/splitter"
import { notNull } from "./stringUtil"

function getVideoPath({
  fileStorageType,
  filePath,
  fileUri
}: {
  fileStorageType: FileStorageType
  filePath?: string
  fileUri?: string
}): string {
  if (fileStorageType === 'FileSystem') {
    return notNull(filePath)
  } else if (fileStorageType === 'OSS') {
    // todo download from oss
    return ''
  } else {
    throw new InvalidArgumentError(`Unsupported fileStorageType ${fileStorageType}`)
  }
}

export {
  getVideoPath
}
