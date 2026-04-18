---
sidebar_position: 5
sidebar_label: "Network Policies"
description: "kubeswarm network policies - control agent pod egress on Kubernetes. Default, strict and disabled modes for MCP server access."
---

# Network Policies

kubeswarm generates Kubernetes NetworkPolicy resources for each agent, controlling pod egress to DNS, Redis and MCP servers.

## Modes

```yaml
spec:
  networkPolicy: default # default | strict | disabled
```

| Mode       | DNS                 | Redis                      | HTTPS egress                 |
| ---------- | ------------------- | -------------------------- | ---------------------------- |
| `default`  | Allowed             | Allowed (kubeswarm-system) | All destinations             |
| `strict`   | Allowed             | Allowed (kubeswarm-system) | Only resolved MCP server IPs |
| `disabled` | No policy generated | -                          | -                            |

## Default Mode

Allows DNS (UDP/TCP 53), Redis (TCP 6379 to the operator namespace) and all TCP egress. This is suitable for most deployments where agents need to reach LLM APIs on various ports.

## Strict Mode

Same as default but HTTPS egress is restricted to the resolved IP addresses of declared MCP servers. The operator DNS-resolves each `spec.tools.mcp[].url` hostname and creates `/32` CIDR egress rules.

Use strict mode when agents must not reach arbitrary internet endpoints.

## Disabled Mode

No NetworkPolicy is generated. Use when your cluster CNI (Cilium, Calico) manages network policy externally.

## Pod Security

Regardless of network policy mode, all agent pods run with:

- `runAsNonRoot: true`
- `readOnlyRootFilesystem: true`
- `allowPrivilegeEscalation: false`
- All capabilities dropped
