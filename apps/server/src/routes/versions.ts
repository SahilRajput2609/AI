import { Router, type Request, type Response } from 'express'
import { asyncHandler, validate } from '@ai-company/backend'
import { VersionRepository, ProjectRepository } from '@ai-company/database'
import { readFileSync, writeFileSync, existsSync, readdirSync, statSync, mkdirSync } from 'fs'
import { join } from 'path'

const versionsRouter = Router()
const versionRepo = new VersionRepository()
const projectRepo = new ProjectRepository()

const PROJECTS_DIR = join(process.cwd(), 'projects')

// List versions for a project (query: ?projectId=xxx)
versionsRouter.get('/', (req: Request, res: Response) => {
  const projectId = req.query.projectId as string | undefined
  if (!projectId) {
    res.status(400).json({ error: 'Missing projectId query parameter' })
    return
  }
  const versions = versionRepo.findByProjectId(projectId)
  res.json(versions)
})

// Get a specific version
versionsRouter.get('/:id', (req: Request, res: Response) => {
  const version = versionRepo.findById(req.params.id as string)
  if (!version) {
    res.status(404).json({ error: 'Version not found' })
    return
  }
  res.json(version)
})

// Create a snapshot/version
versionsRouter.post(
  '/',
  validate([
    { field: 'projectId', required: true, type: 'string' },
    { field: 'label', type: 'string' },
  ]),
  asyncHandler(async (req: Request, res: Response) => {
    const { projectId, label } = req.body as Record<string, string>

    const project = projectRepo.findById(projectId)
    if (!project) {
      res.status(404).json({ error: 'Project not found' })
      return
    }

    const versionNumber = versionRepo.getLatestVersion(projectId) + 1

    const projectDir = join(PROJECTS_DIR, projectId)
    const snapshot: Record<string, string> = {}

    if (existsSync(projectDir)) {
      function scanDir(dir: string, basePath: string) {
        for (const entry of readdirSync(dir)) {
          const full = join(dir, entry)
          const rel = join(basePath, entry).replace(/\\/g, '/')
          if (statSync(full).isDirectory()) {
            scanDir(full, rel)
          } else {
            snapshot[rel] = readFileSync(full, 'utf-8')
          }
        }
      }
      scanDir(projectDir, '')
    }

    const version = versionRepo.create({
      project_id: projectId,
      version_number: versionNumber,
      title: label || `v${versionNumber}`,
      description: label || undefined,
      snapshot_data: JSON.stringify(snapshot),
      file_count: Object.keys(snapshot).length,
      created_by: undefined,
    })

    res.status(201).json(version)
  }),
)

// Delete a version
versionsRouter.delete('/:id', (req: Request, res: Response) => {
  const deleted = versionRepo.delete(req.params.id as string)
  if (!deleted) {
    res.status(404).json({ error: 'Version not found' })
    return
  }
  res.json({ status: 'deleted' })
})

// Restore a version (write snapshot files back to project)
versionsRouter.post('/:id/restore', (req: Request, res: Response) => {
  const version = versionRepo.findById(req.params.id as string)
  if (!version) {
    res.status(404).json({ error: 'Version not found' })
    return
  }

  const snapshot: Record<string, string> = JSON.parse(version.snapshot_data)
  const projectDir = join(PROJECTS_DIR, version.project_id)
  if (!existsSync(projectDir)) mkdirSync(projectDir, { recursive: true })

  let restoredCount = 0
  for (const [filePath, content] of Object.entries(snapshot)) {
    const fullPath = join(projectDir, filePath)
    const dirName = fullPath.substring(0, Math.max(fullPath.lastIndexOf('\\'), fullPath.lastIndexOf('/')))
    if (!existsSync(dirName)) mkdirSync(dirName, { recursive: true })
    writeFileSync(fullPath, content)
    restoredCount++
  }

  // Update project timestamp
  projectRepo.update(version.project_id, { status: 'active' })

  res.json({ status: 'restored', fileCount: restoredCount })
})

// Diff two versions
versionsRouter.get('/:id/diff/:otherId', (req: Request, res: Response) => {
  const v1 = versionRepo.findById(req.params.id as string)
  const v2 = versionRepo.findById(req.params.otherId as string)

  if (!v1 || !v2) {
    res.status(404).json({ error: 'Version not found' })
    return
  }

  const snap1: Record<string, string> = JSON.parse(v1.snapshot_data)
  const snap2: Record<string, string> = JSON.parse(v2.snapshot_data)

  const allPaths = new Set([...Object.keys(snap1), ...Object.keys(snap2)])
  const changes: { path: string; type: 'added' | 'removed' | 'modified' | 'unchanged' }[] = []

  for (const path of allPaths) {
    if (!snap1[path]) changes.push({ path, type: 'added' })
    else if (!snap2[path]) changes.push({ path, type: 'removed' })
    else if (snap1[path] !== snap2[path]) changes.push({ path, type: 'modified' })
    else changes.push({ path, type: 'unchanged' })
  }

  const summary = {
    added: changes.filter((c) => c.type === 'added').length,
    removed: changes.filter((c) => c.type === 'removed').length,
    modified: changes.filter((c) => c.type === 'modified').length,
    unchanged: changes.filter((c) => c.type === 'unchanged').length,
    total: changes.length,
  }

  res.json({
    versionA: { id: v1.id, title: v1.title, version_number: v1.version_number },
    versionB: { id: v2.id, title: v2.title, version_number: v2.version_number },
    changes,
    summary,
  })
})

export { versionsRouter }
