---
sidebar_position: 2
sidebar_label: "Agent Lifecycle"
description: "kubeswarm agent lifecycle on Kubernetes - from kubectl apply to running pods. Understand how the operator creates Deployments, configures MCP tools, monitors health and scales agents."
---

# Agent Lifecycle

A kubeswarm SwarmAgent goes through these stages when deployed on Kubernetes - from apply to running, monitoring and scaling.

## 1. Apply

```bash
kubectl apply -f agent.yaml
```

The operator reads the SwarmAgent spec and creates:

- A **Deployment** with the configured replicas
- A **NetworkPolicy** based on `spec.networkPolicy` mode
- A **ServiceAccount** with minimal RBAC for event emission

## 2. Configure

The operator resolves the agent's configuration:

- Assembles the system prompt from `spec.prompt` + SwarmSettings fragments
- Resolves MCP server URLs (direct or via SwarmRegistry capability lookup)
- Injects all config as environment variables into the pod template

## 3. Run

Each agent pod:

- Connects to configured MCP servers for tool discovery
- Polls the task queue (Redis Streams) for incoming tasks
- Runs the agentic tool-use loop: call LLM, execute tools, repeat
- Reports token usage back via the queue

## 4. Monitor

The operator continuously:

- Probes MCP server health (HTTP GET every 60s)
- Tracks rolling 24h token usage against `spec.guardrails.limits.dailyTokens`
- Sets status conditions: `Ready`, `MCPDegraded`, `BudgetExceeded`
- Scales replicas to 0 when budget is exceeded, restores when the window rotates

## 5. Scale

With KEDA installed, `spec.runtime.autoscaling` scales pods based on pending task queue depth:

```yaml
runtime:
  autoscaling:
    minReplicas: 1
    maxReplicas: 10
    targetPendingTasks: 5
```

## Status

```bash
kubectl get swagent my-agent -o wide
kubectl describe swagent my-agent
```

Key status fields:

- `readyReplicas` / `replicas` - pod health
- `conditions` - Ready, MCPDegraded, BudgetExceeded
- `dailyTokenUsage` - rolling 24h input/output/total tokens
- `toolConnections[]` - per-server health with last check timestamp
