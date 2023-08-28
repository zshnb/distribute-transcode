import {copyFile} from "fs/promises";
import path, {dirname} from "path";
import * as fs from "fs";
import {createDir} from "./folderUtil";

const tmpDir = 'tmp'
export async function tmpDirFor(...subDirs: string[]) {
  const dir = path.join(tmpDir, ...subDirs)
  if (!fs.existsSync(dir)) {
    await createDir(dir)
  }
  return dir
}

export async function copyFileFor(sourceFile: string, targetPath: string) {
  if (!fs.existsSync(dirname(targetPath))) {
    await createDir(dirname(targetPath))
  }
  await copyFile(sourceFile, targetPath)
}
