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
    params: parseBasicParams().concat(args)
  })
}
