---
sidebar_position: 1
sidebar_label: "Architecture"
description: "kubeswarm architecture - four-layer resource model for Kubernetes agent orchestration. Understand how SwarmAgent, SwarmTeam, SwarmRegistry and infrastructure resources relate."
---

# Architecture

kubeswarm organizes its Kubernetes agent resources into four layers. References flow upward only - a lower-layer resource never depends on a higher one. This layered architecture keeps blast radius contained and gives every kubeswarm primitive a principled home.

## Resource Layers

```
┌─────────────────────────────────────────────────────────────────┐
│  4 - Orchestration                                              │
│  SwarmTeam  ·  SwarmRun  ·  SwarmEvent                          │
│  Compose agents into workflows, track execution, trigger runs   │
├─────────────────────────────────────────────────────────────────┤
│  3 - Compute                                                    │
│  SwarmAgent                                                     │
│  The atomic unit - manages a pool of LLM agent pods             │
├─────────────────────────────────────────────────────────────────┤
│  2 - Discovery                                                  │
│  SwarmRegistry                                                  │
│  Capability index - agents register, teams query                │
├─────────────────────────────────────────────────────────────────┤
│  1 - Infrastructure                                             │
│  SwarmSettings · SwarmMemory · SwarmBudget · SwarmNotify         │
│  SwarmPolicy                                                    │
│  Shared config, memory, spend control, notifications, policy    │
└─────────────────────────────────────────────────────────────────┘
         ▲ References flow upward only - no circular deps
```

API keys use native Kubernetes `Secrets` via `spec.apiKeyRef` or `spec.envFrom`.

## How Dispatch Works

Three mechanisms, each firing at a different point in time:

| Mechanism           | Decided by  | When           | Primitive                    |
| ------------------- | ----------- | -------------- | ---------------------------- |
| **Pipeline step**   | YAML author | Design time    | SwarmTeam pipeline DAG       |
| **Routed dispatch** | Router LLM  | Trigger time   | SwarmRegistry + routed mode  |
| **Tool call**       | Task LLM    | Inference time | MCP gateway / `agents[]` A2A |

## Build Bottom-up

1. **Infrastructure** - Create a Secret with your API key, optionally SwarmSettings, SwarmMemory, SwarmBudget
2. **Discovery** - A `default` SwarmRegistry is auto-created per namespace
3. **Compute** - Deploy SwarmAgents with `kubectl apply`
4. **Orchestration** - Compose SwarmTeams, wire SwarmEvents for automation

Standalone agents (step 3) are fully first-class - they support budgets, notifications, events and execution records without a team.
