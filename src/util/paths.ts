import { getCtx } from "../context";
import { tmpDirFor } from "./pathUtil";

async function transcodeDirPath(): Promise<string> {
  return `${await tmpDirFor(getCtx().taskId, 'transcode')}`
}

export {
  transcodeDirPath
}
