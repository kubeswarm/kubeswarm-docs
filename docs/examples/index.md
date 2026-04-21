---
title: Examples
sidebar_position: 1
sidebar_label: "Overview"
description: Production-ready example recipes from the kubeswarm cookbook.
---

# Examples

Production-ready kubeswarm cookbook recipes showcasing every major feature. Each recipe is self-contained with a README and YAML files you can apply directly.

### Getting Started

| Recipe | Pattern | What it shows |
|--------|---------|---------------|
| [01 - Standalone Agent](https://github.com/kubeswarm/kubeswarm-cookbook/tree/main/recipes/01-standalone-agent) | Single agent | Deploy an agent, trigger a task, read the result |
| [02 - Pipeline Team](https://github.com/kubeswarm/kubeswarm-cookbook/tree/main/recipes/02-pipeline-team) | Pipeline DAG | Multi-step pipeline with data flow between agents |
| [03 - Dynamic Delegation](https://github.com/kubeswarm/kubeswarm-cookbook/tree/main/recipes/03-dynamic-delegation) | Dynamic mode | Coordinator delegates to specialists at runtime |
| [04 - Routed Dispatch](https://github.com/kubeswarm/kubeswarm-cookbook/tree/main/recipes/04-routed-dispatch) | LLM dispatch | Capability-based agent selection via SwarmRegistry |
| [05 - Advisor Pattern](https://github.com/kubeswarm/kubeswarm-cookbook/tree/main/recipes/05-advisor-pattern) | Agent-to-Agent | Agents consult each other with context propagation |

### Features

| Recipe | Pattern | What it shows |
|--------|---------|---------------|
| [06 - Validation Gates](https://github.com/kubeswarm/kubeswarm-cookbook/tree/main/recipes/06-validation-gates) | Output validation | Regex, semantic (LLM-judged), and prompt injection defense |
| [07 - Conditional and Loops](https://github.com/kubeswarm/kubeswarm-cookbook/tree/main/recipes/07-conditional-and-loops) | Flow control | Skip steps with `if`, repeat steps with `loop` |
| [08 - Budget and Policy](https://github.com/kubeswarm/kubeswarm-cookbook/tree/main/recipes/08-budget-and-policy) | Governance | Cost limits, model restrictions, compliance enforcement |
| [09 - Audit and Redaction](https://github.com/kubeswarm/kubeswarm-cookbook/tree/main/recipes/09-audit-and-redaction) | Observability | Structured audit trail with PII and secret scrubbing |
| [10 - Settings Composition](https://github.com/kubeswarm/kubeswarm-cookbook/tree/main/recipes/10-settings-composition) | Configuration | Shared prompt fragments and security defaults |

### Operations

| Recipe | Pattern | What it shows |
|--------|---------|---------------|
| [11 - S3 Artifacts](https://github.com/kubeswarm/kubeswarm-cookbook/tree/main/recipes/11-s3-artifacts) | Storage | Save pipeline output to S3 or MinIO |
| [12 - Cron Triggers](https://github.com/kubeswarm/kubeswarm-cookbook/tree/main/recipes/12-cron-triggers) | Scheduling | Automated agent execution via SwarmEvent |
| [13 - Notifications](https://github.com/kubeswarm/kubeswarm-cookbook/tree/main/recipes/13-notifications) | Alerting | Discord/Slack/webhook alerts on run completion |
| [14 - Context Compression](https://github.com/kubeswarm/kubeswarm-cookbook/tree/main/recipes/14-context-compression) | Optimization | Compress verbose output before passing downstream |

## Quick start

```bash
git clone https://github.com/kubeswarm/kubeswarm-cookbook.git
cd kubeswarm-cookbook

# Deploy the simplest recipe
kubectl apply -f recipes/01-standalone-agent/agent.yaml
kubectl get swrun hello-test -w
```
