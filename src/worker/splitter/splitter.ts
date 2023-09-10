import { Job } from "bullmq";
import { getLogger } from "../../logger";
import { SplitVideoParams, SplitJobRequest, SplitJobResponse } from "../../types/worker/splitter";
import { execFfmpeg } from "../../util/ffmpegUtil";
import { getCtx } from "../../context";
import { tmpDirFor } from "../../util/pathUtil";
import { createDir, getDirFiles } from "../../util/folderUtil";
import { getVideoPath } from "../../util/videoUtil";

const logger = getLogger('splitter')
export async function processSplit(job: Job): Promise<SplitJobResponse> {
  logger.info(`splitter received split job`)
  const request = job.data as SplitJobRequest
  const { fileStorageType } = request
  const videoPath = getVideoPath(request)
  const segmentDir = await tmpDirFor(getCtx().taskId, 'segments')
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

