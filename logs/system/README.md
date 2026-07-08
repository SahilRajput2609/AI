# System Logs

System-level logs for the AI Agency platform, including server events, startup/shutdown, and infrastructure operations.

## Contents
- Server startup and shutdown events
- WebSocket connection/disconnection
- API request errors (4xx/5xx)
- Database operations
- Configuration changes

## Monitoring
Use `GET /api/activities` for real-time event monitoring. System logs are also written to this directory for persistent storage.
