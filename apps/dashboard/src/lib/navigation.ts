export type Screen = 'workspace' | 'kanban' | 'files' | 'timeline' | 'settings' | 'agent-ide' | 'agents' | 'projects'

export interface NavigationState {
  screen: Screen
  projectId?: string
}
