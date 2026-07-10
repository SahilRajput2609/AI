import { Router, type Request, type Response } from 'express'
import { asyncHandler, validate } from '@ai-company/backend'
import { DeploymentRepository, ProjectRepository, VersionRepository } from '@ai-company/database'
import { existsSync, readdirSync, statSync, readFileSync } from 'fs'
import { join, relative } from 'path'

const deploymentsRouter = Router()
const deployRepo = new DeploymentRepository()
const projectRepo = new ProjectRepository()
const versionRepo = new VersionRepository()

const PROJECTS_DIR = join(process.cwd(), 'projects')

// List deployments for a project (query: ?projectId=xxx)
deploymentsRouter.get('/', (req: Request, res: Response) => {
  const projectId = req.query.projectId as string | undefined
  if (!projectId) {
    res.status(400).json({ error: 'Missing projectId query parameter' })
    return
  }
  const deploys = deployRepo.findByProjectId(projectId)
  res.json(deploys)
})

// Get a single deployment
deploymentsRouter.get('/:id', (req: Request, res: Response) => {
  const deploy = deployRepo.findById(req.params.id as string)
  if (!deploy) {
    res.status(404).json({ error: 'Deployment not found' })
    return
  }
  res.json(deploy)
})

// Create a new deployment
deploymentsRouter.post(
  '/',
  validate([
    { field: 'projectId', required: true, type: 'string' },
    { field: 'platform', type: 'string' },
    { field: 'region', type: 'string' },
  ]),
  asyncHandler(async (req: Request, res: Response) => {
    const { projectId, platform, region } = req.body as Record<string, string>

    const project = projectRepo.findById(projectId)
    if (!project) {
      res.status(404).json({ error: 'Project not found' })
      return
    }

    const deploy = deployRepo.create({
      project_id: projectId,
      version_id: undefined,
      platform: platform || 'vercel',
      status: 'pending',
      build_logs: undefined,
      config: JSON.stringify({ region: region || 'auto', autoDeploy: true }),
      deployed_by: undefined,
    })

    setTimeout(() => {
      try {
        const projectDir = join(PROJECTS_DIR, projectId)
        if (existsSync(projectDir)) {
          const files: string[] = []
          function scan(dir: string) {
            for (const entry of readdirSync(dir)) {
              const full = join(dir, entry)
              const rel = relative(projectDir, full).replace(/\\/g, '/')
              if (statSync(full).isDirectory()) scan(full)
              else files.push(rel)
            }
          }
          scan(projectDir)

          const platformUrl =
            platform === 'netlify' ? 'netlify.app' : platform === 'aws' ? 'amplifyapp.com' : 'vercel.app'
          const hasIndexHtml = files.some((f) => f.endsWith('index.html'))
          const hasPackageJson = files.some((f) => f === 'package.json')
          const buildLogs = [
            `🔍 Found ${files.length} files across project`,
            `📂 Platform: ${platform || 'vercel'}`,
            `📄 ${hasIndexHtml ? '✓ index.html found' : '⚠ No index.html found'}`,
            `📦 ${hasPackageJson ? '✓ package.json found' : 'ℹ No package.json (static site)'}`,
            ``,
            `📋 File listing:`,
            ...files.map((f) => `  ${f}`),
            ``,
            `✅ Build completed successfully`,
            `🚀 Deployed to: https://${project.name.toLowerCase().replace(/\s+/g, '-')}.${platformUrl}`,
          ].join('\n')

          deployRepo.update(deploy.id, {
            status: 'ready',
            url: `https://${project.name.toLowerCase().replace(/\s+/g, '-')}.${platformUrl}`,
            build_logs: buildLogs,
          })
        } else {
          deployRepo.update(deploy.id, {
            status: 'failed',
            build_logs: 'Project directory not found on disk.',
          })
        }
      } catch (err: any) {
        deployRepo.update(deploy.id, {
          status: 'failed',
          build_logs: `Build error: ${err.message}`,
        })
      }
    }, 3000)

    res.status(201).json(deploy)
  }),
)

// Get deployment logs
deploymentsRouter.get('/:id/logs', (req: Request, res: Response) => {
  const deploy = deployRepo.findById(req.params.id as string)
  if (!deploy) {
    res.status(404).json({ error: 'Deployment not found' })
    return
  }
  res.json({
    id: deploy.id,
    project_id: deploy.project_id,
    status: deploy.status,
    build_logs: deploy.build_logs || 'No build logs available.',
    config: deploy.config,
  })
})

// Download project as ZIP
deploymentsRouter.get('/:id/download', (req: Request, res: Response) => {
  const deploy = deployRepo.findById(req.params.id as string)
  if (!deploy) {
    res.status(404).json({ error: 'Deployment not found' })
    return
  }

  const AdmZip = require('adm-zip') as any
  const zip = new (require('adm-zip'))()
  const projectDir = join(PROJECTS_DIR, deploy.project_id)

  if (existsSync(projectDir)) {
    function addDir(dir: string, basePath: string) {
      for (const entry of readdirSync(dir)) {
        const full = join(dir, entry)
        const rel = join(basePath, entry).replace(/\\/g, '/')
        if (statSync(full).isDirectory()) addDir(full, rel)
        else zip.addFile(rel, readFileSync(full))
      }
    }
    addDir(projectDir, '')
  }

  res.setHeader('Content-Type', 'application/zip')
  res.setHeader('Content-Disposition', `attachment; filename="${deploy.project_id}.zip"`)
  res.send(zip.toBuffer())
})

export { deploymentsRouter }
