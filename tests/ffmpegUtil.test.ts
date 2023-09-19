import { FfProbeData } from "../src/types/ffmpeg";
import { execFfmpeg, ffprobe } from "../src/util/ffmpegUtil";

it('exec ffmpeg', async () => {
  return await execFfmpeg('ffmpeg -i /home/zsh/Downloads/test.mp4.webm tmp/output.mp4', {
    override: true
  })
})

it('exec ffprobe', async () => {
  const data = await ffprobe('tmp/2309197bGj/segments/segment_00.mp4')
  expect(data.format).not.toBeNull()
})
