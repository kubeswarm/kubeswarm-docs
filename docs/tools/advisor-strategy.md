---
sidebar_position: 4
sidebar_label: "Advisor Strategy"
description: "kubeswarm advisor strategy - on-demand expert consultation where a cheap executor model calls an expensive advisor model with automatic conversation context sharing on Kubernetes."
---

# Advisor Strategy

The advisor strategy lets a cheap, fast model (the executor) call an expensive, capable model (the advisor) for expert guidance during task execution. The advisor automatically sees the executor's recent conversation context - no manual context passing needed.

## When to Use

Use the advisor pattern when:

- A cheap model handles 90% of the work but needs expert help on hard decisions
- You want cost control - the expensive model only runs when asked
- The advisor needs to see what the executor has been doing, not just a cold question

## Quick Start

```yaml
apiVersion: kubeswarm.io/v1alpha1
kind: SwarmAgent
metadata:
  name: coder
spec:
  model: claude-sonnet-4-6
  prompt:
    inline: |
      You are a software engineer. Use consult_architect when
      facing architectural decisions or complex debugging.
  agents:
    - name: architect
      agentRef:
        name: senior-architect
      role: advisor
      instructions: >
        Consult when facing architectural trade-offs or when
        your solution has more than two viable approaches.
      contextPropagation:
        recentMessages: 30
        maxCallsPerTask: 5
        timeoutSeconds: 90
---
apiVersion: kubeswarm.io/v1alpha1
kind: SwarmAgent
metadata:
  name: senior-architect
spec:
  model: claude-opus-4-6
  prompt:
    inline: |
      You are a senior software architect. Review the context
      and give concise, actionable advice.
```

The operator auto-injects a `consult_architect` tool into the coder's tool list. No MCP exposure or manual wiring needed.

## How It Works

1. The executor (Sonnet) processes a task normally
2. The executor's LLM decides to call `consult_architect("Should I use event sourcing here?")`
3. kubeswarm automatically attaches the executor's last 30 conversation messages to the call
4. The advisor (Opus) sees the question plus the executor's full working context
5. The advisor's response returns as a tool result - the executor incorporates it and continues

The executor always produces the final answer. The advisor gives guidance, not output.

## Context Propagation

The key difference from regular [agent-to-agent](../tools/agent-to-agent.md) calls is automatic context sharing. Without it, the advisor only sees what the executor explicitly passes in the tool call input.

### What the advisor receives

- The executor's recent conversation entries (configurable via `recentMessages`)
- The executor's system prompt (unless `excludeSystemPrompt: true`)
- Tool results from the current turn, normalised to plain text

### Context normalisation

Tool-use messages are converted to plain text so the advisor works regardless of model:

```
[Tool: github/read_file] Input: {"path":"main.go"} -> Output: package main...
```

## Configuration Reference

All fields on `contextPropagation`:

| Field | Default | Range | Description |
|-------|---------|-------|-------------|
| `recentMessages` | 20 | 1-200 | Conversation entries included in context |
| `maxCallsPerTask` | 3 | 1-50 | Max advisor calls per task attempt |
| `timeoutSeconds` | 60 | 5-300 | Per-call wall-clock timeout |
| `maxAdvisorTokensPerTask` | 0 | 0+ | Cumulative token cap (0 = no limit) |
| `maxContextBytes` | 262144 | 1024-1048576 | Serialised context payload cap |
| `excludeSystemPrompt` | false | | Hide executor's system prompt from advisor |
| `toolName` | | pattern: `^[a-z][a-z0-9_]*$` | Override auto-generated tool name |

## Tool Name

By default the tool is named `consult_<name>` where `<name>` is the connection name, lowercased with hyphens replaced by underscores. Override with `toolName`:

```yaml
- name: security
  role: advisor
  agentRef:
    name: security-reviewer
  contextPropagation:
    toolName: review_security  # instead of consult_security
```

## Multiple Advisors

An agent can have multiple advisors with independent budgets:

```yaml
agents:
  - name: architect
    role: advisor
    agentRef: { name: senior-architect }
    contextPropagation:
      recentMessages: 30
      maxCallsPerTask: 5
      maxAdvisorTokensPerTask: 50000

  - name: security
    role: advisor
    agentRef: { name: security-reviewer }
    contextPropagation:
      recentMessages: 5
      maxCallsPerTask: 2
      maxAdvisorTokensPerTask: 20000
      excludeSystemPrompt: true
      toolName: review_security
```

## Safety Controls

### Call limits

After `maxCallsPerTask` is exceeded, the tool returns a structured error:

```json
{"error": "advisor_limit_exceeded", "advisor": "architect", "limit": 5}
```

The executor receives this as a tool result and must proceed without further consultation.

### Timeout

The effective timeout is `min(timeoutSeconds, remaining task deadline)`. On timeout:

```json
{"error": "advisor_timeout", "advisor": "architect", "elapsed_seconds": 90}
```

### Unavailability

When the advisor has no ready replicas, the queue is full, or the circuit breaker is open:

```json
{"error": "advisor_unavailable", "advisor": "architect", "reason": "no_replicas"}
```

### Guardrails

The `consult_<name>` tool is subject to the same allow/deny rules as any other tool. Adding `consult_architect` to `guardrails.tools.deny` blocks the tool at invocation time.

## Constraints

- Advisors must be in the **same namespace** as the executor
- Advisor connections require `agentRef` (not `capabilityRef`)
- **Depth 1 only** - an advisor cannot itself have advisor connections
- No **self-reference** - an agent cannot be its own advisor

These are enforced at admission time by the webhook and at runtime by the MCP gateway.

## Status

The executor agent shows advisor health in its status:

```bash
kubectl describe swarmagent coder
```

```
Advisor Connections:
  Name:           architect
  Ready:          True
  Tool Injected:  True
  Tool Name:      consult_architect

Conditions:
  Type:    AdvisorsReady
  Status:  True
  Reason:  AllAdvisorsReady
```

## Observability

Each advisor call creates an `advisor.consult` OTel span with attributes:

- `kubeswarm.advisor.name` - connection name
- `kubeswarm.advisor.tool_name` - resolved tool name
- `kubeswarm.advisor.call_index` - which call this is (1, 2, 3...)
- `kubeswarm.advisor.call_budget_remaining` - calls left
- `kubeswarm.advisor.outcome` - `success`, `timeout`, `unavailable`, `limit_exceeded`

## What This Is Not

- **Not model cascading** - cascading is automatic fallback on validation failure. The advisor is called by the executor's judgment.
- **Not a shared scratchpad** - the advisor receives a snapshot, not persistent shared memory. For that, use [SwarmMemory](../intelligence/memory.md).
- **Not multi-agent debate** - the advisor responds once per call. No back-and-forth negotiation.

## See Also

- [Agent-to-Agent Connections](../tools/agent-to-agent.md) - the foundation the advisor pattern builds on
- [Guardrails and Trust](../safety/guardrails.md) - tool permissions that apply to advisor tools
- [API Reference](/reference/api) - AgentConnection, ContextPropagationConfig type details
