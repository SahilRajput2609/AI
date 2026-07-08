import { Router } from 'express';
import { Owner } from '../../../../agents/owner/owner';
import { Planner } from '../../../../agents/planner/planner';
import { Orchestrator } from '../../../../agents/orchestrator/orchestrator';
const owner = new Owner();
const planner = new Planner();
const orchestrator = new Orchestrator();
let broadcastFn = null;
export function setBroadcast(fn) {
    broadcastFn = fn;
}
function broadcast(data) {
    if (broadcastFn)
        broadcastFn(data);
}
export const apiRouter = Router();
apiRouter.get('/status', (_req, res) => {
    res.json({
        status: 'running',
        agents: ['Owner', 'Planner', 'Orchestrator'],
        uptime: process.uptime(),
    });
});
apiRouter.get('/tasks', (_req, res) => {
    const state = owner.getService().getState();
    res.json(state.tasks);
});
apiRouter.post('/tasks', (req, res) => {
    const { title, description, priority, category } = req.body;
    if (!title) {
        res.status(400).json({ error: 'title is required' });
        return;
    }
    const task = owner.createAndSubmitTask(title, description || '', priority || 'medium', category || 'general');
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
apiRouter.post('/tasks/:id/review', (req, res) => {
    const { approved, feedback } = req.body;
    if (approved) {
        owner.approveTask(req.params.id, feedback);
    }
    else {
        owner.rejectTask(req.params.id, feedback || 'No feedback provided');
    }
    broadcast({ type: 'task:reviewed', taskId: req.params.id, approved });
    res.json({ status: 'ok' });
});
apiRouter.get('/plans', (_req, res) => {
    const state = planner.getService().getState();
    res.json(state.plans);
});
apiRouter.post('/plans', (req, res) => {
    const { taskId, title } = req.body;
    if (!taskId || !title) {
        res.status(400).json({ error: 'taskId and title are required' });
        return;
    }
    const plan = planner.createExecutionPlan(taskId, title);
    broadcast({ type: 'plan:created', plan });
    res.status(201).json(plan);
});
apiRouter.post('/plans/:id/subtasks', (req, res) => {
    const { description, estimatedEffort, assignedRole, dependencies } = req.body;
    if (!description || !assignedRole) {
        res.status(400).json({ error: 'description and assignedRole are required' });
        return;
    }
    const subTask = planner.addTask(req.params.id, description, estimatedEffort || 'medium', assignedRole, dependencies || []);
    if (!subTask) {
        res.status(404).json({ error: 'plan not found' });
        return;
    }
    res.status(201).json(subTask);
});
apiRouter.post('/plans/:id/finalize', (req, res) => {
    planner.finalizePlan(req.params.id);
    broadcast({ type: 'plan:finalized', planId: req.params.id });
    res.json({ status: 'ok' });
});
apiRouter.get('/orchestrator/state', (_req, res) => {
    res.json({ status: 'running', message: 'Orchestrator is active' });
});
