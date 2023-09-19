import { spawn } from "child_process";
import { getLogger } from "../logger";
import {ChildProcessExecutionError} from "../error";

const dataUpdatePeriod = 2000
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
    let stdout = ''
    let stderr = ''
    let lastDataUpdate = Date.now()
    p.stdout.on('data', (data: string) => {
      if (Date.now() - lastDataUpdate >= dataUpdatePeriod) {
        logger.debug(`${params.cmd} stdout: ${data}`)
        if (params.onStdOutData) {
          params.onStdOutData(data.toString())
        }
        lastDataUpdate = Date.now()
      }
      stdout += data.toString()
    })

    p.stderr.on('data', (data: string) => {
      if (Date.now() - lastDataUpdate >= dataUpdatePeriod) {
        logger.debug(`${params.cmd} stderr: ${data}`)
        lastDataUpdate = Date.now()
        if (params.onStdOutData) {
          params.onStdOutData(data.toString())
        }
      }
      stderr += data.toString()
    })

    p.on('close', (code, signal) => {
      const end = Date.now()
      logger.info(`${params.cmd} ${params.params.join(' ')} exit with code ${code}, signal: ${signal}, time cost: ${((end - start) / 1000).toFixed(1)}s`)
      if (code === 0) {
        resolve(stdout)
      } else {
        reject(new ChildProcessExecutionError(`${params.cmd} exit non 0, last error: ${stderr}`))
      }
    })
  })
}

