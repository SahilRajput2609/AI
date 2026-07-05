import { Router } from 'express'
import { FileRepository, getDatabase } from '@ai-company/database'

export const filesRouter = Router()

filesRouter.get('/', (req, res) => {
  const projectId = (req.query.projectId as string) || 'default'
  const repo = new FileRepository(getDatabase().getDb())
  const files = repo.findAll({ projectId })
  const tree = buildFileTree(files)
  res.json({ files, tree })
})

filesRouter.get('/:id', (req, res) => {
  const repo = new FileRepository(getDatabase().getDb())
  const file = repo.findById(req.params.id)
  if (!file) {
    res.status(404).json({ error: 'file not found' })
    return
  }
  res.json(file)
})

function buildFileTree(files: any[]) {
  const root: { name: string; type: string; children: any[] }[] = []
  const map = new Map<string, any>()

  for (const file of files) {
    const parts = file.path.split('/').filter(Boolean)
    let current = root
    let pathAccum = ''

    for (let i = 0; i < parts.length; i++) {
      const part = parts[i]
      pathAccum = pathAccum ? `${pathAccum}/${part}` : part
      const isLast = i === parts.length - 1

      let existing = map.get(pathAccum)
      if (!existing) {
        existing = {
          name: part,
          type: isLast && file.type === 'file' ? 'file' : 'folder',
          path: pathAccum,
          children: [],
        }
        map.set(pathAccum, existing)
        current.push(existing)
      } else if (isLast && file.type === 'file' && existing.type !== 'file') {
        existing.type = 'file'
      }
      current = existing.children
    }
  }

  return root
}
