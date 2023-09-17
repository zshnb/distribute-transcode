import { getLogger } from "../logger";
import { Loglevel } from "../types/ffmpeg";
import { execCommand } from "./childProcessUtil";

const logger = getLogger('ffmpegUtil')
export async function execFfmpeg(cmd: string, options: {
  loglevel?: Loglevel
  override?: boolean
}) {
  const args = cmd.split(' ').slice(1)
  function parseBasicParams() {
    const args = []
    options.loglevel === undefined ? 
      args.push('error') :
      args.push(options.loglevel)

    if (options.override === true) {
      args.push('-y')
    }
    return args
  }
  await execCommand({
    cmd: 'ffmpeg',
    params: parseBasicParams().concat(args)
  })
}
