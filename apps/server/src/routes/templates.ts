import { Router } from 'express'
import { asyncHandler, validate } from '@ai-company/backend'
import { TemplateRepository } from '@ai-company/database'

const templatesRouter = Router()
const templateRepo = new TemplateRepository()

// Seed built-in templates
function seedTemplates() {
  const existing = templateRepo.findAll()
  if (existing.length > 0) return

  const templates = [
    { name: 'React Application', description: 'A modern React SPA with TypeScript', category: 'frontend', type: 'project', config: JSON.stringify({ framework: 'react', starter: 'vite' }), is_built_in: true },
    { name: 'Next.js Website', description: 'Full-stack Next.js application', category: 'frontend', type: 'project', config: JSON.stringify({ framework: 'nextjs', starter: 'create-next-app' }), is_built_in: true },
    { name: 'Node.js API', description: 'Express REST API with TypeScript', category: 'backend', type: 'project', config: JSON.stringify({ framework: 'express' }), is_built_in: true },
    { name: 'Python FastAPI', description: 'FastAPI backend with Python', category: 'backend', type: 'project', config: JSON.stringify({ framework: 'fastapi' }), is_built_in: true },
    { name: 'Landing Page', description: 'Beautiful marketing landing page', category: 'website', type: 'project', config: JSON.stringify({ framework: 'html' }), is_built_in: true },
    { name: 'Portfolio Site', description: 'Personal portfolio with projects', category: 'website', type: 'project', config: JSON.stringify({ framework: 'react' }), is_built_in: true },
    { name: 'Dashboard Admin', description: 'Admin dashboard with charts', category: 'dashboard', type: 'project', config: JSON.stringify({ framework: 'react' }), is_built_in: true },
    { name: 'E-commerce Store', description: 'Full e-commerce platform', category: 'fullstack', type: 'project', config: JSON.stringify({ framework: 'nextjs' }), is_built_in: true },
    { name: 'Chrome Extension', description: 'Browser extension boilerplate', category: 'extension', type: 'project', config: JSON.stringify({ framework: 'vanilla' }), is_built_in: true },
    { name: 'AI Agent', description: 'Custom AI agent with tools', category: 'ai', type: 'project', config: JSON.stringify({ framework: 'langchain' }), is_built_in: true },
  ]

  for (const tpl of templates) {
    templateRepo.create(tpl)
  }
}

seedTemplates()

// List all templates
templatesRouter.get('/', (req, res) => {
  const { category } = req.query
  const templates = templateRepo.findAll(category as string | undefined)
  res.json(templates)
})

// Get template by id
templatesRouter.get('/:id', (req, res) => {
  const template = templateRepo.findById(req.params.id)
  if (!template) {
    res.status(404).json({ error: 'Template not found' })
    return
  }
  res.json(template)
})

// Create a template
templatesRouter.post('/', validate([
  { field: 'name', required: true, type: 'string', minLength: 1, maxLength: 200 },
  { field: 'description', type: 'string', maxLength: 2000 },
]), (req, res) => {
  const { name, description, category, config } = req.body
  const template = templateRepo.create({
    name,
    description: description || '',
    category: category || 'custom',
    config: config ? JSON.stringify(config) : '{}',
    is_built_in: false,
  })
  res.status(201).json(template)
})

// Update a template
templatesRouter.put('/:id', validate([
  { field: 'name', type: 'string', minLength: 1, maxLength: 200 },
  { field: 'description', type: 'string', maxLength: 2000 },
]), (req, res) => {
  const updated = templateRepo.update(req.params.id as string, req.body)
  if (!updated) {
    res.status(404).json({ error: 'Template not found' })
    return
  }
  res.json(updated)
})

// Delete a template
templatesRouter.delete('/:id', (req, res) => {
  const deleted = templateRepo.delete(req.params.id as string)
  if (!deleted) {
    res.status(404).json({ error: 'Template not found' })
    return
  }
  res.json({ status: 'deleted' })
})

export { templatesRouter }
