---
sidebar_position: 3
sidebar_label: "Budget Management"
description: "kubeswarm budget management - per-agent daily token limits and shared SwarmBudget for agent cost control on Kubernetes."
---

# kubeswarm Budget Management - Agent Cost Control on Kubernetes

kubeswarm provides two levels of token budget enforcement for agents on Kubernetes: per-agent daily limits and shared SwarmBudget resources.

## Per-agent Daily Limit

Set directly on the agent:

```yaml
spec:
  guardrails:
    limits:
      dailyTokens: 1000000 # rolling 24h window
```

When exceeded:

1. `BudgetExceeded` condition set to True
2. Replicas scaled to 0 (no new tasks accepted)
3. Operator calculates when the oldest usage leaves the 24h window
4. Replicas restored automatically when budget rotates

## SwarmBudget (shared)

For team-wide or cross-agent budgets:

```yaml
apiVersion: kubeswarm.io/v1alpha1
kind: SwarmBudget
metadata:
  name: team-budget
spec:
  selector:
    team: research-pipeline
  period: monthly
  limit: "500.00"       # decimal USD string
  warnAt: 80            # notify at 80% usage
  hardStop: true        # reject tasks when budget exceeded
  notifyRef:
    name: slack-alerts  # optional SwarmNotify reference
```

Reference from agents:

```yaml
spec:
  guardrails:
    budgetRef:
      name: team-budget
```

## Monitoring

```bash
kubectl get swbgt team-budget
kubectl get swagent my-agent -o jsonpath='{.status.dailyTokenUsage}'
```

Token usage is tracked per-step in SwarmRun status, aggregated by the operator into the agent's rolling 24h window.
