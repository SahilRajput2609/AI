export type FrontendFramework = 'react' | 'vue' | 'angular' | 'svelte' | 'nextjs' | 'nuxt'

export type ComponentStatus = 'planned' | 'in-progress' | 'implemented' | 'styled' | 'completed'

export interface FrontendTask {
  id: string
  componentName: string
  framework: FrontendFramework
  status: ComponentStatus
  props?: string[]
  fileName?: string
  createdAt: string
  completedAt?: string
}

export interface FrontendState {
  tasks: FrontendTask[]
  completedComponents: string[]
}
