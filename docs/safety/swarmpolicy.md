---
sidebar_position: 3
sidebar_label: "SwarmPolicy"
description: "kubeswarm SwarmPolicy - platform-level agent governance with namespace-scoped policy enforcement, tool restrictions, token limits and compliance monitoring on Kubernetes."
---

# SwarmPolicy

SwarmPolicy is a namespace-scoped CRD that lets platform teams enforce guardrail floors and ceilings on all agents in a namespace. It is the kubeswarm equivalent of Kubernetes LimitRange and ResourceQuota - infrastructure-level constraints that agent authors cannot weaken.

## The Problem

Without SwarmPolicy, every guardrail is opt-in. An agent author can set `guardrails: {}` and skip all controls. Platform teams that need "no agent in production may use shell tools" or "daily token limit must not exceed 100K" have no enforcement mechanism.

SwarmSettings (from `spec.settings`) provides defaults but not enforcement. SwarmPolicy provides enforcement.

## How It Works

```yaml
apiVersion: kubeswarm.io/v1alpha1
kind: SwarmPolicy
metadata:
  name: production-baseline
  namespace: production
spec:
  enforcementMode: Enforce # Audit | Warn | Enforce
  limits:
    maxDailyTokens: 100000
    maxTokensPerCall: 16000
    maxThinkingTokensPerCall: 50000
  tools:
    deny:
      - "shell/*"
      - "filesystem/delete_file"
  models:
    allow:
      - "claude-sonnet-*"
      - "claude-haiku-*"
    deny:
      - "claude-opus-*" # too expensive for production workloads
```

The operator merges all policies in a namespace into an **effective policy** and applies it to every agent.

## Enforcement Modes

| Mode | Admission | Status | Events |
|------|-----------|--------|--------|
| **Audit** | Allows all | Sets `PolicyCompliant: False` | Logs violations |
| **Warn** | Allows with warnings | Sets `PolicyCompliant: False` | kubectl shows warnings |
| **Enforce** | Rejects non-compliant agents | Blocks creation/update | Rejection event with details |

## What Can Be Enforced

### Token limits

```yaml
limits:
  maxDailyTokens: 100000      # ceiling for dailyTokens
  maxTokensPerCall: 16000     # ceiling for tokensPerCall
  maxThinkingTokensPerCall: 50000
  maxAnswerTokensPerCall: 16000
```

The effective limit is always `min(agent spec, policy ceiling)`. An agent requesting 200K daily tokens in a namespace with a 100K policy gets clamped to 100K.

### Tool restrictions

```yaml
tools:
  deny:
    - "shell/*"
    - "filesystem/write_file"
    - "network_*"
```

Policy deny lists are merged with agent deny lists at runtime. An agent cannot override a policy deny.

### Model restrictions

```yaml
models:
  allow:
    - "claude-sonnet-*"
  deny:
    - "claude-opus-*"
```

The webhook rejects agents whose `spec.model` matches a deny pattern or doesn't match any allow pattern.

## Agent Status

When a policy exists, each agent gets:

- A `PolicyCompliant` condition showing compliance state
- An `effectiveGuardrails` section with provenance showing which policy set each limit
- A `kubeswarm.io/policy-compliant` label for easy filtering

```bash
kubectl get swarmagents -l kubeswarm.io/policy-compliant=false
```

## Multiple Policies

Multiple SwarmPolicy objects in a namespace are merged:

- **Deny lists** are unioned (most restrictive)
- **Numeric limits** use the minimum (most restrictive)
- **Allow lists** are intersected (most restrictive)
- **Enforcement mode** uses the strictest across all policies

Conflicts are reported in the policy's status with specific field-level detail.

## Gradual Rollout

Start with `Audit` mode to see what would be blocked without disrupting existing agents:

```yaml
spec:
  enforcementMode: Audit
```

Review violations via events and agent status, then move to `Warn`, then `Enforce`.

## Observability

SwarmPolicy emits OTel counters:

- `kubeswarm.policy.violation` - agents violating policy (Audit mode)
- `kubeswarm.policy.warned` - admission warnings issued (Warn mode)
- `kubeswarm.policy.rejected` - agents rejected at admission (Enforce mode)
- `kubeswarm.policy.would_reject` - would-be rejections in Audit mode
- `kubeswarm.policy.conflict` - conflicting policies in namespace

## See Also

- [Guardrails and Trust](./guardrails.md) - per-agent guardrail configuration
- [API Reference](/reference/api) - SwarmPolicy type reference
