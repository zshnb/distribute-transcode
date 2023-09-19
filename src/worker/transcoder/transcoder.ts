import { Job } from "bullmq";
import { TranscodeJobRequest, TranscodeJobResponse } from "../../types/worker/transcoder";
import { getVideoDuration, getVideoFile, getVideoFps } from "../../util/videoUtil";
import { execFfmpeg, ffprobe } from "../../util/ffmpegUtil";
import { getLogger } from "../../logger";
import { FfProbeStream, FfmpegExecProgress } from "../../types/ffmpeg";
import { VideoStreamNotFoundError } from "../../error";
import { transcodeDirPath } from "../../util/paths";

const logger = getLogger('transcoder')
async function processTranscode(job: Job): Promise<TranscodeJobResponse> {
  const request = job.data as TranscodeJobRequest
  const { index, fileStorageType } = request
  const videoFile = getVideoFile(request)
  logger.info(`transcoder received transcode job, segment index: ${index}, file: ${videoFile}`)
  const ffprobeData = await ffprobe(videoFile)
  function getFrames(): number {
    const videoStream = getVideoStream()
    const fps = getVideoFps(videoStream)
    const duration = getVideoDuration(videoStream)
    return Math.floor(duration * fps)
  }

  function getVideoStream(): FfProbeStream {
    const streams = ffprobeData.streams
    const videoStream = streams.find(it => it.codec_type === 'video')
    if (!videoStream) {
      throw new VideoStreamNotFoundError()
    }
    return videoStream
  }
  
  const transcodeVideoFile = `${await transcodeDirPath()}/${index}.mp4`
  const ffmpegCmd = `ffmpeg -i ${videoFile} -c:v libx264 ${transcodeVideoFile}`
  await execFfmpeg(ffmpegCmd, {
    override: true,
    onProgress: (data: FfmpegExecProgress) => {
      logger.info(`frames: ${data.frames}, speed: ${data.speed}`)
      job.updateProgress({
        frames: data.frames,
        speed: data.speed,
        totalFrames: getFrames(),
        index
      })
    }
  })
  return {
    index,
    videoFile: transcodeVideoFile,
    fileStorageType
  }
}

export {
  processTranscode
}
