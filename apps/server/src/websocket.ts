// src/websocket.ts
import { Server as HttpServer } from 'http';
import { WebSocketServer, WebSocket } from 'ws';

interface ExtendedWebSocket extends WebSocket {
  isAlive?: boolean;
  userId?: string;
  rooms?: Set<string>;
}

interface RoomManager {
  rooms: Map<string, Set<ExtendedWebSocket>>;
  join: (ws: ExtendedWebSocket, room: string) => void;
  leave: (ws: ExtendedWebSocket, room: string) => void;
  broadcast: (data: any, room?: string) => number;
  broadcastToUser: (data: any, userId: string) => number;
}

/**
 * Sets up a WebSocket server with room support for project-based updates.
 */
export function setupWebSocket(server: HttpServer) {
  const wss = new WebSocketServer({ server, path: '/ws' });
  const rooms: Map<string, Set<ExtendedWebSocket>> = new Map();

  // Room management
  const roomManager: RoomManager = {
    rooms,
    join: (ws: ExtendedWebSocket, room: string) => {
      if (!rooms.has(room)) rooms.set(room, new Set());
      rooms.get(room)!.add(ws);
      if (!ws.rooms) ws.rooms = new Set();
      ws.rooms.add(room);
      console.log(`Client joined room: ${room}`);
    },
    leave: (ws: ExtendedWebSocket, room: string) => {
      if (rooms.has(room)) {
        rooms.get(room)!.delete(ws);
        if (rooms.get(room)!.size === 0) rooms.delete(room);
      }
      if (ws.rooms) ws.rooms.delete(room);
      console.log(`Client left room: ${room}`);
    },
    broadcast: (data: any, room?: string) => {
      const message = JSON.stringify({ ...data, timestamp: new Date().toISOString() });
      let sentCount = 0;

      if (room) {
        if (rooms.has(room)) {
          rooms.get(room)!.forEach((client) => {
            if (client.readyState === client.OPEN) {
              client.send(message);
              sentCount++;
            }
          });
        }
      } else {
        wss.clients.forEach((client) => {
          if (client.readyState === client.OPEN) {
            client.send(message);
            sentCount++;
          }
        });
      }

      console.log(`Broadcast sent to ${sentCount} client(s)${room ? ` in room: ${room}` : ''}`);
      return sentCount;
    },
    broadcastToUser: (data: any, userId: string) => {
      const message = JSON.stringify({ ...data, timestamp: new Date().toISOString() });
      let sentCount = 0;

      wss.clients.forEach((client: ExtendedWebSocket) => {
        if (client.userId === userId && client.readyState === client.OPEN) {
          client.send(message);
          sentCount++;
        }
      });

      console.log(`Message sent to ${sentCount} connection(s) for user: ${userId}`);
      return sentCount;
    },
  };

  // Heartbeat mechanism to detect dead connections
  const heartbeatInterval = setInterval(() => {
    wss.clients.forEach((ws: ExtendedWebSocket) => {
      if (ws.isAlive === false) {
        ws.terminate();
        return;
      }
      ws.isAlive = false;
      ws.ping();
    });
  }, 30000);

  wss.on('connection', (ws: ExtendedWebSocket) => {
    ws.isAlive = true;
    ws.rooms = new Set();

    console.log('WebSocket client connected. Total clients:', wss.clients.size);

    // Send welcome event
    ws.send(JSON.stringify({
      type: 'connected',
      message: 'Connected to AI-Company server',
      timestamp: new Date().toISOString(),
    }));

    // Handle pong responses
    ws.on('pong', () => {
      ws.isAlive = true;
    });

    ws.on('message', (data) => {
      try {
        const message = JSON.parse(data.toString());
        console.log('WebSocket message received:', message.type);

        // Handle different message types
        if (message.type === 'join_room') {
          const { room } = message;
          roomManager.join(ws, room);
          ws.send(JSON.stringify({ type: 'room_joined', room, timestamp: new Date().toISOString() }));
        } else if (message.type === 'leave_room') {
          const { room } = message;
          roomManager.leave(ws, room);
          ws.send(JSON.stringify({ type: 'room_left', room, timestamp: new Date().toISOString() }));
        } else if (message.type === 'set_user') {
          ws.userId = message.userId;
          ws.send(JSON.stringify({ type: 'user_set', userId: message.userId, timestamp: new Date().toISOString() }));
        } else if (message.type === 'ping') {
          ws.send(JSON.stringify({ type: 'pong', timestamp: new Date().toISOString() }));
        } else {
          // Echo unknown messages
          ws.send(JSON.stringify({ type: 'echo', data: message, timestamp: new Date().toISOString() }));
        }
      } catch (error) {
        console.error('Error handling WebSocket message:', error);
        ws.send(JSON.stringify({ type: 'error', message: 'Invalid message format', timestamp: new Date().toISOString() }));
      }
    });

    ws.on('error', (error) => {
      console.error('WebSocket error:', error.message);
    });

    ws.on('close', () => {
      // Clean up rooms
      if (ws.rooms) {
        ws.rooms.forEach((room) => {
          roomManager.leave(ws, room);
        });
      }
      console.log('WebSocket client disconnected. Total clients:', wss.clients.size - 1);
    });
  });

  wss.on('error', (error) => {
    console.error('WebSocket server error:', error);
  });

  // Cleanup on server close
  const originalClose = server.close.bind(server);
  server.close = function(...args: any[]) {
    clearInterval(heartbeatInterval);
    wss.clients.forEach((ws) => {
      ws.close();
    });
    wss.close();
    return originalClose(...args);
  };

  // Export broadcast utility (now with room support)
  const broadcast = (data: any) => roomManager.broadcast(data);

  return { wss, broadcast, roomManager };
}
