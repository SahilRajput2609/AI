# Global Memory

Global memory stores shared state accessible to all agents, such as project context, configuration flags, and cross-cutting data.

## Contents

- Application-wide configuration values
- Feature flags and toggles
- Shared project state

## API

Use `MemoryRepository` with `type: 'global'` to read/write global memory entries.
