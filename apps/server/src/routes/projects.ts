import { Router, type Request, type Response } from 'express'
import { asyncHandler, validate } from '@ai-company/backend'
import { ProjectRepository, TaskRepository, VersionRepository, DeploymentRepository } from '@ai-company/database'
import { generateId } from '@ai-company/shared'
import { existsSync, mkdirSync, writeFileSync, readFileSync, readdirSync, statSync } from 'fs'
import { join, normalize, relative } from 'path'
import { broadcast } from './api.js'

const projectsRouter = Router()
const projectRepo = new ProjectRepository()
const taskRepo = new TaskRepository()

const PROJECTS_DIR = join(process.cwd(), 'projects')

function ensureProjectDir(projectId: string) {
  const dir = join(PROJECTS_DIR, projectId)
  if (!existsSync(dir)) mkdirSync(dir, { recursive: true })
  return dir
}

function safePath(projectId: string, userPath: string): string | null {
  const fullPath = normalize(join(PROJECTS_DIR, projectId, userPath))
  const projectBase = normalize(join(PROJECTS_DIR, projectId))
  if (!fullPath.startsWith(projectBase)) return null
  return fullPath
}

// List all projects
projectsRouter.get('/', (_req: Request, res: Response) => {
  const projects = projectRepo.findAll()
  res.json(projects)
})

// Search projects
projectsRouter.get('/search', (req: Request, res: Response) => {
  const q = (req.query.q as string || '').toLowerCase()
  const all = projectRepo.findAll()
  const results = all.filter((p: any) =>
    p.name.toLowerCase().includes(q) ||
    (p.description && p.description.toLowerCase().includes(q))
  )
  res.json(results)
})

// Get single project
projectsRouter.get('/:id', (req: Request, res: Response) => {
  const project = projectRepo.findById(req.params.id as string)
  if (!project) {
    res.status(404).json({ error: 'Project not found' })
    return
  }
  res.json(project)
})

// Create project
projectsRouter.post('/', validate([
  { field: 'name', required: true, type: 'string', minLength: 1, maxLength: 200 },
  { field: 'description', type: 'string', maxLength: 2000 },
  { field: 'type', type: 'string' },
  { field: 'model', type: 'string' },
  { field: 'framework', type: 'string' },
]), (req: Request, res: Response) => {
  const { name, description, type, model, framework } = req.body as Record<string, any>
  const project = projectRepo.create({
    name,
    description: description || '',
    path: `/projects/${name.toLowerCase().replace(/\s+/g, '-')}`,
    status: 'active',
    type: type || 'custom',
    model: model || '',
    framework: framework || '',
  })

  ensureProjectDir(project.id)
  const projectDir = join(PROJECTS_DIR, project.id)
  writeFileSync(join(projectDir, 'package.json'), JSON.stringify({
    name: project.name.toLowerCase().replace(/\s+/g, '-'),
    version: '1.0.0',
    private: true,
  }, null, 2))
  writeFileSync(join(projectDir, 'index.html'), '<!DOCTYPE html>\n<html lang="en">\n<head>\n  <meta charset="UTF-8" />\n  <meta name="viewport" content="width=device-width, initial-scale=1.0" />\n  <title>' + project.name + '</title>\n</head>\n<body>\n  <div id="root"></div>\n</body>\n</html>')

  res.status(201).json(project)
})

// Update project
projectsRouter.put('/:id', validate([
  { field: 'name', type: 'string', minLength: 1, maxLength: 200 },
  { field: 'description', type: 'string', maxLength: 2000 },
  { field: 'status', type: 'string', pattern: /^(active|archived|paused)$/ },
]), (req: Request, res: Response) => {
  const updated = projectRepo.update(req.params.id as string, req.body)
  if (!updated) {
    res.status(404).json({ error: 'Project not found' })
    return
  }
  res.json(updated)
})

// Delete project
projectsRouter.delete('/:id', (req: Request, res: Response) => {
  const deleted = projectRepo.delete(req.params.id as string)
  if (!deleted) {
    res.status(404).json({ error: 'Project not found' })
    return
  }
  res.json({ status: 'deleted' })
})

