import { describe, it, expect, vi, beforeEach } from 'vitest'
import { FileService } from './file.service.js'

const mockRepo = vi.hoisted(() => ({
  create: vi.fn(),
  findById: vi.fn(),
  findAll: vi.fn(),
  update: vi.fn(),
  delete: vi.fn(),
}))

const mockFs = vi.hoisted(() => ({
  writeFile: vi.fn(),
  readFile: vi.fn(),
  createDirectory: vi.fn(),
  deleteFileOrDir: vi.fn(),
  listDirectory: vi.fn(),
}))

vi.mock('@ai-company/database', () => ({
  FileRepository: vi.fn(() => mockRepo),
}))

vi.mock('../utils/file-system.js', () => mockFs)

describe('FileService', () => {
  let service: FileService

  beforeEach(() => {
    vi.clearAllMocks()
    service = new FileService()
  })

  it('creates a file', async () => {
    mockFs.writeFile.mockResolvedValue(undefined)
    mockRepo.create.mockResolvedValue({
      id: 'file-1', name: 'index.ts', type: 'file', path: 'src/index.ts',
      size: 13, projectId: 'project-1', language: 'typescript',
    })

    const result = await service.createFile({
      name: 'index.ts', path: 'src/index.ts', content: 'console.log("hi")',
      language: 'typescript', projectId: 'project-1',
    })

    expect(mockFs.writeFile).toHaveBeenCalledWith('src/index.ts', 'console.log("hi")')
    expect(result.name).toBe('index.ts')
  })

  it('creates a folder', async () => {
    mockFs.createDirectory.mockResolvedValue(undefined)
    mockRepo.create.mockResolvedValue({
      id: 'folder-1', name: 'src', type: 'folder', path: 'src', size: 0, projectId: 'project-1',
    })

    const result = await service.createFolder({ name: 'src', path: 'src', projectId: 'project-1' })
    expect(mockFs.createDirectory).toHaveBeenCalledWith('src')
    expect(result.type).toBe('folder')
  })

  it('gets file by id', async () => {
    mockRepo.findById.mockResolvedValue({ id: 'file-1', name: 'test.ts' })
    const result = await service.getFile('file-1')
    expect(result?.name).toBe('test.ts')
  })

  it('updates file content', async () => {
    mockRepo.findById.mockResolvedValue({ id: 'file-1', path: 'src/test.ts' })
    mockFs.writeFile.mockResolvedValue(undefined)
    mockRepo.update.mockResolvedValue({ id: 'file-1', size: 5 })

    const result = await service.updateFile('file-1', 'hello')
    expect(mockFs.writeFile).toHaveBeenCalledWith('src/test.ts', 'hello')
    expect(result?.size).toBe(5)
  })

  it('returns null updating nonexistent file', async () => {
    mockRepo.findById.mockResolvedValue(null)
    expect(await service.updateFile('unknown', 'content')).toBeNull()
  })

  it('deletes a file', async () => {
    mockRepo.findById.mockResolvedValue({ id: 'file-1', path: 'src/delete.ts' })
    mockFs.deleteFileOrDir.mockResolvedValue(undefined)
    mockRepo.delete.mockResolvedValue(true)

    expect(await service.deleteFile('file-1')).toBe(true)
    expect(mockFs.deleteFileOrDir).toHaveBeenCalledWith('src/delete.ts')
  })

  it('returns false deleting nonexistent file', async () => {
    mockRepo.findById.mockResolvedValue(null)
    expect(await service.deleteFile('unknown')).toBe(false)
  })

  it('lists files in a project', async () => {
    mockRepo.findAll.mockResolvedValue([])
    await service.listFiles('project-1', 'src')
    expect(mockRepo.findAll).toHaveBeenCalledWith({ projectId: 'project-1', path: 'src' })
  })

  it('reads file content', async () => {
    mockFs.readFile.mockResolvedValue('file content')
    const result = await service.readFileContent('src/test.ts')
    expect(result).toBe('file content')
  })

  it('lists directory content', async () => {
    mockFs.listDirectory.mockResolvedValue(['src', 'tests'])
    const result = await service.listDirectoryContent('.')
    expect(result).toEqual(['src', 'tests'])
  })
})
