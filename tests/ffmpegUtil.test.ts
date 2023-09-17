import 'jest'
import { execFfmpeg } from "../src/util/ffmpegUtil";

describe('exec ffmpeg', () => {
  execFfmpeg('ffmpeg -i input.mp4 output.mp4', {
    override: true
  })
  return true
})
