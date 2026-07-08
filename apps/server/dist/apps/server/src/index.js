import 'dotenv/config';
import express from 'express';
import { createServer } from 'http';
import { WebSocketServer } from 'ws';
import { fileURLToPath } from 'url';
import { dirname, join } from 'path';
import { apiRouter, setBroadcast } from './routes/api.js';
const PORT = parseInt(process.env.PORT || '3001', 10);
const isDev = process.env.NODE_ENV !== 'production';
const app = express();
const server = createServer(app);
const wss = new WebSocketServer({ server });
app.use(express.json());
app.use((_req, res, next) => {
    res.setHeader('Access-Control-Allow-Origin', '*');
    res.setHeader('Access-Control-Allow-Methods', 'GET, POST, PUT, DELETE, OPTIONS');
    res.setHeader('Access-Control-Allow-Headers', 'Content-Type');
    if (_req.method === 'OPTIONS') {
        res.sendStatus(204);
        return;
    }
    next();
});
wss.on('connection', (ws) => {
    console.log('WebSocket client connected');
    ws.send(JSON.stringify({ type: 'connected', message: 'AI-Company server connected' }));
    ws.on('close', () => {
        console.log('WebSocket client disconnected');
    });
});
function broadcast(data) {
    const message = JSON.stringify(data);
    wss.clients.forEach((client) => {
        if (client.readyState === 1) {
            client.send(message);
        }
    });
}
setBroadcast(broadcast);
app.use('/api', apiRouter);
if (!isDev) {
    const __filename = fileURLToPath(import.meta.url);
    const __dirname = dirname(__filename);
    const distPath = join(__dirname, '..', '..', 'dashboard', 'dist');
    app.use(express.static(distPath));
    app.get('*', (_req, res) => {
        res.sendFile(join(distPath, 'index.html'));
    });
}
server.listen(PORT, () => {
    console.log(`AI-Company server running on http://localhost:${PORT}`);
    if (isDev) {
        console.log(`Dashboard dev server at http://localhost:5173`);
    }
});
