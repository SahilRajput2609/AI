# Agent Prompts

Each agent in the AI Agency has a role-specific system prompt defined in `configs/prompts/system.json`. Prompts are loaded at agent initialization and used when the agent processes tasks.

## Prompt Structure

```
System: <role-specific system prompt>
Context: <current task context and project state>
Input: <task description or action payload>
Output: <structured response>
```

## Customization

To customize an agent's prompt, modify the corresponding entry in `configs/prompts/system.json` or use the Agent Configuration screen in the dashboard to set custom parameters.

## Best Practices

- Keep prompts concise and role-specific
- Include output format expectations
- Reference project conventions where applicable
