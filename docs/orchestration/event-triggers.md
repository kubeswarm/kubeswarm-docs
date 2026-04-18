---
sidebar_position: 4
sidebar_label: "Event Triggers"
description: "kubeswarm event triggers - cron schedules, webhooks and pipeline chaining for automated agent execution on Kubernetes."
---

# Event Triggers

SwarmEvent fires kubeswarm agent runs automatically in response to cron schedules, webhook HTTP calls, or upstream pipeline completion on Kubernetes.

## Source Types

### Cron

```yaml
apiVersion: kubeswarm.io/v1alpha1
kind: SwarmEvent
metadata:
  name: daily-review
spec:
  source:
    type: cron
    cron: "0 8 * * 1-5" # weekdays at 8am UTC
  targets:
    - agent: ops-agent
      input:
        prompt: "Review all open PRs."
  concurrencyPolicy: Forbid
```

### Webhook

```yaml
apiVersion: kubeswarm.io/v1alpha1
kind: SwarmEvent
metadata:
  name: ci-hook
spec:
  source:
    type: webhook
  targets:
    - agent: reviewer
      input:
        prompt: "{{ .body.message }}"
  concurrencyPolicy: Allow
```

Trigger via HTTP:

```bash
WEBHOOK_URL=$(kubectl get swevt ci-hook -o jsonpath='{.status.webhookURL}')
TOKEN=$(kubectl get swevt ci-hook -o jsonpath='{.status.webhookToken}')
curl -X POST "$WEBHOOK_URL" \
  -H "Authorization: Bearer $TOKEN" \
  -H "Content-Type: application/json" \
  -d '{"message": "Review PR #42"}'
```

### Team-output (chaining)

Fire when another pipeline completes:

```yaml
spec:
  source:
    type: team-output
    teamOutput:
      teamRef: upstream-pipeline
  targets:
    - team: downstream-pipeline
      input:
        data: "{{ .output }}"
```

## Concurrency Policy

| Policy    | Behavior                                 |
| --------- | ---------------------------------------- |
| `Allow`   | Multiple runs can execute simultaneously |
| `Forbid`  | Skip if a previous run is still active   |
| `Replace` | Cancel active run, start new one         |

## Targets

Events can target either an agent or a team:

```yaml
targets:
  - agent: my-agent # creates SwarmRun with spec.agent
    input:
      prompt: "..."
  - team: my-team # creates SwarmRun with spec.teamRef
    input:
      topic: "..."
```
