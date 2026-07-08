# Agent Logs

Per-agent log files recording agent actions, decisions, and errors.

## Rotation
Logs are rotated daily. Archive logs are retained for 30 days.

## Format
```
[timestamp] [LEVEL] [agentId] message
```
Levels: INFO, WARN, ERROR, DEBUG