// Get project files
projectsRouter.get('/:id/files', (req: Request, res: Response) => {
  const project = projectRepo.findById(req.params.id as string)
  if (!project) {
    res.status(404).json({ error: 'Project not found' })
    return
  }
  const projectDir = ensureProjectDir(project.id)
  const files: { name: string; path: string; type: 'file' | 'folder' }[] = []

  function scanDir(dir: string, basePath: string) {
    const entries = readdirSync(dir)
    for (const entry of entries) {
      const fullPath = join(dir, entry)
      const stat = statSync(fullPath)
      files.push({
        name: entry,
        path: join(basePath, entry).replace(/\\/g, '/'),
        type: stat.isDirectory() ? 'folder' : 'file',
      })
      if (stat.isDirectory()) scanDir(fullPath, join(basePath, entry))
    }
  }

  if (existsSync(projectDir)) scanDir(projectDir, '')
  res.json(files)
})

// Read file content (query param: ?path=...)
projectsRouter.get('/:id/files/read', (req: Request, res: Response) => {
  const project = projectRepo.findById(req.params.id as string)
  if (!project) {
    res.status(404).json({ error: 'Project not found' })
    return
  }
  const filePath = req.query.path as string
  if (!filePath) {
    res.status(400).json({ error: 'Missing path query parameter' })
    return
  }
  const fullPath = safePath(project.id, filePath)
  if (!fullPath) {
    res.status(400).json({ error: 'Invalid path (traversal detected)' })
    return
  }
  if (!existsSync(fullPath)) {
    res.status(404).json({ error: 'File not found' })
    return
  }
  const content = readFileSync(fullPath, 'utf-8')
  res.json({ content, path: filePath })
})

// Write file
projectsRouter.post('/:id/files/write', (req: Request, res: Response) => {
  const project = projectRepo.findById(req.params.id as string)
  if (!project) {
    res.status(404).json({ error: 'Project not found' })
    return
  }
  const { path: filePath, content } = req.body as Record<string, string>
  if (!filePath) {
    res.status(400).json({ error: 'Missing path in body' })
    return
  }
  const fullPath = safePath(project.id, filePath)
  if (!fullPath) {
    res.status(400).json({ error: 'Invalid path (traversal detected)' })
    return
  }
  const dirName = fullPath.substring(0, Math.max(fullPath.lastIndexOf('\\'), fullPath.lastIndexOf('/')))
  if (!existsSync(dirName)) mkdirSync(dirName, { recursive: true })
  writeFileSync(fullPath, content || '')
  broadcast({ type: 'file:saved', projectId: project.id, path: filePath })
  res.json({ status: 'saved', path: filePath })
})

// Get project tasks
projectsRouter.get('/:id/tasks', (req: Request, res: Response) => {
  const tasks = taskRepo.findByProject(req.params.id as string)
  res.json(tasks)
})

// Get project stats
projectsRouter.get('/:id/stats', (req: Request, res: Response) => {
  const projectId = req.params.id as string
  const project = projectRepo.findById(projectId)
  if (!project) {
    res.status(404).json({ error: 'Project not found' })
    return
  }
  const tasks = taskRepo.findByProject(projectId)
  const versionRepo = new VersionRepository()
  const deployRepo = new DeploymentRepository()

  // Count versions and deployments
  let versionCount = 0, deploymentCount = 0
  try { versionCount = versionRepo.findByProjectId(projectId).length } catch {}
  try { deploymentCount = deployRepo.findByProjectId(projectId).length } catch {}

  const dir = join(PROJECTS_DIR, projectId)
  let fileCount = 0
  if (existsSync(dir)) {
    function countFiles(d: string) {
      for (const entry of readdirSync(d)) {
        const full = join(d, entry)
        if (statSync(full).isDirectory()) countFiles(full)
        else fileCount++
      }
    }
    countFiles(dir)
  }
  res.json({
    taskCount: tasks.length,
    completedTasks: tasks.filter((t: any) => t.status === 'completed').length,
    fileCount,
    versionCount,
    deploymentCount,
  })
})

export { projectsRouter }
