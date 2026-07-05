import { existsSync, copyFileSync, mkdirSync, writeFileSync } from 'fs'
import { resolve, dirname } from 'path'
import { fileURLToPath } from 'url'

const ROOT = resolve(dirname(fileURLToPath(import.meta.url)), '..')

function log(msg) {
  console.log(`[setup] ${msg}`)
}

// .env
if (!existsSync(resolve(ROOT, '.env'))) {
  if (existsSync(resolve(ROOT, '.env.example'))) {
    copyFileSync(resolve(ROOT, '.env.example'), resolve(ROOT, '.env'))
    log('Created .env from .env.example — edit it to add your API keys')
  }
} else {
  log('.env already exists, skipping')
}

// scaffolding directories
const dirs = [
  'data',
  'configs/agents',
  'configs/models',
  'configs/prompts',
  'docs/api',
  'docs/architecture',
  'docs/prompts',
  'memory/agents',
  'memory/global',
  'memory/sessions',
  'logs/agents',
  'logs/system',
]

for (const dir of dirs) {
  const fullPath = resolve(ROOT, dir)
  if (!existsSync(fullPath)) {
    mkdirSync(fullPath, { recursive: true })
    log(`Created ${dir}/`)
  }
}

// Init data/.gitkeep if data/ is empty
const dataDir = resolve(ROOT, 'data')
const dataFiles = existsSync(dataDir) ? [] : []
if (!existsSync(resolve(dataDir, '.gitkeep'))) {
  writeFileSync(resolve(dataDir, '.gitkeep'), '')
  log('Created data/.gitkeep')
}

log('Setup complete.')
