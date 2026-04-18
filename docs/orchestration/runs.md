---
sidebar_position: 3
sidebar_label: "Trigger a Run"
description: "Trigger kubeswarm agent execution via kubectl, cron schedules, or webhooks. Create SwarmRun records for agents and team pipelines on Kubernetes."
---

# Runs & Triggers

Three ways to trigger kubeswarm agent or team execution: manual kubectl apply, scheduled cron triggers and webhook-based HTTP triggers.

## Manual (kubectl)

```bash
# Agent run
kubectl apply -f - <<EOF
apiVersion: kubeswarm.io/v1alpha1
kind: SwarmRun
metadata:
  name: my-run
spec:
  agent: my-agent
  prompt: "Review the latest PR."
EOF

# Team run
kubectl apply -f - <<EOF
apiVersion: kubeswarm.io/v1alpha1
kind: SwarmRun
metadata:
  name: team-run
spec:
  teamRef: blog-pipeline
  input:
    topic: "AI agents on Kubernetes"
EOF
```

## Cron (scheduled)

```yaml
apiVersion: kubeswarm.io/v1alpha1
kind: SwarmEvent
metadata:
  name: daily-review
spec:
  source:
    type: cron
    cron: "0 8 * * 1-5"
  targets:
    - agent: my-agent
      input:
        prompt: "Review all open PRs."
  concurrencyPolicy: Forbid
```

## Webhook (HTTP)

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
```

Trigger it:

```bash
WEBHOOK_URL=$(kubectl get swevt ci-hook -o jsonpath='{.status.webhookURL}')
TOKEN=$(kubectl get swevt ci-hook -o jsonpath='{.status.webhookToken}')
curl -X POST "$WEBHOOK_URL" \
  -H "Authorization: Bearer $TOKEN" \
  -d '{"message": "Review PR #42"}'
```

## Monitor

```bash
kubectl get swrun -w
kubectl get swrun my-run -o jsonpath='{.status.output}'
kubectl describe swrun my-run
```
