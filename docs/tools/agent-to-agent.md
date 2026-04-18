---
sidebar_position: 3
sidebar_label: "Agent-to-Agent (A2A)"
description: "kubeswarm Agent-to-Agent (A2A) connections - Agents call other agents as tools on Kubernetes. Configure trust levels, registry discovery and operational instructions."
---

# Agent-to-Agent Connections

kubeswarm agents can call other agents as tools during inference via the `spec.agents[]` section. This enables agent-to-agent collaboration on Kubernetes without pipeline wiring.

## How It Works

```yaml
spec:
  agents:
    - name: researcher
      agentRef:
        name: research-agent # SwarmAgent in same namespace
      trust: internal
      instructions: "Use for all web research tasks."
    - name: search
      capabilityRef:
        name: code-search # resolved from SwarmRegistry
      trust: internal
```

When the agent's LLM decides to call `researcher`, kubeswarm routes the call through the MCP gateway to the target agent's exposed capabilities.

## agentRef vs capabilityRef

| Field           | Resolves to                                     | Use when                          |
| --------------- | ----------------------------------------------- | --------------------------------- |
| `agentRef`      | A specific SwarmAgent by name                   | You know which agent to call      |
| `capabilityRef` | Any agent with that capability in SwarmRegistry | You want registry-based discovery |

Exactly one must be set (enforced by CEL validation).

## Trust Levels

Each connection has a `trust` field that controls runtime behavior:

| Level      | Meaning                                       |
| ---------- | --------------------------------------------- |
| `internal` | Same organization/cluster - baseline behavior |
| `external` | Third-party - restricted                      |
| `sandbox`  | Untrusted/experimental - strictest validation |

The default trust level is set via `spec.guardrails.tools.trust.default`.

## Instructions

The `instructions` field injects operational context into the agent's system prompt for that specific connection. Use it to scope how the connection should be used:

```yaml
instructions: "Only use for PR creation. Never use for branch deletion."
```

## Connection Roles

Each connection has a `role` that controls its behavior:

| Role | Tool wiring | Context sharing | Use case |
|------|------------|-----------------|----------|
| `tool` (default) | Agent's exposed MCP capabilities | None - only tool call input | General agent-to-agent delegation |
| `advisor` | Auto-injected `consult_<name>` tool | Automatic - executor's recent conversation | Expert consultation with context |

### Advisor role

When `role: advisor` is set, kubeswarm auto-injects a `consult_<name>` tool and automatically attaches the executor's recent conversation context to each call. The executor's LLM decides when to ask for help - like a junior developer consulting a senior.

```yaml
agents:
  - name: architect
    agentRef:
      name: senior-architect
    role: advisor
    instructions: "Consult for architectural decisions."
    contextPropagation:
      recentMessages: 30
      maxCallsPerTask: 5
```

See [Advisor Strategy](../tools/advisor-strategy.md) for the full guide.
