import { spawn } from "child_process";
import { getLogger } from "../logger";
import {ChildProcessExecutionError} from "../error";

export type ExecCommandParams = {
  cmd: string,
  params: string[],
  onStdOutData?: (data: string) => void
}
const logger = getLogger('childProcessUtil')
export async function execCommand(params: ExecCommandParams) {
  logger.info(`exec ${params.cmd} ${params.params.join(' ')}`)
  const p = spawn(params.cmd, params.params, {
    stdio: 'pipe'
  })

  return new Promise((resolve, reject) => {
    const start = Date.now()
    let stderr = ''
    let lastDataUpdate = Date.now()
    p.stdout.on('data', (data) => {
      if (Date.now() - lastDataUpdate >= 1000) {
        logger.info(`${params.cmd} stdout: ${data}`)
        if (params.onStdOutData) {
          params.onStdOutData(data)
        }
        lastDataUpdate = Date.now()
      }
    })

    p.stderr.on('data', (data) => {
      if (Date.now() - lastDataUpdate >= 1000) {
        logger.info(`${params.cmd} stderr: ${data}`)
        lastDataUpdate = Date.now()
        if (params.onStdOutData) {
          params.onStdOutData(data)
        }
      }
      stderr = data
    })

    p.on('close', (code) => {
      const end = Date.now()
      logger.info(`${params.cmd} ${params.params.join(' ')} exit with code ${code}, time cost: ${((end - start) / 1000).toFixed(1)}s`)
      if (code === 0) {
        resolve(undefined)
      } else {
        reject(new ChildProcessExecutionError(`${params.cmd} exit non 0, last error: ${stderr}`))
      }
    })
  })
}

