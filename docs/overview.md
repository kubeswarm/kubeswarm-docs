---
slug: /
sidebar_position: 1
sidebar_label: "Overview"
description: "kubeswarm is a Kubernetes operator for agent orchestration. Deploy, scale and operate LLM-powered agents with MCP tools, guardrails and team workflows using kubectl."
---

# Overview

**Orchestrate AI agents at swarm scale.**

kubeswarm is a Kubernetes operator that manages LLM-powered agents as first-class resources. Define your agents in YAML, connect MCP tools, deploy with `kubectl apply` and operate with the same Kubernetes tooling you already use for services.

## Design principles

- **Vendor-agnostic** - no vendor lock-in at any layer. LLM providers, task queues, vector stores, and artifact backends are all pluggable interfaces. Swap Anthropic for OpenAI, Redis for SQS, Qdrant for pgvector - the operator doesn't care. Bring your own infrastructure.
- **Security-first** - every agent pod runs as non-root with read-only filesystem, dropped capabilities, and network policies. API keys live in Kubernetes Secrets, never in YAML. Tool allow/deny lists, per-tool trust levels, and prompt injection defenses are built in - not bolted on.
- **Hard limits, not soft warnings** - SwarmBudget enforces daily token limits with a hard stop. When the budget is exhausted, tasks are rejected - not logged and ignored. Circuit breakers trip on consecutive failures. Cost control is a first-class primitive.
- **Token-efficient by default** - tool result sandboxing intercepts large outputs before they enter the LLM context, replacing them with compact digests. Combined with semantic dedup and in-loop compression, agents use 50-90% fewer tokens on tool-heavy tasks.
- **Scale to zero, scale to thousands** - KEDA-based autoscaling manages agent replicas. Pods scale to zero when idle and spin up on demand. Redis Streams distribute tasks across replicas with consumer groups. The operator itself is stateless.

## What kubeswarm does for agent teams

- **Manages agent pods** - replicas, KEDA autoscaling, health checks, rolling restarts
- **Connects MCP tools** - bearer auth, mTLS, per-tool trust levels, custom headers
- **Orchestrates agent teams** - pipeline DAGs, dynamic delegation, LLM-routed dispatch
- **Enforces guardrails** - tool allow/deny lists, token budgets, network policies
- **Tracks every execution** - immutable run records with token usage and step outputs
- **Integrates natively** - OpenTelemetry, Prometheus, KEDA, Kubernetes RBAC

## Install kubeswarm on Kubernetes

```bash
helm repo add kubeswarm https://kubeswarm.github.io/helm-charts
helm install kubeswarm kubeswarm/kubeswarm \
  --namespace kubeswarm-system --create-namespace
```

## Deploy your first agent on Kubernetes

```yaml
apiVersion: kubeswarm.io/v1alpha1
kind: SwarmAgent
metadata:
  name: hello-agent
spec:
  model: claude-sonnet-4-6
  prompt:
    inline: "You are a helpful assistant."
  infrastructure:
    apiKeyRef:
      name: provider-api-keys
      key: ANTHROPIC_API_KEY
```

```bash
kubectl apply -f agent.yaml
kubectl get swagent -w
```

## Next steps

- [Quick Start](/quick-start) - full walkthrough with a local model (no API keys needed)
- [Deploy an agent](/core/deploy-an-agent) - deploy, configure resources, verify
- [Connect MCP tools](/tools/connect-mcp-tools) - give your agent capabilities
- [kubeswarm Architecture](/core/architecture) - understand the resource model
- [Examples](/examples/) - cookbook recipes for every kubeswarm feature
