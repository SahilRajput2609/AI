import { describe, it, expect, beforeEach, afterEach } from 'vitest'
import { mkdtempSync, writeFileSync, existsSync } from 'fs'
import { join } from 'path'
import { tmpdir } from 'os'

import { writeFile, readFile, createDirectory, deleteFileOrDir, listDirectory, fileExists } from './file-system.js'

let tmpDir: string

beforeEach(() => {
  tmpDir = mkdtempSync(join(tmpdir(), 'fs-test-'))
})

afterEach(async () => {
  await deleteFileOrDir(tmpDir)
})

describe('writeFile / readFile', () => {
  it('writes and reads a file', async () => {
    const filePath = join(tmpDir, 'test.txt')
    await writeFile(filePath, 'hello world')

    const content = await readFile(filePath)
    expect(content).toBe('hello world')
  })

  it('creates intermediate directories when writing', async () => {
    const filePath = join(tmpDir, 'nested', 'dir', 'file.txt')
    await writeFile(filePath, 'nested content')

    expect(existsSync(filePath)).toBe(true)
    const content = await readFile(filePath)
    expect(content).toBe('nested content')
  })
})

describe('createDirectory', () => {
  it('creates a directory', async () => {
    const dirPath = join(tmpDir, 'new-dir')
    await createDirectory(dirPath)

    expect(existsSync(dirPath)).toBe(true)
  })

  it('does not throw for existing directory', async () => {
    const dirPath = join(tmpDir, 'existing')
    await createDirectory(dirPath)
    await expect(createDirectory(dirPath)).resolves.toBeUndefined()
  })
})

describe('listDirectory', () => {
  it('lists directory contents', async () => {
    writeFileSync(join(tmpDir, 'a.txt'), 'a')
    writeFileSync(join(tmpDir, 'b.txt'), 'b')

    const entries = await listDirectory(tmpDir)
    expect(entries).toContain('a.txt')
    expect(entries).toContain('b.txt')
  })
})

describe('fileExists', () => {
  it('returns true for existing files', async () => {
    writeFileSync(join(tmpDir, 'exists.txt'), '')
    expect(await fileExists(join(tmpDir, 'exists.txt'))).toBe(true)
  })

  it('returns false for non-existing files', async () => {
    expect(await fileExists(join(tmpDir, 'nope.txt'))).toBe(false)
  })
})

describe('deleteFileOrDir', () => {
  it('deletes a file', async () => {
    const filePath = join(tmpDir, 'delete-me.txt')
    writeFileSync(filePath, 'bye')
    await deleteFileOrDir(filePath)

    expect(existsSync(filePath)).toBe(false)
  })

  it('deletes a directory recursively', async () => {
    const nestedDir = join(tmpDir, 'nested', 'deep')
    await createDirectory(nestedDir)
    writeFileSync(join(nestedDir, 'file.txt'), 'deep file')

    await deleteFileOrDir(join(tmpDir, 'nested'))
    expect(existsSync(join(tmpDir, 'nested'))).toBe(false)
  })
})
