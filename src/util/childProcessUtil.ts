import { spawn } from "child_process";
import { getLogger } from "../logger";

export type ExecCommandParams = {
  cmd: string,
  params: string[]
}
const logger = getLogger('childProcessUtil')
export async function execCommand(params: ExecCommandParams) {
  const p = spawn(params.cmd, params.params)

  return new Promise((resolve, reject) => {
    p.stdout.on('data', (data) => {
      logger.info(`${params.cmd} stdout: ${data}`)
    })

    p.stdout.on('error', (data) => {
      logger.error(`${params.cmd} stderr: ${data}`)
      reject(`${params.cmd} stderr: ${data}`)
    })

    p.on('close', (code) => {
      logger.info(`${params.cmd} exit with code ${code}`)
      if (code === 0) {
        resolve(undefined)
      } else {
        reject(`${params.cmd} exit non 0`)
      }
    })
  })
}
