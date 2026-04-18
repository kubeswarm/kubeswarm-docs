---
sidebar_position: 1
title: SwarmRegistry
description: Kubernetes-native capability index for agent discovery and routing.
---

# SwarmRegistry

SwarmRegistry is a capability index that enables agents and teams to discover each other by what they can do rather than by name. Instead of hardcoding agent references, you register capabilities and let the system resolve them at runtime.

## Why use a registry

Without a registry, every agent connection is a static reference:

```yaml
# Tightly coupled - breaks if agent is renamed or moved
agents:
  - name: writer
    agentRef:
      name: code-writer-v2
```

With a registry, connections resolve by capability:

```yaml
# Loosely coupled - any agent advertising "write-code" works
agents:
  - name: writer
    capabilityRef:
      name: write-code
```

This enables independent agent deployment, version upgrades without rewiring, and runtime load balancing.

## Creating a registry

```yaml
apiVersion: kubeswarm.io/v1alpha1
kind: SwarmRegistry
metadata:
  name: default
spec:
  scope: Namespace        # Namespace (default) or Cluster
  maxDepth: 3             # max agent-to-agent delegation depth
```

- **Namespace** scope indexes agents in the same namespace
- **Cluster** scope indexes agents across all namespaces

## Advertising capabilities

Agents register capabilities in their spec:

```yaml
apiVersion: kubeswarm.io/v1alpha1
kind: SwarmAgent
metadata:
  name: code-reviewer
spec:
  model: claude-sonnet-4-6
  prompt:
    inline: "You review code for quality and security issues."
  capabilities:
    - name: code-review
      description: Reviews code for bugs, security issues, and style
      tags: ["code", "security", "quality"]
      inputSchema:
        type: object
        properties:
          code:
            type: string
          language:
            type: string
    - name: security-audit
      description: Deep security audit of code changes
      tags: ["security"]
      exposeMCP: true       # also expose via MCP gateway
  infrastructure:
    registryRef:
      name: default         # link to the registry
```

The registry controller automatically indexes these capabilities and tracks agent readiness.

## MCP bindings

Map capability IDs to shared MCP server URLs for capabilities backed by external tools:

```yaml
spec:
  mcpBindings:
    - capabilityID: file-search
      url: http://mcp-filesystem.tools.svc:8080/sse
```

## Resolution strategies

When multiple agents advertise the same capability, the registry selects based on:

1. **Readiness** - only ready agents are considered
2. **Load** - agents with fewer pending tasks are preferred
3. **Tags** - optional tag filters narrow the candidate set

## Monitoring the registry

```bash
kubectl get swarmregistry default -o yaml
```

Status fields:

- `indexedAgents` - total agents in the index
- `fleet` - per-agent readiness and token usage
- `capabilities` - indexed capabilities with provider agents and tags
- `lastRebuild` - when the index was last rebuilt

## Usage in teams

Pipeline steps can reference capabilities instead of specific agents:

```yaml
pipeline:
  - name: review
    capabilityRef:
      name: code-review
    inputs:
      code: "{{ .steps.generate.output }}"
```

The registry resolves the best available agent at runtime.
