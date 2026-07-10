# Agent Memory

Per-agent memory stores contextual state and learned information for each agent instance.

## Structure

- `agents/<agentId>/` — Individual agent memory stores
- Each store contains session data, preferences, and learned patterns

## Usage

Memory is automatically persisted and loaded when agents process tasks. Use the `MemoryRepository` to query or update agent memory programmatically.
