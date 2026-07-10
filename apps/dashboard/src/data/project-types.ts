export type ProjectType =
  | 'website'
  | 'landing-page'
  | 'portfolio'
  | 'dashboard'
  | 'crm'
  | 'erp'
  | 'admin-panel'
  | 'e-commerce'
  | 'react-app'
  | 'nextjs'
  | 'vue'
  | 'angular'
  | 'node-api'
  | 'python'
  | 'fastapi'
  | 'desktop-app'
  | 'electron'
  | 'flutter'
  | 'react-native'
  | 'ai-agent'
  | 'automation'
  | 'chrome-extension'
  | 'vscode-extension'
  | 'machine-learning'
  | 'blockchain'
  | 'iot'
  | 'game'
  | 'custom'

export const projectTypes: { value: ProjectType; label: string; category: string }[] = [
  // Frontend
  { value: 'website', label: 'Website', category: 'Frontend' },
  { value: 'landing-page', label: 'Landing Page', category: 'Frontend' },
  { value: 'portfolio', label: 'Portfolio', category: 'Frontend' },
  { value: 'dashboard', label: 'Dashboard', category: 'Frontend' },
  { value: 'react-app', label: 'React App', category: 'Frontend' },
  { value: 'nextjs', label: 'Next.js', category: 'Frontend' },
  { value: 'vue', label: 'Vue', category: 'Frontend' },
  { value: 'angular', label: 'Angular', category: 'Frontend' },
  // Backend
  { value: 'node-api', label: 'Node API', category: 'Backend' },
  { value: 'python', label: 'Python', category: 'Backend' },
  { value: 'fastapi', label: 'FastAPI', category: 'Backend' },
  // Full Application
  { value: 'crm', label: 'CRM', category: 'Full Application' },
  { value: 'erp', label: 'ERP', category: 'Full Application' },
  { value: 'admin-panel', label: 'Admin Panel', category: 'Full Application' },
  { value: 'e-commerce', label: 'E-commerce', category: 'Full Application' },
  // Desktop & Mobile
  { value: 'desktop-app', label: 'Desktop App', category: 'Desktop & Mobile' },
  { value: 'electron', label: 'Electron', category: 'Desktop & Mobile' },
  { value: 'flutter', label: 'Flutter', category: 'Desktop & Mobile' },
  { value: 'react-native', label: 'React Native', category: 'Desktop & Mobile' },
  // AI & Advanced
  { value: 'ai-agent', label: 'AI Agent', category: 'AI & Advanced' },
  { value: 'automation', label: 'Automation', category: 'AI & Advanced' },
  { value: 'machine-learning', label: 'Machine Learning', category: 'AI & Advanced' },
  { value: 'chrome-extension', label: 'Chrome Extension', category: 'AI & Advanced' },
  { value: 'vscode-extension', label: 'VSCode Extension', category: 'AI & Advanced' },
  { value: 'blockchain', label: 'Blockchain', category: 'AI & Advanced' },
  { value: 'iot', label: 'IoT', category: 'AI & Advanced' },
  { value: 'game', label: 'Game', category: 'AI & Advanced' },
  { value: 'custom', label: 'Custom', category: 'Other' },
]

export const suggestionChips = [
  'Build a landing page for a SaaS product',
  'Create a React dashboard with charts',
  'Make an e-commerce store with cart',
  'Build a REST API with authentication',
  'Create an AI chatbot application',
  'Build a portfolio website',
  'Design a task management app',
  'Create a blog with CMS',
]

export function getProjectTypeLabel(value: ProjectType): string {
  return projectTypes.find((t) => t.value === value)?.label || value
}
