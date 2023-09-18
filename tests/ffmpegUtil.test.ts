import { execFfmpeg } from "../src/util/ffmpegUtil";

it('exec ffmpeg', async () => {
  return await execFfmpeg('ffmpeg -i /home/zsh/Downloads/test.mp4.webm tmp/output.mp4', {
    override: true
  })
})
