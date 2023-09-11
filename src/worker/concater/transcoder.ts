import { Job } from "bullmq";
import { TranscodeJobRequest, TranscodeJobResponse } from "../../types/worker/transcoder";
import { getVideoFile } from "../../util/videoUtil";
import { tmpDirFor } from "../../util/pathUtil";
import { getCtx } from "../../context";
import { execFfmpeg } from "../../util/ffmpegUtil";
import {getLogger} from "../../logger";

const logger = getLogger('transcoder')
async function processTranscode(job: Job): Promise<TranscodeJobResponse> {
  const request = job.data as TranscodeJobRequest
  const { index } = request
  const videoFile = getVideoFile(request)
  logger.info(`transcoder received transcode job, segment index: ${index}, file: ${videoFile}`)
  const transcodeVideoFile = `${await tmpDirFor(getCtx().taskId, 'transcode')}/${index}.mp4`
  const ffmpegCmd = `ffmpeg -y -i ${videoFile} -c:v libx264 ${transcodeVideoFile}`
  await execFfmpeg(ffmpegCmd)
  return {
    index,
  }
}

export {
  processTranscode
}
