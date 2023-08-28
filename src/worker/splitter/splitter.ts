import { Job } from "bullmq";
import { getLogger } from "../../logger";
import { SplitVideoParams, SplitJobRequest, SplitJobResponse } from "../../types/worker/splitter";
import { notNull } from "../../util/stringUtil";
import { InvalidArgumentError } from "../../error";
import { execFfmpeg } from "../../util/ffmpegUtil";
import { getCtx } from "../../context";
import { tmpDirFor } from "../../util/pathUtil";
import { createDir, getDirFiles } from "../../util/folderUtil";

const logger = getLogger('splitter')
export async function processSplit(job: Job): Promise<SplitJobResponse> {
  logger.info(`splitter received split job`)
  const request = job.data as SplitJobRequest
  const { fileStorageType } = request
  const videoPath = getVideoPath(request)
  const segmentDir = await tmpDirFor(getCtx().taskId)
  await createDir(segmentDir)
  const outputPattern = `${segmentDir}/segment_%02d.mp4`
  await splitVideo({
    videoPath,
    segmentLength: 600,
    outputPattern
  })

  return {
    fileStorageType,
    segmentFiles: await getDirFiles(segmentDir)
  }
}

async function splitVideo(params: SplitVideoParams) {
  const splitFfmpegCmd = `ffmpeg -i ${params.videoPath} -c copy -map 0 -f segment -segment_time ${params.segmentLength} ${params.outputPattern}`
  await execFfmpeg(splitFfmpegCmd)
}

function getVideoPath(request: SplitJobRequest): string {
  if (request.fileStorageType === 'FileSystem') {
    return notNull(request.filePath)
  } else if (request.fileStorageType === 'OSS') {
    // todo download from oss
    return ''
  } else {
    throw new InvalidArgumentError(`Unsupported fileStorageType ${request.fileStorageType}`)
  }
}
