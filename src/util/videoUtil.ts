import path from "path"
import { InvalidArgumentError } from "../error"
import { FileStorageType } from "../types/worker/splitter"
import { notNull } from "./stringUtil"

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

export {
  getVideoFile
}

