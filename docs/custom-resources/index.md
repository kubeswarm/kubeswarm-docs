---
title: Custom Resources
sidebar_position: 1
sidebar_label: "Overview"
description: Overview of all kubeswarm.io CRDs and how they relate to each other.
---

# kubeswarm Custom Resources - Kubernetes CRDs for Agents

kubeswarm extends Kubernetes with nine custom resources organized into four layers for agent orchestration.

| Resource      | Short   | Layer              | Analogy                  |
| ------------- | ------- | ------------------ | ------------------------ |
| SwarmAgent    | swagent | 3 - Compute        | `Deployment`             |
| SwarmTeam     | swteam  | 4 - Orchestration  | `CronJob` template       |
| SwarmRun      | swrun   | 4 - Orchestration  | `Job` instance           |
| SwarmEvent    | swevt   | 4 - Orchestration  | `CronJob` / `Ingress`    |
| SwarmRegistry | swreg   | 2 - Discovery      | Service registry         |
| SwarmSettings | swcfg   | 1 - Infrastructure | `ConfigMap` (LLM-aware)  |
| SwarmMemory   | swmem   | 1 - Infrastructure | `PersistentVolumeClaim`  |
| SwarmBudget   | swbgt   | 1 - Infrastructure | `ResourceQuota` (tokens) |
| SwarmNotify   | swnfy   | 1 - Infrastructure | Alertmanager route       |

API keys use native Kubernetes Secrets - no custom CRD. See [API Key Management](/security/api-key-management).

All CRDs are in `categories=kubeswarm`:

```bash
kubectl get kubeswarm -A
```

For complete field-level documentation, see the [API Reference](/reference/api).
