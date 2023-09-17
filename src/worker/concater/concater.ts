import { Job } from "bullmq";
import { getVideoFile } from "../../util/videoUtil";
import { getLogger } from "../../logger";
import { ConcatJobRequest, ConcatJobResponse } from "../../types/worker/concater";
import { writeFile } from "fs/promises";
import { tmpDirFor } from "../../util/pathUtil";
import { execFfmpeg } from "../../util/ffmpegUtil";

const logger = getLogger('concater')
async function processConcat(job: Job): Promise<ConcatJobResponse> {
  const request = job.data as ConcatJobRequest
  logger.info(`splitter received concat job, request: ${JSON.stringify(request)}`)
  const { taskId, segmentFiles, fileStorageType } = request
  const indexs = Object.keys(segmentFiles)
  indexs.sort((a, b) => {
    if (a < b) {
      return -1
    } else {
      return 1
    }
  })

  const concatDir = await tmpDirFor(taskId, 'concat')
  const videoFiles = indexs.map(it => getVideoFile({
    fileStorageType,
    filePath: segmentFiles[parseInt(it)]
  }))
  const concatFile = await createConcatFile()

  async function createConcatFile(): Promise<string> {
    const items = videoFiles.map(it => `file '${it}'`)
    await writeFile(`${concatDir}/concat.txt`, items.join('\n'))
    return `${concatDir}/concat.txt`
  }

  const outputFile = `${concatDir}/result.mp4`
  const concatCmd = `ffmpeg -y -f concat -safe 0 -i ${concatFile} -c copy ${outputFile}`
  await execFfmpeg(concatCmd)

  return {
    videoFile: outputFile
  }
}

export {
  processConcat
}
