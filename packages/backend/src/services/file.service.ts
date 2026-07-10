import type { FileNode } from '@ai-company/shared'
import { FileRepository } from '@ai-company/database'
import { readFile, writeFile, createDirectory, deleteFileOrDir, listDirectory } from '../utils/file-system.js'

export class FileService {
  private fileRepo: FileRepository

  constructor() {
    this.fileRepo = new FileRepository()
  }

  async createFile(data: {
    name: string
    path: string
    content: string
    language?: string
    projectId: string
  }): Promise<FileNode> {
    // Write to actual filesystem
    await writeFile(data.path, data.content)

    // Store metadata in database
    const file = await this.fileRepo.create({
      project_id: data.projectId,
      path: data.path,
      name: data.name,
      type: 'file',
      language: data.language,
      size: Buffer.byteLength(data.content, 'utf8'),
      modified: false,
    })
    return file
  }

  async createFolder(data: { name: string; path: string; projectId: string }): Promise<FileNode> {
    // Create actual directory
    await createDirectory(data.path)

    // Store metadata in database
    const folder = await this.fileRepo.create({
      project_id: data.projectId,
      path: data.path,
      name: data.name,
      type: 'folder',
      size: 0,
      modified: false,
    })
    return folder
  }

  async getFile(id: string): Promise<FileNode | null> {
    return this.fileRepo.findById(id)
  }

  async getFileByPath(path: string): Promise<FileNode | null> {
    const files = await this.fileRepo.findAll({ path })
    return files[0] || null
  }

  async updateFile(id: string, content: string): Promise<FileNode | null> {
    const file = await this.fileRepo.findById(id)
    if (!file) return null

    // Update actual file
    await writeFile(file.path, content)

    // Update metadata
    return this.fileRepo.update(id, {
      size: Buffer.byteLength(content, 'utf8'),
      updated_at: Date.now(),
    })
  }

  async deleteFile(id: string): Promise<boolean> {
    const file = await this.fileRepo.findById(id)
    if (!file) return false

    // Delete actual file/directory
    await deleteFileOrDir(file.path)

    // Delete metadata
    return this.fileRepo.delete(id)
  }

  async listFiles(projectId: string, parentPath?: string): Promise<FileNode[]> {
    return this.fileRepo.findAll({ projectId, path: parentPath })
  }

  async readFileContent(path: string): Promise<string> {
    return readFile(path)
  }

  async listDirectoryContent(path: string): Promise<string[]> {
    return listDirectory(path)
  }
}
