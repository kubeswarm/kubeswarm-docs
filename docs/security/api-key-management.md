---
sidebar_position: 5
sidebar_label: "API Key Management"
description: "kubeswarm API key management - use native Kubernetes Secrets for LLM provider keys. No custom CRD needed. apiKeyRef and envFrom patterns."
---

# kubeswarm API Key Management - Native Kubernetes Secrets

kubeswarm uses native Kubernetes Secrets for agent API key management. No custom CRD needed - reference keys via apiKeyRef or envFrom.

## Two Options

### Option 1: apiKeyRef (single key)

Point to a specific key in a Secret. The key name becomes the environment variable name:

```yaml
spec:
  infrastructure:
    apiKeyRef:
      name: provider-api-keys # Secret name
      key: ANTHROPIC_API_KEY # Secret key = env var name
```

```bash
kubectl create secret generic provider-api-keys \
  --from-literal=ANTHROPIC_API_KEY=sk-ant-...
```

### Option 2: envFrom (multiple keys)

Inject all keys from a Secret or ConfigMap:

```yaml
spec:
  infrastructure:
    envFrom:
      - secretRef:
          name: provider-api-keys
      - configMapRef:
          name: agent-env-config
```

This injects every key in the Secret as an environment variable. Use when the agent needs multiple provider keys or configuration values.

## Rolling Restarts

When a Secret referenced by `apiKeyRef` is updated, the operator detects the change and triggers a rolling restart of agent pods. This ensures rotated keys are picked up without manual intervention.

## Best Practices

- Use one Secret per namespace, not per agent
- Never commit Secrets to git - use `kubectl create secret` or a secrets manager
- Use `envFrom` for complex setups with multiple providers
- Use `apiKeyRef` for simple single-provider deployments
