import { promises as fs } from 'fs'
import { join, dirname } from 'path'

export async function readFile(path: string): Promise<string> {
  try {
    return await fs.readFile(path, 'utf-8')
  } catch (error) {
    throw new Error(`Failed to read file: ${path}`)
  }
}

export async function writeFile(path: string, content: string): Promise<void> {
  try {
    // Ensure directory exists
    await fs.mkdir(dirname(path), { recursive: true })
    await fs.writeFile(path, content, 'utf-8')
  } catch (error) {
    throw new Error(`Failed to write file: ${path}`)
  }
}

export async function createDirectory(path: string): Promise<void> {
  try {
    await fs.mkdir(path, { recursive: true })
  } catch (error) {
    throw new Error(`Failed to create directory: ${path}`)
  }
}

export async function deleteFileOrDir(path: string): Promise<void> {
  try {
    const stats = await fs.stat(path)
    if (stats.isDirectory()) {
      await fs.rm(path, { recursive: true, force: true })
    } else {
      await fs.unlink(path)
    }
  } catch (error) {
    throw new Error(`Failed to delete: ${path}`)
  }
}

export async function listDirectory(path: string): Promise<string[]> {
  try {
    return await fs.readdir(path)
  } catch (error) {
    throw new Error(`Failed to list directory: ${path}`)
  }
}

export async function fileExists(path: string): Promise<boolean> {
  try {
    await fs.access(path)
    return true
  } catch {
    return false
  }
}

export async function getFileStats(path: string) {
  try {
    return await fs.stat(path)
  } catch (error) {
    throw new Error(`Failed to get file stats: ${path}`)
  }
}
