import { Router } from 'express';
import { asyncHandler, validate } from '@ai-company/backend';
import { AgentManager } from '../agent-manager.js';
import { modelProvidersRouter } from './model-providers.js';
import { agentConfigsRouter } from './agent-configs.js';
import { filesRouter } from './files.js';
import { activitiesRouter } from './activities.js';
import { notificationsRouter, setNotificationBroadcast } from './notifications.js';
import { authRouter } from './auth.js';
import { oauthRouter } from './oauth.js';
import { projectsRouter } from './projects.js';
import { chatRouter, setChatBroadcast } from './chat.js';
import { versionsRouter } from './versions.js';
import { deploymentsRouter } from './deployments.js';
import { templatesRouter } from './templates.js';
import { settingsRouter } from './settings.js';
import { usersRouter } from './users.js';
const agentManager = new AgentManager();
const owner = agentManager.getOwner();
const planner = agentManager.getPlanner();
let broadcastFn = null;
export function setBroadcast(fn) {
    broadcastFn = fn;
    setChatBroadcast(fn);
    setNotificationBroadcast(fn);
}
export function broadcast(data) {
    if (broadcastFn)
        broadcastFn(data);
}
export const apiRouter = Router();
// ---- Core routes ----
apiRouter.use('/auth', authRouter);
apiRouter.use('/auth/oauth', oauthRouter);
apiRouter.use('/users', usersRouter);
apiRouter.use('/settings', settingsRouter);
apiRouter.use('/model-providers', modelProvidersRouter);
apiRouter.use('/agent-configs', agentConfigsRouter);
apiRouter.use('/files', filesRouter);
apiRouter.use('/activities', activitiesRouter);
apiRouter.use('/notifications', notificationsRouter);
// ---- New v2.0 routes ----
apiRouter.use('/projects', projectsRouter);
apiRouter.use('/chat', chatRouter);
apiRouter.use('/versions', versionsRouter);
apiRouter.use('/deployments', deploymentsRouter);
apiRouter.use('/templates', templatesRouter);
apiRouter.use('/deployments', deploymentsRouter);
apiRouter.use('/templates', templatesRouter);
// ---- Agent status routes ----
apiRouter.get('/agents', (_req, res) => {
    res.json(agentManager.listAgents());
});
apiRouter.get('/agents/:role', (req, res) => {
    const info = agentManager.getAgentInfo(req.params.role);
    if (!info) {
        res.status(404).json({ error: `Agent '${req.params.role}' not found` });
        return;
    }
    const instance = info.instance;
    const state = instance.service?.getState?.();
    res.json({
        id: info.id,
        role: info.role,
        name: info.name,
        capabilities: info.capabilities,
        isActive: !!instance.service,
        state: state || {},
    });
});
// ---- Task routes (Owner) ----
apiRouter.get('/tasks', (_req, res) => {
    const state = owner.getService().getState();
    res.json(state.tasks);
});
apiRouter.post('/tasks', validate([
    { field: 'title', required: true, type: 'string', minLength: 1, maxLength: 200 },
    { field: 'description', type: 'string', maxLength: 2000 },
    { field: 'priority', type: 'string', pattern: /^(low|medium|high|critical)$/ },
]), (req, res) => {
    const { title, description, priority, category, assignedRole } = req.body;
    const task = owner.createAndSubmitTask(title, description || '', priority || 'medium', category || 'general');
    if (assignedRole) {
        const orchService = agentManager.getOrchestratorService();
        orchService.queueTask({
            id: task.id,
            description: task.description,
            status: 'pending',
            dependencies: [],
            assignedAgent: assignedRole,
        });
        orchService.trackDependencies();
        broadcast({ type: 'task:queued', taskId: task.id, agent: assignedRole });
    }
    broadcast({ type: 'task:created', task });
    res.status(201).json(task);
});
apiRouter.get('/tasks/:id', (req, res) => {
    const task = owner.getService().getTask(req.params.id);
    if (!task) {
        res.status(404).json({ error: 'task not found' });
        return;
    }
    res.json(task);
});
apiRouter.put('/tasks/:id', asyncHandler(async (req, res) => {
    const { title, description, status, priority } = req.body;
    const svc = owner.getService();
    const task = await svc.getTask(req.params.id);
    if (!task) {
        res.status(404).json({ error: 'task not found' });
        return;
    }
    const updates = {};
    if (title)
        updates.title = title;
    if (description)
        updates.description = description;
    if (status)
        updates.status = status;
    if (priority)
        updates.priority = priority;
    const updated = await svc.updateTask(task.id, updates);
    broadcast({ type: 'task:updated', task: updated });
    res.json(updated);
}));
apiRouter.delete('/tasks/:id', asyncHandler(async (req, res) => {
    const svc = owner.getService();
    const task = await svc.getTask(req.params.id);
    if (!task) {
        res.status(404).json({ error: 'task not found' });
        return;
    }
    await svc.deleteTask(task.id);
    broadcast({ type: 'task:deleted', taskId: req.params.id });
    res.json({ status: 'deleted' });
}));
apiRouter.post('/tasks/:id/review', (req, res) => {
    const { approved, feedback } = req.body;
    if (typeof approved !== 'boolean') {
        res.status(400).json({ error: 'approved is required and must be a boolean' });
        return;
    }
    if (approved)
        owner.approveTask(req.params.id, feedback);
    else
        owner.rejectTask(req.params.id, feedback || 'No feedback provided');
    broadcast({ type: 'task:reviewed', taskId: req.params.id, approved });
    res.json({ status: 'ok' });
});
// ---- Plan routes (Planner) ----
apiRouter.get('/plans', (_req, res) => {
    const state = planner.getService().getState();
    res.json(state.plans);
});
apiRouter.post('/plans', validate([
    { field: 'taskId', required: true, type: 'string' },
    { field: 'title', required: true, type: 'string', minLength: 1, maxLength: 200 },
]), (req, res) => {
    const { taskId, title } = req.body;
    const plan = planner.createExecutionPlan(taskId, title);
    broadcast({ type: 'plan:created', plan });
    res.status(201).json(plan);
});
apiRouter.post('/plans/:id/subtasks', validate([
    { field: 'description', required: true, type: 'string', minLength: 1 },
    { field: 'assignedRole', required: true, type: 'string' },
    { field: 'estimatedEffort', type: 'string', pattern: /^(low|medium|high)$/ },
]), (req, res) => {
    const subTask = planner.addTask(req.params.id, req.body.description, req.body.estimatedEffort || 'medium', req.body.assignedRole, req.body.dependencies || []);
    if (!subTask) {
        res.status(404).json({ error: 'plan not found' });
        return;
    }
    res.status(201).json(subTask);
});
apiRouter.post('/plans/:id/finalize', (req, res) => {
    planner.finalizePlan(req.params.id);
    const plan = planner.getPlan(req.params.id);
    if (plan) {
        const orchService = agentManager.getOrchestratorService();
        for (const sub of plan.subtasks) {
            orchService.queueTask({
                id: `sub-${plan.id}-${sub.id}`,
                description: sub.description,
                status: 'pending',
                dependencies: sub.dependencies,
                assignedAgent: sub.assignedRole,
            });
        }
        orchService.trackDependencies();
        broadcast({ type: 'plan:dispatched', planId: req.params.id, subtaskCount: plan.subtasks.length });
    }
    broadcast({ type: 'plan:finalized', planId: req.params.id });
    res.json({ status: 'ok' });
});
// ---- Orchestrator routes ----
apiRouter.get('/orchestrator/state', (_req, res) => {
    const state = agentManager.getQueueState();
    res.json(state);
});
apiRouter.post('/orchestrator/dispatch', asyncHandler(async (_req, res) => {
    await agentManager.dispatchFromQueue();
    const state = agentManager.getQueueState();
    broadcast({ type: 'orchestrator:dispatched', state });
    res.json(state);
}));
// ---- Dispatch routes ----
apiRouter.post('/dispatch/:agentRole', (req, res) => {
    const { agentRole } = req.params;
    const { action, ...payload } = req.body;
    if (!action) {
        res.status(400).json({ error: 'action is required' });
        return;
    }
    try {
        const result = agentManager.dispatch(agentRole, action, payload);
        broadcast({ type: 'agent:dispatched', agentRole, action });
        res.json({ success: true, result });
    }
    catch (err) {
        res.status(400).json({ error: err.message });
    }
});
// ---- Status route ----
apiRouter.get('/status', (_req, res) => {
    const agents = agentManager.listAgents();
    res.json({
        status: 'running',
        agents: agents.map((a) => a.name),
        agentCount: agents.length,
        uptime: process.uptime(),
    });
});
