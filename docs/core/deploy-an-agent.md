---
sidebar_position: 3
sidebar_label: "Deploy an Agent"
description: "Learn how to deploy an agent on Kubernetes using kubeswarm. Define the model, prompt and resources in YAML and apply with kubectl."
---

# Deploy an Agent

A SwarmAgent is the core kubeswarm resource for running AI agents on Kubernetes. It manages a pool of LLM-powered pods with automatic health checks, scaling and budget enforcement.

## Minimal agent

```yaml
apiVersion: kubeswarm.io/v1alpha1
kind: SwarmAgent
metadata:
  name: my-agent
spec:
  model: claude-sonnet-4-6
  prompt:
    inline: "You are a helpful code reviewer."
  infrastructure:
    apiKeyRef:
      name: provider-api-keys
      key: ANTHROPIC_API_KEY
```

## Create the API key Secret

```bash
kubectl create secret generic provider-api-keys \
  --from-literal=ANTHROPIC_API_KEY=sk-ant-...
```

## Deploy

```bash
kubectl apply -f agent.yaml
kubectl get swagent my-agent -w
```

## What the operator creates

For each SwarmAgent, the operator creates:

- A **Deployment** named `<agent-name>-agent` with the configured replicas
- A **NetworkPolicy** controlling pod egress
- A **ServiceAccount** with minimal RBAC

## Add resources

```yaml
spec:
  runtime:
    replicas: 2
    resources:
      requests:
        cpu: 100m
        memory: 128Mi
      limits:
        cpu: 500m
        memory: 512Mi
```

## Verify

```bash
kubectl describe swagent my-agent
kubectl get pods -l kubeswarm/deployment=my-agent
kubectl logs -l kubeswarm/deployment=my-agent
```
