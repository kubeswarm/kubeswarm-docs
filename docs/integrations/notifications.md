---
sidebar_position: 6
sidebar_label: "Notifications"
description: "kubeswarm notification integrations - Slack and webhook alerts for agent budget exceeded, degraded and pipeline failure events on Kubernetes."
---

# kubeswarm Notifications - Slack and Webhook Alerts for Agents

kubeswarm sends alerts via the SwarmNotify CRD when agents degrade, budgets are exceeded, or pipeline runs fail on Kubernetes.

## Supported Channels

| Channel     | Configuration           | Use case                    |
| ----------- | ----------------------- | --------------------------- |
| **Slack**   | Webhook URL from Secret | Team chat alerts            |
| **Webhook** | Any HTTP endpoint       | PagerDuty, Opsgenie, custom |

## Configuration

```yaml
apiVersion: kubeswarm.io/v1alpha1
kind: SwarmNotify
metadata:
  name: ops-alerts
spec:
  channel:
    type: slack
    slack:
      webhookUrlSecretRef:
        name: slack-secrets
        key: webhook-url
  events:
    - type: BudgetExceeded
      template: ":warning: Budget exceeded for {{ .agent }}: {{ .totalTokens }} tokens"
    - type: AgentDegraded
      template: ":red_circle: Agent degraded: {{ .agent }} - {{ .reason }}"
    - type: TeamFailed
      template: ":x: Pipeline failed: {{ .team }} run {{ .run }}"
    - type: TeamSucceeded
      template: ":white_check_mark: Pipeline completed: {{ .team }}"
  rateLimiting:
    windowSeconds: 300
    maxPerWindow: 5
```

## Event Types

| Event            | Trigger                                         |
| ---------------- | ----------------------------------------------- |
| `BudgetExceeded` | Daily token limit reached, replicas scaled to 0 |
| `AgentDegraded`  | MCP server unreachable or health check failed   |
| `TeamFailed`     | Pipeline run reached terminal failure           |
| `TeamSucceeded`  | Pipeline run completed successfully             |
| `TeamTimedOut`   | Pipeline run exceeded `timeoutSeconds`          |

## Referencing from Agents

```yaml
spec:
  observability:
    healthCheck:
      notifyRef:
        name: ops-alerts
```
