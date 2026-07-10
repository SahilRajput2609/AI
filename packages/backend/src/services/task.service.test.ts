import { describe, it, expect, vi, beforeEach } from 'vitest'
import { TaskService } from './task.service.js'

const mockRepo = {
  create: vi.fn(),
  findById: vi.fn(),
  update: vi.fn(),
  delete: vi.fn(),
  findAll: vi.fn(),
}

vi.mock('@ai-company/database', () => ({
  TaskRepository: vi.fn(() => mockRepo),
}))

describe('TaskService', () => {
  let service: TaskService

  beforeEach(() => {
    vi.clearAllMocks()
    service = new TaskService()
  })

  it('creates a task', async () => {
    const data = { title: 'Test', priority: 'high' as const, projectId: 'project-1', assignedTo: 'agent-1' }
    const expected = {
      id: 'task-1',
      project_id: 'project-1',
      title: 'Test',
      priority: 'high',
      assigned_agent: 'agent-1',
      status: 'pending',
      tags: [],
      attachments: 0,
      comments: 0,
      progress: 0,
    }
    mockRepo.create.mockResolvedValue(expected)

    const result = await service.createTask(data)
    expect(result).toEqual(expected)
    expect(mockRepo.create).toHaveBeenCalledWith({
      project_id: 'project-1',
      title: 'Test',
      description: undefined,
      priority: 'high',
      assigned_agent: 'agent-1',
      status: 'pending',
      tags: [],
      attachments: 0,
      comments: 0,
      progress: 0,
    })
  })

  it('gets a task by id', async () => {
    const task = { id: 'task-1', title: 'Task' }
    mockRepo.findById.mockResolvedValue(task)

    const result = await service.getTask('task-1')
    expect(result).toEqual(task)
  })

  it('returns null when task not found', async () => {
    mockRepo.findById.mockResolvedValue(null)
    expect(await service.getTask('unknown')).toBeNull()
  })

  it('updates a task', async () => {
    const updated = { id: 'task-1', title: 'Updated', status: 'in_progress' }
    mockRepo.update.mockResolvedValue(updated)

    const result = await service.updateTask('task-1', { title: 'Updated' })
    expect(result).toEqual(updated)
  })

  it('deletes a task', async () => {
    mockRepo.delete.mockResolvedValue(true)
    expect(await service.deleteTask('task-1')).toBe(true)
  })

  it('lists tasks with filters', async () => {
    mockRepo.findAll.mockResolvedValue([])
    await service.listTasks({ status: 'pending' })
    expect(mockRepo.findAll).toHaveBeenCalledWith({ status: 'pending' })
  })

  it('updates task status', async () => {
    mockRepo.update.mockResolvedValue({ id: 'task-1', status: 'in_progress' })
    await service.updateTaskStatus('task-1', 'in_progress')
    expect(mockRepo.update).toHaveBeenCalledWith('task-1', { status: 'in_progress', updated_at: expect.any(Number) })
  })

  it('assigns a task', async () => {
    mockRepo.update.mockResolvedValue({ id: 'task-1', assigned_agent: 'agent-1' })
    await service.assignTask('task-1', 'agent-1')
    expect(mockRepo.update).toHaveBeenCalledWith('task-1', {
      assigned_agent: 'agent-1',
      updated_at: expect.any(Number),
    })
  })

  it('gets tasks by project', async () => {
    mockRepo.findAll.mockResolvedValue([])
    await service.getTasksByProject('project-1')
    expect(mockRepo.findAll).toHaveBeenCalledWith({ projectId: 'project-1' })
  })

  it('gets tasks by agent', async () => {
    mockRepo.findAll.mockResolvedValue([])
    await service.getTasksByAgent('agent-1')
    expect(mockRepo.findAll).toHaveBeenCalledWith({ assignedTo: 'agent-1' })
  })
})
