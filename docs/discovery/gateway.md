---
sidebar_position: 2
title: Gateway
description: Single entrypoint agent that routes tasks to the swarm via capability discovery.
---

# Gateway

A Gateway agent is a SwarmAgent configured as the single entrypoint to your swarm. It receives user requests and automatically discovers and dispatches to the right agent based on capabilities registered in a SwarmRegistry.

## How it works

1. User sends a task to the gateway agent
2. The operator auto-injects two tools: `registry_search` and `dispatch`
3. The gateway's LLM searches the registry for matching capabilities
4. It dispatches the task to the best matching agent
5. Results flow back through the gateway to the user

## Creating a gateway

```yaml
apiVersion: kubeswarm.io/v1alpha1
kind: SwarmAgent
metadata:
  name: platform-gateway
spec:
  model: claude-sonnet-4-6
  prompt:
    inline: |
      You are the platform gateway. Route user requests to the most
      appropriate agent based on their capabilities. If no agent matches,
      answer directly using your own knowledge.
  gateway:
    registryRef:
      name: default
    dispatchMode: enabled
    dispatchTimeoutSeconds: 120
    maxDispatchDepth: 3
    maxDispatchCalls: 5
    maxSearchCalls: 3
    maxResultsPerSearch: 10
    fallback:
      mode: answer-directly
```

## Configuration reference

| Field | Default | Range | Description |
|-------|---------|-------|-------------|
| `registryRef` | required | - | SwarmRegistry to query |
| `dispatchMode` | enabled | enabled, disabled | disabled = search only, no dispatch |
| `dispatchTimeoutSeconds` | 120 | 10-3600 | Max time for a dispatched task |
| `maxDispatchDepth` | 3 | 1-10 | Max chain depth (gateway -> agent -> agent) |
| `maxDispatchCalls` | 5 | 1-20 | Max dispatch tool calls per task |
| `maxSearchCalls` | 3 | 1-20 | Max registry_search calls per task |
| `maxResultsPerSearch` | 10 | 1-50 | Max capabilities returned per search |
| `allowGatewayTargets` | false | - | Allow dispatching to other gateways |
| `allowedTargets` | [] (all) | max 100 | Restrict dispatch to named agents |

## Filtering by tags

Narrow the discoverable capabilities using tag filters (AND semantics):

```yaml
gateway:
  registryRef:
    name: default
  filterByTags: ["backend", "ml"]
```

Only capabilities tagged with both `backend` AND `ml` are visible to this gateway.

## Fallback behavior

When no capability matches the user's request:

```yaml
# Option 1: Fail with error (strict routing)
fallback:
  mode: fail

# Option 2: Answer directly (default)
fallback:
  mode: answer-directly

# Option 3: Delegate to a fallback agent
fallback:
  mode: agent
  agentRef:
    name: general-assistant
```

## Preventing loops

By default, gateways cannot dispatch to other gateways (`allowGatewayTargets: false`). This prevents infinite routing loops.

To restrict which agents can be targeted:

```yaml
gateway:
  allowedTargets:
    - code-reviewer
    - research-agent
    - data-analyst
```

## Monitoring

```bash
kubectl get swarmagent platform-gateway -o jsonpath='{.status.gateway}'
```

Gateway status fields:

- `routableCapabilities` - capabilities available after tag filtering
- `totalMatchingCapabilities` - total before filtering
- `lastCapabilitySync` - when capabilities were last synced from registry
