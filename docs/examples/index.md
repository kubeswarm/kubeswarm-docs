---
title: Examples
sidebar_position: 1
sidebar_label: "Overview"
description: Production-ready example recipes from the kubeswarm cookbook.
---

# kubeswarm Examples - Agent Cookbook Recipes

Production-ready kubeswarm cookbook recipes showcasing every major agent orchestration feature on Kubernetes.

| Recipe                                                                                                       | Pattern         | What it shows                                            |
| ------------------------------------------------------------------------------------------------------------ | --------------- | -------------------------------------------------------- |
| [00 - Local Quickstart](https://github.com/kubeswarm/kubeswarm-cookbook/tree/main/teams/00-local-quickstart) | Hello world     | Ollama/Qwen, zero API keys                               |
| [01 - Standalone Agent](https://github.com/kubeswarm/kubeswarm-cookbook/tree/main/teams/01-standalone-agent) | Single agent    | MCP tools, bearer auth, guardrails, health check         |
| [02 - Agent with A2A](https://github.com/kubeswarm/kubeswarm-cookbook/tree/main/teams/02-agent-with-a2a)     | Agent-to-Agent  | `agents[]` connections, trust levels, webhook tools      |
| [03 - Pipeline Team](https://github.com/kubeswarm/kubeswarm-cookbook/tree/main/teams/03-pipeline-team)       | Pipeline DAG    | SwarmTeam, `dependsOn`, template expressions             |
| [04 - Routed Team](https://github.com/kubeswarm/kubeswarm-cookbook/tree/main/teams/04-routed-team)           | LLM dispatch    | SwarmRegistry, capability-based routing                  |
| [05 - Deep Research](https://github.com/kubeswarm/kubeswarm-cookbook/tree/main/teams/05-deep-research)       | Loop policy     | Dedup, compression, vector memory                        |
| [06 - Production Ops](https://github.com/kubeswarm/kubeswarm-cookbook/tree/main/teams/06-production-ops)     | Full production | Budget, notify, events, autoscaling, strict network      |
| [07 - Parallel Fan-Out](https://github.com/kubeswarm/kubeswarm-cookbook/tree/main/teams/07-parallel-fan-out) | Fan-out/fan-in  | `spawn_and_collect`, cross-role delegation, KEDA scaling |

## Quick start

```bash
git clone https://github.com/kubeswarm/kubeswarm-cookbook.git
cd cookbook

# Deploy the simplest recipe (no API keys needed)
kubectl apply -f teams/00-local-quickstart/agent.yaml
kubectl get swagent -w
```
