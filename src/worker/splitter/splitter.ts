import { Job } from "bullmq";
import { getLogger } from "../../logger";
import { SplitVideoParams, SplitJobRequest, SplitJobResponse } from "../../types/worker/splitter";
import { execFfmpeg } from "../../util/ffmpegUtil";
import { getCtx } from "../../context";
import { tmpDirFor } from "../../util/pathUtil";
import { createDir, getDirFiles } from "../../util/folderUtil";
import { getVideoFile } from "../../util/videoUtil";

const logger = getLogger('splitter')
export async function processSplit(job: Job): Promise<SplitJobResponse> {
  const request = job.data as SplitJobRequest
  logger.info(`splitter received split job, request: ${JSON.stringify(request)}`)
  const { fileStorageType } = request
  const videoFile = getVideoFile(request)
  const segmentDir = await tmpDirFor(getCtx().taskId, 'segments')
  await createDir(segmentDir)
  const outputPattern = `${segmentDir}/segment_%02d.mp4`
  await splitVideo({
    videoFile,
    segmentLength: 600,
    outputPattern
  })

  const segmentFiles = await getDirFiles(segmentDir)
  logger.info(`segmentFiles: ${segmentFiles}`)
  logger.info(`segment ${videoFile} into ${segmentFiles.length} segments`)
  return {
    fileStorageType,
    segmentFiles
  }
}

async function splitVideo(params: SplitVideoParams) {
  const splitFfmpegCmd = `ffmpeg -i ${params.videoFile} -c copy -map 0 -f segment -segment_time ${params.segmentLength} ${params.outputPattern}`
  await execFfmpeg(splitFfmpegCmd, {
    override: true
  })
}

