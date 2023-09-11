import { getLogger } from "../logger";
import { execCommand } from "./childProcessUtil";

const logger = getLogger('ffmpegUtil')
export async function execFfmpeg(cmd: string) {
  const args = cmd.split(' ').slice(1)
  await execCommand({
    cmd: 'ffmpeg',
    params: ['-loglevel', 'error'].concat(args)
  })
}
