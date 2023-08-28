import { existsSync } from "fs";
import * as fs from "fs/promises";

export async function createDir(path: string) {
  return fs.mkdir(path, { recursive: true })
}

export async function deleteDir(folder: string) {
  return fs.rm(folder, { recursive: true, force: true })
}

export async function getDirFiles(dir: string) {
  if (!existsSync(dir)) {
    return []
  }
  const files = await fs.readdir(dir)
  return files
}
