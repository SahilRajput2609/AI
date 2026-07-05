import { Owner } from '../../../agents/owner/owner'
import { Planner } from '../../../agents/planner/planner'
import { Orchestrator } from '../../../agents/orchestrator/orchestrator'
import { Api } from '../../../agents/api/api'
import { Backend } from '../../../agents/backend/backend'
import { Database } from '../../../agents/database/database'
import { Debugger } from '../../../agents/debugger/debugger'
import { DevOps } from '../../../agents/devops/devops'
import { Documentation } from '../../../agents/documentation/documentation'
import { Frontend } from '../../../agents/frontend/frontend'
import { QA } from '../../../agents/qa/qa'
import { Reviewer } from '../../../agents/reviewer/reviewer'

export type AgentRole =
  | 'owner' | 'planner' | 'orchestrator'
  | 'api' | 'backend' | 'database' | 'debugger' | 'devops'
  | 'documentation' | 'frontend' | 'qa' | 'reviewer'

export type AgentAction =
  | 'createEndpoint' | 'deployEndpoint' | 'listEndpoints'
  | 'createService' | 'implementService'
  | 'designSchema' | 'createMigration' | 'optimizeQuery'
  | 'analyzeError' | 'suggestFix' | 'applyFix'
  | 'deploy' | 'configureCI' | 'rollback'
  | 'generateDocs' | 'updateDocs' | 'reviewDocs'
  | 'createComponent' | 'implementFeature' | 'styleComponent'
  | 'writeTests' | 'runTests' | 'validateCoverage'
  | 'reviewCode' | 'approveChanges' | 'requestChanges'
  | 'createAndSubmitTask' | 'approveTask' | 'rejectTask'
  | 'createExecutionPlan' | 'addTask' | 'finalizePlan'
  | 'handleOwnerTask' | 'dispatchTasks' | 'completeAndReview'

interface AgentInfo {
  id: string
  role: AgentRole
  name: string
  capabilities: string[]
  instance: any
}

export class AgentManager {
  private agents: Map<AgentRole, AgentInfo> = new Map()
  private orchestrator: Orchestrator
  private owner: Owner
  private planner: Planner

  constructor() {
    this.owner = new Owner()
    this.planner = new Planner()
    this.orchestrator = new Orchestrator()

    this.register('owner', 'Owner', ['task-management', 'review', 'approval'], this.owner)
    this.register('planner', 'Planner', ['planning', 'decomposition', 'scheduling'], this.planner)
    this.register('orchestrator', 'Orchestrator', ['coordination', 'dispatching', 'monitoring'], this.orchestrator)
    this.register('api', 'API Agent', ['api-design', 'endpoint-creation', 'routing'], new Api())
    this.register('backend', 'Backend Agent', ['backend-logic', 'services', 'middleware'], new Backend())
    this.register('database', 'Database Agent', ['schema-design', 'migrations', 'query-optimization'], new Database())
    this.register('debugger', 'Debugger', ['error-analysis', 'debugging', 'fix-suggestion'], new Debugger())
    this.register('devops', 'DevOps Agent', ['deployment', 'ci-cd', 'infrastructure'], new DevOps())
    this.register('documentation', 'Documentation Agent', ['docs-generation', 'readme', 'api-docs'], new Documentation())
    this.register('frontend', 'Frontend Agent', ['ui-components', 'styling', 'frontend-logic'], new Frontend())
    this.register('qa', 'QA Agent', ['testing', 'coverage', 'quality'], new QA())
    this.register('reviewer', 'Reviewer', ['code-review', 'quality-check', 'feedback'], new Reviewer())

    this.registerAgentsWithOrchestrator()
  }

  private register(role: AgentRole, name: string, capabilities: string[], instance: any): void {
    this.agents.set(role, { id: role, role, name, capabilities, instance })
  }

  private registerAgentsWithOrchestrator(): void {
    const orchestratorService = this.orchestrator['service']
    for (const [, info] of this.agents) {
      if (info.role !== 'orchestrator') {
        orchestratorService.registerAgent({
          id: info.id,
          name: info.name,
          capabilities: info.capabilities,
        })
      }
    }
  }

  listAgents(): { id: string; role: AgentRole; name: string; capabilities: string[]; status: string }[] {
    const result: { id: string; role: AgentRole; name: string; capabilities: string[]; status: string }[] = []
    for (const [, info] of this.agents) {
      const instance = info.instance as any
      const state = instance.service?.getState?.()
      const status = info.role === 'orchestrator' ? 'running'
        : info.role === 'owner' ? 'online'
        : state?.activePlanId ? 'running'
        : 'idle'
      result.push({ id: info.id, role: info.role, name: info.name, capabilities: info.capabilities, status })
    }
    return result
  }

  getAgentInfo(role: AgentRole): AgentInfo | undefined {
    return this.agents.get(role)
  }

  getOwner(): Owner { return this.owner }
  getPlanner(): Planner { return this.planner }
  getOrchestrator(): Orchestrator { return this.orchestrator }
  getOrchestratorService() {
    return (this.orchestrator as any).service
  }

  private getDefaultAction(role: AgentRole): AgentAction {
    const roleActions: Partial<Record<AgentRole, AgentAction>> = {
      api: 'createEndpoint',
      backend: 'createService',
      database: 'designSchema',
      debugger: 'analyzeError',
      devops: 'deploy',
      documentation: 'generateDocs',
      frontend: 'createComponent',
      qa: 'writeTests',
      reviewer: 'reviewCode',
    }
    return roleActions[role] || 'completeAndReview' as AgentAction
  }

  dispatch(role: AgentRole, action: AgentAction, payload: Record<string, any>): any {
    const agent = this.agents.get(role)
    if (!agent) throw new Error(`Unknown agent role: ${role}`)

    const instance = agent.instance
    const method = instance[action]
    if (!method) throw new Error(`Agent "${role}" does not support action "${action}"`)

    const args = Object.values(payload)
    return typeof method === 'function' ? method.apply(instance, args) : method
  }

  async dispatchFromQueue(): Promise<void> {
    const orchService = (this.orchestrator as any).service
    const state = orchService.getState()

    for (const task of state.taskQueue) {
      if (!task.assignedAgent) continue

      const role = task.assignedAgent as AgentRole
      const agent = this.agents.get(role)
      if (!agent) continue

      orchService.startTask(task.id)
      try {
        const action = this.getDefaultAction(role)
        const result = this.dispatch(role, action, { taskId: task.id, description: task.description })
        orchService.updateProgress(task.id, 'completed', result)
      } catch (err: any) {
        orchService.updateProgress(task.id, 'failed', null, err.message)
      }
    }
  }

  getQueueState() {
    return (this.orchestrator as any).service.getState()
  }
}
