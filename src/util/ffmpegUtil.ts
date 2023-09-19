import { getLogger } from "../logger";
import { FfmpegExecProgress, Loglevel } from "../types/ffmpeg";
import { execCommand } from "./childProcessUtil";

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
  const pattern = /.*frame= (\d+).*speed=(.*)x.*/
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

export {
  execFfmpeg
}
