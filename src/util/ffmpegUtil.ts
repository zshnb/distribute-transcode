import { writeFile } from "fs/promises";
import { getLogger } from "../logger";
import { FfProbeData, FfmpegExecProgress, Loglevel } from "../types/ffmpeg";
import { execCommand } from "./childProcessUtil";
import { basename } from "path";
import { transcodeDirPath } from "./paths";

const logger = getLogger('ffmpegUtil')
async function execFfmpeg(cmd: string, options: {
  loglevel?: Loglevel
  override?: boolean
  onProgress?: (execProgress: FfmpegExecProgress) => void
}) {
  const args = cmd.split(' ').slice(1)
  function parseBasicParams() {
    const args = ['-hide_banner']
    options.loglevel === undefined ?
      args.push('-loglevel', 'info') :
      args.push('-loglevel', options.loglevel)

    if (options.override === true) {
      args.push('-y')
    }
    return args
  }

  await execCommand({
    cmd: 'ffmpeg',
    params: parseBasicParams().concat(args),
    onStdOutData: (data: string) => {
      const progress = getFfmpegProgress(data)
      if (progress) {
        options.onProgress && options.onProgress(progress)
      }
    }
  })
}

function getFfmpegProgress(data: string): FfmpegExecProgress | undefined {
  const pattern = /.*frame=\s*(\d+).*speed=(.*)x.*/
  const matchResult = data.match(pattern)
  if (matchResult) {
    const frames = matchResult[1]
    const speed = matchResult[2]
    return {
      frames: parseInt(frames),
      speed: parseFloat(speed)
    }
  }
}

async function ffprobe(videoFile: string): Promise<FfProbeData> {
  const cmd = 'ffprobe'
  const params = ['-v', 'quiet', '-show_format', '-show_streams', '-print_format', 'json', videoFile]
  try {
    const content = await execCommand({
      cmd,
      params
    }) as string
    await writeFile(`${await transcodeDirPath()}/ffprobe.${basename(videoFile)}.json`, content)
    return JSON.parse(content) as FfProbeData
  } catch (e) {
    logger.error(`read ffprobe json file error, ${(e as Error).message}`)
    return {} as FfProbeData
  }
}

export {
  execFfmpeg,
  ffprobe
}
